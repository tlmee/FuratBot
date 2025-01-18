import { Client, GuildMember, TextChannel, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || path.join(__dirname, '..', '..', 'data', 'servers');

interface WelcomeSettings {
  welcomeMessage: string;
  welcomeImage: string | null;
  welcomeChannel: string;
  imageText: string;
  imageTextColor: string;
  imageTextSize: number;
  imageTextX: number;
  imageTextY: number;
  avatarX: number;
  avatarY: number;
  avatarSize: number;
  showAvatar: boolean;
  showWelcomeText: boolean;
  showUsername: boolean;
  usernameX: number;
  usernameY: number;
  usernameSize: number;
  usernameColor: string;
  isWelcomeEnabled: boolean;
}

export async function handleWelcome(member: GuildMember) {
  console.log(`New member joined: ${member.user.tag}`);
  try {
    const settings = await getWelcomeSettings(member.guild.id);
    if (!settings) {
      console.log(`No welcome settings found for server ${member.guild.id}`);
      return;
    }
    if (!settings.isWelcomeEnabled) {
      console.log(`Welcome messages are disabled for server ${member.guild.id}`);
      return;
    }

    const welcomeChannel = member.guild.channels.cache.get(settings.welcomeChannel) as TextChannel;
    if (!welcomeChannel) {
      console.error(`Welcome channel ${settings.welcomeChannel} not found for server ${member.guild.id}`);
      return;
    }

    const welcomeMessage = settings.welcomeMessage
      .replace('{user}', member.toString())
      .replace('{server}', member.guild.name);

    console.log(`Sending welcome message for ${member.user.tag} in ${welcomeChannel.name}`);

    if (settings.welcomeImage) {
      console.log('Creating welcome image...');
      const attachment = await createWelcomeImage(member, settings);
      await welcomeChannel.send({ content: welcomeMessage, files: [attachment] });
    } else {
      await welcomeChannel.send(welcomeMessage);
    }

    console.log(`Welcome message sent successfully for ${member.user.tag}`);
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

async function getWelcomeSettings(guildId: string): Promise<WelcomeSettings | null> {
  try {
    const filePath = path.join(SERVER_DATA_PATH, `${guildId}.json`);
    console.log(`Attempting to read welcome settings from ${filePath}`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const serverData = JSON.parse(fileContent);
    if (!serverData.welcomeSettings) {
      console.log(`No welcome settings found in file for server ${guildId}`);
      return null;
    }
    return serverData.welcomeSettings;
  } catch (error) {
    console.error(`Error fetching welcome settings for server ${guildId}:`, error);
    return null;
  }
}

async function createWelcomeImage(member: GuildMember, settings: WelcomeSettings): Promise<AttachmentBuilder> {
  console.log('Starting welcome image creation...');
  try {
    // Register a font (you may need to adjust the path based on your project structure)
    registerFont(path.join(process.cwd(), 'assets', 'fonts', 'Cairo-Regular.ttf'), { family: 'Cairo' });

    const canvas = createCanvas(1000, 500);
    const ctx = canvas.getContext('2d');

    // Load and draw background image
    console.log(`Loading background image: ${settings.welcomeImage}`);
    const background = await loadImage(settings.welcomeImage!);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw welcome text
    if (settings.showWelcomeText) {
      console.log('Drawing welcome text');
      ctx.font = `${settings.imageTextSize}px Cairo`;
      ctx.fillStyle = settings.imageTextColor;
      ctx.textAlign = 'center';
      ctx.fillText(settings.imageText, settings.imageTextX, settings.imageTextY);
    }

    // Draw avatar
    if (settings.showAvatar) {
      console.log('Drawing user avatar');
      const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
      console.log(`Avatar URL: ${avatarURL}`);
      const avatar = await loadImage(avatarURL);
      ctx.save();
      ctx.beginPath();
      ctx.arc(settings.avatarX, settings.avatarY, settings.avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, settings.avatarX - settings.avatarSize / 2, settings.avatarY - settings.avatarSize / 2, settings.avatarSize, settings.avatarSize);
      ctx.restore();
    }

    // Draw username
    if (settings.showUsername) {
      console.log('Drawing username');
      ctx.font = `${settings.usernameSize}px Cairo`;
      ctx.fillStyle = settings.usernameColor;
      ctx.textAlign = 'center';
      ctx.fillText(member.user.username, settings.usernameX, settings.usernameY);
    }

    console.log('Welcome image created successfully');
    const buffer = canvas.toBuffer('image/png');
    return new AttachmentBuilder(buffer, { name: 'welcome-image.png' });
  } catch (error) {
    console.error('Error creating welcome image:', error);
    throw error;
  }
}

export function setupWelcomeHandler(client: Client) {
  client.on('guildMemberAdd', handleWelcome);
}

