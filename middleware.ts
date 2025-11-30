import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to handle proxy headers for OAuth
 * When behind a reverse proxy (ngrok, etc.), the host header is localhost
 * but x-forwarded-host contains the actual public URL.
 * This middleware sets the host header to match x-forwarded-host
 * so NextAuth generates the correct OAuth callback URLs.
 */
export function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  
  // If behind a proxy, set host header to the forwarded host for NextAuth
  if (forwardedHost) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('host', forwardedHost)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/:path*'],
}

