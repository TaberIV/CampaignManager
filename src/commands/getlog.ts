import { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Command } from "./commands";
import {
  getFollowUp,
  getNumberOrNull,
  getNumberOrUndefined,
  getStringOrNull,
  getStringOrUndefined
} from "./utility";
import notion from "../data/notion/sessions";
import { SessionInfo } from "src/utils/session";

export const getSession: Command = {
  name: "getlog",
  description:
    "Get a session log by number or title. (Default: Gets the previous session.)",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      type: "NUMBER",
      name: "number",
      description: "Session number",
      required: false
    },
    {
      type: "STRING",
      name: "search",
      description: "String to search for in title or description.",
      required: false
    }
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const numArg = getNumberOrUndefined(
      interaction.options.get("number", false)
    );
    const search = getStringOrUndefined(
      interaction.options.get("search", false)
    );
    const number = numArg !== undefined || search ? numArg : -1;
    interaction.followUp(
      getFollowUp(await notion.querySessions({ number, search }))
    );
  }
};

export const getAllSessions: Command = {
  name: "readlog",
  description:
    "Get a number of the most recent past session logs. (Default/Maximum: 10)",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      type: "NUMBER",
      name: "number",
      description: "Number of sessions",
      required: false
    }
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const numArg = getNumberOrUndefined(
      interaction.options.get("number", false)
    );
    const limit = numArg !== undefined ? numArg : 10;

    const response = await notion.querySessions({ limit });
    interaction.followUp(getFollowUp(response));
  }
};
