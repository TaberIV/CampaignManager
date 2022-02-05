import {
  BaseCommandInteraction,
  Client,
  ApplicationCommandOption,
  InternalDiscordGatewayAdapterCreator,
  InteractionReplyOptions
} from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import calendar from "../utils/calendar";
import { Command } from "./commands";
import { getNumberOrNull } from "./utility";

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
    const year = getNumberOrNull(interaction.options.get("year"));
    const date = calendar.createDate(month, day, year);

    let followUp: string | InteractionReplyOptions = "";

    if (date) {
      const content = calendar.getMoonPhase(date);

      followUp = {
        ephemeral: true,
        content
      };
    } else {
      followUp = "Invalid Date";
    }

    interaction.followUp(followUp);
  }
};
