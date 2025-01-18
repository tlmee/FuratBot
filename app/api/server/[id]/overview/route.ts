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
    // Fetch server information
    const serverResponse = await fetch(`https://discord.com/api/guilds/${id}?with_counts=true`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!serverResponse.ok) {
      throw new Error(`Failed to fetch server information: ${serverResponse.statusText}`)
    }

    const serverInfo = await serverResponse.json()

    // Fetch channels
    const channelsResponse = await fetch(`https://discord.com/api/guilds/${id}/channels`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!channelsResponse.ok) {
      throw new Error(`Failed to fetch channels: ${channelsResponse.statusText}`)
    }

    const channels = await channelsResponse.json()

    // Fetch members
    const membersResponse = await fetch(`https://discord.com/api/guilds/${id}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!membersResponse.ok) {
      throw new Error(`Failed to fetch members: ${membersResponse.statusText}`)
    }

    const members = await membersResponse.json()

    // Calculate statistics
    const textChannels = channels.filter((channel: any) => channel.type === 0)
    const voiceChannels = channels.filter((channel: any) => channel.type === 2)
    const categoryChannels = channels.filter((channel: any) => channel.type === 4)
    const botMembers = members.filter((member: any) => member.user.bot)
    const humanMembers = members.filter((member: any) => !member.user.bot)

    // Fetch messages from each text channel (last 100 messages)
    let totalMessages = 0
    let botMessages = 0
    let userMessages = 0

    for (const channel of textChannels.slice(0, 5)) { // Limit to first 5 text channels to avoid rate limits
      try {
        const messagesResponse = await fetch(`https://discord.com/api/channels/${channel.id}/messages?limit=100`, {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          },
        })

        if (messagesResponse.ok) {
          const messages = await messagesResponse.json()
          totalMessages += messages.length
          const channelBotMessages = messages.filter((msg: any) => msg.author.bot).length
          botMessages += channelBotMessages
          userMessages += messages.length - channelBotMessages
        }
      } catch (error) {
        console.error(`Error fetching messages for channel ${channel.id}:`, error)
      }
    }

    const overviewData = {
      id: serverInfo.id,
      name: serverInfo.name,
      icon: serverInfo.icon,
      memberCount: humanMembers.length,
      botCount: botMembers.length,
      onlineMembers: serverInfo.approximate_presence_count || 0,
      textChannels: textChannels.length,
      voiceChannels: voiceChannels.length,
      categoryChannels: categoryChannels.length,
      totalChannels: channels.length,
      totalMessages,
      userMessages,
      botMessages,
      messageRate: totalMessages > 0 ? ((botMessages / totalMessages) * 100).toFixed(1) : '0',
      stats: {
        messages: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          messages: Math.floor(Math.random() * 1000) + 500,
          botMessages: Math.floor(Math.random() * 300) + 100,
        })),
        members: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          joins: Math.floor(Math.random() * 20) + 5,
          leaves: Math.floor(Math.random() * 10) + 2,
          total: serverInfo.approximate_member_count || 0,
        })),
        activity: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          messages: Math.floor(Math.random() * 100) + 20,
          active: Math.floor(Math.random() * 50) + 10,
        })),
      },
    }

    return NextResponse.json(overviewData)
  } catch (error) {
    console.error('Error fetching server overview:', error)
    return NextResponse.json({ error: 'Failed to fetch server overview' }, { status: 500 })
  }
}

