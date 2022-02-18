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
  endDateArgs,
  getNumberOrUndefined
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
    ...endDateArgs,
    {
      type: "NUMBER",
      name: "number",
      description: "Session number",
      required: false
    }
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    let followUp: FollowUp = "";
    let number = getNumberOrUndefined(interaction.options.get("number"));

    const query = await notion.querySessions({ number: number ? number : -1 });
    if (query.length !== 0) {
      if (number) {
        followUp =
          "Duplicate log number, your session was not logged. " +
          "Consider using `/updatelog`.";
      } else if (query[0].session.number) {
        number = query[0].session.number + 1;
      } else {
        followUp =
          "Your most recent session is not numbered. " +
          "Fix that and try again, or specify a session number.";
      }
    }

    if (!number) {
      number = 1;
    }

    if (followUp === "") {
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
    }

    await interaction.followUp(followUp);
  }
};
