import { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Command } from "./commands";
import { createSessionMessage } from "./utility";
import notion from "../data/notion/sessions";
import { SessionQuery } from "src/utils/session";

export const getSession: Command = {
  name: "getsession",
  description: "Get a session log by number.",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      type: "NUMBER",
      name: "number",
      description: "Session number",
      required: true
    }
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const number = Number(interaction.options.get("number", true).value);
    const response = await notion.querySessions({ number });
    interaction.followUp(response);
  }
};

export const getAllSessions: Command = {
  name: "readlog",
  description: "View the entire session log.",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const response = await notion.querySessions();
    interaction.followUp(response);
  }
};
