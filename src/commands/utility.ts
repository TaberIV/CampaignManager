import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  ApplicationCommandOption,
  BaseCommandInteraction,
  CacheType,
  CommandInteractionOption,
  CommandInteractionOptionResolver,
  MessageEmbed
} from "discord.js";
import { Session } from "src/utils/session";

export function getNumberOrNull(option: CommandInteractionOption | null) {
  return option && option.value ? Number(option.value) : null;
}

export const requiredDateArgs: [
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

export function createSessionMessage(session: Session, url: string) {
  const body =
    (session.number ? `**Session ${session.number}**\n` : "") +
    (session.gameDateFmt
      ? `**${session.gameDateFmt}**` +
        (session.moon ? ` ${session.moon}` : "") +
        "\n"
      : "") +
    `${session.description}`;
  const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setTitle(session.title)
    .setDescription(`${body}\n[View on Notion](${url})`)
    .setFooter({
      text: session.author
    });

  return {
    ephemeral: true,
    embeds: [embed]
  };
}
