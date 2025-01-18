import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string, roleId: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, roleId } = params
  const { name, color, permissions } = await request.json()

  try {
    const response = await fetch(`https://discord.com/api/guilds/${id}/roles/${roleId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color, permissions }),
    })

    if (!response.ok) {
      throw new Error('Failed to update role')
    }

    const role = await response.json()
    return NextResponse.json(role)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, roleId: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, roleId } = params

  try {
    const response = await fetch(`https://discord.com/api/guilds/${id}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete role')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}

