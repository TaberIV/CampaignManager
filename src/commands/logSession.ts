import { BaseCommandInteraction, Client } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import calendar from "../utils/calendar";
import { Command } from "./commands";
import {
  getNumberOrNull,
  FollowUp,
  getFollowUp,
  getMemberName,
  requiredDateArgs,
  endDateArgs
} from "./utility";
import notion from "../data/notion/sessions";
import { Session } from "src/utils/session";
import { convertCompilerOptionsFromJson } from "typescript";

export const logSession: Command = {
  name: "logsession",
  description: "Create a session log.",
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
      required: true
    },
    {
      type: "STRING",
      name: "description",
      description: "Session description",
      required: true
    },
    ...requiredDateArgs,
    ...endDateArgs
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const number = Number(interaction.options.get("number", true).value);
    const title = String(interaction.options.get("title", true).value);
    const description = String(
      interaction.options.get("description", true).value
    );
    const month = Number(interaction.options.get("month", true).value);
    const day = Number(interaction.options.get("day", true).value);
    const year = getNumberOrNull(interaction.options.get("year"));
    const monthEnd = getNumberOrNull(interaction.options.get("month-end"));
    const dayEnd = getNumberOrNull(interaction.options.get("day-end"));
    const yearEnd = getNumberOrNull(interaction.options.get("year-end"));
    const author = getMemberName(interaction);
    const gameDate = calendar.createDate(month, day, year);
    const sessionDate = new Date().toISOString().split("T")[0];

    const gameDateEnd = calendar.createDate(
      monthEnd ? monthEnd : month,
      dayEnd ? dayEnd : day,
      yearEnd ? yearEnd : year
    );
    const compareDate =
      gameDate && gameDateEnd
        ? calendar.compareDates(gameDate, gameDateEnd)
        : 0;

    let followUp: FollowUp = "";

    if (number < 0) {
      followUp = "Session number cannot be negative.";
    } else if (!gameDate || !gameDateEnd) {
      followUp = "Invalid Date";
    } else if (compareDate < 0) {
      followUp = "End date cannot be before start date";
    } else {
      try {
        const gameDateStr = calendar.formatDateRange(gameDate, gameDateEnd);
        const moon = calendar.getMoonPhase(gameDate);
        const moonEnd = calendar.getMoonPhase(gameDateEnd);

        const session: Session = {
          number,
          title,
          description,
          gameDate,
          gameDateEnd: compareDate > 0 ? gameDateEnd : undefined,
          gameDateStr,
          author,
          moon: moon === moonEnd ? moon : `${moon} - ${moonEnd}`,
          sessionDate
        };

        const url = await notion.logSession(session);

        if (url) {
          followUp = getFollowUp([{ session, url }]);
        }
      } catch (e) {
        followUp = "There was an internal error.";
      }
    }

    await interaction.followUp(followUp);
  }
};
