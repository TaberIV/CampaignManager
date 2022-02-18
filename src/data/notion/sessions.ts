import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { InteractionReplyOptions, MessageEmbed } from "discord.js";
import { getFollowUp } from "../../commands/utility";
import { Session, SessionInfo } from "src/utils/session";
import calendar from "../../utils/calendar";
import { plainText, sessionToProperties } from "./utils";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const database_id = String(process.env.NOTION_DATABASE_ID);

async function logSession(session: Session): Promise<string | null> {
  const response = await notion.pages.create({
    parent: { database_id },
    properties: sessionToProperties(session)
  });

  if ("url" in response) {
    return response.url;
  }

  return null;
}

async function updateLog(session?: SessionInfo) {
  let filter =
    session?.number !== undefined
      ? {
          property: "number",
          number: {
            equals: session.number
          }
        }
      : undefined;

  const direction: "ascending" | "descending" = "ascending";
  const sorts = [{ property: "number", direction }];
  const response = await notion.databases.query({
    database_id,
    filter,
    sorts
  });
  const sessions: { session: SessionInfo; url: string }[] =
    parseSessions(response);

  if (session?.number !== undefined && response.results.length > 1) {
    return getFollowUp(
      sessions,
      "The following logs have duplicate sessions numbers, this is invalid. No changes were made."
    );
  } else if (response.results.length === 0) {
    if (session?.number !== undefined) {
      return "No log was found with that number";
    } else {
      return "Logbook empty.";
    }
  }

  const entries = await Promise.all(
    sessions.map(async (entry, index) => {
      const page = response.results[index];
      const { session: res, url } = entry;

      if ("properties" in page) {
        const properties: any = {};
        const updatedSession: SessionInfo = session
          ? { ...session }
          : { ...res };

        if (session) {
          // Inputted values
          if (session.number) {
            properties.number = { type: "number", number: session.number };
          }

          let edited = false;
          if (session.title) {
            properties.title = {
              type: "title",
              title: plainText(session.title),
              id: page.properties.title.id
            };
            edited = true;
          } else if (res.title) {
            updatedSession.title = res.title;
          }

          if (session.description) {
            properties.description = {
              type: "rich_text",
              rich_text: plainText(session.description),
              id: page.properties.description.id
            };
            edited = true;
          } else if (res.description) {
            updatedSession.description = res.description;
          }

          if (session.gameDate) {
            properties.day = {
              type: "number",
              number: session.gameDate.day,
              id: page.properties.day.id
            };
            properties.month = {
              type: "number",
              number: session.gameDate.month,
              id: page.properties.month.id
            };
            properties.year = {
              type: "number",
              number: session.gameDate.year,
              id: page.properties.year.id
            };
          } else if (res.gameDate) {
            updatedSession.gameDate = res.gameDate;
          }

          if (session.gameDateEnd) {
            properties.day = {
              type: "number",
              number: session.gameDateEnd.day,
              id: page.properties.day.id
            };
            properties.month = {
              type: "number",
              number: session.gameDateEnd.month,
              id: page.properties.month.id
            };
            properties.year = {
              type: "number",
              number: session.gameDateEnd.year,
              id: page.properties.year.id
            };
          } else if (res.gameDateEnd) {
            updatedSession.gameDateEnd = res.gameDateEnd;
          }

          if (session.author && edited) {
            if (res.author && !res.author.includes(session.author)) {
              properties.author = {
                type: "rich_text",
                rich_text: plainText(`${res.author}\n${session?.author}`),
                id: page.properties.author.id
              };
            }
          }
        }

        // Derived values
        if (updatedSession.gameDate) {
          updatedSession.gameDateStr = calendar.formatDate(
            updatedSession.gameDate
          );
          properties.gameDate = {
            type: "rich_text",
            rich_text: plainText(updatedSession.gameDateStr),
            id: page.properties.gameDate.id
          };

          updatedSession.moon = calendar.getMoonPhase(updatedSession.gameDate);

          if (updatedSession.moon) {
            properties.moon = {
              type: "rich_text",
              rich_text: plainText(updatedSession.moon),
              id: page.properties.moon.id
            };
          }

          await notion.pages.update({
            page_id: page.id,
            properties
          });

          return {
            session: updatedSession,
            url
          };
        } else {
          return { session: res, url, error: "Invalid Date" };
        }
      }

      return {
        session: {} as SessionInfo,
        url,
        error: "Error Retriving Session"
      };
    })
  );

  let content = "";
  // entries.length == 1 && entries[0].session
  //   ? `Session ${entries[0].session.number}: **${entries[0].session.title}** was updated successfully.`
  //   :

  if (entries.length === 0) {
    content = "No logs found.";
  } else if (entries.length == 1) {
    content = entries[0].error
      ? entries[0].error
      : `Session ${entries[0].session.number}: **${entries[0].session.title}** was updated successfully.`;
  } else {
    const errors = entries
      .map((e) =>
        e.error ? `Error in session ${e.session.number}: ${e.error}` : undefined
      )
      .filter((e) => e !== undefined);

    content =
      errors.length > 0 ? errors.join("\n") : "All logs updated successfully.";
  }

  return getFollowUp(entries, content);
}

