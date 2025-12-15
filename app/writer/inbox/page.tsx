'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Check, X, ExternalLink, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PreviewModal } from './_components/PreviewModal'

interface SuggestedPost {
  id: string
  title: string
  subtitle: string | null
  slug: string
  markdown: string
  sourceUrl: string | null
  createdAt: string
  topic: {
    id: string
    name: string
  } | null
}

export default function InboxPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<SuggestedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [previewPost, setPreviewPost] = useState<SuggestedPost | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?status=suggested')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch suggested posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (post: SuggestedPost) => {
    setActionLoading(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      })
      
      if (res.ok) {
        // Redirect to editor
        router.push(`/writer/editor/${post.slug}`)
      } else {
        alert('Failed to accept post')
      }
    } catch (error) {
      alert('Failed to accept post')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (post: SuggestedPost) => {
    if (!confirm(`Reject "${post.title}"? This will delete the draft.`)) return
    
    setActionLoading(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== post.id))
      } else {
        alert('Failed to reject post')
      }
    } catch (error) {
      alert('Failed to reject post')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-title font-bold mb-2">Inbox</h1>
        <p className="text-muted-foreground">
          AI-generated essay drafts waiting for your review
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No suggested essays</p>
          <p className="text-sm text-muted-foreground">
            Configure <Link href="/admin/topics" className="text-primary hover:underline">topic subscriptions</Link> to automatically generate drafts
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div
              key={post.id}
              className="border rounded-lg p-4 bg-background hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setPreviewPost(post)}
                    className="text-left hover:underline"
                  >
                    <h3 className="font-medium truncate">{post.title}</h3>
                  </button>
                  {post.subtitle && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {post.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {post.topic && (
                      <span className="bg-muted px-2 py-0.5 rounded">{post.topic.name}</span>
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
                    onClick={() => setPreviewPost(post)}
                    className="hidden sm:inline-flex"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(post)}
                    disabled={actionLoading === post.id}
                  >
                    <X className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(post)}
                    disabled={actionLoading === post.id}
                  >
                    {actionLoading === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Accept</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewPost && (
        <PreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          onAccept={() => handleAccept(previewPost)}
          onReject={() => handleReject(previewPost)}
        />
      )}
    </div>
  )
}

