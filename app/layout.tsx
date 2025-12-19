import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Metadata, Viewport } from 'next'
import { HOMEPAGE } from '@/lib/homepage'
import { getBaseUrl, TWITTER_HANDLE, OG_STYLE, OG_SIZE_SQUARE } from '@/lib/metadata'
import { RB2BScript } from '@/components/RB2BScript'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { PageTracker } from 'react-page-tracker'
import { Toaster } from '@/components/ui/sonner'
import { getSiteSettings, getEffectiveSiteTitle, getEffectiveSiteDescription, getEffectiveSiteKeywords, getTitleTemplate } from '@/lib/seo'
import { getIntegrationSettings } from '@/lib/integrations'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl()
  const siteSettings = await getSiteSettings()
  
  const siteTitle = getEffectiveSiteTitle(siteSettings)
  const siteDescription = getEffectiveSiteDescription(siteSettings)
  const siteKeywords = getEffectiveSiteKeywords(siteSettings)
  const titleTemplate = getTitleTemplate(siteSettings)
  const twitterHandle = siteSettings.twitterHandle || TWITTER_HANDLE
  
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: titleTemplate,
    },
    description: siteDescription,
    keywords: siteKeywords,
    authors: [{ name: HOMEPAGE.name }],
    creator: HOMEPAGE.name,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteTitle,
      images: [{
        url: `${baseUrl}/polyhedra/thumbnails/${OG_STYLE.defaultShape}.png`,
        width: OG_SIZE_SQUARE.width,
        height: OG_SIZE_SQUARE.height,
        alt: siteTitle,
      }],
    },
    twitter: {
      card: 'summary',
      creator: twitterHandle,
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const integrations = await getIntegrationSettings()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PageTracker />
        <Providers>{children}</Providers>
        <Toaster />
        <RB2BScript apiKey={integrations.rb2bApiKey} />
        <GoogleAnalytics gaId={integrations.googleAnalyticsId} />
      </body>
    </html>
  )
}
