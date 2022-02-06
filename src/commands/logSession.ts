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
  FollowUp,
  getFollowUp,
  getMemberName
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
    ...optionalDateArgs
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
    const author = getMemberName(interaction);
    const date = calendar.createDate(month, day, year);
    const sessionDate = new Date().toISOString().split("T")[0];

    let followUp: FollowUp = "";

    if (number < 0) {
      followUp = "Session number cannot be negative.";
    } else if (date == null) {
      followUp = "Invalid Date";
    } else {
      try {
        const gameDate = calendar.formatDate(date);
        const moon = calendar.getMoonPhase(date);

        const session: Session = {
          number,
          title,
          description,
          ...date,
          gameDate,
          author,
          moon,
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
