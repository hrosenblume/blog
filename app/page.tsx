import { prisma } from '@/lib/db'
import { SecretNav } from '@/components/SecretNav'
import { HomeKeyboardNav } from '@/app/_components/HomeKeyboardNav'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { TapLink } from '@/components/TapLink'

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
    <main className="max-w-2xl mx-auto px-6 py-16">
      <HomeKeyboardNav />
      
      <header className="mb-16">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          <SecretNav>Hunter Rosenblume</SecretNav>
        </h1>
        <p className="max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">
          I started my career as a{' '}
          <TapLink
            href="https://thielfellowship.org"
            className="underline hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Thiel Fellow
          </TapLink>{' '}
          and software engineer. More recently, I am the co-founder and CEO of{' '}
          <TapLink
            href="https://ordo.com"
            className="underline hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Ordo
          </TapLink>
          , a school lunch company. This year we&apos;re serving over 3 million meals in 15 states. I write about startups.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-8 dark:text-white">Essays</h2>
        
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
