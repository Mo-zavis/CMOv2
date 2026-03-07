import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerInboxMemberTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_inbox_members',
    'List all members (agents) assigned to an inbox.',
    {
      inbox_id: z.number().describe('ID of the inbox'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/inbox_members/${args.inbox_id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_add_inbox_members',
    'Add agents as members to an inbox.',
    {
      inbox_id: z.number().describe('ID of the inbox'),
      user_ids: z.array(z.number()).describe('Array of user IDs to add to the inbox'),
    },
    async (args) => {
      try {
        return ok(await client.app.post('/inbox_members', {
          inbox_id: args.inbox_id,
          user_ids: args.user_ids,
        }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_inbox_members',
    'Update (replace) the members of an inbox.',
    {
      inbox_id: z.number().describe('ID of the inbox'),
      user_ids: z.array(z.number()).describe('Array of user IDs that will replace current inbox members'),
    },
    async (args) => {
      try {
        return ok(await client.app.patch('/inbox_members', {
          inbox_id: args.inbox_id,
          user_ids: args.user_ids,
        }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_inbox_members',
    'Remove agents from an inbox.',
    {
      inbox_id: z.number().describe('ID of the inbox'),
      user_ids: z.array(z.number()).describe('Array of user IDs to remove from the inbox'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete('/inbox_members', {
          inbox_id: args.inbox_id,
          user_ids: args.user_ids,
        }));
      } catch (e) { return formatError(e); }
    },
  );
}
