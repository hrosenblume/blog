import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { EmailLink } from '@/components/EmailLink'
import { SecretNav } from '@/components/SecretNav'
import { HomeKeyboardNav } from '@/components/HomeKeyboardNav'

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
      polyhedraGif: true,
    },
  })
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
      <HomeKeyboardNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-20">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">
            <SecretNav>Hunter Rosenblume</SecretNav>
          </h1>
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

        <section>
          <h2 className="text-xl font-semibold mb-8 dark:text-white">Essays</h2>
          
          {posts.length === 0 ? (
            <p className="text-gray-500">No essays yet.</p>
          ) : (
            <div className="space-y-0">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/e/${post.slug}`}
                  className="group block w-full text-left border-b border-gray-200 dark:border-gray-800 last:border-b-0 transition-all hover:bg-gray-50 dark:hover:bg-gray-900/30 -mx-4 px-4 py-5 rounded"
                >
                  <div className="flex items-center gap-4">
                    {/* Polyhedra GIF */}
                    <div className="flex-shrink-0 w-[60px] h-[60px] rounded overflow-hidden">
                      {post.polyhedraGif ? (
                        <Image
                          src={`/polyhedra/${post.polyhedraGif}`}
                          alt={`Animated polyhedra for ${post.title}`}
                          width={60}
                          height={60}
                          unoptimized
                          loading={index < 3 ? 'eager' : 'lazy'}
                          className="polyhedra-gif"
                        />
                      ) : (
                        // Fallback placeholder for posts without GIF
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <span className="text-gray-600 text-xs">◇</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Title and subtitle */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 transition-colors dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                        {getSubtitle(post.markdown)}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <svg 
                      className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" 
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

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <nav className="flex gap-6 text-gray-600 dark:text-gray-400" aria-label="Social links">
            <a href="https://x.com/hrosenblume" className="transition-colors hover:text-gray-900 dark:hover:text-white">
              Twitter
            </a>
            <a href="https://www.linkedin.com/in/hrosenblume/" className="transition-colors hover:text-gray-900 dark:hover:text-white">
              LinkedIn
            </a>
            <EmailLink className="transition-colors hover:text-gray-900 dark:hover:text-white" />
          </nav>
        </footer>
      </div>
    </div>
  )
}
