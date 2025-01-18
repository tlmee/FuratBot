'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ServerData {
  id: string
  permissions: string
  addedAt: string
}

export default function BotAdded() {
  const searchParams = useSearchParams()
  const [serverData, setServerData] = useState<ServerData | null>(null)

  useEffect(() => {
    const guild_id = searchParams.get('guild_id')
    if (guild_id) {
      fetch(`/api/server/${guild_id}`)
        .then(response => response.json())
        .then(data => setServerData(data))
        .catch(error => console.error('Error fetching server data:', error))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
      <div className="bg-indigo-900 p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-4">تمت إضافة البوت بنجاح!</h1>
        {serverData && (
          <div className="text-indigo-200 mb-6">
            <p className="text-xl mb-2">تمت إضافة FuratBot إلى السيرفر: {serverData.id}</p>
            <p>الصلاحيات: {serverData.permissions}</p>
            <p>تاريخ الإضافة: {new Date(serverData.addedAt).toLocaleString('ar-SA')}</p>
          </div>
        )}
        <Link
          href="/dashboard"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          الذهاب إلى لوحة التحكم
        </Link>
      </div>
    </div>
  )
}

