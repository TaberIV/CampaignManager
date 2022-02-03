import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  CreatePageResponse
} from "@notionhq/client/build/src/api-endpoints";
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

async function logSession(
  number: number,
  title: string,
  description: string,
  gameDate: string,
  gameDateFmt: string,
  author: string,
  moon: string | null
): Promise<CreatePageResponse | null> {
  const params: CreatePageParameters = {
    parent: { database_id },
    properties: {
      number: { type: "number", number: number },
      title: {
        title: plainText(title)
      },
      description: {
        type: "rich_text",
        rich_text: plainText(description)
      },
      gameDate: {
        type: "rich_text",
        rich_text: plainText(gameDate)
      },
      gameDateFmt: {
        type: "rich_text",
        rich_text: plainText(gameDateFmt)
      },
      sessionDate: {
        type: "date",
        date: { start: new Date().toISOString().split("T")[0] }
      },
      author: {
        type: "rich_text",
        rich_text: plainText(author)
      }
    }
  };

  if (moon) {
    params.properties.moon = {
      type: "rich_text",
      rich_text: plainText(moon)
    };
  }

  try {
    const response = await notion.pages.create(params);
    return response;
  } catch (e: unknown) {
    if (typeof e === "string") {
      console.log(e.toUpperCase());
    } else if (e instanceof Error) {
      console.log(e.message);
    }
  }

  return null;
}

export default { logSession };
