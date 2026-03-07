import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ChatwootClient } from '../client/chatwoot-client.js';
export interface ToolContext {
    server: McpServer;
    client: ChatwootClient;
}
