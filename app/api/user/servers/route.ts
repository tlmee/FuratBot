import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || 'C:\\Users\\arabs\\Desktop\\FuratBotAS\\data\\servers'

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds.`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        retries++;
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      retries++;
      if (retries === maxRetries) throw error;
    }
  }
  throw new Error('Max retries reached');
}

export async function GET() {
  const sessionCookie = cookies().get('session')
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    const { accessToken } = session

    // Fetch user's guilds from Discord API with retry mechanism
    const userGuildsResponse = await fetchWithRetry('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userGuildsResponse.ok) {
      console.error('Discord API response not OK:', userGuildsResponse.status, userGuildsResponse.statusText);
      return NextResponse.json({ error: 'Failed to fetch user guilds from Discord' }, { status: userGuildsResponse.status });
    }

    const userGuilds = await userGuildsResponse.json();

    if (!Array.isArray(userGuilds)) {
      console.error('User guilds is not an array:', userGuilds);
      return NextResponse.json({ error: 'Unexpected response format from Discord API' }, { status: 500 });
    }

    // Filter guilds where user is an admin
    const adminGuilds = userGuilds.filter(guild => (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8))

    // Read bot's server data
    const serverFiles = await fs.readdir(SERVER_DATA_PATH)
    const botServers = await Promise.all(
      serverFiles.map(async file => {
        const content = await fs.readFile(path.join(SERVER_DATA_PATH, file), 'utf-8')
        return JSON.parse(content)
      })
    )

    // Filter servers where both bot and user (as admin) are present
    const relevantServers = adminGuilds.filter(guild => 
      botServers.some(server => server.id === guild.id)
    )

    return NextResponse.json(relevantServers)
  } catch (error) {
    console.error('Error fetching user servers:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}

