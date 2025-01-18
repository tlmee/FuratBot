import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const sessionCookie = cookies().get('session')
  
  if (!sessionCookie) {
    return NextResponse.json(null)
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return NextResponse.json(session.user)
  } catch (error) {
    console.error('Error parsing session:', error)
    return NextResponse.json(null)
  }
}

