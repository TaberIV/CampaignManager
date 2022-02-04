import {
  ApplicationCommandOption,
  CommandInteractionOption,
  MessageEmbed
} from "discord.js";
import { SessionQuery } from "src/utils/session";

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

export const optionalDateArgs: [
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
  { type: "NUMBER", name: "year", description: "In-game year", required: false }
];

export function createSessionMessage(session: SessionQuery, url: string) {
  const body =
    (session.number ? `**Session ${session.number}**\n` : "") +
    (session.gameDateFmt
      ? `**${session.gameDateFmt}**` +
        (session.moon ? ` ${session.moon}` : "") +
        "\n"
      : "") +
    `${session.description}`;

  const footer =
    (session.author ? session.author : "") +
    (session.author && session.sessionDate ? ", " : "") +
    (session.sessionDate ? new Date(session.sessionDate).toDateString() : "");

  const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setTitle(`${session.title}`)
    .setDescription(`${body}\n[View on Notion](${url})`)
    .setFooter({
      text: footer
    });

  return embed;
}

export function getFollowUp(
  response: {
    session: SessionQuery;
    url: string;
  }[]
) {
  const embeds: Array<MessageEmbed> = [];
  response.forEach((res) => {
    const { session, url } = res;
    embeds.push(createSessionMessage(session, url));
  });
  return {
    ephemeral: true,
    embeds
  };
}
