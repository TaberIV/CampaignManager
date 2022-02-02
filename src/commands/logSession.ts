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
import { getNumber } from "./utility";
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
    required: false
  },
  {
    type: "NUMBER",
    name: "day",
    description: "In-game day of month",
    required: false
  },
  { type: "NUMBER", name: "year", description: "In game year", required: false }
];

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
    {
      type: "NUMBER",
      name: "number",
      description: "Session number",
      required: false
    },
    ...dateArgs
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const title = String(interaction.options.get("title", true).value);
    const number = getNumber(interaction.options.get("number"));
    const month = getNumber(interaction.options.get("month"));
    const day = getNumber(interaction.options.get("day"));
    const year = getNumber(interaction.options.get("year"));
    const author = interaction.user.username;

    const gameDate =
      month && day ? calendar.createDate(month, day, year) : undefined;
    const gameDateFmt = gameDate ? calendar.formatDate(gameDate) : null;
    const gameDateStr = gameDate ? calendar.dateToString(gameDate) : null;
    const moon = gameDate ? calendar.getMoonPhase(gameDate) : null;

    const description = String(
      interaction.options.get("description", true).value
    );
    console.log(description);

    const response = await notion.logSession(
      title,
      description,
      number,
      gameDateFmt,
      gameDateStr,
      moon,
      author
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
  }
};
