import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || path.join(process.cwd(), 'data', 'servers')

const defaultModCommands = [
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
      banMessage: 'تم حظرك من السيرفر.'
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const filePath = path.join(SERVER_DATA_PATH, `${id}.json`)
    let serverData

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      serverData = JSON.parse(fileContent)
    } catch (error) {
      console.log('File not found or empty, initializing with default commands')
      serverData = { modCommands: defaultModCommands }
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))
    }

    // If modCommands don't exist or are empty, use default commands
    if (!serverData.modCommands || serverData.modCommands.length === 0) {
      serverData.modCommands = defaultModCommands
      await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))
    }

    console.log("Returning mod commands:", serverData.modCommands)
    return NextResponse.json(serverData.modCommands)
  } catch (error) {
    console.error('Error fetching mod commands:', error)
    return NextResponse.json({ error: 'Failed to fetch mod commands' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const updatedModCommands = await request.json()

  try {
    const filePath = path.join(SERVER_DATA_PATH, `${id}.json`)
    let serverData

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      serverData = JSON.parse(fileContent)
    } catch (error) {
      console.log('File not found, creating new server data')
      serverData = {}
    }

    serverData.modCommands = updatedModCommands

    await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))

    console.log("Updated mod commands:", serverData.modCommands)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating mod commands:', error)
    return NextResponse.json({ error: 'Failed to update mod commands' }, { status: 500 })
  }
}

