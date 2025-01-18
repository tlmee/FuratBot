import React from 'react'
import { Home, MessageSquare, Terminal, Shield, ShieldAlert, MessageCircle, UserPlus, FileText, Settings, FolderOpen, Users } from 'lucide-react'

interface ServerSidebarProps {
  activePanel: string
  setActivePanel: (panel: string) => void
}

const sidebarItems = [
  { id: 'overview', label: 'النظرة العامة', icon: Home },
  { id: 'welcome', label: 'الترحيب', icon: MessageSquare },
  { id: 'channels', label: 'إدارة الرومات', icon: FolderOpen },
  { id: 'roles', label: 'إدارة الرتب', icon: Users },
  { id: 'general-commands', label: 'الأوامر العامة', icon: Terminal },
  { id: 'mod-commands', label: 'أوامر الإشراف', icon: Shield },
  { id: 'protection', label: 'الحماية', icon: ShieldAlert },
  { id: 'auto-response', label: 'الرد التلقائي', icon: MessageCircle },
  { id: 'auto-roles', label: 'الرتب التلقائية', icon: UserPlus },
  { id: 'logging', label: 'السجلات', icon: FileText },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
]

export default function ServerSidebar({ activePanel, setActivePanel }: ServerSidebarProps) {
  return (
    <aside className="w-64 bg-indigo-950/50 backdrop-blur-sm border-l border-indigo-900/50 h-screen overflow-y-auto">
      <div className="p-4">
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActivePanel(item.id)}
                  className={`w-full text-right flex items-center justify-end space-x-2 space-x-reverse p-2 rounded-lg transition-colors ${
                    activePanel === item.id 
                      ? 'bg-indigo-900/60 text-white' 
                      : 'text-gray-300 hover:bg-indigo-900/40 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <item.icon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

