import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  // Get all published essays
  const essays = await prisma.post.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  })
  
  const essayUrls = essays.map((essay) => ({
    url: `${baseUrl}/e/${essay.slug}`,
    lastModified: essay.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...essayUrls,
  ]
}

