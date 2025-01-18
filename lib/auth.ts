'use server'

import { cookies } from 'next/headers'

export async function getSession(): Promise<AuthSession | null> {
  const sessionCookie = cookies().get('session')?.value
  if (!sessionCookie) return null
  
  try {
    return JSON.parse(sessionCookie) as AuthSession
  } catch {
    return null
  }
}

