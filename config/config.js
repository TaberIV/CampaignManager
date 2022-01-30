import { Intents } from 'discord.js';

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
  moonPhase: "moon",
  dayOfWeek: "weekday"
};

export { botIntents, commands, prefix };
