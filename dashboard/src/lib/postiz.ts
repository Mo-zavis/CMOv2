/**
 * Postiz API client for querying connected social media integrations.
 * Server-side only. API key must never be exposed to the browser.
 */

export interface PostizIntegration {
  id: string;
  name: string;
  identifier: string; // Platform type: "x", "linkedin", "instagram", etc.
  picture: string;
  disabled: boolean;
  profile: string;
  customer: {
    id: string;
    name: string;
  };
}

const POSTIZ_API_URL = process.env.POSTIZ_API_URL;
const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;

async function postizFetch<T>(endpoint: string): Promise<T> {
  if (!POSTIZ_API_URL || !POSTIZ_API_KEY) {
    throw new Error("POSTIZ_API_URL and POSTIZ_API_KEY must be set in .env");
  }

  const url = `${POSTIZ_API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      Authorization: POSTIZ_API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Postiz API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getIntegrations(): Promise<PostizIntegration[]> {
  return postizFetch<PostizIntegration[]>("/integrations");
}

export async function checkConnection(): Promise<boolean> {
  try {
    if (!POSTIZ_API_URL || !POSTIZ_API_KEY) return false;
    const res = await fetch(`${POSTIZ_API_URL}/is-connected`, {
      headers: { Authorization: POSTIZ_API_KEY },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
