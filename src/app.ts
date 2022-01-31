import { Client } from "discord.js";
import { botIntents } from "./config/config";
import config from "./config/default";
import ready from "./listeners/ready";
import calendarActions from "./actions/calendar";
import interactionCreate from "./listeners/interactionCreate";

const client = new Client({
  intents: botIntents,
  partials: ["CHANNEL", "MESSAGE"]
});

ready(client);
interactionCreate(client);

export function startBot() {
  client.login(config.DISCORD_TOKEN);
}
