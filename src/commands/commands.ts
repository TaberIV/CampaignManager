import {
  BaseCommandInteraction,
  ChatInputApplicationCommandData,
  Client
} from "discord.js";
import { moon } from "./moon";
import { logSession } from "./logSession";
import { getSession, getAllSessions } from "./getlog";
import { updateLog } from "./updatelog";

export interface Command extends ChatInputApplicationCommandData {
  run: (Client: Client, interaction: BaseCommandInteraction) => void;
}

export const commands: Command[] = [
  moon,
  logSession,
  getSession,
  getAllSessions,
  updateLog
];
