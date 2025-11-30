import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SecretNav } from '@/components/SecretNav'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { TapLink } from '@/components/TapLink'
import { HOMEPAGE } from '@/lib/homepage'

// Revalidate every hour (homepage content changes rarely)
export const revalidate = 3600

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
          <p className="text-muted-foreground">{HOMEPAGE.notes.emptyMessage}</p>
        ) : (
          <>
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
            {HOMEPAGE.notes.maxItems && allPosts.length > HOMEPAGE.notes.maxItems && (
              <div className="mt-8 text-center">
                <Link 
                  href="/essays"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allPosts.length >= 20 ? `View all ${allPosts.length} essays →` : 'View all essays →'}
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <HomepageFooter />
    </main>
  )
}
