import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import ArticleListItem from './ArticleListItem';
import { getThemeClasses } from '../utils/theme';
import { PLACEHOLDERS, STATS_LABELS } from '../constants';
import { api, type Post } from '../api/client';
import type { Article } from '../types';

interface WriterDashboardProps {
  onNavigateToEditor: (articleId?: string) => void;
  onNavigateToEssay: (articleId: string) => void;
  darkMode: boolean;
}

// Convert API Post to Article type used by components
function postToArticle(post: Post): Article {
  return {
    id: post.id,
    title: post.title,
    status: post.status,
    updatedAt: formatRelativeTime(post.updatedAt),
    wordCount: post.wordCount,
    slug: post.slug,
  };
}

// Format ISO date to relative time string
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

// Format large numbers (e.g., 42500 -> "42.5k")
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export default function WriterDashboard({ onNavigateToEditor, onNavigateToEssay, darkMode }: WriterDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts on mount
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getPosts();
        setArticles(response.posts.map(postToArticle));
      } catch (err) {
        if (err instanceof Error && err.message === 'Not authenticated') {
          api.redirectToLogin();
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.deletePost(id);
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post');
    }
  }, []);

  const handleUnpublish = useCallback(async (id: string) => {
    try {
      await api.updatePost(id, { status: 'draft' });
      setArticles(prev => prev.map(article => 
        article.id === id ? { ...article, status: 'draft' as const } : article
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unpublish post');
    }
  }, []);

  const handleViewLive = useCallback((id: string) => {
    // Find the article to get its slug
    const article = articles.find(a => a.id === id);
    if (article?.slug) {
      window.open(`/e/${article.slug}/`, '_blank');
    } else {
      onNavigateToEssay(id);
    }
  }, [articles, onNavigateToEssay]);

  const handleEdit = useCallback((id: string) => {
    window.scrollTo(0, 0);
    onNavigateToEditor(id);
  }, [onNavigateToEditor]);

  const handleNewArticle = useCallback(() => {
    window.scrollTo(0, 0);
    onNavigateToEditor();
  }, [onNavigateToEditor]);

  const filteredArticles = useMemo(() => 
    articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [articles, searchQuery]
  );

  const drafts = useMemo(() => 
    filteredArticles.filter(article => article.status === 'draft'),
    [filteredArticles]
  );

  const published = useMemo(() => 
    filteredArticles.filter(article => article.status === 'published'),
    [filteredArticles]
  );

  // Calculate stats from actual data
  const stats = useMemo(() => {
    const totalWords = articles.reduce((sum, a) => sum + a.wordCount, 0);
    return [
      { label: STATS_LABELS.totalArticles, value: articles.length.toString() },
      { label: STATS_LABELS.published, value: articles.filter(a => a.status === 'published').length.toString() },
      { label: STATS_LABELS.drafts, value: articles.filter(a => a.status === 'draft').length.toString() },
      { label: STATS_LABELS.totalWords, value: formatNumber(totalWords) },
    ];
  }, [articles]);

  const theme = getThemeClasses(darkMode);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-lg ${theme.buttonPrimary}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="mb-2">Writer</h1>
            <p className={theme.textSecondary}>Your writing workspace</p>
          </div>
          <button 
            onClick={handleNewArticle}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme.buttonPrimary}`}
          >
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className={`border-b pb-4 ${theme.border}`}>
              <p className={`mb-2 ${theme.textSecondary}`}>{stat.label}</p>
              <p className={theme.text}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <label htmlFor="search-articles" className="sr-only">Search articles</label>
          <input
            id="search-articles"
            type="search"
            placeholder={PLACEHOLDERS.searchArticles}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-0 py-2 bg-transparent border-b outline-none transition-colors ${theme.border} ${
              darkMode ? 'placeholder-gray-600 focus:border-gray-600' : 'placeholder-gray-400 focus:border-gray-400'
            }`}
          />
        </div>

        <section className="mb-16">
          <h2 className="mb-6 dark:text-white">{STATS_LABELS.drafts}</h2>
          {drafts.length > 0 ? (
            <div className="space-y-0">
              {drafts.map((article) => (
                <ArticleListItem 
                  key={article.id} 
                  article={article} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUnpublish={handleUnpublish}
                  onViewLive={handleViewLive}
                  darkMode={darkMode} 
                />
              ))}
            </div>
          ) : (
            <p className={theme.textTertiary}>No drafts. All caught up!</p>
          )}
        </section>

        <section>
          <h2 className="mb-6 dark:text-white">{STATS_LABELS.published}</h2>
          {published.length > 0 ? (
            <div className="space-y-0">
              {published.map((article) => (
                <ArticleListItem 
                  key={article.id} 
                  article={article} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUnpublish={handleUnpublish}
                  onViewLive={handleViewLive}
                  darkMode={darkMode} 
                />
              ))}
            </div>
          ) : (
            <p className={theme.textTertiary}>No published articles yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
