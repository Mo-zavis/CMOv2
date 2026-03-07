import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerCannedResponseTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_canned_responses',
    'List canned responses, optionally filtered by a search term.',
    {
      search: z.string().optional().describe('Search term to filter canned responses'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.search) params.search = args.search;
        return ok(await client.app.get('/canned_responses', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_canned_response',
    'Create a new canned response.',
    {
      short_code: z.string().describe('Short code for the canned response (used as trigger)'),
      content: z.string().describe('Content of the canned response'),
    },
    async (args) => {
      try {
        return ok(await client.app.post('/canned_responses', {
          short_code: args.short_code,
          content: args.content,
        }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_canned_response',
    'Update an existing canned response.',
    {
      id: z.number().describe('ID of the canned response to update'),
      short_code: z.string().optional().describe('New short code for the canned response'),
      content: z.string().optional().describe('New content for the canned response'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.short_code !== undefined) body.short_code = args.short_code;
        if (args.content !== undefined) body.content = args.content;
        return ok(await client.app.put(`/canned_responses/${args.id}`, body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_canned_response',
    'Delete a canned response.',
    {
      id: z.number().describe('ID of the canned response to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/canned_responses/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );
}
