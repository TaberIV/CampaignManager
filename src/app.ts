import { Client } from 'discord.js';
import { botIntents, commands, prefix } from './config/config';
import config from './config/default';
import calendarActions from './actions/calendar';

const client = new Client({
  intents: botIntents,
  partials: ['CHANNEL', 'MESSAGE']
});

client.on('ready', () => {
  console.log('Logged in as ' + client.user?.tag);
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
    msg.channel.send(calendarActions.getMoonPhase(args[0]));
  } else if (userCmd === commands.dayOfWeek) {
    msg.channel.send(calendarActions.getDayOfWeek(args[0]));
  } else {
    msg.reply("Didn't understand command: " + userCmd);
  }
});

export function startBot() {
  client.login(config.DISCORD_TOKEN);
}
