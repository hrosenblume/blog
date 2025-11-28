import { useState, useEffect, useCallback, useRef, Component, type ReactNode } from 'react';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';

import EditorToolbar from './editor/EditorToolbar';
import EditorStatusBar from './editor/EditorStatusBar';
import { htmlToMarkdown, markdownToHtml } from './editor/markdownUtils';
import { generateSlug } from './editor/slugUtils';
import { ErrorFallback } from './ErrorBoundary';
import { PLACEHOLDERS, DEFAULTS, ARIA_LABELS, LABELS } from '../constants';
import { config } from '../config';
import { api } from '../api/client';
import './editor/editor.css';

// Create ALL extension instances once at module level to prevent duplicates
// These are singleton instances shared across all editor instances
const editorExtensions = [
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'underline',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Placeholder.configure({
    placeholder: 'Start writing...',
  }),
  CharacterCount,
];

interface EditorProps {
  onNavigateBack: () => void;
  darkMode: boolean;
  articleId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  darkMode: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class EditorErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Editor error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error || undefined}
          resetError={this.handleReset}
          darkMode={this.props.darkMode}
        />
      );
    }

    return this.props.children;
  }
}

function EditorComponent({ onNavigateBack, darkMode, articleId }: EditorProps) {
  const [postId, setPostId] = useState<string | null>(articleId || null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [loading, setLoading] = useState(!!articleId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInitializedRef = useRef(false);

  const editor = useEditor({
    extensions: editorExtensions,
    content: '',
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${
          darkMode ? 'prose-invert' : ''
        }`,
      },
    },
    shouldRerenderOnTransaction: false,
  });

  // Load existing post if articleId is provided
  useEffect(() => {
    if (!articleId || !editor) return;
    
    async function loadPost() {
      try {
        setLoading(true);
        setError(null);
        const post = await api.getPost(articleId);
        
        setPostId(post.id);
        setTitle(post.title);
        setSlug(post.slug);
        setStatus(post.status);
        setIsManualSlug(true); // Existing post has a slug already
        
        if (titleRef.current) {
          titleRef.current.textContent = post.title;
        }
        
        // Convert markdown to HTML and set in editor
        if (post.markdown) {
          const html = markdownToHtml(post.markdown);
          editor.commands.setContent(html);
        }
        
        isInitializedRef.current = true;
      } catch (err) {
        if (err instanceof Error && err.message === 'Not authenticated') {
          api.redirectToLogin();
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    
    loadPost();
  }, [articleId, editor]);

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (!isManualSlug && title && !articleId) {
      setSlug(generateSlug(title));
    }
  }, [title, isManualSlug, articleId]);

  // Get current markdown content
  const getCurrentMarkdown = useCallback(() => {
    if (!editor) return '';
    if (showMarkdown) return markdownContent;
    return htmlToMarkdown(editor.getHTML());
  }, [editor, showMarkdown, markdownContent]);

  // Auto-save to API
  const triggerAutoSave = useCallback(async () => {
    if (!postId || !title.trim() || !slug.trim()) return;
    if (!isInitializedRef.current && articleId) return; // Don't save before loading
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const markdown = getCurrentMarkdown();
        await api.updatePost(postId, {
          title: title.trim(),
          slug: slug.trim(),
          markdown,
          status,
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, config.autosaveDelay);
  }, [postId, title, slug, status, getCurrentMarkdown, articleId]);

  // Trigger auto-save on content changes
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      if (postId) triggerAutoSave();
    };
    
    editor.on('update', updateHandler);
    return () => {
      editor.off('update', updateHandler);
    };
  }, [editor, triggerAutoSave, postId]);

  // Trigger auto-save on title/slug/status changes
  useEffect(() => {
    if (postId) triggerAutoSave();
  }, [title, slug, status, postId, triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save/Create post
  const handleSave = useCallback(async (publishStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (!slug.trim()) {
      alert('Slug is required');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const markdown = getCurrentMarkdown();
      
      if (postId) {
        // Update existing post
        await api.updatePost(postId, {
          title: title.trim(),
          slug: slug.trim(),
          markdown,
          status: publishStatus,
        });
      } else {
        // Create new post
        const response = await api.createPost({
          title: title.trim(),
          slug: slug.trim(),
          markdown,
          status: publishStatus,
        });
        setPostId(response.id);
        isInitializedRef.current = true;
      }
      
      setStatus(publishStatus);
      setLastSaved(new Date());
      
      if (publishStatus === 'published') {
        onNavigateBack();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save post';
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }, [postId, title, slug, getCurrentMarkdown, onNavigateBack]);

  const toggleMarkdownView = useCallback(() => {
    if (!editor) return;

    if (!showMarkdown) {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      setMarkdownContent(markdown);
    } else {
      const html = markdownToHtml(markdownContent);
      editor.commands.setContent(html, false);
    }
    setShowMarkdown(prev => !prev);
  }, [editor, showMarkdown, markdownContent]);

  const handleSlugChange = useCallback((newSlug: string) => {
    setSlug(newSlug);
    setIsManualSlug(true);
  }, []);

  const handleTitleInput = useCallback((e: React.FormEvent<HTMLHeadingElement>) => {
    setTitle(e.currentTarget.textContent || '');
  }, []);

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownContent(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error && !editor) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={onNavigateBack}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-white text-black' : 'bg-black text-white'
            }`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}>
        <p className="animate-pulse">{LABELS.loadingEditor}</p>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <header className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onNavigateBack}
              className={`inline-flex items-center gap-2 transition-colors ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label={ARIA_LABELS.goBackToDashboard}
            >
              <ArrowLeft className="w-4 h-4" />
              {LABELS.backToDashboard}
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMarkdownView}
                className={`px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 text-sm ${
                  showMarkdown
                    ? darkMode
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : darkMode 
                      ? 'hover:bg-gray-900 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
                aria-label={showMarkdown ? ARIA_LABELS.switchToEditor : ARIA_LABELS.switchToMarkdown}
                aria-pressed={showMarkdown}
              >
                <Eye className="w-4 h-4" />
                {showMarkdown ? LABELS.editor : LABELS.markdown}
              </button>
              
              {status === 'draft' && (
                <button 
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } disabled:opacity-50`}
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
              )}
              
              <button 
                onClick={() => handleSave('published')}
                disabled={saving}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-black text-white hover:bg-gray-800'
                } disabled:opacity-50`}
                aria-label={ARIA_LABELS.publishArticle}
              >
                {saving ? 'Saving...' : (status === 'published' ? 'Update' : LABELS.publish)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {!showMarkdown && <EditorToolbar editor={editor} darkMode={darkMode} />}

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <article className="prose prose-lg max-w-none">
            <h1 
              ref={titleRef}
              className="mb-8 dark:text-white"
              contentEditable
              suppressContentEditableWarning
              onInput={handleTitleInput}
              data-placeholder={PLACEHOLDERS.articleTitle}
              aria-label={ARIA_LABELS.articleTitle}
            />

            {showMarkdown ? (
              <div className="not-prose">
                <label htmlFor="markdown-content" className="sr-only">
                  {ARIA_LABELS.markdownContent}
                </label>
                <textarea
                  id="markdown-content"
                  value={markdownContent}
                  onChange={handleMarkdownChange}
                  className={`w-full min-h-[600px] p-0 bg-transparent border-none outline-none resize-none font-mono ${
                    darkMode 
                      ? 'text-gray-300 placeholder-gray-600' 
                      : 'text-gray-700 placeholder-gray-400'
                  }`}
                  placeholder={PLACEHOLDERS.markdownEditor}
                  aria-label={ARIA_LABELS.markdownContent}
                />
              </div>
            ) : (
              <EditorContent 
                editor={editor} 
                className={`min-h-[500px] ${darkMode ? 'tiptap-dark' : 'tiptap-light'}`}
              />
            )}
          </article>

          <div className={`mt-12 pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 text-sm">
              <label 
                htmlFor="article-slug" 
                className={darkMode ? 'text-gray-400' : 'text-gray-500'}
              >
                {LABELS.urlLabel}
              </label>
              <input
                id="article-slug"
                type="text"
                placeholder={PLACEHOLDERS.urlSlug}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm ${
                  darkMode 
                    ? 'text-gray-400 placeholder-gray-600' 
                    : 'text-gray-500 placeholder-gray-400'
                }`}
                aria-label={ARIA_LABELS.articleUrlSlug}
              />
            </div>
          </div>
        </div>
      </main>

      <EditorStatusBar editor={editor} darkMode={darkMode} lastSaved={lastSaved} />
    </div>
  );
}

export default function Editor(props: EditorProps) {
  return (
    <EditorErrorBoundary darkMode={props.darkMode}>
      <EditorComponent {...props} />
    </EditorErrorBoundary>
  );
}
