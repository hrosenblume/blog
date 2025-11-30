import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { renderMarkdown } from '@/lib/markdown'
import { KeyboardNav } from './_components/KeyboardNav'
import { EssayNav } from '@/components/EssayNav'
import { HomepageFooter } from '@/components/HomepageFooter'
import { BackLink } from '@/components/BackLink'
import { PageContainer } from '@/components/PageContainer'
import { HOMEPAGE } from '@/lib/homepage'
import { getBaseUrl, OG_STYLE, OG_SIZE_SQUARE } from '@/lib/metadata'

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
  const description = post.subtitle || post.markdown.replace(/[#*_\[\]]/g, '').slice(0, 160).trim() + '...'
  
  // Use polyhedra thumbnail as OG image
  const shapeName = post.polyhedraShape || OG_STYLE.defaultShape
  const imageUrl = `${baseUrl}/polyhedra/thumbnails/${shapeName}.png`
  
  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${baseUrl}/e/${slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [HOMEPAGE.name],
      images: [{
        url: imageUrl,
        width: OG_SIZE_SQUARE.width,
        height: OG_SIZE_SQUARE.height,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description,
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

  return (
    <div className="min-h-screen">
      <KeyboardNav prevSlug={prev?.slug ?? null} nextSlug={next?.slug ?? null} slug={post.slug} />
      <PageContainer>
        <BackLink href="/" label="Home" />

        <article className="space-y-6">
          <h1 className="text-title font-bold">{post.title}</h1>
          {post.subtitle && (
            <p className="text-lg text-muted-foreground -mt-4">{post.subtitle}</p>
          )}
          
          {/* Author byline - no date per plan 11 */}
          <header className="text-sm text-muted-foreground mb-8">
            <Link 
              href="/" 
              className="underline hover:text-foreground transition-colors"
            >
              {HOMEPAGE.name}
            </Link>
          </header>

          <div 
            className="prose prose-gray dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4
              prose-p:leading-relaxed
              prose-a:underline
              prose-blockquote:border-border"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>

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
