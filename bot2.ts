import { Client, GatewayIntentBits, SlashCommandBuilder, Interaction, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DATA_PATH = path.join(__dirname, 'data', 'servers');

interface Command {
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

async function getServerCommands(serverId: string): Promise<Command[]> {
  const serverDataPath = path.join(__dirname, '..', 'data', 'servers');
  const filePath = path.join(serverDataPath, `${serverId}.json`);
  
  try {
    await mkdir(serverDataPath, { recursive: true });
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(data);
      return parsedData.commands || [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`No command file found for server ${serverId}. Creating a default one.`);
        const defaultCommands: Command[] = [
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
          },
          {
            id: 'serverinfo',
            name: 'serverinfo',
            description: 'عرض معلومات السيرفر',
            isEnabled: true,
            alternativeNames: ['معلومات_السيرفر', 'السيرفر'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'userinfo',
            name: 'userinfo',
            description: 'عرض معلومات المستخدم',
            isEnabled: true,
            alternativeNames: ['معلومات_المستخدم', 'المستخدم'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'user',
            name: 'user',
            description: 'معلومات المستخدم',
            isEnabled: true,
            alternativeNames: ['معلومات_المستخدم'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'avatar',
            name: 'avatar',
            description: 'صورة المستخدم',
            isEnabled: true,
            alternativeNames: ['صورة_المستخدم'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'roles',
            name: 'roles',
            description: 'قائمة الرتب',
            isEnabled: true,
            alternativeNames: ['الرتب'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'help',
            name: 'help',
            description: 'قائمة الأوامر',
            isEnabled: true,
            alternativeNames: ['مساعدة', 'المساعدة'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'roll',
            name: 'roll',
            description: 'رمي نرد',
            isEnabled: true,
            alternativeNames: ['نرد'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          },
          {
            id: 'poll',
            name: 'poll',
            description: 'عمل استطلاع',
            isEnabled: true,
            alternativeNames: ['استطلاع'],
            allowedRoles: [],
            disallowedRoles: [],
            allowedChannels: [],
            disallowedChannels: [],
          }
        ];
        await fs.writeFile(filePath, JSON.stringify({ commands: defaultCommands }, null, 2));
        return defaultCommands;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error handling commands for server ${serverId}:`, error);
    return [];
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  try {
    const guilds = await client.guilds.fetch();
    for (const [guildId, guild] of guilds) {
      const commands = await getServerCommands(guildId);
      const slashCommands = commands
        .filter(cmd => cmd.isEnabled)
        .map(cmd => {
          const command = new SlashCommandBuilder()
            .setName(cmd.name)
            .setDescription(cmd.description);
          
          if (cmd.name === 'userinfo' || cmd.name === 'avatar') {
            command.addUserOption(option => 
              option.setName('user')
                .setDescription('المستخدم المراد عرض معلوماته')
                .setRequired(false)
            );
          } else if (cmd.name === 'poll') {
            command
              .addStringOption(option =>
                option.setName('question')
                  .setDescription('السؤال المراد طرحه في الاستطلاع')
                  .setRequired(true)
              )
              .addStringOption(option =>
                option.setName('options')
                  .setDescription('خيارات الاستطلاع (مفصولة بفواصل)')
                  .setRequired(false)
              );
          }
          
          return command;
        });

      const fetchedGuild = await client.guilds.fetch(guildId);
      await fetchedGuild.commands.set(slashCommands);
    }
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

client.on('interactionCreate', async (interaction: any) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guildId, channelId, member } = interaction;

  if (!guildId) {
    await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    return;
  }

  const commands = await getServerCommands(guildId);
  const command = commands.find(cmd => cmd.name === commandName || cmd.alternativeNames.includes(commandName));

  if (!command || !command.isEnabled) {
    await interaction.reply({ content: 'This command is not available.', ephemeral: true });
    return;
  }

  // Check channel permissions
  if (command.allowedChannels.length > 0 && !command.allowedChannels.includes(channelId)) {
    await interaction.reply({ content: 'This command cannot be used in this channel.', ephemeral: true });
    return;
  }

  if (command.disallowedChannels.includes(channelId)) {
    await interaction.reply({ content: 'This command cannot be used in this channel.', ephemeral: true });
    return;
  }

  // Check role permissions
  const memberRoles = member?.roles.cache.map(role => role.id) || [];
  if (command.allowedRoles.length > 0 && !command.allowedRoles.some(role => memberRoles.includes(role))) {
    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    return;
  }

  if (command.disallowedRoles.some(role => memberRoles.includes(role))) {
    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    return;
  }

  // Execute command
  try {
    await executeCommand(command, interaction);
  } catch (error) {
    console.error(`Error executing command ${command.name}:`, error);
    await interaction.reply({ content: 'عذرًا، حدث خطأ أثناء تنفيذ هذا الأمر. الرجاء المحاولة مرة أخرى لاحقًا.', ephemeral: true });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/g);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const guildId = message.guild?.id;
  if (!guildId) return;

  const commands = await getServerCommands(guildId);
  const command = commands.find(cmd => 
    cmd.name === commandName || 
    cmd.alternativeNames.includes(commandName)
  );

  if (!command || !command.isEnabled) return;

  // Check channel permissions
  if (command.allowedChannels.length > 0 && !command.allowedChannels.includes(message.channel.id)) {
    await message.reply('This command cannot be used in this channel.');
    return;
  }

  if (command.disallowedChannels.includes(message.channel.id)) {
    await message.reply('This command cannot be used in this channel.');
    return;
  }

  // Check role permissions
  const memberRoles = message.member?.roles.cache.map(role => role.id) || [];
  if (command.allowedRoles.length > 0 && !command.allowedRoles.some(role => memberRoles.includes(role))) {
    await message.reply('You do not have permission to use this command.');
    return;
  }

  if (command.disallowedRoles.some(role => memberRoles.includes(role))) {
    await message.reply('You do not have permission to use this command.');
    return;
  }

  // Execute command
  try {
    await executeCommand(command, message);
  } catch (error) {
    console.error(`Error executing command ${command.name}:`, error);
    await message.reply('عذرًا، حدث خطأ أثناء تنفيذ هذا الأمر. الرجاء المحاولة مرة أخرى لاحقًا.');
  }
});

async function executeCommand(command: Command, interaction: any) {
  const isSlashCommand = interaction.isChatInputCommand?.();
  
  switch (command.name) {
    case 'userinfo':
      await handleUserInfoCommand(interaction, isSlashCommand);
      break;
    case 'avatar':
      await handleAvatarCommand(interaction, isSlashCommand);
      break;
    case 'serverinfo':
      await handleServerInfoCommand(interaction, isSlashCommand);
      break;
    case 'ping':
      await handlePingCommand(interaction, isSlashCommand);
      break;
    case 'roles':
      await handleRolesCommand(interaction, isSlashCommand);
      break;
    case 'help':
      await handleHelpCommand(interaction, isSlashCommand);
      break;
    case 'roll':
      await handleRollCommand(interaction, isSlashCommand);
      break;
    case 'poll':
      await handlePollCommand(interaction, isSlashCommand);
      break;
    default:
      throw new Error(`Unhandled command: ${command.name}`);
  }
}

async function handleUserInfoCommand(interaction: any, isSlashCommand: boolean) {
  const user = isSlashCommand ? interaction.options.getUser('user') || interaction.user : interaction.mentions.users.first() || interaction.author;
  const member = interaction.guild?.members.cache.get(user.id);

  try {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`معلومات المستخدم - ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'معرف المستخدم', value: user.id, inline: true },
        { name: 'تاريخ إنشاء الحساب', value: user.createdAt.toUTCString(), inline: true },
        { name: 'تاريخ الانضمام للسيرفر', value: member?.joinedAt?.toUTCString() || 'غير متوفر', inline: true },
        { name: 'الرتب', value: member?.roles.cache.map(r => r.name).join(', ') || 'لا يوجد' }
      );

    if (isSlashCommand) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in handleUserInfoCommand:', error);
    throw error;
  }
}

async function handleAvatarCommand(interaction: any, isSlashCommand: boolean) {
  const user = isSlashCommand ? interaction.options.getUser('user') || interaction.user : interaction.mentions.users.first() || interaction.author;
  const avatarUrl = user.displayAvatarURL({ size: 4096, dynamic: true });

  try {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`الصورة الشخصية لـ ${user.tag}`)
      .setImage(avatarUrl);

    if (isSlashCommand) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in handleAvatarCommand:', error);
    throw error;
  }
}

async function handleServerInfoCommand(interaction: any, isSlashCommand: boolean) {
  try {
    const { guild } = interaction;
    if (!guild) {
      const response = 'هذا الأمر يمكن استخدامه فقط في السيرفر.';
      if (isSlashCommand) {
        await interaction.reply({ content: response, ephemeral: true });
      } else {
        await interaction.channel.send(response);
      }
      return;
    }

    const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
    const categories = guild.channels.cache.filter(channel => channel.type === 4).size;
    const totalChannels = textChannels + voiceChannels + categories;

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`معلومات السيرفر - ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }) || '')
      .addFields(
        { name: 'معرف السيرفر', value: guild.id, inline: true },
        { name: 'المالك', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'تاريخ الإنشاء', value: guild.createdAt.toUTCString(), inline: true },
        { name: 'عدد الأعضاء', value: guild.memberCount.toString(), inline: true },
        { name: 'إجمالي القنوات', value: totalChannels.toString(), inline: true },
        { name: 'القنوات النصية', value: textChannels.toString(), inline: true },
        { name: 'القنوات الصوتية', value: voiceChannels.toString(), inline: true },
        { name: 'التصنيفات', value: categories.toString(), inline: true },
        { name: 'الرتب', value: guild.roles.cache.size.toString(), inline: true }
      );

    if (isSlashCommand) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in handleServerCommand:', error);
    throw error;
  }
}

async function handlePingCommand(interaction: any, isSlashCommand: boolean) {
  try {
    const startTime = Date.now();

    if (isSlashCommand) {
      const sent = await interaction.reply({ content: 'جاري حساب البنق...', fetchReply: true });
      const endTime = Date.now();
      const latency = endTime - startTime;
      await interaction.editReply(`🏓 بونج! زمن الاستجابة: ${latency}ms. زمن استجابة API: ${Math.round(client.ws.ping)}ms`);
    } else {
      const sent = await interaction.channel.send('جاري حساب البنق...');
      const endTime = Date.now();
      const latency = endTime - startTime;
      await sent.edit(`🏓 بونج! زمن الاستجابة: ${latency}ms. زمن استجابة API: ${Math.round(client.ws.ping)}ms`);
    }
  } catch (error) {
    console.error('Error in handlePingCommand:', error);
    throw error;
  }
}

async function handleRolesCommand(interaction: any, isSlashCommand: boolean) {
  try {
    const { guild } = interaction;
    if (!guild) {
      const response = 'هذا الأمر يمكن استخدامه فقط في السيرفر.';
      if (isSlashCommand) {
        await interaction.reply({ content: response, ephemeral: true });
      } else {
        await interaction.channel.send(response);
      }
      return;
    }

    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .join(', ');

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`الرتب في ${guild.name}`)
      .setDescription(roles || 'لا توجد رتب.');

    if (isSlashCommand) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in handleRolesCommand:', error);
    throw error;
  }
}

// إضافة الدوال الجديدة للأوامر

async function handleHelpCommand(interaction: any, isSlashCommand: boolean) {
  try {
    const commands = await getServerCommands(interaction.guild.id);
    
    const enabledCommands = commands.filter(cmd => cmd.isEnabled);
    const helpText = enabledCommands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n');

    const embed = {
      color: 0x0099ff,
      title: 'قائمة الأوامر المتاحة',
      description: helpText,
    };

    if (isSlashCommand) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in handleHelpCommand:', error);
    throw error;
  }
}

async function handleRollCommand(interaction: any, isSlashCommand: boolean) {
  try {
    const result = Math.floor(Math.random() * 6) + 1;
    const response = `🎲 النتيجة هي: **${result}**`;

    if (isSlashCommand) {
      await interaction.reply(response);
    } else {
      await interaction.channel.send(response);
    }
  } catch (error) {
    console.error('Error in handleRollCommand:', error);
    throw error;
  }
}

async function handlePollCommand(interaction: any, isSlashCommand: boolean) {
  try {
    let question, options;

    if (isSlashCommand) {
      question = interaction.options.getString('question');
      options = interaction.options.getString('options')?.split(',') || ['نعم', 'لا'];
    } else {
      const args = interaction.content.split(' ').slice(1);
      question = args.join(' ').split('|')[0].trim();
      options = args.join(' ').split('|').slice(1).map((opt: string) => opt.trim());
      if (options.length === 0) options = ['نعم', 'لا'];
    }

    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const pollOptions = options.slice(0, 10).map((opt: string, i: number) => `${emoji[i]} ${opt}`).join('\n');

    const embed = {
      color: 0x0099ff,
      title: '📊 استطلاع',
      description: `**${question}**\n\n${pollOptions}`,
    };

    let pollMessage;
    if (isSlashCommand) {
      pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
    } else {
      pollMessage = await interaction.channel.send({ embeds: [embed] });
    }

    for (let i = 0; i < options.length && i < 10; i++) {
      await pollMessage.react(emoji[i]);
    }
  } catch (error) {
    console.error('Error in handlePollCommand:', error);
    throw error;
  }
}


client.login(process.env.DISCORD_BOT_TOKEN).catch(console.error);

