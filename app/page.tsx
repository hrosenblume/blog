import { prisma } from '@/lib/db'
import { SecretNav } from '@/components/SecretNav'
import { HomeKeyboardNav } from '@/app/_components/HomeKeyboardNav'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { TapLink } from '@/components/TapLink'
import { HOMEPAGE } from '@/lib/homepage'

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
  const allPosts = await getPublishedPosts()
  const posts = HOMEPAGE.notes.maxItems 
    ? allPosts.slice(0, HOMEPAGE.notes.maxItems) 
    : allPosts

  const linkClass = 'underline hover:text-gray-900 dark:hover:text-white transition-colors'

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <HomeKeyboardNav />
      
      <header className="mb-16">
        <h1 className="text-title font-bold mb-6 dark:text-white">
          <SecretNav>{HOMEPAGE.name}</SecretNav>
        </h1>
        <div className="max-w-xl space-y-4">
          {HOMEPAGE.bio.map((paragraph, pIndex) => (
            <p key={pIndex} className="leading-relaxed text-body text-gray-600 dark:text-gray-400">
              {paragraph.map((segment, sIndex) =>
                segment.href ? (
                  <TapLink key={sIndex} href={segment.href} className={linkClass}>
                    {segment.text}
                  </TapLink>
                ) : (
                  <span key={sIndex}>{segment.text}</span>
                )
              )}
            </p>
          ))}
        </div>
      </header>

      <section>
        <h2 className="text-h1 font-semibold mb-8 dark:text-white">{HOMEPAGE.notes.title}</h2>
        
        {posts.length === 0 ? (
          <p className="text-gray-500">{HOMEPAGE.notes.emptyMessage}</p>
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
