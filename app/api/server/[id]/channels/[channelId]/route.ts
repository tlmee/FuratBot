import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string, channelId: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, channelId } = params
  const { name, permissions } = await request.json()

  try {
    // Update channel name
    const response = await fetch(`https://discord.com/api/channels/${channelId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error('Failed to update channel')
    }

    const channel = await response.json()

    // Update permissions
    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        await fetch(`https://discord.com/api/channels/${channelId}/permissions/${permission.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            allow: permission.allow,
            deny: permission.deny,
            type: permission.type === 'role' ? 0 : 1,
          }),
        })
      }
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error updating channel:', error)
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, channelId: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, channelId } = params

  try {
    const response = await fetch(`https://discord.com/api/channels/${channelId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete channel')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }
}

