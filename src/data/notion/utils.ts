import { Session, SessionInfo } from "src/utils/session";

export type PlainRichText = [
  {
    text: {
      content: string;
    };
  }
];

export type SessionProperties = {
  number: number;
  title: PlainRichText;
  description: PlainRichText;
  day: number;
  month: number;
  year: number;
  dayEnd?: number;
  monthEnd?: number;
  yearEnd?: number;
  gameDate: PlainRichText;
  sessionDate: {
    start: string;
  };
  author: PlainRichText;
  moon?: PlainRichText;
};

export function plainText(content: string): PlainRichText {
  return [{ text: { content } }];
}

export function sessionToProperties(session: Session) {
  const properties: SessionProperties = {
    number: session.number,
    title: plainText(session.title),
    description: plainText(session.description),
    day: session.gameDate.day,
    month: session.gameDate.month,
    year: session.gameDate.year,
    gameDate: plainText(session.gameDateStr),
    sessionDate: { start: session.sessionDate },
    author: plainText(session.author),
    moon: session.moon ? plainText(session.moon) : undefined
  };

  if (session.gameDateEnd) {
    properties.dayEnd = session.gameDateEnd.day;
    properties.monthEnd = session.gameDateEnd.month;
    properties.yearEnd = session.gameDateEnd.year;
  }

  return properties;
}
