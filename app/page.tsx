import { prisma } from '@/lib/db'
import { EmailLink } from '@/components/EmailLink'
import { SecretNav } from '@/components/SecretNav'
import { HomeKeyboardNav } from '@/components/HomeKeyboardNav'
import { EssayLink } from '@/components/EssayLink'

export const revalidate = 60

async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      polyhedraShape: true,
    },
  })
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
                <EssayLink
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  subtitle={post.subtitle}
                  polyhedraShape={post.polyhedraShape}
                  index={index}
                />
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
