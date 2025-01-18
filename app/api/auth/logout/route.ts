import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_API_BASE_URL))
  response.cookies.delete('session')
  return response
}

