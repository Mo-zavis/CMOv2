import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerTeamTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_teams',
    'List all teams in the Chatwoot account.',
    {},
    async () => {
      try {
        return ok(await client.app.get('/teams'));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_team',
    'Create a new team in the Chatwoot account.',
    {
      name: z.string().describe('Name of the team'),
      description: z.string().optional().describe('Description of the team'),
      allow_auto_assign: z.boolean().optional().describe('Whether to allow auto-assignment to this team'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { name: args.name };
        if (args.description !== undefined) body.description = args.description;
        if (args.allow_auto_assign !== undefined) body.allow_auto_assign = args.allow_auto_assign;
        return ok(await client.app.post('/teams', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_team',
    'Get details of a specific team.',
    {
      id: z.number().describe('ID of the team'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/teams/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_team',
    'Update an existing team in the Chatwoot account.',
    {
      id: z.number().describe('ID of the team to update'),
      data: z.record(z.unknown()).describe('Team fields to update (e.g. name, description, allow_auto_assign)'),
    },
    async (args) => {
      try {
        return ok(await client.app.put(`/teams/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_team',
    'Delete a team from the Chatwoot account.',
    {
      id: z.number().describe('ID of the team to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/teams/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );
}
