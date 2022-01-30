const { Client, MessageEmbed } = require('discord.js');
const { botIntents, commands, prefix } = require('./config/config');
const config = require('./config/default');
const calendarActions = require('./actions/calendar.js');

const client = new Client({
  intents: botIntents,
  partials: ['CHANNEL', 'MESSAGE']
});

client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  // Trim message whitespace!

  const message = msg.content.slice(prefix.length).split(' ');
  const userCmd = message[0];
  const args = message.slice(1);

  if (userCmd === commands.loadCalendar) {
    msg.channel.send("Command not yet supported.");
  } else if (userCmd === commands.moonPhase) {
    msg.channel.send("Command not yet supported.");
  } else if (userCmd === commands.dayOfYear) {
    msg.reply(calendarActions.getDayOfYear(...args).toString());
  } else if (userCmd === commands.dayOfWeek) {
    msg.reply(calendarActions.getDayOfWeek(...args));
  } else {
    msg.reply("Didn't understand command: " + userCmd);
  }
});

const startBot = () => {
  client.login(config.DISCORD_TOKEN);
};

// export startBot as default
module.exports = { startBot };