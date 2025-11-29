import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate } from '@/lib/utils/format'
import { KeyboardNav } from './KeyboardNav'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: 'published' },
  })
}

async function getAdjacentPosts(currentId: string, publishedAt: Date | null) {
  if (!publishedAt) return { prev: null, next: null }
  
  const [prev, next] = await Promise.all([
    // Previous = newer post (go back up the timeline)
    prisma.post.findFirst({
      where: { 
        status: 'published',
        publishedAt: { gt: publishedAt },
      },
      orderBy: { publishedAt: 'asc' },
      select: { slug: true, title: true },
    }),
    // Next = older post (continue reading down the timeline)
    prisma.post.findFirst({
      where: { 
        status: 'published',
        publishedAt: { lt: publishedAt },
      },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, title: true },
    }),
  ])
  
  return { prev, next }
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { slug: true },
  })
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Not Found' }
  return {
    title: post.title,
    description: post.markdown.substring(0, 160),
  }
}

export default async function EssayPage({ params }: Props) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const { prev, next } = await getAdjacentPosts(post.id, post.publishedAt)
  const htmlContent = renderMarkdown(post.markdown)

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <KeyboardNav prevSlug={prev?.slug ?? null} nextSlug={next?.slug ?? null} slug={post.slug} />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link 
          href="/"
          className="inline-block text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          ← Home
        </Link>
        <article className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
          
          <header className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <div>
              <Link 
                href="/" 
                className="underline hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Hunter Rosenblume
              </Link>
            </div>
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt)}
              </time>
            )}
          </header>

          <div 
            className="prose prose-gray dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4
              prose-p:text-gray-900 prose-p:dark:text-white prose-p:leading-relaxed
              prose-a:text-gray-900 prose-a:dark:text-white prose-a:underline
              prose-strong:text-gray-900 prose-strong:dark:text-white
              prose-code:text-gray-900 prose-code:dark:text-white
              prose-blockquote:border-gray-300 prose-blockquote:dark:border-gray-700
              prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm">
          {prev ? (
            <Link 
              href={`/e/${prev.slug}`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Previous essay
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link 
              href={`/e/${next.slug}`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Next essay →
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </div>
    </div>
  )
}
