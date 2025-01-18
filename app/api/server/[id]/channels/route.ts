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
    const response = await fetch(`https://discord.com/api/guilds/${id}/channels`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch channels')
    }

    const channels = await response.json()
    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
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
  const { name, type } = await request.json()

  try {
    const response = await fetch(`https://discord.com/api/guilds/${id}/channels`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, type }),
    })

    if (!response.ok) {
      throw new Error('Failed to create channel')
    }

    const channel = await response.json()
    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}

