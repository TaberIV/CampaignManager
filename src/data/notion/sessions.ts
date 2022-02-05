import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  CreatePageResponse,
  QueryDatabaseResponse
} from "@notionhq/client/build/src/api-endpoints";
import { InteractionReplyOptions, MessageEmbed } from "discord.js";
import {
  createSessionMessage,
  getFollowUp as createFollowUp
} from "../../commands/utility";
import { Session, SessionQuery } from "src/utils/session";
// import config from "../config/default";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const database_id = String(process.env.NOTION_DATABASE_ID);

function plainText(content: string) {
  return [{ text: { content } }];
}

// function buildLogPage(
//   title: string,
//   description: string,
//   number: number | null,
//   gameDate: string | null,
//   gameDateRaw: string | null,
//   moon: string | null,
//   author: string
// ): BlockObjectRequest> | nul[] {
//   return null;
// }

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
      gameDate: {
        type: "rich_text",
        rich_text: plainText(session.gameDate)
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
      gameDateFmt: {
        type: "rich_text",
        rich_text: plainText(session.gameDateFmt)
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

  try {
    const response = await notion.pages.create(params);

    if ("url" in response) {
      return response.url;
    }
  } catch (e: unknown) {
    if (typeof e === "string") {
      console.log(e.toUpperCase());
    } else if (e instanceof Error) {
      console.log(e.message);
    }
  }

  return null;
}

async function updateSession(session: SessionQuery) {
  if (session.number) {
    const response = await notion.databases.query({
      database_id,
      filter: {
        property: "number",
        number: {
          equals: session.number
        }
      }
    });

    const sessions: { session: SessionQuery; url: string }[] =
      parseSessions(response);

    if (response.results.length === 1) {
      const [page] = response.results;
      const [res] = sessions;

      if ("properties" in page) {
        const properties: any = {
          number: { type: "number", number: session.number }
        };

        if (session.title) {
          properties.title = {
            title: plainText(session.title)
          };
        }
        if (session.description) {
          properties.description = {
            description: plainText(session.description)
          };
        }
        if (session.gameDate) {
          properties.gameDate = {
            gameDate: plainText(session.gameDate)
          };
        }
        if (session.day) {
          properties.day = {
            day: session.day
          };
        }
        if (session.month) {
          properties.month = {
            month: session.month
          };
        }
        if (session.year) {
          properties.year = {
            year: session.year
          };
        }
        if (session.gameDateFmt) {
          properties.gameDateFmt = {
            gameDateFmt: plainText(session.gameDateFmt)
          };
        }
        if (session.sessionDate) {
          properties.sessionDate = {
            sessionDate: plainText(session.sessionDate)
          };
        }

        if (session.author) {
          if (
            "author" in page.properties &&
            "rich_text" in page.properties.author
          ) {
            let existingAuthor = "";
            page.properties.author.rich_text.forEach((rich_text) => {
              existingAuthor += rich_text.plain_text;
            });

            const author = existingAuthor.includes(session.author)
              ? existingAuthor
              : existingAuthor + session.author;
            properties.author = {
              author
            };
          } else {
            properties.author = {
              author: plainText(session.author)
            };
          }
        }

        const updateRes = await notion.pages.update({
          page_id: page.id,
          properties
        });
      }
    } else {
      return createFollowUp(
        sessions,
        "The following logs have duplicate sessions numbers, this is invalid. No changes were made."
      );
    }
  }

  return "Must specify a session number";
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

  if (sessionQuery?.number && sessionQuery.number < 0) {
    return createFollowUp([sessions[sessions.length + sessionQuery.number]]);
  } else {
    return createFollowUp(sessions);
  }
}

export default { logSession, querySessions, updateSession };

function parseSessions(response: QueryDatabaseResponse) {
  const sessions: { session: SessionQuery; url: string }[] = [];
  response.results.forEach((page) => {
    if ("properties" in page) {
      const props = page.properties;

      let number: number | undefined;
      if (
        props["number"] &&
        props["number"].type === "number" &&
        props["number"].number !== null
      ) {
        number = props["number"].number;
      }

      let title: string | undefined;
      if (props["title"] && props["title"].type === "title") {
        title = "";
        props["title"].title.forEach(
          (rich_text) => (title += rich_text.plain_text)
        );
      }

      let description: string | undefined;
      if (props["description"] && props["description"].type === "rich_text") {
        description = "";
        props["description"].rich_text.forEach(
          (rich_text) => (description += rich_text.plain_text)
        );
      }

      let gameDate: string | undefined;
      if (props["gameDate"] && props["gameDate"].type === "rich_text") {
        gameDate = "";
        props["gameDate"].rich_text.forEach(
          (rich_text) => (gameDate += rich_text.plain_text)
        );
      }

      let gameDateFmt: string | undefined;
      if (props["gameDateFmt"] && props["gameDateFmt"].type === "rich_text") {
        gameDateFmt = "";
        props["gameDateFmt"].rich_text.forEach(
          (rich_text) => (gameDateFmt += rich_text.plain_text)
        );
      }

      let author: string | undefined;
      if (props["author"] && props["author"].type === "rich_text") {
        author = "";
        props["author"].rich_text.forEach(
          (rich_text) => (author += rich_text.plain_text)
        );
      }

      let moon: string | null = null;
      if (props["moon"] && props["moon"].type === "rich_text") {
        moon = props["moon"].rich_text[0]?.plain_text;
      }

      let sessionDate: string | undefined;
      if (props["sessionDate"] && props["sessionDate"].type === "date") {
        sessionDate = props["sessionDate"].date?.start;
      }

      const session: SessionQuery = {
        number,
        title,
        description,
        gameDate,
        gameDateFmt,
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
