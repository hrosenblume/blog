import { prisma } from '@/lib/db'
import { SecretNav } from '@/components/SecretNav'
import { HomeKeyboardNav } from '@/app/_components/HomeKeyboardNav'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { TapLink } from '@/components/TapLink'
import { AUTHOR } from '@/lib/author'

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

  const linkClass = 'underline hover:text-gray-900 dark:hover:text-white transition-colors'

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <HomeKeyboardNav />
      
      <header className="mb-16">
        <h1 className="text-title font-bold mb-6 dark:text-white">
          <SecretNav>{AUTHOR.name}</SecretNav>
        </h1>
        <p className="max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">
          {AUTHOR.bio.map((segment, i) =>
            segment.href ? (
              <TapLink key={i} href={segment.href} className={linkClass}>
                {segment.text}
              </TapLink>
            ) : (
              <span key={i}>{segment.text}</span>
            )
          )}
        </p>
      </header>

      <section>
        <h2 className="text-section font-semibold mb-8 dark:text-white">Essays</h2>
        
        {posts.length === 0 ? (
          <p className="text-gray-500">No essays yet.</p>
        ) : (
          <div className="-mx-6">
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

      <HomepageFooter />
    </main>
  )
}
