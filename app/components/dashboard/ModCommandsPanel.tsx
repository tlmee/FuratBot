'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MultiSelect } from '@/components/ui/multi-select' 

import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, PlusCircle, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"


interface ModCommand {
  id: string
  name: string
  description: string
  isEnabled: boolean
  alternativeNames: string[]
  allowedRoles: string[]
  disallowedRoles: string[]
  allowedChannels: string[]
  disallowedChannels: string[]
  customSettings?: {
    [key: string]: string
  }
}

interface Role {
  id: string
  name: string
}

interface Channel {
  id: string
  name: string
}

interface ModCommandsPanelProps {
  serverId: string
}

const defaultModCommands: ModCommand[] = [
  {
    id: 'ban',
    name: 'ban',
    description: 'حظر عضو من السيرفر',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
    customSettings: {
      banNotificationMessage: 'تم حظر {user} من السيرفر بواسطة {moderator}.'
    }
  },
  {
    id: 'kick',
    name: 'kick',
    description: 'طرد عضو من السيرفر',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
    customSettings: {
      kickMessage: 'تم طردك من السيرفر.'
    }
  },
  {
    id: 'unban',
    name: 'unban',
    description: 'إلغاء حظر عضو',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'vkick',
    name: 'vkick',
    description: 'طرد عضو من الروم الصوتي',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'timeout',
    name: 'timeout',
    description: 'إعطاء العضو وقت مستقطع',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'untimeout',
    name: 'untimeout',
    description: 'إلغاء الوقت المستقطع من العضو',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'clear',
    name: 'clear',
    description: 'حذف الرسائل',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'mv',
    name: 'mv',
    description: 'نقل العضو من روم صوتي إلى آخر',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'role',
    name: 'role',
    description: 'إضافة أو إزالة رتبة للعضو',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'lock',
    name: 'lock',
    description: 'قفل الروم',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'setnickname',
    name: 'setnickname',
    description: 'تغيير اسم شخص',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'slm',
    name: 'slm',
    description: 'تفعيل السلو مود في الشات',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
]

export default function ModCommandsPanel({ serverId }: ModCommandsPanelProps) {
  const [modCommands, setModCommands] = useState<ModCommand[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModCommands()
    fetchRoles()
    fetchChannels()
  }, [serverId])

  const fetchModCommands = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/mod-commands`)
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched mod commands:", data)
        setModCommands(data.length > 0 ? data : defaultModCommands)
      } else {
        throw new Error('Failed to fetch mod commands')
      }
    } catch (error) {
      console.error('Error fetching mod commands:', error)
      setModCommands(defaultModCommands)
      toast({
        title: "خطأ في جلب أوامر الإشراف",
        description: "حدث خطأ أثناء جلب أوامر الإشراف. تم استخدام الإعدادات الافتراضية.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/roles`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        throw new Error('Failed to fetch roles')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/channels`)
      if (response.ok) {
        const data = await response.json()
        setChannels(data)
      } else {
        throw new Error('Failed to fetch channels')
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const handleCommandToggle = (commandId: string, isEnabled: boolean) => {
    setModCommands(prevCommands =>
      prevCommands.map(cmd =>
        cmd.id === commandId ? { ...cmd, isEnabled } : cmd
      )
    )
  }

  const handleCommandUpdate = (updatedCommand: ModCommand) => {
    setModCommands(prevCommands =>
      prevCommands.map(cmd =>
        cmd.id === updatedCommand.id ? updatedCommand : cmd
      )
    )
  }

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/mod-commands`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modCommands),
      })

      if (!response.ok) {
        throw new Error('Failed to save mod commands')
      }

      toast({
        title: "تم حفظ التغييرات",
        description: "تم حفظ إعدادات أوامر الإشراف بنجاح",
      })
    } catch (error) {
      console.error('Error saving mod commands:', error)
      toast({
        title: "خطأ في حفظ التغييرات",
        description: "حدث خطأ أثناء حفظ إعدادات أوامر الإشراف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">أوامر الإشراف</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)] pr-4 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-300">
        {modCommands.map((command) => (
          <Card key={command.id} className="mb-4 bg-indigo-950/30 border-indigo-900/50">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>/{command.name}</span>
                <Switch
                  checked={command.isEnabled}
                  onCheckedChange={(checked) => handleCommandToggle(command.id, checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value={command.id}>
                  <AccordionTrigger>تفاصيل الأمر</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">الوصف</Label>
                        <p className="text-sm text-muted-foreground mt-1">{command.description}</p>
                      </div>
                      <div>
                        <Label className="text-white">الأسماء البديلة</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {command.alternativeNames.map((name, index) => (
                            <Badge key={index} variant="secondary">
                              {name}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-4 w-4 p-0"
                                onClick={() => {
                                  const newNames = [...command.alternativeNames];
                                  newNames.splice(index, 1);
                                  handleCommandUpdate({ ...command, alternativeNames: newNames });
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex mt-2">
                          <Input
                            placeholder="أدخل اسمًا بديلاً"
                            className="bg-indigo-900/50 border-indigo-700 text-white"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleCommandUpdate({
                                    ...command,
                                    alternativeNames: [...command.alternativeNames, input.value.trim()]
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="ml-2"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input.value.trim()) {
                                handleCommandUpdate({
                                  ...command,
                                  alternativeNames: [...command.alternativeNames, input.value.trim()]
                                });
                                input.value = '';
                              }
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-white">الرتب المسموح لها</Label>
                        <MultiSelect
                          className="bg-indigo-900/50 border-indigo-700 text-white"
                          options={roles.map(role => ({ label: role.name, value: role.id }))}
                          selected={command.allowedRoles}
                          onChange={(selected) => handleCommandUpdate({ ...command, allowedRoles: selected })}
                        />
                      </div>
                      <div>
                        <Label className="text-white">الرتب الغير مسموح لها</Label>
                        <MultiSelect
                          className="bg-indigo-900/50 border-indigo-700 text-white"
                          options={roles.map(role => ({ label: role.name, value: role.id }))}
                          selected={command.disallowedRoles}
                          onChange={(selected) => handleCommandUpdate({ ...command, disallowedRoles: selected })}
                        />
                      </div>
                      <div>
                        <Label className="text-white">القنوات المسموح فيها</Label>
                        <MultiSelect
                          className="bg-indigo-900/50 border-indigo-700 text-white"
                          options={channels.map(channel => ({ label: channel.name, value: channel.id }))}
                          selected={command.allowedChannels}
                          onChange={(selected) => handleCommandUpdate({ ...command, allowedChannels: selected })}
                        />
                      </div>
                      <div>
                        <Label className="text-white">القنوات الغير مسموح فيها</Label>
                        <MultiSelect
                          className="bg-indigo-900/50 border-indigo-700 text-white"
                          options={channels.map(channel => ({ label: channel.name, value: channel.id }))}
                          selected={command.disallowedChannels}
                          onChange={(selected) => handleCommandUpdate({ ...command, disallowedChannels: selected })}
                        />
                      </div>
                      {command.customSettings && Object.entries(command.customSettings).map(([key, value]) => (
                        <div key={key}>
                          <Label className="text-white" htmlFor={`${command.id}-${key}`}>
                            {key === 'banNotificationMessage' ? 'رسالة الإشعار بالحظر' : key}
                          </Label>
                          <Input
                            className="bg-indigo-900/50 border-indigo-700 text-white"
                            id={`${command.id}-${key}`}
                            value={value}
                            onChange={(e) => handleCommandUpdate({
                              ...command,
                              customSettings: {
                                ...command.customSettings,
                                [key]: e.target.value
                              }
                            })}
                          />
                          {key === 'banNotificationMessage' && (
                            <p className="text-sm text-muted-foreground mt-1">
                              يمكنك استخدام {'{user}'} لاسم المستخدم المحظور و {'{moderator}'} لاسم المشرف الذي نفذ الحظر.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
      <Button onClick={handleSaveChanges} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
        <Save className="mr-2 h-4 w-4" /> حفظ التغييرات
      </Button>
    </div>
  )
}

