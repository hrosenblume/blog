import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { BackLink } from '@/components/BackLink'
import { PageContainer } from '@/components/PageContainer'
import { HOMEPAGE } from '@/lib/homepage'
import { ESSAYS_PAGE } from '@/lib/essays'
import { getBaseUrl, OG_STYLE, OG_SIZE_SQUARE } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl()
  const imageUrl = `${baseUrl}/polyhedra/thumbnails/${OG_STYLE.defaultShape}.png`
  
  return {
    title: {
      absolute: ESSAYS_PAGE.title,  // Override template, just show "Essays"
    },
    description: `${ESSAYS_PAGE.descriptionPrefix}${HOMEPAGE.name}`,
    openGraph: {
      title: ESSAYS_PAGE.title,
      images: [{
        url: imageUrl,
        width: OG_SIZE_SQUARE.width,
        height: OG_SIZE_SQUARE.height,
        alt: ESSAYS_PAGE.title,
      }],
    },
    twitter: {
      card: 'summary',
      title: ESSAYS_PAGE.title,
      images: [imageUrl],
    },
  }
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
      <PageContainer>
        <header className="mb-8">
          <BackLink href={ESSAYS_PAGE.backLink.href} label={ESSAYS_PAGE.backLink.label.replace('← ', '')} />
          <h1 className="text-title font-bold">{ESSAYS_PAGE.title}</h1>
          <p className="text-muted-foreground mt-1">
            {ESSAYS_PAGE.recommendation.intro}
            <Link href={`/e/${ESSAYS_PAGE.recommendation.slug}`} className="underline hover:text-foreground">
              {ESSAYS_PAGE.recommendation.label}
            </Link>
            .
          </p>
        </header>

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
      </PageContainer>
    </div>
  )
}
