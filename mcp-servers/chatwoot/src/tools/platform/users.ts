import { z } from 'zod';
import type { ToolContext } from '../_context.js';
import { formatError, ok } from '../../utils/errors.js';

export function registerPlatformUserTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_platform_list_users',
    'List all users on the Chatwoot platform.',
    {
      page: z.number().optional().describe('Page number for pagination'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.page !== undefined) params.page = String(args.page);
        return ok(await client.platform.get('/users', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_platform_create_user',
    'Create a new user on the Chatwoot platform.',
    {
      name: z.string().describe('Name of the user'),
      email: z.string().describe('Email address of the user'),
      password: z.string().optional().describe('Password for the user'),
      custom_attributes: z.record(z.unknown()).optional().describe('Custom attributes for the user'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          name: args.name,
          email: args.email,
        };
        if (args.password !== undefined) body.password = args.password;
        if (args.custom_attributes !== undefined) body.custom_attributes = args.custom_attributes;
        return ok(await client.platform.post('/users', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_platform_get_user',
    'Get details of a specific user by ID.',
    {
      id: z.number().describe('ID of the user'),
    },
    async (args) => {
      try {
        return ok(await client.platform.get(`/users/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_platform_update_user',
    'Update an existing user on the Chatwoot platform.',
    {
      id: z.number().describe('ID of the user to update'),
      data: z.record(z.unknown()).describe('User fields to update (e.g. name, email, custom_attributes)'),
    },
    async (args) => {
      try {
        return ok(await client.platform.patch(`/users/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_platform_get_user_sso_link',
    'Get the SSO login URL for a specific user.',
    {
      id: z.number().describe('ID of the user'),
    },
    async (args) => {
      try {
        return ok(await client.platform.get(`/users/${args.id}/login`));
      } catch (e) { return formatError(e); }
    },
  );
}
