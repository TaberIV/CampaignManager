import { BaseCommandInteraction, Client } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Command } from "./commands";
import { createSessionMessage } from "./utility";
import notion from "../data/notion/sessions";

export const getAllSessions: Command = {
  name: "readlog",
  description: "View the entire session log.",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const response = await notion.querySessions();

    if (response) {
      const { session, url } = response;
      interaction.followUp(createSessionMessage(session, url));
    }
  }
};
