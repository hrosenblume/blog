# Subscription Option: RSS Feed + Simple Email

## Goal
Allow readers to subscribe to new essays via RSS feed and/or email newsletter (using a low-maintenance service like Buttondown or Mailchimp).

## Components

### 1. RSS Feed

#### 1.1 Create RSS Route

Create `app/feed.xml/route.ts`:

```tsx
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { homepage } from '@/lib/homepage'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  
  const essays = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      title: true,
      slug: true,
      content: true,
      createdAt: true,
    },
  })

  const rssItems = essays.map((essay) => {
    // Convert markdown to plain text for description
    const description = essay.content
      .replace(/[#*_\[\]`]/g, '')
      .slice(0, 300)
      .trim() + '...'

    return `
    <item>
      <title><![CDATA[${essay.title}]]></title>
      <link>${baseUrl}/e/${essay.slug}</link>
      <guid isPermaLink="true">${baseUrl}/e/${essay.slug}</guid>
      <pubDate>${new Date(essay.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${homepage.name}'s Blog</title>
    <link>${baseUrl}</link>
    <description>Essays and thoughts by ${homepage.name}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

#### 1.2 Add RSS Link to Head

Update `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  // ... existing metadata
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
}
```

#### 1.3 Add RSS Link to Footer

```tsx
// components/HomepageFooter.tsx
<a 
  href="/feed.xml" 
  className="text-gray-500 hover:text-gray-900"
  title="RSS Feed"
>
  <RssIcon className="w-5 h-5" />
</a>
```

### 2. Email Newsletter (Buttondown)

Buttondown is simple, affordable, and developer-friendly.

#### 2.1 Setup Buttondown
1. Sign up at buttondown.email
2. Get your API key
3. Add to `.env.local`:
   ```env
   BUTTONDOWN_API_KEY=your-api-key
   ```

#### 2.2 Create Subscribe API Route

Create `app/api/subscribe/route.ts`:

```tsx
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Valid email required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        tags: ['blog'],
      }),
    })

    if (response.status === 201) {
      return NextResponse.json({ success: true })
    }

    if (response.status === 409) {
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    const data = await response.json()
    return NextResponse.json(
      { error: data.detail || 'Subscription failed' },
      { status: response.status }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 }
    )
  }
}
```

#### 2.3 Create Subscribe Component

```tsx
// components/Subscribe.tsx
'use client'

import { useState } from 'react'

export function Subscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('Thanks for subscribing!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong')
    }
  }

  return (
    <div className="max-w-md">
      <h3 className="text-section font-semibold mb-2">Subscribe</h3>
      <p className="text-body text-gray-500 mb-4">
        Get new essays in your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg dark:bg-white dark:text-gray-900 disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-2 text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
      
      <p className="mt-4 text-xs text-gray-400">
        Or subscribe via <a href="/feed.xml" className="underline">RSS</a>
      </p>
    </div>
  )
}
```

#### 2.4 Add to Homepage/Footer

```tsx
// app/page.tsx or components/HomepageFooter.tsx
import { Subscribe } from '@/components/Subscribe'

// Add subscribe section
<section className="mt-12 pt-8 border-t">
  <Subscribe />
</section>
```

### 3. Alternative: Mailchimp

If preferring Mailchimp:

```tsx
// app/api/subscribe/route.ts
import mailchimp from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., 'us1'
})

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
      email_address: email,
      status: 'subscribed',
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }
}
```

## Environment Variables

Add to `.env.example`:

```env
# Newsletter (choose one)
BUTTONDOWN_API_KEY=
# OR
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_LIST_ID=
```

## Files to Create
- `app/feed.xml/route.ts` - RSS feed
- `app/api/subscribe/route.ts` - Email subscription API
- `components/Subscribe.tsx` - Subscribe form
- Update `app/layout.tsx` - RSS link in head
- Update `components/HomepageFooter.tsx` - RSS icon link
- Update `app/page.tsx` - Subscribe section

## Testing Checklist
- [ ] RSS feed is valid XML
- [ ] RSS feed includes all published essays
- [ ] RSS feed validates (use W3C Feed Validator)
- [ ] Subscribe form submits correctly
- [ ] Success message shows on subscribe
- [ ] Error handling works
- [ ] Already-subscribed case handled
- [ ] RSS link in footer works
- [ ] RSS autodiscovery works in browsers

## Sending Newsletters
With Buttondown:
1. Write essay in blog
2. Publish essay
3. Go to Buttondown dashboard
4. Create new email with essay content/link
5. Send to subscribers

Or automate with webhook (advanced):
- Create webhook on publish
- Trigger Buttondown API to create draft email

