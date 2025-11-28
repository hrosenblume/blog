'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  wordCount: number
  updatedAt: string
  publishedAt: string | null
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const drafts = filteredPosts.filter(p => p.status === 'draft')
  const published = filteredPosts.filter(p => p.status === 'published')

  const stats = useMemo(() => {
    const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0)
    return [
      { label: 'Total', value: posts.length },
      { label: 'Published', value: posts.filter(p => p.status === 'published').length },
      { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length },
      { label: 'Words', value: formatNumber(totalWords) },
    ]
  }, [posts])

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(posts.filter(p => p.id !== id))
  }

  async function handleUnpublish(id: string) {
    await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'draft' as const } : p))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-3xl font-bold mb-2">Writer</h1>
          <p className="text-gray-600 dark:text-gray-400">Your writing workspace</p>
        </div>
        <Link
          href="/writer/editor"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map(stat => (
          <div key={stat.label} className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <p className="text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
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
          className="w-full px-0 py-2 bg-transparent border-b border-gray-200 dark:border-gray-800 outline-none focus:border-gray-400 dark:focus:border-gray-600 placeholder-gray-400"
        />
      </div>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Drafts</h2>
        {drafts.length > 0 ? (
          <div className="space-y-0">
            {drafts.map(post => (
              <PostItem key={post.id} post={post} onDelete={handleDelete} onUnpublish={handleUnpublish} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No drafts</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Published</h2>
        {published.length > 0 ? (
          <div className="space-y-0">
            {published.map(post => (
              <PostItem key={post.id} post={post} onDelete={handleDelete} onUnpublish={handleUnpublish} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No published articles</p>
        )}
      </section>
    </div>
  )
}

function PostItem({ 
  post, 
  onDelete, 
  onUnpublish 
}: { 
  post: Post
  onDelete: (id: string) => void
  onUnpublish: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 group">
      <div className="flex-1 min-w-0">
        <Link href={`/writer/editor/${post.id}`} className="block">
          <h3 className="font-medium truncate group-hover:text-gray-600 dark:group-hover:text-gray-300">
            {post.title || 'Untitled'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatRelativeTime(post.updatedAt)} · {post.wordCount} words
          </p>
        </Link>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <Link
                href={`/writer/editor/${post.id}`}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowMenu(false)}
              >
                Edit
              </Link>
              {post.status === 'published' && (
                <>
                  <Link
                    href={`/e/${post.slug}`}
                    target="_blank"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowMenu(false)}
                  >
                    View Live
                  </Link>
                  <button
                    onClick={() => { onUnpublish(post.id); setShowMenu(false) }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Unpublish
                  </button>
                </>
              )}
              <button
                onClick={() => { onDelete(post.id); setShowMenu(false) }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


