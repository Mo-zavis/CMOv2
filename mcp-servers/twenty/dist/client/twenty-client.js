export class TwentyApiError extends Error {
    statusCode;
    responseBody;
    constructor(message, statusCode, responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.name = 'TwentyApiError';
    }
}
export class TwentyClient {
    baseUrl;
    apiKey;
    callTimestamps = [];
    MAX_CALLS_PER_MINUTE = 100;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.apiKey = config.apiKey;
    }
    async enforceRateLimit() {
        const now = Date.now();
        // Remove timestamps older than 60 seconds
        this.callTimestamps = this.callTimestamps.filter(t => now - t < 60000);
        if (this.callTimestamps.length >= this.MAX_CALLS_PER_MINUTE) {
            const oldestInWindow = this.callTimestamps[0];
            const waitMs = 60000 - (now - oldestInWindow) + 100; // +100ms buffer
            if (waitMs > 0) {
                await new Promise(resolve => setTimeout(resolve, waitMs));
            }
        }
        this.callTimestamps.push(Date.now());
    }
    async request(method, path, options) {
        await this.enforceRateLimit();
        const url = new URL(path, this.baseUrl);
        if (options?.params) {
            for (const [key, value] of Object.entries(options.params)) {
                if (value !== undefined && value !== '') {
                    url.searchParams.set(key, value);
                }
            }
        }
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
        const response = await fetch(url.toString(), {
            method,
            headers,
            body: options?.body ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            }
            catch {
                errorBody = await response.text();
            }
            throw new TwentyApiError(`Twenty API ${response.status} ${response.statusText} on ${method} ${path}`, response.status, errorBody);
        }
        if (response.status === 204)
            return undefined;
        return response.json();
    }
    async get(path, params) {
        return this.request('GET', path, { params });
    }
    async post(path, body, params) {
        return this.request('POST', path, { body, params });
    }
    async patch(path, body, params) {
        return this.request('PATCH', path, { body, params });
    }
    async delete(path, params) {
        return this.request('DELETE', path, { params });
    }
}
//# sourceMappingURL=twenty-client.js.map