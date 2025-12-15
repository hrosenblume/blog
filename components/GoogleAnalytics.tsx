'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

type GoogleAnalyticsProps = {
  gaId: string | null
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname()

  // Only track public-facing pages (not admin/writer/auth)
  if (!gaId || pathname?.startsWith('/admin') || pathname?.startsWith('/writer') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  )
}
