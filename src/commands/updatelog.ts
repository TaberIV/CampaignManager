import {
  BaseCommandInteraction,
  Client,
  InteractionReplyOptions
} from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import calendar from "../utils/calendar";
import { Command } from "./commands";
import {
  optionalDateArgs,
  getNumberOrNull,
  getStringOrUndefined,
  getMemberName
} from "./utility";
import notion from "../data/notion/sessions";
import { SessionQuery } from "src/utils/session";

export const updateLog: Command = {
  name: "updatelog",
  description:
    "Update an existing setting log by number, or update all log pages.",
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
      name: "title",
      description: "Session title",
      required: false
    },
    {
      type: "STRING",
      name: "description",
      description: "Session description",
      required: false
    },
    ...optionalDateArgs
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const number = getNumberOrNull(interaction.options.get("number"));

    if (number) {
      const title = getStringOrUndefined(interaction.options.get("title"));
      const description = getStringOrUndefined(
        interaction.options.get("description")
      );
      const month = getNumberOrNull(interaction.options.get("month"));
      const day = getNumberOrNull(interaction.options.get("day"));
      const year = getNumberOrNull(interaction.options.get("year"));
      const author = getMemberName(interaction);
      const date =
        month && day ? calendar.createDate(month, day, year) : undefined;

      try {
        const gameDate = date ? calendar.formatDate(date) : undefined;
        const moon = date ? calendar.getMoonPhase(date) : undefined;

        const session: SessionQuery = {
          number,
          title,
          description,
          ...date,
          gameDate,
          author,
          moon
        };

        interaction.followUp(await notion.updateSession(session));
      } catch (e) {
        console.log(e);
      }
    } else if (interaction.options.data.length === 0) {
      interaction.followUp(await notion.updateSession());
    } else {
      interaction.followUp(
        "You provided log details but no session number. If you want to create a session use `/logsession`" +
          ", or if you want to update an existing log include the session number." +
          " Run `/updatelog` with no argumetns to regenerate all logs' Notion pages."
      );
    }
  }
};
