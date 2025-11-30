# Add Sitemap.xml and SEO Basics

## Goal
Implement essential SEO infrastructure: sitemap.xml, robots.txt, meta tags, and Open Graph support.

## Components

### 1. Sitemap.xml

#### 1.1 Dynamic Sitemap with Next.js

Create `app/sitemap.ts`:

```tsx
import { MetadataRoute } from 'next'
import prisma from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  
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
```

### 2. Robots.txt

Create `app/robots.ts`:

```tsx
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/writer/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 3. Global Meta Tags

Update `app/layout.tsx`:

```tsx
import { Metadata } from 'next'
import { homepage } from '@/lib/homepage'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'),
  title: {
    default: `${homepage.name}'s Blog`,
    template: `%s | ${homepage.name}`,
  },
  description: 'Personal essays and thoughts',
  keywords: ['essays', 'blog', 'writing', 'personal'],
  authors: [{ name: homepage.name }],
  creator: homepage.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: `${homepage.name}'s Blog`,
  },
  twitter: {
    card: 'summary_large_image',
    // Add twitter handle if available
    // creator: '@handle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

### 4. Essay Page Meta Tags

Update `app/e/[slug]/page.tsx`:

```tsx
import { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const essay = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true, content: true, createdAt: true },
  })
  
  if (!essay) return {}
  
  // Extract first 160 chars for description
  const description = essay.content
    .replace(/[#*_\[\]]/g, '') // Remove markdown
    .slice(0, 160)
    .trim() + '...'
  
  return {
    title: essay.title,
    description,
    openGraph: {
      title: essay.title,
      description,
      type: 'article',
      publishedTime: essay.createdAt.toISOString(),
      authors: [homepage.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: essay.title,
      description,
    },
  }
}
```

### 5. Canonical URLs

Add canonical URL to prevent duplicate content issues:

```tsx
// In essay page metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  
  return {
    // ... other metadata
    alternates: {
      canonical: `${baseUrl}/e/${params.slug}`,
    },
  }
}
```

### 6. JSON-LD Structured Data

Add structured data for rich search results:

```tsx
// components/JsonLd.tsx
export function ArticleJsonLd({ essay }: { essay: Post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: essay.title,
    author: {
      '@type': 'Person',
      name: homepage.name,
    },
    datePublished: essay.createdAt,
    dateModified: essay.updatedAt,
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// In essay page
<ArticleJsonLd essay={essay} />
```

## Environment Variables

Add to `.env.example`:

```env
# SEO
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Files to Create/Modify
- `app/sitemap.ts` - Dynamic sitemap
- `app/robots.ts` - Robots.txt
- `app/layout.tsx` - Global metadata
- `app/e/[slug]/page.tsx` - Essay metadata
- `components/JsonLd.tsx` - Structured data (optional)
- `.env.example` - Add BASE_URL variable

## Testing Checklist
- [ ] `/sitemap.xml` returns valid XML with all published essays
- [ ] `/robots.txt` returns correct rules
- [ ] Homepage has proper meta tags
- [ ] Essay pages have unique meta tags
- [ ] Open Graph tags work (test with Facebook debugger)
- [ ] Twitter cards work (test with Twitter card validator)
- [ ] Google can crawl and index pages
- [ ] Canonical URLs are correct

## Validation Tools
- Google Search Console
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

