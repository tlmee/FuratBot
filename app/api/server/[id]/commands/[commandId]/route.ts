import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || 'C:\\Users\\arabs\\Desktop\\FuratBotAS\\data\\servers'

const defaultCommands = [
  {
    id: 'user',
    name: 'user',
    description: 'عرض معلومات المستخدم',
    isEnabled: true,
    alternativeNames: [],
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
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'server',
    name: 'server',
    description: 'عرض معلومات السيرفر',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'ping',
    name: 'ping',
    description: 'عرض معلومات البنق',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'roles',
    name: 'roles',
    description: 'عرض جميع الرتب في السيرفر',
    isEnabled: true,
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
  {
    id: 'help',
    name: 'help',
    description: 'عرض قائمة الأوامر المتاحة',
    isEnabled: true,
    alternativeNames: [],
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
    alternativeNames: [],
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
    alternativeNames: [],
    allowedRoles: [],
    disallowedRoles: [],
    allowedChannels: [],
    disallowedChannels: [],
  },
];

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, commandId: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, commandId } = params

  try {
    const filePath = path.join(SERVER_DATA_PATH, `${id}.json`)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const serverData = JSON.parse(fileContent)

    if (!serverData.commands) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 })
    }

    serverData.commands = serverData.commands.filter((c: any) => c.id !== commandId)

    await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting command:', error)
    return NextResponse.json({ error: 'Failed to delete command' }, { status: 500 })
  }
}

