import { GameDate } from "./calendar";

export type Session = {
  number: number;
  title: string;
  description: string;
  gameDate: GameDate;
  gameDateEnd?: GameDate;
  gameDateStr: string;
  author: string;
  moon: string | null;
  sessionDate: string;
};

export type SessionInfo = {
  number?: number;
  title?: string;
  description?: string;
  gameDate?: GameDate;
  gameDateEnd?: GameDate;
  gameDateStr?: string;
  author?: string;
  moon?: string | null;
  sessionDate?: string;
};
