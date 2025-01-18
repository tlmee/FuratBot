import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

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
    const response = await fetch(`https://discord.com/api/guilds/${id}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch server information')
    }

    const serverInfo = await response.json()
    return NextResponse.json({
      id: serverInfo.id,
      name: serverInfo.name,
      icon: serverInfo.icon,
    })
  } catch (error) {
    console.error('Error fetching server information:', error)
    return NextResponse.json({ error: 'Failed to fetch server information' }, { status: 500 })
  }
}

