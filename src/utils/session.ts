export type Session = {
  number: number;
  title: string;
  description: string;
  day: number;
  month: number;
  year: number;
  gameDate: string;
  author: string;
  moon: string | null;
  sessionDate: string;
};

export type SessionInfo = {
  number?: number;
  title?: string;
  description?: string;
  day?: number;
  month?: number;
  year?: number;
  gameDate?: string;
  author?: string;
  moon?: string | null;
  sessionDate?: string;
};
