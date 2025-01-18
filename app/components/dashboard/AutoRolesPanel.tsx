import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AutoRolesPanelProps {
  serverId: string
}

export default function AutoRolesPanel({ serverId }: AutoRolesPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">الرتب التلقائية</h2>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="اختر الرتبة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">عضو جديد</SelectItem>
              <SelectItem value="active">عضو نشط</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Button>إضافة رتبة تلقائية</Button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">الرتب التلقائية الحالية</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border">
              <span className="font-medium">عضو جديد</span>
              <Button variant="destructive" size="sm">حذف</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

