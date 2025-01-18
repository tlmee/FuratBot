'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ServerSidebar from '@/app/components/ServerSidebar'
import OverviewPanel from '@/app/components/dashboard/OverviewPanel'
import WelcomePanel from '@/app/components/dashboard/WelcomePanel'
import GeneralCommandsPanel from '@/app/components/dashboard/GeneralCommandsPanel'
import ModCommandsPanel from '@/app/components/dashboard/ModCommandsPanel'
import ProtectionPanel from '@/app/components/dashboard/ProtectionPanel'
import AutoResponsePanel from '@/app/components/dashboard/AutoResponsePanel'
import AutoRolesPanel from '@/app/components/dashboard/AutoRolesPanel'
import LoggingPanel from '@/app/components/dashboard/LoggingPanel'
import SettingsPanel from '@/app/components/dashboard/SettingsPanel'
import ChannelManagementPanel from '@/app/components/dashboard/ChannelManagementPanel'
import RoleManagementPanel from '@/app/components/dashboard/RoleManagementPanel'
import { Loader2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ServerInfo {
  id: string
  name: string
  icon: string | null
}

interface ServerDashboardProps {
  params: {
    id: string
  }
}

export default function ServerDashboard({ params }: ServerDashboardProps) {
  const [activePanel, setActivePanel] = useState('overview')
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [permissionDetails, setPermissionDetails] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingPanel, setPendingPanel] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkPermissionsAndFetchInfo = async () => {
      try {
        setLoading(true)

        // Check permissions
        const permissionResponse = await fetch(`/api/server/${params.id}/check-permissions`)
        if (!permissionResponse.ok) {
          throw new Error('Failed to check permissions')
        }
        const permissionData = await permissionResponse.json()
        setHasPermission(permissionData.hasPermission)
        setPermissionDetails(permissionData.details)

        if (!permissionData.hasPermission) {
          setError('ليس لديك الصلاحيات الكافية للوصول إلى لوحة التحكم هذه.')
          return
        }

        // Fetch server info
        const infoResponse = await fetch(`/api/server/${params.id}`)
        if (!infoResponse.ok) {
          throw new Error('Failed to fetch server information')
        }
        const data = await infoResponse.json()
        setServerInfo(data)
      } catch (err) {
        console.error('Error:', err);
        let errorMessage = 'حدث خطأ أثناء تحميل معلومات السيرفر. يرجى المحاولة مرة أخرى.';
        if (err instanceof Error) {
          errorMessage += ` التفاصيل: ${err.message}`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false)
      }
    }

    checkPermissionsAndFetchInfo()
  }, [params.id, router])

  const handlePanelChange = (newPanel: string) => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true)
      setPendingPanel(newPanel)
    } else {
      setActivePanel(newPanel)
    }
  }

  const handleConfirmPanelChange = () => {
    if (pendingPanel) {
      setActivePanel(pendingPanel)
      setHasUnsavedChanges(false)
      setShowConfirmDialog(false)
      setPendingPanel(null)
    }
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <OverviewPanel serverId={params.id} />
      case 'welcome':
        return <WelcomePanel 
          serverId={params.id} 
          onUnsavedChanges={setHasUnsavedChanges}
        />
      case 'channels':
        return <ChannelManagementPanel serverId={params.id} />
      case 'roles':
        return <RoleManagementPanel serverId={params.id} />
      case 'general-commands':
        return <GeneralCommandsPanel serverId={params.id} />
      case 'mod-commands':
        return <ModCommandsPanel serverId={params.id} />
      case 'protection':
        return <ProtectionPanel serverId={params.id} />
      case 'auto-response':
        return <AutoResponsePanel serverId={params.id} />
      case 'auto-roles':
        return <AutoRolesPanel serverId={params.id} />
      case 'logging':
        return <LoggingPanel serverId={params.id} />
      case 'settings':
        return <SettingsPanel serverId={params.id} />
      default:
        return <OverviewPanel serverId={params.id} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-950 to-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-white">جاري التحقق من الصلاحيات وتحميل المعلومات...</p>
          <p className="text-sm text-gray-400 mt-2">قد يستغرق هذا بعض الوقت. يرجى الانتظار.</p>
        </div>
      </div>
    )
  }

  if (error || hasPermission === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-950 to-black">
        <div className="text-center bg-red-900/50 p-8 rounded-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-white mb-4">{error || 'ليس لديك الصلاحيات الكافية للوصول إلى لوحة التحكم هذه.'}</p>
          {permissionDetails && (
            <p className="text-sm text-gray-300 mb-4">تفاصيل الصلاحيات: {permissionDetails}</p>
          )}
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            العودة إلى قائمة السيرفرات
          </button>
          {error && (
            <div className="text-sm text-red-300 mt-2">
              <strong>تفاصيل الخطأ:</strong> {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-indigo-950 to-black">
      <ServerSidebar activePanel={activePanel} setActivePanel={handlePanelChange} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-6 flex items-center">
            {serverInfo?.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${serverInfo.id}/${serverInfo.icon}.png`}
                alt={serverInfo.name}
                width={64}
                height={64}
                className="rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-white">
                  {serverInfo?.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{serverInfo?.name}</h1>
              <p className="text-gray-400 mt-1">إدارة الإعدادات والميزات</p>
            </div>
          </div>
          <div className="bg-indigo-950/30 backdrop-blur-sm rounded-lg border border-indigo-900/50 p-6">
            {renderPanel()}
          </div>
        </div>
      </main>

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
              onClick={handleConfirmPanelChange}
              className="bg-white text-black hover:bg-gray-200"
            >
              حفظ التغييرات
            </Button>
            <Button
              onClick={handleConfirmPanelChange}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              تجاهل التغييرات
            </Button>
            <Button
              onClick={() => setShowConfirmDialog(false)}
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
              <Button onClick={handleConfirmPanelChange} variant="default" size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                حفظ التغييرات
              </Button>
              <Button onClick={() => setHasUnsavedChanges(false)} variant="outline" size="lg" className="border-indigo-500 text-indigo-300 hover:bg-indigo-800">
                إلغاء التغييرات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

