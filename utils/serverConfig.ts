import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DATA_PATH = path.join(__dirname, '..', 'data', 'servers');

export interface ServerConfig {
  commands: Command[];
  welcomeSettings: WelcomeSettings;
  // Add other configuration properties here
}

export interface Command {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  alternativeNames: string[];
  allowedRoles: string[];
  disallowedRoles: string[];
  allowedChannels: string[];
  disallowedChannels: string[];
}

export interface WelcomeSettings {
  isEnabled: boolean;
  channelId: string;
  message: string;
}

export async function getServerConfig(serverId: string): Promise<ServerConfig | null> {
  const filePath = path.join(SERVER_DATA_PATH, `${serverId}.json`);
  
  try {
    await fs.mkdir(SERVER_DATA_PATH, { recursive: true });
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ServerConfig;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`No configuration file found for server ${serverId}. Creating a default one.`);
        const defaultConfig: ServerConfig = {
          commands: [
            {
              id: 'ping',
              name: 'ping',
              description: 'Replies with Pong!',
              isEnabled: true,
              alternativeNames: [],
              allowedRoles: [],
              disallowedRoles: [],
              allowedChannels: [],
              disallowedChannels: [],
            }
          ],
          welcomeSettings: {
            isEnabled: false,
            channelId: '',
            message: 'Welcome to the server, {user}!',
          },
        };
        await fs.writeFile(filePath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error handling configuration for server ${serverId}:`, error);
    return null;
  }
}

export async function updateServerConfig(serverId: string, config: Partial<ServerConfig>): Promise<void> {
  const filePath = path.join(SERVER_DATA_PATH, `${serverId}.json`);
  
  try {
    const currentConfig = await getServerConfig(serverId);
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...config };
      await fs.writeFile(filePath, JSON.stringify(updatedConfig, null, 2));
    }
  } catch (error) {
    console.error(`Error updating configuration for server ${serverId}:`, error);
  }
}

