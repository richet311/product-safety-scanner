import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const intent = searchParams.get('intent') ?? 'signin'

  const cookieStore = await cookies()
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_error`)
  }

  // Set intent cookie in the same response — survives the Google OAuth redirect cycle
  // because it's set on our domain before the browser ever leaves
  cookieStore.set('oauth_intent', intent, {
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
    httpOnly: true,
  })

  return NextResponse.redirect(data.url)
}
