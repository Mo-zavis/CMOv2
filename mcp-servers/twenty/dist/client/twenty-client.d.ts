export interface TwentyClientConfig {
    baseUrl: string;
    apiKey: string;
}
export declare class TwentyApiError extends Error {
    statusCode: number;
    responseBody: unknown;
    constructor(message: string, statusCode: number, responseBody: unknown);
}
export declare class TwentyClient {
    private baseUrl;
    private apiKey;
    private callTimestamps;
    private readonly MAX_CALLS_PER_MINUTE;
    constructor(config: TwentyClientConfig);
    private enforceRateLimit;
    private request;
    get(path: string, params?: Record<string, string>): Promise<unknown>;
    post(path: string, body?: unknown, params?: Record<string, string>): Promise<unknown>;
    patch(path: string, body?: unknown, params?: Record<string, string>): Promise<unknown>;
    delete(path: string, params?: Record<string, string>): Promise<unknown>;
}
