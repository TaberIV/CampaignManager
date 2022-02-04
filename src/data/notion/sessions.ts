import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  CreatePageResponse,
  QueryDatabaseResponse
} from "@notionhq/client/build/src/api-endpoints";
import { MessageEmbed } from "discord.js";
import { createSessionMessage, getFollowUp } from "../../commands/utility";
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
// ): Array<BlockObjectRequest> | null {
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

async function querySessions(sessionQuery?: SessionQuery) {
  let filter: any = { and: [] };

  if (sessionQuery)
    Object.keys(sessionQuery).forEach((key) => {
      if (key === "number") {
        filter.and.push({
          property: "number",
          number: {
            equals: sessionQuery.number
          }
        });
      } else if (key === "title") {
        filter.and.push({
          property: "title",
          text: {
            contains: sessionQuery.title
          }
        });
      }
    });

  const direction: "ascending" | "descending" = "ascending";
  const sorts = [{ property: "number", direction }];

  const params = {
    database_id,
    filter,
    sorts
  };

  const response = await notion.databases.query(params);
  const sessions: Array<{ session: SessionQuery; url: string }> = [];

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

  return getFollowUp(sessions);
}

export default { logSession, querySessions };
