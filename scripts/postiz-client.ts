/**
 * postiz-client.ts — CLI utility for the CMO agent (runtime) to interact with Postiz.
 *
 * Usage:
 *   npx tsx scripts/postiz-client.ts check-connection
 *   npx tsx scripts/postiz-client.ts list-integrations
 *   npx tsx scripts/postiz-client.ts schedule-post --integrationId <id> --content <text> --date <iso>
 */

import path from "path";
import fs from "fs";

// Read Postiz config from dashboard .env
const envPath = path.resolve(__dirname, "../dashboard/.env");
const envContent = fs.readFileSync(envPath, "utf-8");

function envVar(name: string): string {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]*)"?`, "m"));
  return match?.[1] ?? "";
}

const POSTIZ_API_URL = envVar("POSTIZ_API_URL");
const POSTIZ_API_KEY = envVar("POSTIZ_API_KEY");

if (!POSTIZ_API_URL) {
  console.error("POSTIZ_API_URL not found in dashboard/.env");
  process.exit(1);
}

async function postizFetch(endpoint: string, options?: RequestInit) {
  const url = `${POSTIZ_API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: POSTIZ_API_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Postiz API ${res.status}: ${text}`);
  }

  return res.json();
}

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

async function main() {
  switch (command) {
    case "check-connection": {
      try {
        const res = await fetch(`${POSTIZ_API_URL}/is-connected`, {
          headers: { Authorization: POSTIZ_API_KEY },
        });
        console.log(
          JSON.stringify({ connected: res.ok, status: res.status })
        );
      } catch (err) {
        console.log(
          JSON.stringify({
            connected: false,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      }
      break;
    }

    case "list-integrations": {
      const integrations = await postizFetch("/integrations");
      console.log(JSON.stringify(integrations, null, 2));
      break;
    }

    case "schedule-post": {
      const integrationId = getFlag("integrationId");
      const content = getFlag("content");
      const date = getFlag("date");

      if (!integrationId || !content || !date) {
        console.error("Required: --integrationId, --content, --date");
        process.exit(1);
      }

      const result = await postizFetch("/posts", {
        method: "POST",
        body: JSON.stringify({
          integrationId,
          content,
          date,
          type: "post",
        }),
      });
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    default:
      console.error(
        "Usage: npx tsx scripts/postiz-client.ts <command>\n\n" +
          "Commands:\n" +
          "  check-connection         Check if Postiz is running\n" +
          "  list-integrations        List all connected social accounts\n" +
          "  schedule-post            Schedule a post (--integrationId, --content, --date)\n"
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
