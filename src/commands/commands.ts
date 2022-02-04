import {
  BaseCommandInteraction,
  ChatInputApplicationCommandData,
  Client
} from "discord.js";
import { moon } from "./moon";
import { logSession } from "./logSession";
import { getSession } from "./getSession";
import { getAllSessions } from "./getAllSessions";

export interface Command extends ChatInputApplicationCommandData {
  run: (Client: Client, interaction: BaseCommandInteraction) => void;
}

export const commands: Command[] = [
  moon,
  logSession,
  getSession,
  getAllSessions
];
