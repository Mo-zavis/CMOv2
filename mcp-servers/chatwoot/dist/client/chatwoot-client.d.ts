export declare class ChatwootApiError extends Error {
    status: number;
    statusText: string;
    body: unknown;
    constructor(status: number, statusText: string, body: unknown);
}
interface ApiMethods {
    get(path: string, params?: Record<string, string>): Promise<unknown>;
    post(path: string, body?: unknown): Promise<unknown>;
    patch(path: string, body?: unknown): Promise<unknown>;
    put(path: string, body?: unknown): Promise<unknown>;
    delete(path: string, body?: unknown): Promise<unknown>;
}
export interface ChatwootClientConfig {
    baseUrl: string;
    apiAccessToken: string;
    accountId: number;
    platformToken?: string;
}
export declare class ChatwootClient {
    private baseUrl;
    private apiAccessToken;
    private platformToken?;
    /** Application API — /api/v1/accounts/{id}/... */
    app: ApiMethods;
    /** Platform API — /platform/api/v1/... */
    platform: ApiMethods;
    /** Public API — /public/api/v1/... (no auth) */
    pub: ApiMethods;
    /** Reports v2 API — /api/v2/accounts/{id}/... */
    reports: ApiMethods;
    constructor(config: ChatwootClientConfig);
    request(method: string, path: string, body?: unknown, params?: Record<string, string>, useAuth?: boolean): Promise<unknown>;
}
export {};
