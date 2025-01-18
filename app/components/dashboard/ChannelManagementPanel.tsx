'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Lock, MessageSquare, VolumeX, Hash, Plus, UserPlus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { textChannelPermissions, voiceChannelPermissions } from '@/utils/permissions'

interface Channel {
  id: string
  name: string
  type: number
}

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  username: string
}

interface ChannelPermission {
  id: string
  type: 'role' | 'member'
  allow: string
  deny: string
}

interface ChannelManagementPanelProps {
  serverId: string
}

export default function ChannelManagementPanel({ serverId }: ChannelManagementPanelProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelType, setNewChannelType] = useState('0')
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [editingPermissions, setEditingPermissions] = useState<ChannelPermission[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  useEffect(() => {
    fetchChannels()
    fetchRoles()
    fetchUsers()
  }, [serverId])

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/channels`)
      if (!response.ok) {
        throw new Error('Failed to fetch channels')
      }
      const data = await response.json()
      setChannels(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching channels:', err)
      setError('Failed to fetch channels. Please try again.')
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/roles`)
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }
      const data = await response.json()
      setRoles(data)
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleCreateChannel = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newChannelName, type: parseInt(newChannelType) }),
      })

      if (!response.ok) {
        throw new Error('Failed to create channel')
      }

      toast({
        title: "Channel created successfully",
        description: `The channel ${newChannelName} has been created`,
      })

      setNewChannelName('')
      setNewChannelType('0')
      fetchChannels()
    } catch (err) {
      console.error('Error creating channel:', err)
      toast({
        title: "Failed to create channel",
        description: "An error occurred while creating the channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateChannel = async () => {
    if (!editingChannel) return

    try {
      const response = await fetch(`/api/server/${serverId}/channels/${editingChannel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: editingChannel.name,
          permissions: editingPermissions
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update channel')
      }

      toast({
        title: "Channel updated successfully",
        description: `The channel ${editingChannel.name} has been updated`,
      })

      setEditingChannel(null)
      setEditingPermissions([])
      setIsEditDialogOpen(false)
      fetchChannels()
    } catch (err) {
      console.error('Error updating channel:', err)
      toast({
        title: "Failed to update channel",
        description: "An error occurred while updating the channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const response = await fetch(`/api/server/${serverId}/channels/${channelId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete channel')
      }

      toast({
        title: "Channel deleted successfully",
        description: "The channel has been deleted from the server",
      })

      fetchChannels()
    } catch (err) {
      console.error('Error deleting channel:', err)
      toast({
        title: "Failed to delete channel",
        description: "An error occurred while deleting the channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePermissionChange = (id: string, type: 'role' | 'member', permission: bigint, isAllow: boolean) => {
    setEditingPermissions(prev => {
      const existingPermission = prev.find(p => p.id === id && p.type === type)
      if (existingPermission) {
        return prev.map(p => {
          if (p.id === id && p.type === type) {
            const newAllow = isAllow ? (BigInt(p.allow) | permission).toString() : (BigInt(p.allow) & ~permission).toString()
            const newDeny = isAllow ? (BigInt(p.deny) & ~permission).toString() : (BigInt(p.deny) | permission).toString()
            return { ...p, allow: newAllow, deny: newDeny }
          }
          return p
        })
      } else {
        return [...prev, {
          id,
          type,
          allow: isAllow ? permission.toString() : '0',
          deny: isAllow ? '0' : permission.toString()
        }]
      }
    })
  }

  const getChannelIcon = (type: number) => {
    switch (type) {
      case 0: // Text Channel
        return <Hash className="w-4 h-4 text-gray-400" />
      case 2: // Voice Channel
        return <VolumeX className="w-4 h-4 text-gray-400" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />
    }
  }

  const openEditDialog = (channel: Channel) => {
    setEditingChannel(channel)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <div className="text-center text-white text-lg">جاري تحميل القنوات...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  const textChannels = channels.filter(channel => channel.type === 0)
  const voiceChannels = channels.filter(channel => channel.type === 2)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Channel Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Channel</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="col-span-3"
                  placeholder="Channel name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Select onValueChange={setNewChannelType} defaultValue={newChannelType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Channel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Text Channel</SelectItem>
                    <SelectItem value="2">Voice Channel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateChannel}>Create Channel</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {/* Text Channels Section */}
        <div className="bg-indigo-950/30 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 text-indigo-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Text Channels
          </h3>
          <div className="space-y-3">
            {textChannels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-3 bg-indigo-900/40 rounded-lg">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.type)}
                  <span className="text-gray-100">{channel.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white"
                    onClick={() => openEditDialog(channel)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteChannel(channel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Channels Section */}
        <div className="bg-indigo-950/30 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 text-indigo-100 flex items-center gap-2">
            <VolumeX className="w-5 h-5" />
            Voice Channels
          </h3>
          <div className="space-y-3">
            {voiceChannels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-3 bg-indigo-900/40 rounded-lg">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.type)}
                  <span className="text-gray-100">{channel.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white"
                    onClick={() => openEditDialog(channel)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteChannel(channel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Channel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Channel Name</Label>
                  <Input
                    id="name"
                    value={editingChannel?.name || ''}
                    onChange={(e) => setEditingChannel(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="permissions">
              <div className="grid gap-4 py-4">
                <Select onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role to edit permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRoleId && (
                  <div className="border rounded-md p-4">
                    <div className="font-semibold mb-2">Channel Permissions:</div>
                    <ScrollArea className="h-[300px] w-full pr-4">
                      {(editingChannel?.type === 0 ? textChannelPermissions : voiceChannelPermissions).map((permission) => (
                        <div key={permission.name} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`${selectedRoleId}-${permission.name}`}
                            checked={editingPermissions.some(p => p.id === selectedRoleId && p.type === 'role' && (BigInt(p.allow) & permission.value) !== BigInt(0))}
                            onCheckedChange={(checked) => handlePermissionChange(selectedRoleId, 'role', permission.value, checked as boolean)}
                          />
                          <Label htmlFor={`${selectedRoleId}-${permission.name}`}>{permission.name}</Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <Button onClick={handleUpdateChannel}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

