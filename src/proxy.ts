// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Create middleware client dengan request/response headers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requestHeaders
            .get('cookie')
            ?.split(';')
            .map(c => {
              const [name, value] = c.trim().split('=', 2)
              return { name, value }
            }) || []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append(
              'Set-Cookie',
              `${name}=${value}; Path=${options?.path || '/'}; ${
                options?.maxAge ? `Max-Age=${options.maxAge}` : ''
              }`
            )
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const publicPaths = ['/', '/login']
  const protectedPaths = ['/issues', '/dashboard']

  // Protect routes
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect logged-in users from public paths
  if (publicPaths.includes(request.nextUrl.pathname) && session) {
    return NextResponse.redirect(new URL('/issues', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
