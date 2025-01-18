'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bot, ChevronDown, LogOut, UserPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/auth'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    }
  }

  useEffect(() => {
    fetchUser()
    
    window.addEventListener('focus', fetchUser)
    return () => window.removeEventListener('focus', fetchUser)
  }, [])

  // useEffect(() => {
  //   router.events.on('routeChangeComplete', fetchUser)
  //   return () => {
  //     router.events.off('routeChangeComplete', fetchUser)
  //   }
  // }, [router.events])

  const handleAuth = async (action: 'login' | 'add-bot') => {
    try {
      const response = await fetch(`/api/discord/auth-url?action=${action}`)
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error(`Error getting ${action} URL:`, error)
    }
  }

  return (
    <header className="border-b border-gray-800 bg-indigo-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Bot className="w-8 h-8" />
            <span>FuratBot</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
                الميزات
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>الأوامر</DropdownMenuItem>
                <DropdownMenuItem>نظام الترحيب</DropdownMenuItem>
                <DropdownMenuItem>الإدارة</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
                الموارد
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>الدعم</DropdownMenuItem>
                <DropdownMenuItem>التوثيق</DropdownMenuItem>
                <DropdownMenuItem>الأسئلة الشائعة</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/premium"
            className="hidden md:block text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            بريميوم ✨
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm text-gray-300">{user.username}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">لوحة التحكم</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/logout" className="text-red-500">
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => handleAuth('login')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm border border-gray-700"
            >
              تسجيل الدخول
            </button>
          )}
          <button
            onClick={() => handleAuth('add-bot')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة البوت
          </button>
        </div>
      </div>
    </header>
  )
}

