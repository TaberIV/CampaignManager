import { BaseCommandInteraction, Client } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Command } from "./commands";
import { createSessionMessage } from "./utility";
import notion from "../data/notion/sessions";

export const findSessions: Command = {
  name: "findsessions",
  description: "",
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

    if (response) {
      const { session, url } = response;
      interaction.followUp(createSessionMessage(session, url));
    }
  }
};
