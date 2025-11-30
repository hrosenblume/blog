'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from '@/components/Spinner'
import { CenteredPage } from '@/components/CenteredPage'
import { Dropdown, DropdownItem } from '@/components/Dropdown'
import { PlusIcon, MoreVerticalIcon } from '@/components/Icons'
import { formatRelativeTime, formatNumber } from '@/lib/utils/format'
import { confirmPublish, confirmUnpublish } from '@/lib/utils/confirm'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { HOMEPAGE } from '@/lib/homepage'

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'deleted'
  wordCount: number
  updatedAt: string
  publishedAt: string | null
}

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

  const drafts = filteredPosts.filter(p => p.status === 'draft')
  const published = filteredPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return bDate - aDate
    })

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

  if (loading) {
    return (
      <CenteredPage>
        <Spinner />
      </CenteredPage>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="mb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-bold mb-2">{HOMEPAGE.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome to your workspace</p>
          </div>
          <Link
            href="/writer/editor"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusIcon />
            New Essay
          </Link>
        </div>
      </header>

      <Link
        href="/writer/editor"
        className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg hover:opacity-90 transition-opacity z-50"
        aria-label="New Essay"
      >
        <PlusIcon className="w-6 h-6" />
      </Link>

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
        <h2 className="text-section font-semibold mb-6">Drafts</h2>
        {drafts.length > 0 ? (
          <div className="space-y-0">
            {drafts.map(post => (
              <PostItem key={post.id} post={post} onDelete={handleDelete} onUnpublish={handleUnpublish} onPublish={handlePublish} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No drafts</p>
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
          <p className="text-gray-500">No published articles</p>
        )}
      </section>
    </div>
  )
}

function PostItem({ 
  post, 
  onDelete, 
  onUnpublish,
  onPublish,
}: { 
  post: Post
  onDelete: (id: string) => void
  onUnpublish: (id: string) => void
  onPublish: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 group">
      <div className="flex-1 min-w-0">
        <Link href={`/writer/editor/${post.slug}`} className="block">
          <h3 className="font-medium truncate group-hover:text-gray-600 dark:group-hover:text-gray-300">
            {post.title || 'Untitled'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatRelativeTime(post.updatedAt)} · {post.wordCount} words
          </p>
        </Link>
      </div>
      
      <Dropdown
        trigger={
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <MoreVerticalIcon className="text-gray-400" />
          </button>
        }
      >
        <Link
          href={`/writer/editor/${post.slug}`}
          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
        >
          Edit
        </Link>
        {post.status === 'draft' && (
          <DropdownItem onClick={() => onPublish(post.id)}>
            Publish
          </DropdownItem>
        )}
        {post.status === 'published' && (
          <>
            <Link
              href={`/e/${post.slug}`}
              target="_blank"
              className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              View Live
            </Link>
            <DropdownItem onClick={() => onUnpublish(post.id)}>
              Unpublish
            </DropdownItem>
          </>
        )}
        <DropdownItem destructive onClick={() => onDelete(post.id)}>
          Delete
        </DropdownItem>
      </Dropdown>
    </div>
  )
}
