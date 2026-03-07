import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TwentyClient } from '../client/twenty-client.js';
import { formatError } from '../utils/errors.js';
import type { TwentyObject } from './registry.js';
import * as s from './schemas.js';

function buildParams(args: Record<string, unknown>, keys: string[]): Record<string, string> {
  const params: Record<string, string> = {};
  for (const key of keys) {
    const val = args[key];
    if (val !== undefined && val !== null && val !== '') {
      params[key] = String(val);
    }
  }
  return params;
}

function ok(result: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
}

export function registerObjectTools(
  server: McpServer,
  client: TwentyClient,
  obj: TwentyObject,
): void {

  // 1. list_{plural}
  server.tool(
    `list_${obj.plural}`,
    `List/search ${obj.plural}. ${obj.description}`,
    {
      filter: s.filterSchema,
      order_by: s.orderBySchema,
      limit: s.limitSchema,
      depth: s.depthSchema,
      starting_after: s.startingAfterSchema,
      ending_before: s.endingBeforeSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['filter', 'order_by', 'limit', 'depth', 'starting_after', 'ending_before']);
        return ok(await client.get(`/rest/${obj.plural}`, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 2. get_{singular}
  server.tool(
    `get_${obj.singular}`,
    `Get a single ${obj.singular} by ID. ${obj.description}`,
    {
      id: s.idSchema,
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth']);
        return ok(await client.get(`/rest/${obj.plural}/${args.id}`, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 3. create_{singular}
  server.tool(
    `create_${obj.singular}`,
    `Create a new ${obj.singular}. ${obj.description}`,
    {
      data: s.dataSchema,
      depth: s.depthSchema,
      upsert: s.upsertSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth', 'upsert']);
        return ok(await client.post(`/rest/${obj.plural}`, args.data, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 4. update_{singular}
  server.tool(
    `update_${obj.singular}`,
    `Update a single ${obj.singular} by ID.`,
    {
      id: s.idSchema,
      data: s.dataSchema,
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth']);
        return ok(await client.patch(`/rest/${obj.plural}/${args.id}`, args.data, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 5. delete_{singular}
  server.tool(
    `delete_${obj.singular}`,
    `Delete a single ${obj.singular} by ID. Use soft_delete=true to allow restoration later.`,
    {
      id: s.idSchema,
      soft_delete: s.softDeleteSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['soft_delete']);
        return ok(await client.delete(`/rest/${obj.plural}/${args.id}`, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 6. update_many_{plural}
  server.tool(
    `update_many_${obj.plural}`,
    `Update multiple ${obj.plural} matching a filter.`,
    {
      filter: s.requiredFilterSchema,
      data: s.dataSchema,
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['filter', 'depth']);
        return ok(await client.patch(`/rest/${obj.plural}`, args.data, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 7. delete_many_{plural}
  server.tool(
    `delete_many_${obj.plural}`,
    `Delete multiple ${obj.plural} matching a filter. Use soft_delete=true to allow restoration.`,
    {
      filter: s.requiredFilterSchema,
      soft_delete: s.softDeleteSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['filter', 'soft_delete']);
        return ok(await client.delete(`/rest/${obj.plural}`, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 8. batch_create_{plural}
  server.tool(
    `batch_create_${obj.plural}`,
    `Create multiple ${obj.plural} in one request (max 60).`,
    {
      records: s.batchDataSchema,
      depth: s.depthSchema,
      upsert: s.upsertSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth', 'upsert']);
        return ok(await client.post(`/rest/batch/${obj.plural}`, args.records, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 9. find_duplicate_{plural}
  server.tool(
    `find_duplicate_${obj.plural}`,
    `Find duplicate ${obj.plural}. Provide a record to match against.`,
    {
      data: s.dataSchema,
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth']);
        return ok(await client.post(`/rest/${obj.plural}/duplicates`, args.data, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 10. restore_{singular}
  server.tool(
    `restore_${obj.singular}`,
    `Restore a soft-deleted ${obj.singular} by ID.`,
    {
      id: s.idSchema,
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth']);
        return ok(await client.patch(`/rest/restore/${obj.plural}/${args.id}`, undefined, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 11. restore_many_{plural}
  server.tool(
    `restore_many_${obj.plural}`,
    `Restore multiple soft-deleted ${obj.plural} matching a filter.`,
    {
      filter: s.requiredFilterSchema,
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['filter', 'depth']);
        return ok(await client.patch(`/rest/restore/${obj.plural}`, undefined, params));
      } catch (e) { return formatError(e); }
    },
  );

  // 12. merge_{plural}
  server.tool(
    `merge_${obj.plural}`,
    `Merge duplicate ${obj.plural}. Provide primary record ID and IDs to merge into it.`,
    {
      primary_record_id: z.string().describe('ID of the record to keep as the primary'),
      merge_record_ids: z.array(z.string()).describe('IDs of records to merge into the primary'),
      depth: s.depthSchema,
    },
    async (args) => {
      try {
        const params = buildParams(args, ['depth']);
        return ok(await client.patch(
          `/rest/${obj.plural}/merge`,
          { primaryRecordId: args.primary_record_id, mergeRecordIds: args.merge_record_ids },
          params,
        ));
      } catch (e) { return formatError(e); }
    },
  );

  // 13. group_by_{plural}
  server.tool(
    `group_by_${obj.plural}`,
    `Group ${obj.plural} by fields with optional aggregation.`,
    {
      group_by: z.string().describe('JSON array of fields to group by. Example: [{"createdAt":{"granularity":"MONTH"}}]'),
      filter: s.filterSchema,
      order_by: s.orderBySchema,
      limit: s.limitSchema,
      aggregate: z.string().optional().describe('JSON array of aggregate operations. Example: ["countNotEmptyId","sumAmount"]'),
      view_id: z.string().optional().describe('View ID to apply pre-configured filters'),
      include_records_sample: z.boolean().optional().describe('Include sample records per group'),
      order_by_for_records: z.string().optional().describe('Order for sample records within each group'),
    },
    async (args) => {
      try {
        const params = buildParams(args, ['group_by', 'filter', 'order_by', 'limit', 'aggregate', 'view_id', 'include_records_sample', 'order_by_for_records']);
        return ok(await client.get(`/rest/${obj.plural}/groupBy`, params));
      } catch (e) { return formatError(e); }
    },
  );
}
