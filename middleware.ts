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
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const currentHost = request.headers.get('host')
  
  // Debug logging for auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('[middleware] Auth request:', {
      path: request.nextUrl.pathname,
      currentHost,
      forwardedHost,
      forwardedProto,
    })
  }
  
  // If behind a proxy, set headers for NextAuth to generate correct URLs
  if (forwardedHost) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('host', forwardedHost)
    // Ensure x-forwarded-proto is set for HTTPS detection
    if (forwardedProto) {
      requestHeaders.set('x-forwarded-proto', forwardedProto)
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|polyhedra|uploads).*)',
  ],
}

