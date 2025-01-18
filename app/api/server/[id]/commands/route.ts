import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || path.join(process.cwd(), 'data', 'servers')

// تعريف الأوامر الافتراضية
const defaultCommands = [
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('GET request received for server:', params.id);
  console.log('SERVER_DATA_PATH:', SERVER_DATA_PATH);
  
  const session = await getSession()
  if (!session) {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const filePath = path.join(SERVER_DATA_PATH, `${id}.json`)
    console.log('Attempting to read file:', filePath);
    
    let serverData

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      console.log('File content:', fileContent);
      serverData = JSON.parse(fileContent)
      console.log('File read successfully');
    } catch (error) {
      console.log('File not found or empty, initializing with default commands');
      serverData = { commands: defaultCommands }
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))
    }

    // If commands don't exist or are empty, use default commands
    if (!serverData.commands || serverData.commands.length === 0) {
      console.log('No commands found, using default commands');
      serverData.commands = defaultCommands
      await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))
    }

    console.log('Sending commands:', serverData.commands);
    return NextResponse.json(serverData.commands)
  } catch (error) {
    console.error('Error fetching commands:', error)
    return NextResponse.json({ error: 'Failed to fetch commands' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('PUT request received for server:', params.id);
  
  const session = await getSession();
  if (!session) {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const updatedCommand = await request.json();
  console.log('Received updated command:', updatedCommand);

  try {
    const filePath = path.join(SERVER_DATA_PATH, `${id}.json`);
    console.log('Attempting to read file:', filePath);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const serverData = JSON.parse(fileContent);

    if (!serverData.commands) {
      console.log('Commands not found in server data');
      return NextResponse.json({ error: 'Commands not found' }, { status: 404 });
    }

    const commandIndex = serverData.commands.findIndex((c: any) => c.id === updatedCommand.id);
    if (commandIndex === -1) {
      console.log('Command not found:', updatedCommand.id);
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    serverData.commands[commandIndex] = {
      ...serverData.commands[commandIndex],
      ...updatedCommand
    };

    console.log('Updating command:', serverData.commands[commandIndex]);
    await fs.writeFile(filePath, JSON.stringify(serverData, null, 2));

    return NextResponse.json(serverData.commands[commandIndex]);
  } catch (error) {
    console.error('Error updating command:', error);
    return NextResponse.json({ error: 'Failed to update command' }, { status: 500 });
  }
}

