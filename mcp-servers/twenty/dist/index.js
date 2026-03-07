#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TwentyClient } from './client/twenty-client.js';
import { TWENTY_OBJECTS } from './objects/registry.js';
import { registerObjectTools } from './objects/tool-factory.js';
import { METADATA_RESOURCES } from './metadata/registry.js';
import { registerMetadataTools } from './metadata/tool-factory.js';
import { registerSpecialTools } from './special/dashboard-tools.js';
async function main() {
    const apiKey = process.env.TWENTY_API_KEY;
    const baseUrl = process.env.TWENTY_BASE_URL || 'https://api.twenty.com';
    if (!apiKey) {
        console.error('TWENTY_API_KEY environment variable is required');
        process.exit(1);
    }
    const client = new TwentyClient({ baseUrl, apiKey });
    const server = new McpServer({
        name: 'twenty-crm',
        version: '1.0.0',
    });
    // Register all core object tools (30 objects × 13 operations = 390 tools)
    for (const obj of TWENTY_OBJECTS) {
        registerObjectTools(server, client, obj);
    }
    // Register all metadata tools (13 resources × 5 operations = 65 tools)
    for (const resource of METADATA_RESOURCES) {
        registerMetadataTools(server, client, resource);
    }
    // Register special one-off tools (3 tools)
    registerSpecialTools(server, client);
    // Connect via stdio
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Twenty CRM MCP server running (${TWENTY_OBJECTS.length * 13 + METADATA_RESOURCES.length * 5 + 3} tools)`);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map