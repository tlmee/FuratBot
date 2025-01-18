'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Shield, Plus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { rolePermissions } from '@/utils/permissions'

interface Role {
  id: string
  name: string
  color: number
  position: number
  permissions: string
}

interface RoleManagementPanelProps {
  serverId: string
}

export default function RoleManagementPanel({ serverId }: RoleManagementPanelProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingPermissions, setEditingPermissions] = useState<bigint>(BigInt(0))
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [serverId])

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/roles`)
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }
      const data = await response.json()
      setRoles(data.sort((a: Role, b: Role) => b.position - a.position))
      setLoading(false)
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError('Failed to fetch roles. Please try again.')
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      const response = await fetch(`/api/server/${serverId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRoleName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create role')
      }

      toast({
        title: "Role created successfully",
        description: `The role ${newRoleName} has been created`,
      })

      setNewRoleName('')
      fetchRoles()
    } catch (err) {
      console.error('Error creating role:', err)
      toast({
        title: "Failed to create role",
        description: "An error occurred while creating the role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      const response = await fetch(`/api/server/${serverId}/roles/${editingRole.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: editingRole.name, 
          color: editingRole.color,
          permissions: editingPermissions.toString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast({
        title: "Role updated successfully",
        description: `The role ${editingRole.name} has been updated`,
      })

      setEditingRole(null)
      setIsEditDialogOpen(false)
      fetchRoles()
    } catch (err) {
      console.error('Error updating role:', err)
      toast({
        title: "Failed to update role",
        description: "An error occurred while updating the role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/server/${serverId}/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete role')
      }

      toast({
        title: "Role deleted successfully",
        description: "The role has been deleted from the server",
      })

      fetchRoles()
    } catch (err) {
      console.error('Error deleting role:', err)
      toast({
        title: "Failed to delete role",
        description: "An error occurred while deleting the role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (color: number) => {
    return `#${color.toString(16).padStart(6, '0')}`
  }

  const handlePermissionChange = (permission: bigint) => {
    setEditingPermissions(prev => prev & permission ? prev & ~permission : prev | permission)
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setEditingPermissions(BigInt(role.permissions))
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <div className="text-center text-white text-lg">جاري تحميل الأدوار...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Role Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="col-span-3"
                  placeholder="Role name"
                />
              </div>
            </div>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-indigo-950/30 rounded-lg p-4">
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-indigo-900/40 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" style={{ color: getRoleColor(role.color) }} />
                <span className="text-gray-100">{role.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:text-white"
                  onClick={() => openEditDialog(role)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300"
                  onClick={() => handleDeleteRole(role.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Role Name</Label>
                  <Input
                    id="name"
                    value={editingRole?.name || ''}
                    onChange={(e) => setEditingRole(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">Role Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={getRoleColor(editingRole?.color || 0)}
                    onChange={(e) => setEditingRole(prev => prev ? {...prev, color: parseInt(e.target.value.slice(1), 16)} : null)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="permissions">
              <div className="grid gap-4 py-4">
                <div className="border rounded-md p-4">
                  <div className="font-semibold mb-2">Role Permissions:</div>
                  <ScrollArea className="h-[300px] w-full pr-4">
                    {rolePermissions.map((permission) => (
                      <div key={permission.name} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={permission.name}
                          checked={(editingPermissions & permission.value) !== BigInt(0)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditingPermissions(prev => prev | permission.value)
                            } else {
                              setEditingPermissions(prev => prev & ~permission.value)
                            }
                          }}
                        />
                        <Label htmlFor={permission.name}>{permission.name}</Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <Button onClick={handleUpdateRole}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

