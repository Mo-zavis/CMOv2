/**
 * API helper that works both locally (via API routes + SQLite) and on Vercel (via static JSON).
 * On Vercel, API routes can't access SQLite, so we fall back to pre-generated static data.
 */

const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_DATA === "true";

export async function fetchAPI(path: string): Promise<Response> {
  if (IS_STATIC) {
    // Map API paths to static JSON files
    const staticPath = path
      .replace(/^\/api\//, "/_data/")
      .replace(/\?.*$/, ""); // strip query params

    // Handle calendar events with month query param
    if (path.startsWith("/api/calendar/events")) {
      const url = new URL(path, "http://localhost");
      const month = url.searchParams.get("month") || getCurrentMonth();
      return fetch(`/_data/calendar/events/${month}.json`);
    }

    return fetch(`${staticPath}.json`);
  }

  return fetch(path);
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
