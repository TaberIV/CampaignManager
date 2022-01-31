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

const dateArgs: [ApplicationCommandOption, ApplicationCommandOption, ApplicationCommandOption] = [
  { type: "NUMBER", name: "month", description: "In-game month (number)", required: false },
  { type: "NUMBER", name: "day", description: "In-game day of month", required: false },
  { type: "NUMBER", name: "year", description: "In game year", required: false }
];

export const logSession: Command = {
  name: "logsession",
  description: "Create a session log.",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [
    { type: "STRING", name: "title", description: "Session title", required: true },
    { type: "STRING", name: "description", description: "Session description", required: true },
    { type: "NUMBER", name: "number", description: "Session number", required: false },
    ...dateArgs
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const title = interaction.options.get("title", true).value;
    const number = interaction.options.get("number")?.value
      ? Number(interaction.options.get("number")?.value)
      : undefined;

    const month = interaction.options.get("month")?.value;
    const day = interaction.options.get("day")?.value;
    const year = interaction.options.get("year")?.value
      ? Number(interaction.options.get("year")?.value)
      : undefined;

    const date =
      month && day ? calendar.createDate(Number(month), Number(day), year ? Number(year) : undefined) : undefined;
    const dateStr = date ? calendar.dateString(date) : undefined;
    const moon = date ? calendar.getMoonPhase(date) : undefined;

    const description =
      (moon ? `${moon} ` : "") +
      (number ? `**Session ${number}**\n` : "") +
      `${interaction.options.get("description", true).value}`;

    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(`${title}`)
      .setDescription(`${description}`)
      .setFooter(dateStr ? { text: dateStr } : null);

    const content = embed;

    await interaction.followUp({
      ephemeral: true,
      embeds: [embed]
    });
  }
};
