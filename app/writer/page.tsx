'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageLoader } from '@/components/PageLoader'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@/components/Icons'
import { formatNumber } from '@/lib/utils/format'
import { confirmPublish, confirmUnpublish } from '@/lib/utils/confirm'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { HOMEPAGE } from '@/lib/homepage'
import { PostItem, type Post } from '@/components/writer/PostItem'

export default function Dashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // N to create new essay
  useKeyboard([
    { ...SHORTCUTS.NEW_ARTICLE, handler: () => router.push('/writer/editor') },
  ])

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredPosts = useMemo(() => 
    posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [posts, searchQuery]
  )

  const drafts = useMemo(() => 
    filteredPosts.filter(p => p.status === 'draft'),
    [filteredPosts]
  )

  const published = useMemo(() => 
    filteredPosts
      .filter(p => p.status === 'published')
      .sort((a, b) => {
        const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return bDate - aDate
      }),
    [filteredPosts]
  )

  const stats = useMemo(() => {
    const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0)
    return [
      { label: 'Total', value: posts.length },
      { label: 'Published', value: posts.filter(p => p.status === 'published').length },
      { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length },
      { label: 'Words', value: formatNumber(totalWords) },
    ]
  }, [posts])

  // Loading state - MUST be after all hooks
  if (loading) {
    return <PageLoader />
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="mb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-bold mb-2">{HOMEPAGE.name}</h1>
            <p className="text-muted-foreground">Welcome to your workspace</p>
          </div>
          <Button asChild className="hidden sm:inline-flex gap-2">
            <Link href="/writer/editor">
              <PlusIcon />
              New Essay
            </Link>
          </Button>
        </div>
      </header>

      <Button asChild size="icon" className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50">
        <Link href="/writer/editor" aria-label="New Essay">
          <PlusIcon className="w-6 h-6" />
        </Link>
      </Button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map(stat => (
          <div key={stat.label} className="border-b border-border pb-4">
            <p className="text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <input
          type="search"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-0 py-2 bg-transparent border-b border-border outline-none focus:border-ring placeholder:text-muted-foreground"
        />
      </div>

      <section className="mb-16">
        <h2 className="text-section font-semibold mb-6">Drafts</h2>
        {drafts.length > 0 ? (
          <div className="space-y-0">
            {drafts.map(post => (
              <PostItem key={post.id} post={post} onDelete={handleDelete} onUnpublish={handleUnpublish} onPublish={handlePublish} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No drafts</p>
        )}
      </section>

      <section>
        <h2 className="text-section font-semibold mb-6">Published</h2>
        {published.length > 0 ? (
          <div className="space-y-0">
            {published.map(post => (
              <PostItem key={post.id} post={post} onDelete={handleDelete} onUnpublish={handleUnpublish} onPublish={handlePublish} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No published articles</p>
        )}
      </section>
    </div>
  )
}
