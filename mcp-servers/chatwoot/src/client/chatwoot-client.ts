export class ChatwootApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`Chatwoot API error ${status}: ${statusText}`);
    this.name = 'ChatwootApiError';
  }
}

interface ApiMethods {
  get(path: string, params?: Record<string, string>): Promise<unknown>;
  post(path: string, body?: unknown): Promise<unknown>;
  patch(path: string, body?: unknown): Promise<unknown>;
  put(path: string, body?: unknown): Promise<unknown>;
  delete(path: string, body?: unknown): Promise<unknown>;
}

function makeApi(client: ChatwootClient, prefix: string, useAuth = true): ApiMethods {
  return {
    get: (path, params?) => client.request('GET', `${prefix}${path}`, undefined, params, useAuth),
    post: (path, body?) => client.request('POST', `${prefix}${path}`, body, undefined, useAuth),
    patch: (path, body?) => client.request('PATCH', `${prefix}${path}`, body, undefined, useAuth),
    put: (path, body?) => client.request('PUT', `${prefix}${path}`, body, undefined, useAuth),
    delete: (path, body?) => client.request('DELETE', `${prefix}${path}`, body, undefined, useAuth),
  };
}

export interface ChatwootClientConfig {
  baseUrl: string;
  apiAccessToken: string;
  accountId: number;
  platformToken?: string;
}

export class ChatwootClient {
  private baseUrl: string;
  private apiAccessToken: string;
  private platformToken?: string;

  /** Application API — /api/v1/accounts/{id}/... */
  public app: ApiMethods;
  /** Platform API — /platform/api/v1/... */
  public platform: ApiMethods;
  /** Public API — /public/api/v1/... (no auth) */
  public pub: ApiMethods;
  /** Reports v2 API — /api/v2/accounts/{id}/... */
  public reports: ApiMethods;

  constructor(config: ChatwootClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiAccessToken = config.apiAccessToken;
    this.platformToken = config.platformToken;

    this.app = makeApi(this, `/api/v1/accounts/${config.accountId}`);
    this.platform = makeApi(this, '/platform/api/v1');
    this.pub = makeApi(this, '/public/api/v1', false);
    this.reports = makeApi(this, `/api/v2/accounts/${config.accountId}`);
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>,
    useAuth = true,
  ): Promise<unknown> {
    let url = `${this.baseUrl}${path}`;
    if (params && Object.keys(params).length > 0) {
      url += '?' + new URLSearchParams(params).toString();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useAuth) {
      if (path.startsWith('/platform/') && this.platformToken) {
        headers['api_access_token'] = this.platformToken;
      } else {
        headers['api_access_token'] = this.apiAccessToken;
      }
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { parsed = text; }
      throw new ChatwootApiError(res.status, res.statusText, parsed);
    }

    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }
}
