import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { fetchWithRetry } from '@/utils/apiUtils'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized', details: 'No session found' }, { status: 401 })
  }

  const { id } = params

  try {
    // Fetch the user's guilds
    const guildsResponse = await fetchWithRetry(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!guildsResponse.ok) {
      throw new Error(`Failed to fetch user guilds: ${guildsResponse.statusText}`)
    }

    const guilds = await guildsResponse.json()

    // Find the specific guild
    const guild = guilds.find((g: any) => g.id === id)

    if (!guild) {
      return NextResponse.json({ hasPermission: false, details: 'User is not a member of this server' })
    }

    if (!guild.permissions) {
      console.error('Permissions field is missing from the guild object:', guild);
      return NextResponse.json({ 
        hasPermission: false, 
        details: 'Unable to determine permissions. The API response is missing the permissions field.',
        apiResponse: guild
      });
    }

    // Check if the user has the MANAGE_GUILD permission (0x00000020)
    const hasPermission = (BigInt(guild.permissions) & BigInt(0x00000020)) !== BigInt(0)

    return NextResponse.json({ 
      hasPermission, 
      details: hasPermission ? 'User has MANAGE_GUILD permission' : 'User does not have MANAGE_GUILD permission',
      permissions: guild.permissions
    })
  } catch (error) {
    console.error('Error checking permissions:', error);
    return NextResponse.json({ 
      error: 'Failed to check permissions', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

