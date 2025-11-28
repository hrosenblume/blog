import Link from 'next/link'
import { prisma } from '@/lib/db'

export const revalidate = 60

async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      markdown: true,
      publishedAt: true,
    },
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function getReadTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length
  const mins = Math.ceil(words / 200)
  return `${mins} min read`
}

function getSubtitle(markdown: string): string {
  // Get first paragraph as subtitle
  const firstPara = markdown.split('\n\n')[0]?.replace(/^#+\s*/, '').trim()
  if (firstPara && firstPara.length > 100) {
    return firstPara.substring(0, 100) + '...'
  }
  return firstPara || ''
}

export default async function Home() {
  const posts = await getPublishedPosts()

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-20">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Hunter Rosenblume</h1>
          <p className="max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">
            I started my career as a{' '}
            <a
              href="https://thielfellowship.org"
              className="underline hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Thiel Fellow
            </a>{' '}
            and software engineer. More recently, I am the co-founder and CEO of{' '}
            <a
              href="https://ordo.com"
              className="underline hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Ordo
            </a>
            , a school lunch company. This year we&apos;re serving over 3 million meals in 15 states. I write about startups.
          </p>
        </header>

        {/* Essays */}
        <section>
          <h2 className="text-xl font-semibold mb-8 dark:text-white">Essays</h2>
          
          {posts.length === 0 ? (
            <p className="text-gray-500">No essays yet.</p>
          ) : (
            <div className="space-y-0">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/e/${post.slug}`}
                  className="group block w-full text-left border-b border-gray-200 dark:border-gray-800 last:border-b-0 transition-all hover:bg-gray-50 dark:hover:bg-gray-900/30 -mx-4 px-4 py-6 rounded"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2 transition-colors dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        {getSubtitle(post.markdown)}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        {post.publishedAt && (
                          <time>{formatDate(post.publishedAt)}</time>
                        )}
                        <span>·</span>
                        <span>{getReadTime(post.markdown)}</span>
                      </div>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <nav className="flex gap-6 text-gray-600 dark:text-gray-400" aria-label="Social links">
            <a href="https://twitter.com" className="transition-colors hover:text-gray-900 dark:hover:text-white">
              Twitter
            </a>
            <a href="https://linkedin.com" className="transition-colors hover:text-gray-900 dark:hover:text-white">
              LinkedIn
            </a>
            <a href="mailto:hello@example.com" className="transition-colors hover:text-gray-900 dark:hover:text-white">
              Email
            </a>
          </nav>
        </footer>
      </div>
    </div>
  )
}