async function querySessions(
  query?: { number?: number; search?: string; limit?: number },
  direction: "ascending" | "descending" = "ascending"
) {
  let filter: any = { and: [] };

  if (query) {
    if (query.number !== undefined) {
      if (query.number >= 0) {
        filter.and.push({
          property: "number",
          number: {
            equals: query.number
          }
        });
      }
    }
    if (query.search) {
      filter.and.push({
        or: [
          {
            property: "title",
            text: {
              contains: query.search
            }
          },
          {
            property: "description",
            text: {
              contains: query.search
            }
          }
        ]
      });
    }
  }

  const sorts = [{ property: "number", direction }];

  const response = await notion.databases.query({
    database_id,
    filter,
    sorts
  });

  const sessions = parseSessions(response);

  if (query?.number !== undefined && query.number < 0) {
    return query.number + sessions.length >= 0
      ? [sessions[sessions.length + query.number]]
      : [];
  } else {
    return sessions;
  }
}

export default { logSession, querySessions, updateSession: updateLog };

function parseSessions(response: QueryDatabaseResponse) {
  const sessions: { session: SessionInfo; url: string }[] = [];
  response.results.forEach((page) => {
    if ("properties" in page) {
      const props = page.properties;

      let number: number | undefined;
      if (
        props.number &&
        props.number.type === "number" &&
        props.number.number !== null
      ) {
        number = props.number.number;
      }

      let title: string | undefined;
      if (props.title && props.title.type === "title") {
        title = "";
        props.title.title.forEach(
          (rich_text) => (title += rich_text.plain_text)
        );
      }

      let description: string | undefined;
      if (props.description && props.description.type === "rich_text") {
        description = "";
        props.description.rich_text.forEach(
          (rich_text) => (description += rich_text.plain_text)
        );
      }

      let day: number | undefined;
      if (
        props.day &&
        props.day.type === "number" &&
        props.day.number !== null
      ) {
        day = props.day.number;
      }

      let month: number | undefined;
      if (
        props.month &&
        props.month.type === "number" &&
        props.month.number !== null
      ) {
        month = props.month.number;
      }

      let year: number | undefined;
      if (
        props.year &&
        props.year.type === "number" &&
        props.year.number !== null
      ) {
        year = props.year.number;
      }

      const gameDate = day && month && year ? { day, month, year } : undefined;

      let gameDateStr: string | undefined;
      if (props.gameDate && props.gameDate.type === "rich_text") {
        gameDateStr = "";
        props.gameDate.rich_text.forEach(
          (rich_text) => (gameDateStr += rich_text.plain_text)
        );
      }

      let author: string | undefined;
      if (props.author && props.author.type === "rich_text") {
        author = "";
        props.author.rich_text.forEach(
          (rich_text) => (author += rich_text.plain_text)
        );
      }

      let moon: string | null = null;
      if (props.moon && props.moon.type === "rich_text") {
        moon = props.moon.rich_text[0]?.plain_text;
      }

      let sessionDate: string | undefined;
      if (props.sessionDate && props.sessionDate.type === "date") {
        sessionDate = props.sessionDate.date?.start;
      }

      const session: SessionInfo = {
        number,
        title,
        description,
        gameDate,
        gameDateStr,
        author,
        moon,
        sessionDate
      };
      const url = page.url;
      sessions.push({ session, url });
    }
  });

  return sessions;
}
