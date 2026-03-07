import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerProfileTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_get_profile',
    'Get the current authenticated user profile.',
    {},
    async () => {
      try {
        return ok(await client.app.get('/profile'));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_profile',
    'Update the current authenticated user profile.',
    {
      name: z.string().optional().describe('Full name'),
      email: z.string().optional().describe('Email address'),
      availability: z.enum(['online', 'busy', 'offline']).optional().describe('Availability status'),
      auto_offline: z.boolean().optional().describe('Whether to automatically go offline'),
      display_name: z.string().optional().describe('Display name'),
      avatar_url: z.string().optional().describe('URL of the avatar image'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.email !== undefined) body.email = args.email;
        if (args.availability !== undefined) body.availability = args.availability;
        if (args.auto_offline !== undefined) body.auto_offline = args.auto_offline;
        if (args.display_name !== undefined) body.display_name = args.display_name;
        if (args.avatar_url !== undefined) body.avatar_url = args.avatar_url;
        return ok(await client.app.put('/profile', body));
      } catch (e) { return formatError(e); }
    },
  );
}
