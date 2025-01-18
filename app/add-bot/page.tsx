'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AddBot() {
  const router = useRouter()

  useEffect(() => {
    async function getAuthUrl() {
      try {
        const response = await fetch('/api/discord/auth-url')
        const data = await response.json()
        
        if (data.url) {
          // Ensure the URL is absolute before redirecting
          window.location.href = data.url
        } else {
          // Fallback to dashboard if something goes wrong
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error fetching auth URL:', error)
        router.push('/dashboard')
      }
    }
    
    getAuthUrl()
  }, [router])

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">جارٍ توجيهك إلى Discord...</h1>
        <p className="text-gray-300">يرجى الانتظار بينما نقوم بتحضير عملية إضافة البوت.</p>
      </div>
    </div>
  )
}

