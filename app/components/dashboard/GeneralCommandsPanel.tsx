'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from 'lucide-react'
import { PlusCircle, X } from 'lucide-react'

interface Command {
  id: string
  name: string
  description: string
  isEnabled: boolean
  alternativeNames: string[]
  allowedRoles: string[]
  disallowedRoles: string[]
  allowedChannels: string[]
  disallowedChannels: string[]
}

interface Role {
  id: string
  name: string
}

interface Channel {
  id: string
  name: string
}

interface GeneralCommandsPanelProps {
  serverId: string
}

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (value: string[]) => void
  placeholder: string
}

function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between bg-indigo-900/50 border-indigo-700 text-white">
          {selected.length > 0 ? (
            <>
              <span className="truncate">{selected.length} selected</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          ) : (
            <>
              <span className="truncate">{placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className="bg-indigo-950 text-white">
          <CommandInput placeholder="Search..." className="bg-indigo-900/50 border-indigo-700 text-white" />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value]
                  )
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


export default function GeneralCommandsPanel({ serverId }: GeneralCommandsPanelProps) {
  const [commands, setCommands] = useState<Command[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommands()
    fetchRoles()
    fetchChannels()
  }, [serverId])

  const fetchCommands = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/commands`)
      if (response.ok) {
        const data = await response.json()
        // تحديث الأوامر الافتراضية في دالة fetchCommands
        setCommands(data);
      } else {
        throw new Error('Failed to fetch commands')
      }
    } catch (error) {
      console.error('Error fetching commands:', error)
      toast({
        title: "خطأ في جلب الأوامر",
        description: "حدث خطأ أثناء جلب الأوامر. يرجى المحاولة مرة أخرى.",
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

  const handleCommandToggle = async (commandId: string, isEnabled: boolean) => {
    try {
      const updatedCommand = commands.find(cmd => cmd.id === commandId);
      if (!updatedCommand) {
        throw new Error('Command not found');
      }

      const updatedCommands = commands.map(cmd => 
        cmd.id === commandId ? { ...cmd, isEnabled } : cmd
      );
      setCommands(updatedCommands);

      const response = await fetch(`/api/server/${serverId}/commands`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedCommand, isEnabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update command');
      }

      toast({
        title: isEnabled ? "تم تفعيل الأمر" : "تم تعطيل الأمر",
        description: `تم ${isEnabled ? 'تفعيل' : 'تعطيل'} الأمر بنجاح`,
      });
    } catch (error) {
      console.error('Error updating command:', error);
      // Revert the local state if the API call fails
      setCommands(commands);
      toast({
        title: "خطأ في تحديث الأمر",
        description: "حدث خطأ أثناء تحديث حالة الأمر. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  }

  const handleCommandUpdate = async (updatedCommand: Command) => {
    try {
      const response = await fetch(`/api/server/${serverId}/commands/${updatedCommand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCommand),
      })

      if (!response.ok) {
        throw new Error('Failed to update command')
      }

      setCommands(commands.map(cmd => 
        cmd.id === updatedCommand.id ? updatedCommand : cmd
      ))

      toast({
        title: "تم تحديث الأمر",
        description: "تم تحديث إعدادات الأمر بنجاح",
      })
    } catch (error) {
      console.error('Error updating command:', error)
      toast({
        title: "خطأ في تحديث الأمر",
        description: "حدث خطأ أثناء تحديث إعدادات الأمر. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center text-white">جاري تحميل الأوامر...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">الأوامر العامة</h2>
      <ScrollArea className="h-[calc(100vh-200px)] pr-2">
        {commands.map((command) => (
          <Card key={command.id} className="mb-2 bg-indigo-950/30 border-indigo-900/50">
            <CardContent className="p-3">
              <p className="text-sm text-gray-300 mt-1 mb-2">{command.description}</p>
              <div className="flex items-center">
                <Switch
                  checked={command.isEnabled}
                  onCheckedChange={(checked) => handleCommandToggle(command.id, checked)}
                />
                <span className="text-base font-medium text-white mr-4 rtl:ml-4 rtl:mr-0">/{command.name}</span>
              </div>
                <Accordion type="single" collapsible className="w-auto">
                  <AccordionItem value={command.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <span className="sr-only">Toggle command details</span>
                      {command.isEnabled ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-white transition-transform duration-200" />
                      ) : (
                        <ChevronUp className="h-4 w-4 shrink-0 text-white transition-transform duration-200" />
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <CommandForm
                        command={command}
                        roles={roles}
                        channels={channels}
                        onUpdate={handleCommandUpdate}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  )
}

interface CommandFormProps {
  command: Command
  roles: Role[]
  channels: Channel[]
  onUpdate: (command: Command) => void
}

function CommandForm({ command, roles, channels, onUpdate }: CommandFormProps) {
  const [localCommand, setLocalCommand] = useState(command)
  const [newAlternativeName, setNewAlternativeName] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name !== 'description') {
      setLocalCommand({ ...localCommand, [e.target.name]: e.target.value })
    }
  }

  const handleMultiSelectChange = (field: keyof Command, value: string[]) => {
    setLocalCommand(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(localCommand)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="alternativeNames" className="text-white">الأسماء البديلة</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {localCommand.alternativeNames.map((name, index) => (
            <Badge key={index} className="bg-indigo-600 text-white">
              {name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 h-4 w-4 p-0 text-white hover:text-red-500"
                onClick={() => {
                  const newNames = [...localCommand.alternativeNames];
                  newNames.splice(index, 1);
                  setLocalCommand({ ...localCommand, alternativeNames: newNames });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex mt-2">
          <Input
            id="newAlternativeName"
            className="bg-indigo-900/50 border-indigo-700 text-white"
            placeholder="أدخل اسمًا بديلاً"
            value={newAlternativeName}
            onChange={(e) => setNewAlternativeName(e.target.value)}
          />
          <Button
            type="button"
            className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              if (newAlternativeName.trim()) {
                setLocalCommand({
                  ...localCommand,
                  alternativeNames: [...localCommand.alternativeNames, newAlternativeName.trim()]
                });
                setNewAlternativeName('');
              }
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            إضافة
          </Button>
        </div>
      </div>
      <div>
        <Label className="text-white">الرتب المسموح لها</Label>
        <MultiSelect
          options={roles.map(role => ({ value: role.id, label: role.name }))}
          selected={localCommand.allowedRoles}
          onChange={(value) => handleMultiSelectChange('allowedRoles', value)}
          placeholder="اختر الرتب المسموح لها"
        />
      </div>
      <div>
        <Label className="text-white">الرتب الغير مسموح لها</Label>
        <MultiSelect
          options={roles.map(role => ({ value: role.id, label: role.name }))}
          selected={localCommand.disallowedRoles}
          onChange={(value) => handleMultiSelectChange('disallowedRoles', value)}
          placeholder="اختر الرتب الغير مسموح لها"
        />
      </div>
      <div>
        <Label className="text-white">القنوات المسموح فيها</Label>
        <MultiSelect
          options={channels.map(channel => ({ value: channel.id, label: channel.name }))}
          selected={localCommand.allowedChannels}
          onChange={(value) => handleMultiSelectChange('allowedChannels', value)}
          placeholder="اختر القنوات المسموح فيها"
        />
      </div>
      <div>
        <Label className="text-white">القنوات الغير مسموح فيها</Label>
        <MultiSelect
          options={channels.map(channel => ({ value: channel.id, label: channel.name }))}
          selected={localCommand.disallowedChannels}
          onChange={(value) => handleMultiSelectChange('disallowedChannels', value)}
          placeholder="اختر القنوات الغير مسموح فيها"
        />
      </div>
      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
        حفظ التغييرات
      </Button>
    </form>
  )
}

const defaultCommands: Command[] = [
  {
    id: 'help',
    name: 'help',
    description: 'عرض قائمة الأوامر المتاحة',
    isEnabled: true,
    alternativeNames: ['مساعدة', 'اوامر'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'serverinfo',
    name: 'serverinfo',
    description: 'عرض معلومات السيرفر',
    isEnabled: true,
    alternativeNames: ['معلومات_السيرفر', 'السيرفر'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'userinfo',
    name: 'userinfo',
    description: 'عرض معلومات المستخدم',
    isEnabled: true,
    alternativeNames: ['معلومات_المستخدم', 'المستخدم'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'avatar',
    name: 'avatar',
    description: 'عرض الصورة الشخصية للمستخدم',
    isEnabled: true,
    alternativeNames: ['صورة', 'الصورة'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'ping',
    name: 'ping',
    description: 'فحص استجابة البوت',
    isEnabled: true,
    alternativeNames: ['بينج', 'اختبار'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'roll',
    name: 'roll',
    description: 'رمي النرد',
    isEnabled: true,
    alternativeNames: ['نرد', 'رمي'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'poll',
    name: 'poll',
    description: 'إنشاء استطلاع بسيط',
    isEnabled: true,
    alternativeNames: ['استطلاع', 'تصويت'],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
];

