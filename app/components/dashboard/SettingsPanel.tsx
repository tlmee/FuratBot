import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SettingsPanelProps {
  serverId: string
}

export default function SettingsPanel({ serverId }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">إعدادات عامة</h2>
      <div className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">بادئة الأوامر</label>
            <Input placeholder="!" className="w-24" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">اللغة</label>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">المنطقة الزمنية</label>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر المنطقة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ast">توقيت السعودية (AST)</SelectItem>
                <SelectItem value="gmt">توقيت جرينتش (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="pt-4">
          <Button variant="destructive">حذف البوت من السيرفر</Button>
        </div>
      </div>
    </div>
  )
}

