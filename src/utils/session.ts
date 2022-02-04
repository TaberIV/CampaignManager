export type Session = {
  number: number;
  title: string;
  description: string;
  gameDate: string;
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
  gameDateFmt?: string;
  author?: string;
  moon?: string | null;
  sessionDate?: string;
};
