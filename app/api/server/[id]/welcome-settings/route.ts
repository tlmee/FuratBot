import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || 'C:\\Users\\arabs\\Desktop\\FuratBotAS\\data\\servers'

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
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const serverData = JSON.parse(fileContent)

    return NextResponse.json(serverData.welcomeSettings || {})
  } catch (error) {
    console.error('Error fetching welcome settings:', error)
    return NextResponse.json({ error: 'Failed to fetch welcome settings' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const welcomeSettings = await request.json()

  try {
    const filePath = path.join(SERVER_DATA_PATH, `${id}.json`)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const serverData = JSON.parse(fileContent)

    serverData.welcomeSettings = welcomeSettings

    await fs.writeFile(filePath, JSON.stringify(serverData, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving welcome settings:', error)
    return NextResponse.json({ error: 'Failed to save welcome settings' }, { status: 500 })
  }
}

