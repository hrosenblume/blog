'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Check, X, ExternalLink, Search, ArrowUp, Globe } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonPostList } from '@/components/writer/SkeletonPostList'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ControlButton } from '@/components/ui/control-button'
import { PlusIcon } from '@/components/Icons'
import { useAIModels } from '@/lib/ai/useAIModels'
import { LENGTH_OPTIONS } from '@/lib/ai/models'
import { ModelSelector } from '@/components/editor/ModelSelector'
import { confirmPublish, confirmUnpublish } from '@/lib/utils/confirm'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { useChatContext } from '@/lib/chat'
import { PostItem, type Post } from '@/components/writer/PostItem'

interface SuggestedPost {
  id: string
  title: string
  subtitle: string | null
  slug: string
  sourceUrl: string | null
  createdAt: string
  topic: { id: string; name: string } | null
}

type TabType = 'all' | 'drafts' | 'published'

export default function Dashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [suggestedPosts, setSuggestedPosts] = useState<SuggestedPost[]>([])
  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false)
  const [suggestedOpen, setSuggestedOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Idea input controls
  const { models, selectedModel: modelId, setSelectedModel: setModelId, currentModel } = useAIModels()
  const [length, setLength] = useState<number>(500)
  const [webEnabled, setWebEnabled] = useState(false)
  
  // Chat context - check if open to disable shortcuts
  const { isOpen: chatOpen } = useChatContext()

  // N to create new essay (disabled when chat is open)
  useKeyboard([
    { ...SHORTCUTS.NEW_ARTICLE, handler: () => { if (!chatOpen) router.push('/writer/editor') } },
  ])

  useEffect(() => {
    // Fetch posts
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Fetch feature flag
    fetch('/api/integrations/settings')
      .then(res => res.json())
      .then(data => {
        const enabled = !!data.autoDraftEnabled
        setAutoDraftEnabled(enabled)
        if (enabled) {
          // Fetch suggested posts
          fetch('/api/posts?status=suggested')
            .then(res => res.json())
            .then(data => setSuggestedPosts(data.posts || []))
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  // Counts for tabs
  const draftCount = useMemo(() => posts.filter(p => p.status === 'draft').length, [posts])
  const publishedCount = useMemo(() => posts.filter(p => p.status === 'published').length, [posts])
  const totalCount = posts.length

  // Filtered posts based on search and active tab
  const filteredPosts = useMemo(() => {
    let result = posts

    // Filter by search query
    if (searchQuery) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by tab
    if (activeTab === 'drafts') {
      result = result.filter(p => p.status === 'draft')
    } else if (activeTab === 'published') {
      result = result.filter(p => p.status === 'published')
    }

    // Sort: drafts by updatedAt, published by publishedAt
    return result.sort((a, b) => {
      if (a.status === 'published' && b.status === 'published') {
        const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return bDate - aDate
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [posts, searchQuery, activeTab])

  // Loading state - MUST be after all hooks
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mt-4 mb-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <div className="flex border-b border-border mb-6">
          <Skeleton className="h-10 w-16 mr-4" />
          <Skeleton className="h-10 w-20 mr-4" />
          <Skeleton className="h-10 w-24" />
        </div>
        <SkeletonPostList count={5} />
      </div>
    )
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(posts.filter(p => p.id !== id))
  }

  async function handleUnpublish(id: string) {
    const post = posts.find(p => p.id === id)
    if (!post || !confirmUnpublish(post.title)) return
    
    await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'draft' as const } : p))
  }

  async function handlePublish(id: string) {
    if (!confirmPublish()) return
    
    await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    })
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'published' as const } : p))
  }

  async function handleAcceptSuggested(post: SuggestedPost) {
    setActionLoading(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      })
      if (res.ok) {
        router.push(`/writer/editor/${post.slug}`)
      }
    } catch (error) {
      console.error('Failed to accept suggested post:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectSuggested(post: SuggestedPost) {
    if (!confirm(`Reject "${post.title}"? This will delete the draft.`)) return
    
    setActionLoading(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuggestedPosts(suggestedPosts.filter(p => p.id !== post.id))
      }
    } catch (error) {
      console.error('Failed to reject suggested post:', error)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Mobile FAB */}
      <Button asChild size="icon" className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50">
        <Link href="/writer/editor" aria-label="New Essay">
          <PlusIcon className="w-6 h-6" />
        </Link>
      </Button>

      {/* Idea Input */}
      <div className="mt-4 mb-8">
        <h2 className="text-section font-semibold mb-4">What's on your mind?</h2>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            const idea = (e.target as HTMLFormElement).idea.value.trim()
            if (idea) {
              const params = new URLSearchParams({
                idea,
                model: modelId,
                length: String(length),
                ...(webEnabled && { web: '1' })
              })
              router.push(`/writer/editor?${params}`)
            }
          }}
        >
          <div className="relative">
            <Textarea
              name="idea"
              placeholder="Describe your idea..."
              className="min-h-[100px] pr-14 resize-none text-base md:text-base"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  const form = e.currentTarget.form
                  if (form) form.requestSubmit()
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="secondary"
              className="absolute bottom-3 right-3 rounded-full w-10 h-10"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Controls Row */}
          <div className="mt-2 flex items-center gap-3">
            {/* Length Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ControlButton>
                  {length} words
                  <ChevronDown className="w-3.5 h-3.5" />
                </ControlButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {LENGTH_OPTIONS.map(len => (
                  <DropdownMenuItem key={len} onClick={() => setLength(len)}>
                    {len} words
                    {length === len && <Check className="w-4 h-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Web Search Toggle */}
            <ControlButton
              onClick={(e) => {
                setWebEnabled(!webEnabled)
                // Return focus to textarea so Enter submits form
                const textarea = e.currentTarget.closest('form')?.querySelector('textarea')
                textarea?.focus()
              }}
              active={webEnabled}
              title="Search the web for current information"
              tabIndex={-1}
            >
              <Globe className="w-4 h-4" />
            </ControlButton>
            
            {/* Model Dropdown */}
            <ModelSelector
              models={models}
              selectedModel={modelId}
              onModelChange={setModelId}
              currentModel={currentModel}
            />
          </div>
        </form>
      </div>

      {/* Suggested posts section - only when auto-draft is enabled */}
      {autoDraftEnabled && (
        <section className="mb-8">
          <Collapsible open={suggestedOpen} onOpenChange={setSuggestedOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-section font-semibold mb-4 group">
              <ChevronDown 
                className={`h-4 w-4 text-muted-foreground transition-transform ${suggestedOpen ? '' : '-rotate-90'}`} 
              />
              Suggested
              {suggestedPosts.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {suggestedPosts.length}
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {suggestedPosts.length > 0 ? (
                <div className="space-y-2">
                  {suggestedPosts.map(post => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between gap-4 py-3 border-b border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{post.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {post.topic && (
                            <span className="bg-muted px-2 py-0.5 rounded text-xs">{post.topic.name}</span>
                          )}
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.sourceUrl && (
                            <a
                              href={post.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectSuggested(post)}
                          disabled={actionLoading === post.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptSuggested(post)}
                          disabled={actionLoading === post.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No suggested essays — <Link href="/settings/topics" className="text-primary hover:underline">configure topics</Link> to generate drafts
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </section>
      )}

      {/* Tabs and Search */}
      <div className="relative flex items-center justify-between border-b border-border mb-6">
        {/* Tabs - hidden on mobile when search is open */}
        <div className={`flex ${searchOpen ? 'invisible sm:visible' : ''}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'all'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All <span className="text-muted-foreground">({totalCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'drafts'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Drafts <span className="text-muted-foreground">({draftCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'published'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Published <span className="text-muted-foreground">({publishedCount})</span>
          </button>
        </div>
        
        {/* Search - overlays tabs on mobile when open */}
        <div className={`flex items-center gap-2 pb-2 ${searchOpen ? 'absolute inset-x-0 sm:relative sm:inset-auto' : ''}`}>
          <Link
            href="/writer/editor"
            className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
            aria-label="New Essay"
          >
            <PlusIcon className="w-4 h-4" />
          </Link>
          {searchOpen ? (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 sm:w-48 px-3 py-1.5 text-base bg-background border border-border rounded-md outline-none focus:border-ring placeholder:text-muted-foreground"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent sm:hidden"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post List */}
      <section>
        {filteredPosts.length > 0 ? (
          <div className="space-y-0">
            {filteredPosts.map(post => (
              <PostItem 
                key={post.id} 
                post={post} 
                onDelete={handleDelete} 
                onUnpublish={handleUnpublish} 
                onPublish={handlePublish}
                showStatus={activeTab === 'all'}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            {searchQuery ? 'No matching articles' : 'No articles yet'}
          </p>
        )}
      </section>
    </div>
  )
}
