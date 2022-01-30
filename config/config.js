const { Intents } = require('discord.js');

const {
  DIRECT_MESSAGES,
  GUILD_MESSAGES,
  GUILDS,
} = Intents.FLAGS;

const botIntents = [
  DIRECT_MESSAGES,
  GUILD_MESSAGES,
  GUILDS,
];

const prefix = '!';
const commands = {
  loadCalendar: "load-calendar",
  moonPhase: "moon-phase",
  dayOfYear: "day-of-year",
  dayOfWeek: "day-of-week"
};


module.exports = { botIntents, commands, prefix };
