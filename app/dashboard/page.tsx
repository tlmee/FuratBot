'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bot } from 'lucide-react'

interface Server {
  id: string
  name: string
  icon: string | null
}

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/servers')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch servers')
        }
        return response.json()
      })
      .then(data => {
        setServers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching servers:', err)
        setError('Failed to load servers. Please try again later.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <div className="text-white text-2xl">جاري تحميل السيرفرات...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-indigo-950 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">لوحة التحكم</h1>
      {servers.length === 0 ? (
        <div className="text-white text-xl">
          لم يتم العثور على أي سيرفرات. تأكد من أن لديك صلاحيات الإدارة في السيرفرات التي تم إضافة البوت إليها.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map(server => (
            <Link href={`/dashboard/server/${server.id}`} key={server.id}>
              <div className="bg-indigo-900 rounded-lg p-6 hover:bg-indigo-800 transition-colors duration-200 flex items-center space-x-4 rtl:space-x-reverse">
                {server.icon ? (
                  <img
                    src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                    alt={server.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-white">{server.name}</h2>
                  <p className="text-indigo-300">انقر للإدارة</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

