'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Upload, Save } from 'lucide-react'
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface WelcomePanelProps {
  serverId: string
  onUnsavedChanges: (hasChanges: boolean) => void
}

interface WelcomeSettings {
  welcomeMessage: string
  welcomeImage: string | null
  welcomeChannel: string
  imageText: string
  imageTextColor: string
  imageTextSize: number
  imageTextX: number
  imageTextY: number
  avatarX: number
  avatarY: number
  avatarSize: number
  showAvatar: boolean
  showWelcomeText: boolean
  showUsername: boolean
  usernameX: number
  usernameY: number
  usernameSize: number
  usernameColor: string
  isWelcomeEnabled: boolean
  font: string
}

export default function WelcomePanel({ serverId, onUnsavedChanges }: WelcomePanelProps) {
  const [settings, setSettings] = useState<WelcomeSettings>({
    welcomeMessage: 'مرحبًا {user} في سيرفر {server}!',
    welcomeImage: null,
    welcomeChannel: '',
    imageText: 'أهلاً بك!',
    imageTextColor: '#ffffff',
    imageTextSize: 40,
    imageTextX: 50,
    imageTextY: 50,
    avatarX: 50,
    avatarY: 50,
    avatarSize: 128,
    showAvatar: true,
    showWelcomeText: true,
    showUsername: false,
    usernameX: 50,
    usernameY: 100,
    usernameSize: 24,
    usernameColor: '#ffffff',
    isWelcomeEnabled: true,
    font: 'Arial'
  })
  const [originalSettings, setOriginalSettings] = useState<WelcomeSettings | null>(null)
  const [channels, setChannels] = useState<Array<{ id: string, name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElement, setDraggedElement] = useState<'welcome' | 'avatar' | 'username' | null>(null)
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier', label: 'Courier' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'Garamond', label: 'Garamond' },
    { value: 'Bookman', label: 'Bookman' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  ]

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/server/${serverId}/welcome-settings`)
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          setOriginalSettings(data)
        }
      } catch (error) {
        console.error('Error fetching welcome settings:', error)
      }
    }

    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/server/${serverId}/channels`)
        if (response.ok) {
          const data = await response.json()
          setChannels(data.filter((channel: any) => channel.type === 0))
        }
      } catch (error) {
        console.error('Error fetching channels:', error)
      }
    }

    Promise.all([fetchSettings(), fetchChannels()]).then(() => setLoading(false))
  }, [serverId])

  useEffect(() => {
    if (originalSettings) {
      const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
      setHasUnsavedChanges(hasChanges)
      onUnsavedChanges(hasChanges)
    }
  }, [settings, originalSettings, onUnsavedChanges])

  useEffect(() => {
    if (hasUnsavedChanges) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = ''
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setSettings(prev => ({ ...prev, welcomeImage: img.src }))
          imageRef.current = img
          drawCanvas()
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageRef.current) return

    canvas.width = imageRef.current.width
    canvas.height = imageRef.current.height

    ctx.drawImage(imageRef.current, 0, 0)

    if (settings.isWelcomeEnabled) {
      if (settings.showWelcomeText) {
        ctx.font = `${settings.imageTextSize}px ${settings.font}`
        ctx.fillStyle = settings.imageTextColor
        ctx.textAlign = 'center'
        ctx.fillText(settings.imageText, settings.imageTextX, settings.imageTextY)
      
        ctx.beginPath()
        ctx.arc(settings.imageTextX, settings.imageTextY, 5, 0, Math.PI * 2)
        ctx.fillStyle = 'yellow'
        ctx.fill()
      }

      if (settings.showAvatar) {
        ctx.beginPath()
        ctx.arc(settings.avatarX, settings.avatarY, settings.avatarSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'
        ctx.fill()
        ctx.strokeStyle = 'yellow'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      if (settings.showUsername) {
        ctx.font = `${settings.usernameSize}px ${settings.font}`
        ctx.fillStyle = settings.usernameColor
        ctx.textAlign = 'center'
        ctx.fillText('@username', settings.usernameX, settings.usernameY)
      
        ctx.beginPath()
        ctx.arc(settings.usernameX, settings.usernameY, 5, 0, Math.PI * 2)
        ctx.fillStyle = 'yellow'
        ctx.fill()
      }

      ctx.font = '14px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText('انقر واسحب العناصر ذات النقاط الصفراء', canvas.width / 2, 20)
    } else {
      ctx.font = '24px Arial'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText('الترحيب معطل', canvas.width / 2, canvas.height / 2)
    }
  }

  useEffect(() => {
    if (settings.welcomeImage) {
      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        drawCanvas()
      }
      img.src = settings.welcomeImage
    }
  }, [settings])

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!settings.isWelcomeEnabled) return;
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (isClickOnElement(x, y, 'welcome') && settings.showWelcomeText) {
      setDraggedElement('welcome')
      setIsDragging(true)
      setStartDragPos({ x, y })
    } else if (isClickOnElement(x, y, 'avatar') && settings.showAvatar) {
      setDraggedElement('avatar')
      setIsDragging(true)
      setStartDragPos({ x, y })
    } else if (isClickOnElement(x, y, 'username') && settings.showUsername) {
      setDraggedElement('username')
      setIsDragging(true)
      setStartDragPos({ x, y })
    }
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedElement) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const dx = x - startDragPos.x
    const dy = y - startDragPos.y

    setSettings(prev => {
      switch (draggedElement) {
        case 'welcome':
          return { ...prev, imageTextX: prev.imageTextX + dx, imageTextY: prev.imageTextY + dy }
        case 'avatar':
          return { ...prev, avatarX: prev.avatarX + dx, avatarY: prev.avatarY + dy }
        case 'username':
          return { ...prev, usernameX: prev.usernameX + dx, usernameY: prev.usernameY + dy }
        default:
          return prev
      }
    })

    setStartDragPos({ x, y })
    drawCanvas()
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedElement(null)
  }

  const isClickOnElement = (x: number, y: number, element: 'welcome' | 'avatar' | 'username') => {
    const tolerance = 50
    switch (element) {
      case 'welcome':
        return Math.abs(x - settings.imageTextX) < tolerance && Math.abs(y - settings.imageTextY) < tolerance
      case 'avatar':
        return Math.sqrt(Math.pow(x - settings.avatarX, 2) + Math.pow(y - settings.avatarY, 2)) < settings.avatarSize / 2 + tolerance
      case 'username':
        return Math.abs(x - settings.usernameX) < tolerance && Math.abs(y - settings.usernameY) < tolerance
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/welcome-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setOriginalSettings(settings)
        setHasUnsavedChanges(false)
        setShowConfirmDialog(false) // Close the dialog after successful save
        toast({
          title: "تم حفظ الإعدادات",
          description: "تم حفظ إعدادات الترحيب بنجاح",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving welcome settings:', error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ إعدادات الترحيب",
        variant: "destructive",
      })
    }
  }

  const handleSettingChange = (newSettings: Partial<WelcomeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    setHasUnsavedChanges(true)
  }

  const handleRevertChanges = () => {
    if (originalSettings) {
      setSettings(originalSettings)
      setHasUnsavedChanges(false)
    }
  }

  const resetElementPositions = () => {
    setSettings(prev => ({
      ...prev,
      imageTextX: imageRef.current ? imageRef.current.width / 2 : 400,
      imageTextY: 50,
      avatarX: imageRef.current ? imageRef.current.width / 2 : 400,
      avatarY: imageRef.current ? imageRef.current.height / 2 : 300,
      usernameX: imageRef.current ? imageRef.current.width / 2 : 400,
      usernameY: imageRef.current ? imageRef.current.height - 50 : 550,
    }))
  }

  const handleCancelAction = () => {
    setShowConfirmDialog(false)
  }

  if (loading) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-indigo-950/30 border-indigo-900/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">إعدادات الترحيب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isWelcomeEnabled" className="text-indigo-100">تفعيل رسالة الترحيب</Label>
            <Switch
              id="isWelcomeEnabled"
              checked={settings.isWelcomeEnabled}
              onCheckedChange={(checked) => {
                handleSettingChange({ isWelcomeEnabled: checked })
              }}
            />
          </div>
          {settings.isWelcomeEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="text-indigo-100">رسالة الترحيب</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => handleSettingChange({ welcomeMessage: e.target.value })}
                  placeholder="أدخل رسالة الترحيب هنا. استخدم {user} للاسم و {server} لاسم السيرفر."
                  className="bg-indigo-900/50 border-indigo-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeChannel" className="text-indigo-100">قناة الترحيب</Label>
                <Select
                  value={settings.welcomeChannel}
                  onValueChange={(value) => handleSettingChange({ welcomeChannel: value })}
                >
                  <SelectTrigger className="bg-indigo-900/50 border-indigo-700 text-white">
                    <SelectValue placeholder="اختر قناة الترحيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeImage" className="text-indigo-100">صورة الترحيب</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="welcomeImage"
                    type="file"
                    onChange={handleImageUpload}
                    className="bg-indigo-900/50 border-indigo-700 text-white"
                  />
                  <Button onClick={() => document.getElementById('welcomeImage')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    رفع صورة
                  </Button>
                </div>
              </div>
              {settings.welcomeImage && (
                <div className="space-y-4">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    style={{ maxWidth: '100%', height: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }}
                  />
                  <Button onClick={resetElementPositions} className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                    إعادة تعيين مواقع العناصر
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showWelcomeText" className="text-indigo-100">إظهار نص الترحيب</Label>
                        <Switch
                          id="showWelcomeText"
                          checked={settings.showWelcomeText}
                          onCheckedChange={(checked) => handleSettingChange({ showWelcomeText: checked })}
                        />
                      </div>
                      {settings.showWelcomeText && (
                        <>
                          <Input
                            id="imageText"
                            value={settings.imageText}
                            onChange={(e) => handleSettingChange({ imageText: e.target.value })}
                            className="bg-indigo-900/50 border-indigo-700 text-white"
                          />
                          <Input
                            id="imageTextColor"
                            type="color"
                            value={settings.imageTextColor}
                            onChange={(e) => handleSettingChange({ imageTextColor: e.target.value })}
                            className="bg-indigo-900/50 border-indigo-700 h-10"
                          />
                          <div>
                            <Label htmlFor="imageTextSize" className="text-indigo-100">حجم النص</Label>
                            <Slider
                              id="imageTextSize"
                              min={12}
                              max={72}
                              step={1}
                              value={[settings.imageTextSize]}
                              onValueChange={(value) => handleSettingChange({ imageTextSize: value[0] })}
                              className="w-full"
                            />
                            <span className="text-indigo-100 text-sm">{settings.imageTextSize}px</span>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="font" className="text-indigo-100">نوع الخط</Label>
                            <Select
                              value={settings.font}
                              onValueChange={(value) => handleSettingChange({ font: value })}
                            >
                              <SelectTrigger className="bg-indigo-900/50 border-indigo-700 text-white">
                                <SelectValue placeholder="اختر نوع الخط" />
                              </SelectTrigger>
                              <SelectContent>
                                {fontOptions.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showAvatar" className="text-indigo-100">إظهار صورة المستخدم</Label>
                        <Switch
                          id="showAvatar"
                          checked={settings.showAvatar}
                          onCheckedChange={(checked) => handleSettingChange({ showAvatar: checked })}
                        />
                      </div>
                      {settings.showAvatar && (
                        <>
                          <div>
                            <Label htmlFor="avatarSize" className="text-indigo-100">حجم الصورة الشخصية</Label>
                            <Slider
                              id="avatarSize"
                              min={32}
                              max={256}
                              step={1}
                              value={[settings.avatarSize]}
                              onValueChange={(value) => handleSettingChange({ avatarSize: value[0] })}
                              className="w-full"
                            />
                            <span className="text-indigo-100 text-sm">{settings.avatarSize}px</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showUsername" className="text-indigo-100">إظهار اسم المستخدم</Label>
                      <Switch
                        id="showUsername"
                        checked={settings.showUsername}
                        onCheckedChange={(checked) => handleSettingChange({ showUsername: checked })}
                      />
                    </div>
                    {settings.showUsername && (
                      <>
                        <Input
                          id="usernameColor"
                          type="color"
                          value={settings.usernameColor}
                          onChange={(e) => handleSettingChange({ usernameColor: e.target.value })}
                          className="bg-indigo-900/50 border-indigo-700 h-10"
                        />
                        <div>
                          <Label htmlFor="usernameSize" className="text-indigo-100">حجم اسم المستخدم</Label>
                          <Slider
                            id="usernameSize"
                            min={12}
                            max={72}
                            step={1}
                            value={[settings.usernameSize]}
                            onValueChange={(value) => handleSettingChange({ usernameSize: value[0] })}
                            className="w-full"
                          />
                          <span className="text-indigo-100 text-sm">{settings.usernameSize}px</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <Button onClick={handleSaveSettings} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!hasUnsavedChanges}>
                <Save className="w-4 h-4 mr-2" />
                حفظ الإعدادات
              </Button>
            </>
          )}
          {hasUnsavedChanges && (
            <Button 
              onClick={handleRevertChanges} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              إلغاء التغييرات
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">تأكيد الإجراء</DialogTitle>
            <DialogDescription className="text-gray-400">
              لديك تغييرات غير محفوظة. هل تريد حفظ التغييرات قبل المتابعة؟
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={handleSaveSettings}
              className="bg-white text-black hover:bg-gray-200"
            >
              حفظ التغييرات
            </Button>
            <Button
              onClick={handleSaveSettings}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              تجاهل التغييرات
            </Button>
            <Button
              onClick={handleCancelAction}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-900/90 text-white p-6 shadow-lg transition-all duration-300 ease-in-out transform translate-y-0 hover:translate-y-1 border-t border-indigo-700">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="font-semibold text-lg">لديك تغييرات غير محفوظة</p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <Button onClick={handleSaveSettings} variant="default" size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                حفظ التغييرات
              </Button>
              <Button onClick={handleRevertChanges} variant="outline" size="lg" className="border-indigo-500 text-indigo-300 hover:bg-indigo-800">
                إلغاء التغييرات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

