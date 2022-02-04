import {
  BaseCommandInteraction,
  Client,
  InteractionReplyOptions
} from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import calendar from "../utils/calendar";
import { Command } from "./commands";
import {
  requiredDateArgs,
  getNumberOrNull,
  createSessionMessage
} from "./utility";
import notion from "../data/notion/sessions";
import { Session } from "src/utils/session";

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
    ...requiredDateArgs
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const title = String(interaction.options.get("title", true).value);
    const number = Number(interaction.options.get("number", true).value);
    const month = Number(interaction.options.get("month", true).value);
    const day = Number(interaction.options.get("day", true).value);
    const year = getNumberOrNull(interaction.options.get("year"));
    const author = interaction.user.username;

    let followUp: string | InteractionReplyOptions =
      "There was an internal error.";

    try {
      const gameDate = calendar.createDate(month, day, year);

      const gameDateFmt = calendar.formatDate(gameDate);
      const gameDateStr = calendar.dateToString(gameDate);
      const moon = calendar.getMoonPhase(gameDate);

      const description = String(
        interaction.options.get("description", true).value
      );

      const session: Session = {
        number,
        title,
        description,
        gameDate: gameDateStr,
        gameDateFmt,
        author,
        moon
      };

      const url = await notion.logSession(session);

      if (url) {
        const msg = createSessionMessage(session, url);
        followUp = msg ? msg : followUp;
      }
    } catch (e) {
      if ((e as Error).message == "InvalidDate") {
        followUp = "Invalid Date";
      }
    }

    await interaction.followUp(followUp);
  }
};
