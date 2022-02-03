import {
  BaseCommandInteraction,
  Client,
  ApplicationCommandOption,
  MessageEmbed,
  EmbedFooterData
} from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import calendar from "../actions/calendar";
import { Command } from "./command";
import { getNumberOrNull } from "./utility";
import notion from "../data/notion";

const dateArgs: [
  ApplicationCommandOption,
  ApplicationCommandOption,
  ApplicationCommandOption
] = [
  {
    type: "NUMBER",
    name: "month",
    description: "In-game month (number)",
    required: true
  },
  {
    type: "NUMBER",
    name: "day",
    description: "In-game day of month",
    required: true
  },
  { type: "NUMBER", name: "year", description: "In-game year", required: false }
];

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
    ...dateArgs
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const title = String(interaction.options.get("title", true).value);
    const number = Number(interaction.options.get("number", true).value);
    const month = Number(interaction.options.get("month", true).value);
    const day = Number(interaction.options.get("day", true).value);
    const year = getNumberOrNull(interaction.options.get("year"));
    const author = interaction.user.username;

    try {
      const gameDate = calendar.createDate(month, day, year);

      const gameDateFmt = calendar.formatDate(gameDate);
      const gameDateStr = calendar.dateToString(gameDate);
      const moon = calendar.getMoonPhase(gameDate);

      const description = String(
        interaction.options.get("description", true).value
      );

      const response = await notion.logSession(
        number,
        title,
        description,
        gameDateStr,
        gameDateFmt,
        author,
        moon
      );

      const body =
        (number ? `**Session ${number}**\n` : "") +
        (gameDateFmt
          ? `**${gameDateFmt}**` + (moon ? ` ${moon}` : "") + "\n"
          : "") +
        `${description}`;

      if (response && (response as any).url) {
        const url = (response as any).url;
        const embed = new MessageEmbed()
          .setColor("RANDOM")
          .setTitle(title)
          .setDescription(`${body}\n[View on Notion](${url})`)
          .setFooter({
            text: author
          });

        const content = embed;

        await interaction.followUp({
          ephemeral: true,
          embeds: [embed]
        });
      }
    } catch (e) {
      if ((e as Error).message == "InvalidDate") {
        interaction.followUp("Invalid Date");
      } else {
        interaction.followUp("There was an internal error.");
      }
    }
  }
};
