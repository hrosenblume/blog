'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

type RB2BScriptProps = {
  apiKey: string | null
}

export function RB2BScript({ apiKey }: RB2BScriptProps) {
  const pathname = usePathname()

  // Only track public-facing pages (not settings/writer/auth)
  if (!apiKey || pathname?.startsWith('/settings') || pathname?.startsWith('/writer') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <Script
      id="rb2b-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(key) {
            if (window.reb2b) return;
            window.reb2b = {loaded: true};
            var s = document.createElement("script");
            s.async = true;
            s.src = "https://ddwl4m2hdecbv.cloudfront.net/b/" + key + "/" + key + ".js.gz";
            s.onerror = function () {
              console.warn("[RB2B] tracker failed to load (key=" + key + "). The CDN script returned an error — the key has likely been rotated, disabled, or the account changed plan. Update the key in /settings/integrations.");
            };
            document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);
          }("${apiKey}");
        `,
      }}
    />
  )
}
