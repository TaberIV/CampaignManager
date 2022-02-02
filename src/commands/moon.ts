import {
  BaseCommandInteraction,
  Client,
  ApplicationCommandOption
} from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import calendar from "../actions/calendar";
import { Command } from "./command";
import { getNumber } from "./utility";

const dateArgs: [
  ApplicationCommandOption,
  ApplicationCommandOption,
  ApplicationCommandOption
] = [
  {
    type: "NUMBER",
    name: "month",
    description: "Month (number)",
    required: true
  },
  {
    type: "NUMBER",
    name: "day",
    description: "Day of the month",
    required: true
  },
  { type: "NUMBER", name: "year", description: "Year", required: false }
];

export const moon: Command = {
  name: "moon",
  description: "Get the phase of the moon for a date in your campaign.",
  type: ApplicationCommandTypes.CHAT_INPUT,
  options: [...dateArgs],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const month = Number(interaction.options.get("month", true).value);
    const day = Number(interaction.options.get("day", true).value);
    const year = getNumber(interaction.options.get("year"));
    const content = calendar.getMoonPhase(
      calendar.createDate(month, day, year)
    );

    await interaction.followUp({
      ephemeral: true,
      content
    });
  }
};
