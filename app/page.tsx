import Link from 'next/link'
import { Metadata } from 'next'
import { OrganizationJsonLd } from 'next-seo'
import { prisma } from '@/lib/db'
import { SecretNav } from '@/components/SecretNav'
import { EssayLink } from '@/components/EssayLink'
import { HomepageFooter } from '@/components/HomepageFooter'
import { TapLink } from '@/components/TapLink'
import { HOMEPAGE } from '@/lib/homepage'
import { getBaseUrl, OG_STYLE, OG_SIZE_SQUARE } from '@/lib/metadata'
import { getSiteSettings, getOrgName, getOrgSocialUrls, getPageSeoValues, getEffectiveOgImage } from '@/lib/seo'

// Revalidate every hour (homepage content changes rarely)
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl()
  const siteSettings = await getSiteSettings()
  
  // Get page-specific overrides (falls back to site defaults)
  const pageSeo = await getPageSeoValues('home', {
    title: HOMEPAGE.name,
    description: `Essays and writing by ${HOMEPAGE.name}`,
  })
  
  // OG image fallback chain: page custom -> site default -> polyhedra thumbnail
  const fallbackImage = `${baseUrl}/polyhedra/thumbnails/${OG_STYLE.defaultShape}.png`
  const imageUrl = getEffectiveOgImage(pageSeo.ogImage, siteSettings.defaultOgImage, fallbackImage)
  
  return {
    title: {
      absolute: pageSeo.title,  // Override template for homepage
    },
    description: pageSeo.description,
    keywords: pageSeo.keywords.length > 0 ? pageSeo.keywords : undefined,
    robots: pageSeo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: pageSeo.title,
      description: pageSeo.description,
      images: [{
        url: imageUrl,
        width: OG_SIZE_SQUARE.width,
        height: OG_SIZE_SQUARE.height,
        alt: pageSeo.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageSeo.title,
      description: pageSeo.description,
      images: [imageUrl],
    },
  }
}

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

  // Get SEO settings for JSON-LD
  const baseUrl = await getBaseUrl()
  const siteSettings = await getSiteSettings()
  const orgName = getOrgName(siteSettings)
  const socialUrls = getOrgSocialUrls(siteSettings)

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* JSON-LD Structured Data */}
      <OrganizationJsonLd
        name={orgName}
        url={baseUrl}
        logo={siteSettings.orgLogo || undefined}
        sameAs={socialUrls.length > 0 ? socialUrls : undefined}
      />
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
