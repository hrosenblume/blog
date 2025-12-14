import { notFound } from 'next/navigation'
import { ArticleJsonLd, BreadcrumbJsonLd } from 'next-seo'
import { prisma } from '@/lib/db'
import { renderMarkdown } from '@/lib/markdown'
import { KeyboardNav } from './_components/KeyboardNav'
import { EssayNav } from '@/components/EssayNav'
import { HomepageFooter } from '@/components/HomepageFooter'
import { BackLink } from '@/components/BackLink'
import { PageContainer } from '@/components/PageContainer'
import { ArticleLayout } from '@/components/ArticleLayout'
import { ArticleHeader } from '@/components/ArticleHeader'
import { ArticleBody } from '@/components/ArticleBody'
import { HOMEPAGE } from '@/lib/homepage'
import { getBaseUrl, OG_STYLE, OG_SIZE_SQUARE } from '@/lib/metadata'
import { getPostSeoValues, getSiteSettings, getEffectiveOgImage } from '@/lib/seo'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: 'published' },
  })
}

// Get adjacent posts with wrap-around (infinite loop)
async function getAdjacentPosts(currentSlug: string) {
  const essays = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true },
  })

  const currentIndex = essays.findIndex(e => e.slug === currentSlug)
  
  // If not found or only one essay, no navigation
  if (currentIndex === -1 || essays.length <= 1) {
    return { prev: null, next: null, isFirst: false, isLast: false }
  }

  const totalEssays = essays.length
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalEssays - 1

  // Wrap around logic
  const prevIndex = (currentIndex - 1 + totalEssays) % totalEssays
  const nextIndex = (currentIndex + 1) % totalEssays

  return {
    prev: essays[prevIndex],
    next: essays[nextIndex],
    isFirst,
    isLast,
  }
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { slug: true },
  })
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Not Found' }
  
  const baseUrl = await getBaseUrl()
  const siteSettings = await getSiteSettings()
  const seo = getPostSeoValues(post)
  
  // OG image fallback chain: post custom -> site default -> polyhedra thumbnail
  const shapeName = post.polyhedraShape || OG_STYLE.defaultShape
  const fallbackImage = `${baseUrl}/polyhedra/thumbnails/${shapeName}.png`
  const imageUrl = getEffectiveOgImage(post.ogImage, siteSettings.defaultOgImage, fallbackImage)
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.length > 0 ? seo.keywords : undefined,
    robots: post.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `${baseUrl}/e/${slug}`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [HOMEPAGE.name],
      images: [{
        url: imageUrl,
        width: OG_SIZE_SQUARE.width,
        height: OG_SIZE_SQUARE.height,
        alt: seo.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [imageUrl],
    },
  }
}

export default async function EssayPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const { prev, next, isFirst, isLast } = await getAdjacentPosts(post.slug)
  const htmlContent = renderMarkdown(post.markdown)
  const baseUrl = await getBaseUrl()
  const siteSettings = await getSiteSettings()
  const seo = getPostSeoValues(post)
  
  // OG image fallback chain for JSON-LD
  const shapeName = post.polyhedraShape || OG_STYLE.defaultShape
  const fallbackImage = `${baseUrl}/polyhedra/thumbnails/${shapeName}.png`
  const imageUrl = getEffectiveOgImage(post.ogImage, siteSettings.defaultOgImage, fallbackImage)

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        type="BlogPosting"
        headline={seo.title}
        datePublished={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        author={HOMEPAGE.name}
        image={imageUrl}
        description={seo.description}
        url={`${baseUrl}/e/${post.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: baseUrl },
          { name: post.title },
        ]}
      />
      
      <KeyboardNav prevSlug={prev?.slug ?? null} nextSlug={next?.slug ?? null} slug={post.slug} />
      <PageContainer>
        <BackLink href="/" label="Home" />

        <ArticleLayout
          header={
            <ArticleHeader 
              title={post.title} 
              subtitle={post.subtitle ?? undefined}
              byline={HOMEPAGE.name}
              bylineHref="/"
            />
          }
        >
          <ArticleBody>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </ArticleBody>
        </ArticleLayout>

        <EssayNav 
          prev={prev} 
          next={next} 
          isFirst={isFirst} 
          isLast={isLast} 
        />

        <HomepageFooter />
      </PageContainer>
    </div>
  )
}
