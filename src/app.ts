import { Client } from "discord.js";
import { botIntents } from "./config/config";
// import config from "./config/default";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";

const client = new Client({
  intents: botIntents,
  partials: ["CHANNEL", "MESSAGE"]
});

ready(client);
interactionCreate(client);

export function startBot() {
  client.login(process.env.DISCORD_TOKEN);
}
