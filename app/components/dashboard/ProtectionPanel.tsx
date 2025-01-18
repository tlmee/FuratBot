import React from 'react'
import { Switch } from '@/components/ui/switch'

interface ProtectionPanelProps {
  serverId: string
}

export default function ProtectionPanel({ serverId }: ProtectionPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">إعدادات الحماية</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold">حماية ضد الروابط المزعجة</h3>
            <p className="text-gray-600">حذف الروابط المزعجة تلقائياً</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold">حماية ضد التكرار</h3>
            <p className="text-gray-600">منع تكرار الرسائل المتشابهة</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold">حماية ضد الحسابات المشبوهة</h3>
            <p className="text-gray-600">منع دخول الحسابات الجديدة المشبوهة</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  )
}

