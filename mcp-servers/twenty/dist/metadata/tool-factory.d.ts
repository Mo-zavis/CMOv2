import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TwentyClient } from '../client/twenty-client.js';
import type { MetadataResource } from './registry.js';
export declare function registerMetadataTools(server: McpServer, client: TwentyClient, resource: MetadataResource): void;
