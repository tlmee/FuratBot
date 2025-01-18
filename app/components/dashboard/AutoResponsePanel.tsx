import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

interface AutoResponsePanelProps {
  serverId: string
}

export default function AutoResponsePanel({ serverId }: AutoResponsePanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">الرد التلقائي</h2>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input placeholder="الكلمة المفتاحية" className="flex-1" />
          <Input placeholder="الرد" className="flex-1" />
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            إضافة
          </Button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">الردود الحالية</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border">
              <div>
                <span className="font-medium">السلام عليكم</span>
                <span className="text-gray-500 mx-2">→</span>
                <span>وعليكم السلام</span>
              </div>
              <Button variant="destructive" size="sm">حذف</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

