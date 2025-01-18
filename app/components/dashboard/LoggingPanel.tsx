import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LoggingPanelProps {
  serverId: string
}

export default function LoggingPanel({ serverId }: LoggingPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">إعدادات السجلات</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="قناة السجلات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="logs">#السجلات</SelectItem>
              <SelectItem value="mod-logs">#سجلات-الإشراف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">سجلات الدخول والخروج</h3>
              <p className="text-gray-600">تسجيل دخول وخروج الأعضاء</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">سجلات الرسائل المحذوفة</h3>
              <p className="text-gray-600">تسجيل الرسائل التي تم حذفها</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">سجلات تعديل الرتب</h3>
              <p className="text-gray-600">تسجيل التغييرات في رتب الأعضاء</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  )
}

