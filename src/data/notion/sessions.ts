import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  CreatePageResponse,
  QueryDatabaseResponse
} from "@notionhq/client/build/src/api-endpoints";
import { InteractionReplyOptions, MessageEmbed } from "discord.js";
import {
  getFollowUp as createFollowUp,
  getFollowUp
} from "../../commands/utility";
import { Session, SessionQuery } from "src/utils/session";
import calendar from "../../utils/calendar";
// import config from "../config/default";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const database_id = String(process.env.NOTION_DATABASE_ID);

function plainText(content: string) {
  return [{ text: { content } }];
}

async function logSession(session: Session): Promise<string | null> {
  const params: CreatePageParameters = {
    parent: { database_id },
    properties: {
      number: { type: "number", number: session.number },
      title: {
        title: plainText(session.title)
      },
      description: {
        type: "rich_text",
        rich_text: plainText(session.description)
      },
      day: {
        type: "number",
        number: session.number
      },
      month: {
        type: "number",
        number: session.number
      },
      year: {
        type: "number",
        number: session.number
      },
      gameDate: {
        type: "rich_text",
        rich_text: plainText(session.gameDate)
      },
      sessionDate: {
        type: "date",
        date: { start: session.sessionDate }
      },
      author: {
        type: "rich_text",
        rich_text: plainText(session.author)
      }
    }
  };

  if (session.moon) {
    params.properties.moon = {
      type: "rich_text",
      rich_text: plainText(session.moon)
    };
  }

  const response = await notion.pages.create(params);

  if ("url" in response) {
    return response.url;
  }

  return null;
}

async function updateLog(session?: SessionQuery) {
  let filter = session?.number
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
  const sessions: { session: SessionQuery; url: string }[] =
    parseSessions(response);

  if (session?.number && response.results.length !== 1) {
    return createFollowUp(
      sessions,
      "The following logs have duplicate sessions numbers, this is invalid. No changes were made."
    );
  } else if (response.results.length === 0) {
    if (session?.number) {
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
        const updatedSession: SessionQuery = session
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

          if (session.day) {
            properties.day = {
              type: "number",
              number: updatedSession.day,
              id: page.properties.day.id
            };
          } else if (res.day) {
            updatedSession.day = res.day;
          }

          if (session.month) {
            properties.month = {
              type: "number",
              number: updatedSession.month,
              id: page.properties.month.id
            };
          } else if (res.month) {
            updatedSession.month = res.month;
          }

          if (session.year) {
            properties.year = {
              type: "number",
              number: updatedSession.year,
              id: page.properties.year.id
            };
          } else if (res.year) {
            updatedSession.year = res.year;
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
        if (updatedSession.year && updatedSession.month && updatedSession.day) {
          const updatedDate = calendar.createDate(
            updatedSession.month,
            updatedSession.day,
            updatedSession.year
          );

          if (updatedDate) {
            updatedSession.gameDate = calendar.formatDate(updatedDate);
            properties.gameDate = {
              type: "rich_text",
              rich_text: plainText(updatedSession.gameDate),
              id: page.properties.gameDate.id
            };
          }

          updatedSession.moon = updatedDate
            ? calendar.getMoonPhase(updatedDate)
            : session?.moon;
        }

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
      }
      return { session: { title: "Error retrieving session" }, url };
    })
  );

  const content =
    entries.length == 1 && entries[0]
      ? `Session ${entries[0].session.number}: **${entries[0].session.title}** was updated successfully.`
      : "All logs updated successfully.";
  return getFollowUp(entries, content);
}

async function querySessions(
  sessionQuery?: SessionQuery,
  direction: "ascending" | "descending" = "ascending"
) {
  let filter: any = { and: [], or: [] };

  if (sessionQuery) {
    Object.keys(sessionQuery).forEach((key) => {
      if (key === "number" && sessionQuery.number) {
        if (sessionQuery.number >= 0) {
          filter.and.push({
            property: "number",
            number: {
              equals: sessionQuery.number
            }
          });
        }
      } else if (key === "title" && sessionQuery.title) {
        filter.or.push({
          property: "title",
          text: {
            contains: sessionQuery.title
          }
        });
      } else if (key === "description" && sessionQuery.description) {
        filter.or.push({
          property: "description",
          text: {
            contains: sessionQuery.description
          }
        });
      }
    });
  }

  const sorts = [{ property: "number", direction }];

  const response = await notion.databases.query({
    database_id,
    filter,
    sorts
  });

  const sessions: { session: SessionQuery; url: string }[] =
    parseSessions(response);

  if (sessions.length > 0) {
    if (sessionQuery?.number && sessionQuery.number < 0) {
      return sessionQuery.number + sessions.length >= 0
        ? createFollowUp([sessions[sessions.length + sessionQuery.number]])
        : "Invalid session number.";
    } else {
      return createFollowUp(sessions);
    }
  } else {
    return "No sessions found.";
  }
}

export default { logSession, querySessions, updateSession: updateLog };

function parseSessions(response: QueryDatabaseResponse) {
  const sessions: { session: SessionQuery; url: string }[] = [];
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

      let gameDate: string | undefined;
      if (props.gameDate && props.gameDate.type === "rich_text") {
        gameDate = "";
        props.gameDate.rich_text.forEach(
          (rich_text) => (gameDate += rich_text.plain_text)
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

      const session: SessionQuery = {
        number,
        title,
        description,
        day,
        month,
        year,
        gameDate,
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
