'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const router = useRouter()

  useEffect(() => {
    // Trigger a re-fetch of the user data
    window.location.href = '/'
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-950">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">تم تسجيل الدخول بنجاح</h1>
        <p>جاري إعادة توجيهك...</p>
      </div>
    </div>
  )
}

