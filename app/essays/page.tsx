import Link from 'next/link'
import { prisma } from '@/lib/db'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { HOMEPAGE } from '@/lib/homepage'
import { ESSAYS_PAGE } from '@/lib/essays'

export const metadata = {
  title: ESSAYS_PAGE.title,
  description: `${ESSAYS_PAGE.descriptionPrefix}${HOMEPAGE.name}`,
}

export default async function EssaysPage() {
  const essays = await prisma.post.findMany({
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

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-8">
          <Link 
            href={ESSAYS_PAGE.backLink.href}
            className="inline-flex items-center min-h-[44px] px-3 py-2 -mx-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors mb-4"
          >
            {ESSAYS_PAGE.backLink.label}
          </Link>
          <h1 className="text-title font-bold">{ESSAYS_PAGE.title}</h1>
          <p className="text-muted-foreground mt-1">
            {ESSAYS_PAGE.recommendation.intro}
            <Link href={`/e/${ESSAYS_PAGE.recommendation.slug}`} className="underline hover:text-foreground">
              {ESSAYS_PAGE.recommendation.label}
            </Link>
            .
          </p>
        </header>

        {/* Essays list */}
        {essays.length === 0 ? (
          <p className="text-muted-foreground">{ESSAYS_PAGE.emptyMessage}</p>
        ) : (
          <div className="-mx-6">
            {essays.map((essay, index) => (
              <EssayLink 
                key={essay.id} 
                slug={essay.slug}
                title={essay.title}
                subtitle={essay.subtitle}
                polyhedraShape={essay.polyhedraShape}
                index={index}
              />
            ))}
          </div>
        )}

        <HomepageFooter />
      </div>
    </div>
  )
}

