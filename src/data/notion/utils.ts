import { SessionInfo } from "src/utils/session";

export type PlainRichText = [
  {
    text: {
      content: string;
    };
  }
];

export type SessionProperties = {
  number?: number;
  title?: PlainRichText;
  description?: PlainRichText;
  day?: number;
  month?: number;
  year?: number;
  gameDate?: PlainRichText;
  sessionDate?: {
    start: string;
  };
  author?: PlainRichText;
  moon?: PlainRichText;
};

export function plainText(content: string): PlainRichText {
  return [{ text: { content } }];
}

export function sessionToProperties(session: SessionInfo) {
  const properties: SessionProperties = {};
  properties.number = session.number !== undefined ? session.number : undefined;
  properties.title = session.title ? plainText(session.title) : undefined;
  properties.description = session.description
    ? plainText(session.description)
    : undefined;
  properties.day = session.gameDate?.day ? session.gameDate?.day : undefined;
  properties.month = session.gameDate?.month
    ? session.gameDate?.month
    : undefined;
  properties.year = session.gameDate?.year ? session.gameDate?.year : undefined;
  properties.gameDate = session.gameDateStr
    ? plainText(session.gameDateStr)
    : undefined;
  properties.sessionDate = session.sessionDate
    ? { start: session.sessionDate }
    : undefined;
  properties.author = session.author ? plainText(session.author) : undefined;
  properties.moon = session.moon ? plainText(session.moon) : undefined;

  return properties;
}
