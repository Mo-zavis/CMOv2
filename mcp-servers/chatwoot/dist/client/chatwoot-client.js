export class ChatwootApiError extends Error {
    status;
    statusText;
    body;
    constructor(status, statusText, body) {
        super(`Chatwoot API error ${status}: ${statusText}`);
        this.status = status;
        this.statusText = statusText;
        this.body = body;
        this.name = 'ChatwootApiError';
    }
}
function makeApi(client, prefix, useAuth = true) {
    return {
        get: (path, params) => client.request('GET', `${prefix}${path}`, undefined, params, useAuth),
        post: (path, body) => client.request('POST', `${prefix}${path}`, body, undefined, useAuth),
        patch: (path, body) => client.request('PATCH', `${prefix}${path}`, body, undefined, useAuth),
        put: (path, body) => client.request('PUT', `${prefix}${path}`, body, undefined, useAuth),
        delete: (path, body) => client.request('DELETE', `${prefix}${path}`, body, undefined, useAuth),
    };
}
export class ChatwootClient {
    baseUrl;
    apiAccessToken;
    platformToken;
    /** Application API — /api/v1/accounts/{id}/... */
    app;
    /** Platform API — /platform/api/v1/... */
    platform;
    /** Public API — /public/api/v1/... (no auth) */
    pub;
    /** Reports v2 API — /api/v2/accounts/{id}/... */
    reports;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.apiAccessToken = config.apiAccessToken;
        this.platformToken = config.platformToken;
        this.app = makeApi(this, `/api/v1/accounts/${config.accountId}`);
        this.platform = makeApi(this, '/platform/api/v1');
        this.pub = makeApi(this, '/public/api/v1', false);
        this.reports = makeApi(this, `/api/v2/accounts/${config.accountId}`);
    }
    async request(method, path, body, params, useAuth = true) {
        let url = `${this.baseUrl}${path}`;
        if (params && Object.keys(params).length > 0) {
            url += '?' + new URLSearchParams(params).toString();
        }
        const headers = {
            'Content-Type': 'application/json',
        };
        if (useAuth) {
            if (path.startsWith('/platform/') && this.platformToken) {
                headers['api_access_token'] = this.platformToken;
            }
            else {
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
            let parsed;
            try {
                parsed = JSON.parse(text);
            }
            catch {
                parsed = text;
            }
            throw new ChatwootApiError(res.status, res.statusText, parsed);
        }
        const text = await res.text();
        if (!text)
            return null;
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
}
//# sourceMappingURL=chatwoot-client.js.map