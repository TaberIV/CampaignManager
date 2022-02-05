export type Session = {
  number: number;
  title: string;
  description: string;
  gameDate: string;
  day: number;
  month: number;
  year: number;
  gameDateFmt: string;
  author: string;
  moon: string | null;
  sessionDate: string;
};

export type SessionQuery = {
  number?: number;
  title?: string;
  description?: string;
  gameDate?: string;
  day?: number;
  month?: number;
  year?: number;
  gameDateFmt?: string;
  author?: string;
  moon?: string | null;
  sessionDate?: string;
};
