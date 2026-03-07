import { z } from 'zod';
import type { ToolContext } from '../_context.js';
import { formatError, ok } from '../../utils/errors.js';

export function registerPlatformAccountUserTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_platform_list_account_users',
    'List all users in a specific Chatwoot account.',
    {
      account_id: z.number().describe('ID of the account'),
    },
    async (args) => {
      try {
        return ok(await client.platform.get(`/accounts/${args.account_id}/account_users`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_platform_create_account_user',
    'Add a user to a Chatwoot account.',
    {
      account_id: z.number().describe('ID of the account'),
      user_id: z.number().describe('ID of the user to add'),
      role: z.enum(['agent', 'administrator']).optional().describe('Role of the user in the account'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { user_id: args.user_id };
        if (args.role !== undefined) body.role = args.role;
        return ok(await client.platform.post(`/accounts/${args.account_id}/account_users`, body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_platform_delete_account_user',
    'Remove a user from a Chatwoot account.',
    {
      account_id: z.number().describe('ID of the account'),
      user_id: z.number().describe('ID of the user to remove'),
    },
    async (args) => {
      try {
        return ok(await client.platform.delete(`/accounts/${args.account_id}/account_users`, { user_id: args.user_id }));
      } catch (e) { return formatError(e); }
    },
  );
}
