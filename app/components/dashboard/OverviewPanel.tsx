'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Bot, MessageSquare, Hash, Volume2, Folder, Calendar, Activity } from 'lucide-react'
import Image from 'next/image'
import ServerStats from './ServerStats'

interface ServerOverview {
  id: string
  name: string
  icon: string | null
  memberCount: number
  botCount: number
  onlineMembers: number
  textChannels: number
  voiceChannels: number
  categoryChannels: number
  totalChannels: number
  totalMessages: number
  userMessages: number
  botMessages: number
  messageRate: string
  createdAt: string | null;
  joinedAt: string | null;
  stats: {
    messages: Array<{
      date: string
      messages: number
      botMessages: number
    }>
    members: Array<{
      date: string
      joins: number
      leaves: number
      total: number
    }>
    activity: Array<{
      hour: number
      messages: number
      active: number
    }>
  }
}

interface OverviewPanelProps {
  serverId: string
}

export default function OverviewPanel({ serverId }: OverviewPanelProps) {
  const [overview, setOverview] = useState<ServerOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/server/${serverId}/overview`)
        if (!response.ok) {
          throw new Error('Failed to fetch server overview')
        }
        const data = await response.json()
        setOverview(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching server overview:', err)
        setError('فشل في تحميل معلومات السيرفر. يرجى المحاولة مرة أخرى.')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [serverId])

  if (loading) {
    return <OverviewSkeleton />
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  if (!overview) {
    return <div className="text-center p-4">لا توجد معلومات متاحة</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {overview.icon ? (
          <Image
            src={`https://cdn.discordapp.com/icons/${overview.id}/${overview.icon}.png`}
            alt={overview.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">
              {overview.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{overview.name}</h2>
          <p className="text-gray-400 mt-1">
            {overview.createdAt 
              ? `تم إنشاؤه في ${new Date(overview.createdAt).toLocaleDateString('ar-SA')}` 
              : 'تاريخ الإنشاء غير متوفر'}
            {overview.joinedAt && ` • انضم البوت في ${new Date(overview.joinedAt).toLocaleDateString('ar-SA')}`}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">الأعضاء</CardTitle>
            <Users className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.memberCount}</div>
            <p className="text-xs text-indigo-300">
              {overview.onlineMembers} متصل الآن
            </p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">البوتات</CardTitle>
            <Bot className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.botCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">القنوات النصية</CardTitle>
            <Hash className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.textChannels}</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">القنوات الصوتية</CardTitle>
            <Volume2 className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.voiceChannels}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">إجمالي القنوات</CardTitle>
            <Folder className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.totalChannels}</div>
            <p className="text-xs text-indigo-300">
              {overview.categoryChannels} تصنيفات
            </p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">إجمالي الرسائل</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.totalMessages}</div>
            <p className="text-xs text-indigo-300">
              في آخر 100 رسالة
            </p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">رسائل المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.userMessages}</div>
            <p className="text-xs text-indigo-300">
              في آخر 100 رسالة
            </p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-950/30 border-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">نسبة تفاعل البوت</CardTitle>
            <Activity className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overview.messageRate}%</div>
            <p className="text-xs text-indigo-300">
              من إجمالي الرسائل
            </p>
          </CardContent>
        </Card>
      </div>
      <ServerStats 
        messageStats={overview.stats.messages}
        memberStats={overview.stats.members}
        activityStats={overview.stats.activity}
      />
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[150px] mt-2" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-indigo-950/30 border-indigo-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

