const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  Events,
  AuditLogEvent,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const express = require('express');
const app = express();
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const jsonFilePath = path.join(__dirname, "API/Files/ban.json");

client.on(Events.MessageCreate, async (message) => {
  const args = message.content.split(" ");

  if (args[0] === "!ban") {
    const userId = args[1];

    try {

      const rEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Confirmation")
        .setDescription(`Are you sure you'd like to ban that user?`)
        .setTimestamp();

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ban_player_${userId}`)
          .setLabel("Ban Player")
          .setStyle(ButtonStyle.Success)
      );

      await message.reply({ embeds: [rEmbed], components: [button] });
    } catch (error) {
      console.error('Error fetching username: ', error);
      message.reply('Failed to fetch the username. Please check the user ID.');
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("ban_player")) {
    const userId = interaction.customId.split('_')[2];

    fs.readFile('src/API/Files/ban.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return interaction.reply({ content: 'Failed to read the file.', ephemeral: true });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        return interaction.reply({ content: 'Failed to parse JSON.', ephemeral: true });
      }

      if (jsonData.bans.includes(`${userId}`)) {
        return interaction.reply({ content: `That user is already banned!`, ephemeral: true})
      }

      jsonData.bans.push(userId);

      fs.writeFile('src/API/Files/ban.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing file:', writeErr);
          return interaction.reply({ content: 'Failed to write to the file.', ephemeral: true });
        }
        interaction.reply({ content: 'User banned successfully!', ephemeral: true });
      });
    });
  }
});

process.on("unhandledRejection", async (reason, promise) => {
  console.log(`Unhandled Rejection at: ${promise} \n\n Reason: ${reason}`.red);
});

process.on("uncaughtException", async (err) => {
  console.log(`Unhandled Exception ${err}`.red);
});

process.on("uncaughtExceptionMonitor", async (err, origin) => {
  console.log(`Unhandled Exception ${err} \n\n Origin: ${origin}`.red);
});

client.login(process.env.token).then(
  console.log(`Logged into the bot.`)
);


app.use(express.static(path.join(__dirname, './index.html')));
app.use(express.static(path.join(__dirname, './API/Files')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/api/ban', (req, res) => {
  res.sendFile(path.join(__dirname, 'API/Files/ban.json'));
});

app.listen(3000, () => {
  console.log(`Listening to port 3000. http://localhost:3000`)
})