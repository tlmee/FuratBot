'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MessageStat {
  date: string
  messages: number
  botMessages: number
}

interface MemberStat {
  date: string
  joins: number
  leaves: number
  total: number
}

interface ActivityStat {
  hour: number
  messages: number
  active: number
}

interface ServerStatsProps {
  messageStats: MessageStat[]
  memberStats: MemberStat[]
  activityStats: ActivityStat[]
}

export default function ServerStats({ messageStats, memberStats, activityStats }: ServerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>نشاط الرسائل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messageStats}>
                <defs>
                  <linearGradient id="messageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#888888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  contentStyle={{ background: '#1a1b1c', border: 'none' }}
                  labelStyle={{ color: '#888888' }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#messageGradient)"
                  name="الرسائل"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>حركة الأعضاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberStats}>
                <defs>
                  <linearGradient id="joinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="leaveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#888888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  contentStyle={{ background: '#1a1b1c', border: 'none' }}
                  labelStyle={{ color: '#888888' }}
                />
                <Area
                  type="monotone"
                  dataKey="joins"
                  stackId="1"
                  stroke="#4ADE80"
                  fill="url(#joinGradient)"
                  name="انضمام"
                />
                <Area
                  type="monotone"
                  dataKey="leaves"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="url(#leaveGradient)"
                  name="مغادرة"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>النشاط اليومي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityStats}>
                <XAxis 
                  dataKey="hour" 
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis stroke="#888888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  contentStyle={{ background: '#1a1b1c', border: 'none' }}
                  labelStyle={{ color: '#888888' }}
                />
                <Bar 
                  dataKey="messages" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                  name="الرسائل"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

