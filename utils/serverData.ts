import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || './data/servers'

interface ServerData {
  id: string
  name: string
  // أضف المزيد من الحقول حسب الحاجة
}

// تأكد من وجود المجلد
async function ensureDirectory() {
  try {
    await fs.access(SERVER_DATA_PATH)
  } catch {
    await fs.mkdir(SERVER_DATA_PATH, { recursive: true })
  }
}

export async function saveServerData(serverId: string, data: ServerData): Promise<void> {
  await ensureDirectory()
  const filePath = path.join(SERVER_DATA_PATH, `${serverId}.json`)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export async function getServerData(serverId: string): Promise<ServerData | null> {
  await ensureDirectory()
  const filePath = path.join(SERVER_DATA_PATH, `${serverId}.json`)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as ServerData
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw error
  }
}

export async function getAllServers(): Promise<ServerData[]> {
  await ensureDirectory()
  try {
    const files = await fs.readdir(SERVER_DATA_PATH)
    const servers = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const serverId = path.basename(file, '.json')
          return await getServerData(serverId)
        })
    )
    return servers.filter((server): server is ServerData => server !== null)
  } catch (error) {
    console.error('Error reading servers directory:', error)
    return []
  }
}

