import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TwentyClient } from '../client/twenty-client.js';
import type { TwentyObject } from './registry.js';
export declare function registerObjectTools(server: McpServer, client: TwentyClient, obj: TwentyObject): void;
