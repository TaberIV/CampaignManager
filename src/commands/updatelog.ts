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
  createSessionMessage,
  getStringOrUndefined
} from "./utility";
import notion from "../data/notion/sessions";
import { SessionQuery } from "src/utils/session";

export const updateLog: Command = {
  name: "updatelog",
  description: "Update an existing session by number.",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      type: "NUMBER",
      name: "number",
      description: "Session number",
      required: true
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
    const number = Number(interaction.options.get("number", true).value);
    const title = getStringOrUndefined(interaction.options.get("title"));
    const description = getStringOrUndefined(
      interaction.options.get("description")
    );
    const month = getNumberOrNull(interaction.options.get("month"));
    const day = getNumberOrNull(interaction.options.get("day"));
    const year = getNumberOrNull(interaction.options.get("year"));
    const author = interaction.user.username;
    const gameDate =
      month && day ? calendar.createDate(month, day, year) : undefined;

    let followUp: string | InteractionReplyOptions = "";
    try {
      const gameDateFmt = gameDate ? calendar.formatDate(gameDate) : undefined;
      const gameDateStr = gameDate
        ? calendar.dateToString(gameDate)
        : undefined;
      const moon = gameDate ? calendar.getMoonPhase(gameDate) : undefined;

      const session: SessionQuery = {
        number,
        title,
        description,
        gameDate: gameDateStr,
        gameDateFmt,
        author,
        moon
      };

      followUp = await notion.updateSession(session);
    } catch (e) {
      followUp = "There was an internal error.";
    }

    await interaction.followUp(followUp);
  }
};
