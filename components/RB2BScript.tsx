'use client'

import Script from 'next/script'

export function RB2BScript() {
  const apiKey = process.env.NEXT_PUBLIC_RB2B_API_KEY

  // Don't render if no key configured
  if (!apiKey) return null

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
            document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);
          }("${apiKey}");
        `,
      }}
    />
  )
}
