import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const REDIRECT_URI = 'http://localhost:3000/api/discord/callback'
    
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Error in Discord callback:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

