import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TwentyClient } from '../client/twenty-client.js';
import { formatError } from '../utils/errors.js';
import type { MetadataResource } from './registry.js';

const idSchema = z.string().describe('Record UUID');
const dataSchema = z.record(z.unknown()).describe('Metadata record data as a JSON object');
const limitSchema = z.number().int().min(1).max(1000).optional().describe('Max records (1-1000, default 1000)');
const startingAfterSchema = z.string().optional().describe('Cursor for forward pagination');
const endingBeforeSchema = z.string().optional().describe('Cursor for backward pagination');

function ok(result: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
}

export function registerMetadataTools(
  server: McpServer,
  client: TwentyClient,
  resource: MetadataResource,
): void {

  // 1. metadata_list_{plural}
  server.tool(
    `metadata_list_${resource.plural}`,
    `List all ${resource.plural} (metadata). ${resource.description}`,
    {
      limit: limitSchema,
      starting_after: startingAfterSchema,
      ending_before: endingBeforeSchema,
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.limit) params.limit = String(args.limit);
        if (args.starting_after) params.starting_after = args.starting_after;
        if (args.ending_before) params.ending_before = args.ending_before;
        return ok(await client.get(`/rest/metadata/${resource.plural}`, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 2. metadata_get_{singular}
  server.tool(
    `metadata_get_${resource.singular}`,
    `Get a single ${resource.singular} by ID (metadata). ${resource.description}`,
    { id: idSchema },
    async (args) => {
      try {
        return ok(await client.get(`/rest/metadata/${resource.plural}/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  // 3. metadata_create_{singular}
  server.tool(
    `metadata_create_${resource.singular}`,
    `Create a new ${resource.singular} (metadata). ${resource.description}`,
    { data: dataSchema },
    async (args) => {
      try {
        return ok(await client.post(`/rest/metadata/${resource.plural}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  // 4. metadata_update_{singular}
  server.tool(
    `metadata_update_${resource.singular}`,
    `Update an existing ${resource.singular} by ID (metadata).`,
    { id: idSchema, data: dataSchema },
    async (args) => {
      try {
        return ok(await client.patch(`/rest/metadata/${resource.plural}/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  // 5. metadata_delete_{singular}
  server.tool(
    `metadata_delete_${resource.singular}`,
    `Delete a ${resource.singular} by ID (metadata).`,
    { id: idSchema },
    async (args) => {
      try {
        return ok(await client.delete(`/rest/metadata/${resource.plural}/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );
}
