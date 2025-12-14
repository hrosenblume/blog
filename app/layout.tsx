import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Metadata, Viewport } from 'next'
import { HOMEPAGE } from '@/lib/homepage'
import { getBaseUrl, SITE_DESCRIPTION, SITE_KEYWORDS, TWITTER_HANDLE, OG_STYLE, OG_SIZE_SQUARE } from '@/lib/metadata'
import { RB2BScript } from '@/components/RB2BScript'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl()
  
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: HOMEPAGE.name,
      template: `%s | ${HOMEPAGE.name}`,
    },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    authors: [{ name: HOMEPAGE.name }],
    creator: HOMEPAGE.name,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: HOMEPAGE.name,
      images: [{
        url: `${baseUrl}/polyhedra/thumbnails/${OG_STYLE.defaultShape}.png`,
        width: OG_SIZE_SQUARE.width,
        height: OG_SIZE_SQUARE.height,
        alt: HOMEPAGE.name,
      }],
    },
    twitter: {
      card: 'summary',
      creator: TWITTER_HANDLE,
      images: [`${baseUrl}/polyhedra/thumbnails/${OG_STYLE.defaultShape}.png`],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <RB2BScript />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
