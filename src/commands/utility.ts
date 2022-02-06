import {
  ApplicationCommandOption,
  CommandInteractionOption,
  Interaction,
  InteractionReplyOptions,
  MessageEmbed
} from "discord.js";
import { SessionQuery } from "src/utils/session";

export function getNumberOrNull(option: CommandInteractionOption | null) {
  return option && option.value ? Number(option.value) : null;
}

export function getStringOrNull(option: CommandInteractionOption | null) {
  return option && option.value ? String(option.value) : null;
}

export function getNumberOrUndefined(option: CommandInteractionOption | null) {
  return option && option.value ? Number(option.value) : undefined;
}

export function getStringOrUndefined(option: CommandInteractionOption | null) {
  return option && option.value ? String(option.value) : undefined;
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

function createSessionMessage(session: SessionQuery, url: string) {
  const body =
    (session.number ? `**Session ${session.number}**\n` : "") +
    (session.gameDate
      ? `**${session.gameDate}**` +
        (session.moon ? ` ${session.moon}` : "") +
        "\n"
      : "") +
    `${session.description}`;

  let footer = "";
  const authors = session.author ? session.author.split("\n") : [];
  if (authors.length > 0) {
    if (authors.length === 1) {
      footer = authors[0];
    } else {
      const [last] = authors.splice(authors.length - 1, 1, "and");
      footer = authors.join(", ") + " " + last;
    }
  }
  if (session.sessionDate) {
    const dateStr = session.sessionDate
      ? new Date(session.sessionDate).toDateString()
      : "";
    footer += footer ? ` (${dateStr})` : ` ${dateStr}`;
  }

  const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setTitle(`${session.title}`)
    .setDescription(`${body}\n[View on Notion](${url})`)
    .setFooter(
      footer
        ? {
            text: footer
          }
        : null
    );

  return embed;
}

export type FollowUp = InteractionReplyOptions | string;

export function getFollowUp(
  response: {
    session: SessionQuery;
    url: string;
  }[],
  content?: string
): FollowUp {
  const embeds = response.map((res) => {
    return createSessionMessage(res.session, res.url);
  });
  return {
    ephemeral: true,
    embeds,
    content
  };
}

export function getMemberName(interaction: Interaction) {
  return interaction.member &&
    "nickname" in interaction.member &&
    interaction.member.nickname
    ? interaction.member.nickname
    : interaction.user.username;
}
