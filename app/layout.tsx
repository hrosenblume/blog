import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Metadata } from 'next'
import { HOMEPAGE } from '@/lib/homepage'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'),
  title: {
    default: HOMEPAGE.name,
    template: `%s | ${HOMEPAGE.name}`,
  },
  description: 'Essays on startups, building, and life.',
  keywords: ['essays', 'blog', 'startups', 'building', 'writing'],
  authors: [{ name: HOMEPAGE.name }],
  creator: HOMEPAGE.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: HOMEPAGE.name,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@hrosenblume',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
