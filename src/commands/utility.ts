import {
  BaseCommandInteraction,
  CacheType,
  CommandInteractionOption,
  CommandInteractionOptionResolver
} from "discord.js";

export function getNumberOrNull(option: CommandInteractionOption | null) {
  return option && option.value ? Number(option.value) : null;
}
