import { Client, GatewayIntentBits, TextChannel, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const SERVER_DATA_PATH = path.join(process.cwd(), 'data', 'servers');

interface WelcomeSettings {
  isWelcomeEnabled: boolean;
  welcomeChannel: string;
  welcomeMessage: string;
  welcomeImage: string;
  showWelcomeText: boolean;
  imageText: string;
  imageTextX: number;
  imageTextY: number;
  avatarX: number;
  avatarY: number;
  usernameX: number;
  usernameY: number;
  imageTextSize: number;
  showAvatar: boolean;
  avatarSize: number;
  showUsername: boolean;
  usernameSize: number;
  usernameColor: string;
  font: string;
}

async function getWelcomeSettings(serverId: string): Promise<WelcomeSettings> {
  const filePath = path.join(SERVER_DATA_PATH, `${serverId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData.welcomeSettings;
  } catch (error) {
    console.error(`Error reading welcome settings for server ${serverId}:`, error);
    throw error;
  }
}

async function createWelcomeImage(member: any, settings: WelcomeSettings): Promise<Buffer | null> {
  try {
    if (!settings.welcomeImage) {
      console.error('No welcome image found in settings');
      return null;
    }

    const matches = settings.welcomeImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    let image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to get image dimensions');
    }

    // Create a circular avatar
    let avatarBuffer: Buffer | null = null;
    if (settings.showAvatar) {
      const avatarResponse = await fetch(member.user.displayAvatarURL({ format: 'png', size: 256 }));
      const avatarArrayBuffer = await avatarResponse.arrayBuffer();
      avatarBuffer = await sharp(Buffer.from(avatarArrayBuffer))
        .resize(settings.avatarSize, settings.avatarSize)
        .composite([{
          input: Buffer.from(`<svg><circle cx="${settings.avatarSize / 2}" cy="${settings.avatarSize / 2}" r="${settings.avatarSize / 2}" /></svg>`),
          blend: 'dest-in'
        }])
        .toBuffer();
    }

    // Prepare text overlay
    const svgText = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          .username { fill: ${settings.usernameColor}; font-size: ${settings.usernameSize}px; font-weight: bold; font-family: ${settings.font}, sans-serif; }
          .welcome-text { fill: black; font-size: ${settings.imageTextSize}px; font-family: ${settings.font}, sans-serif; }
        </style>
        ${settings.showUsername ? `<text x="${Math.round(settings.usernameX)}" y="${Math.round(settings.usernameY)}" class="username">${member.user.username}</text>` : ''}
        ${settings.showWelcomeText ? `<text x="${Math.round(settings.imageTextX)}" y="${Math.round(settings.imageTextY)}" class="welcome-text">${settings.imageText}</text>` : ''}
      </svg>
    `;

    // Composite the image
    const compositeOperations = [];
    
    if (avatarBuffer) {
      compositeOperations.push({
        input: avatarBuffer,
        top: Math.round(settings.avatarY - settings.avatarSize / 2),
        left: Math.round(settings.avatarX - settings.avatarSize / 2),
      });
    }

    compositeOperations.push({
      input: Buffer.from(svgText),
      top: 0,
      left: 0,
    });

    const finalImage = await image
      .composite(compositeOperations)
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('Error creating welcome image:', error);
    return null;
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  const setWelcomeChannelCommand = new SlashCommandBuilder()
    .setName('setwelcomechannel')
    .setDescription('Set the channel for welcome messages')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send welcome messages in')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

  try {
    await client.application?.commands.set([setWelcomeChannelCommand]);
    console.log('Slash command registered successfully!');
  } catch (error) {
    console.error('Error registering slash command:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'setwelcomechannel') {
    await handleSetWelcomeChannel(interaction);
  }
});

async function handleSetWelcomeChannel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel');
  if (!channel || !(channel instanceof TextChannel)) {
    await interaction.reply({ content: 'Please select a valid text channel.', ephemeral: true });
    return;
  }

  try {
    console.log(`Attempting to set welcome channel for server ${interaction.guildId} to ${channel.id}`);
    const welcomeSettings = await getWelcomeSettings(interaction.guildId!);
    welcomeSettings.welcomeChannel = channel.id;
    welcomeSettings.isWelcomeEnabled = true;
    await fs.writeFile(
      path.join(SERVER_DATA_PATH, `${interaction.guildId}.json`),
      JSON.stringify({ welcomeSettings }, null, 2)
    );
    console.log(`Updated welcome settings:`, welcomeSettings);
    await interaction.reply({ content: `Welcome channel has been set to ${channel.toString()}.`, ephemeral: true });
  } catch (error) {
    console.error('Error setting welcome channel:', error);
    await interaction.reply({ content: 'An error occurred while setting the welcome channel.', ephemeral: true });
  }
}

client.on('guildMemberAdd', async (member) => {
  console.log(`New member joined: ${member.user.username}`);
  try {
    const welcomeSettings = await getWelcomeSettings(member.guild.id);
    console.log(`Welcome settings for server ${member.guild.id}:`, welcomeSettings);
    if (welcomeSettings.isWelcomeEnabled && welcomeSettings.welcomeChannel) {
      const channel = await client.channels.fetch(welcomeSettings.welcomeChannel) as TextChannel;
      if (channel) {
        const welcomeMessage = welcomeSettings.welcomeMessage.replace('{user}', member.user.toString());
        
        // Create and send welcome image
        const welcomeImageBuffer = await createWelcomeImage(member, welcomeSettings);
        if (welcomeImageBuffer) {
          const attachment = new AttachmentBuilder(welcomeImageBuffer, { name: 'welcome-image.png' });
          await channel.send({ content: welcomeMessage, files: [attachment] });
          console.log(`Sent welcome message and image to ${member.user.username} in ${channel.name}`);
        } else {
          console.error('Failed to create welcome image. Sending message without image.');
          await channel.send(welcomeMessage);
          console.log(`Sent welcome message (without image) to ${member.user.username} in ${channel.name}`);
        }
      } else {
        console.error(`Welcome channel ${welcomeSettings.welcomeChannel} not found for server ${member.guild.id}`);
      }
    } else {
      console.log(`Welcome messages are disabled or channel not set for server ${member.guild.id}`);
      console.log(`Enabled: ${welcomeSettings.isWelcomeEnabled}, ChannelId: ${welcomeSettings.welcomeChannel}`);
    }
  } catch (error) {
    console.error(`Error sending welcome message: ${error}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

