import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerAgentTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_agents',
    'List all agents in the Chatwoot account.',
    {},
    async () => {
      try {
        return ok(await client.app.get('/agents'));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_agent',
    'Create a new agent in the Chatwoot account.',
    {
      name: z.string().describe('Full name of the agent'),
      email: z.string().describe('Email address of the agent'),
      role: z.enum(['agent', 'administrator']).optional().describe('Role of the agent'),
      availability: z.enum(['online', 'busy', 'offline']).optional().describe('Availability status'),
      auto_offline: z.boolean().optional().describe('Whether agent auto-goes offline'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          name: args.name,
          email: args.email,
        };
        if (args.role !== undefined) body.role = args.role;
        if (args.availability !== undefined) body.availability = args.availability;
        if (args.auto_offline !== undefined) body.auto_offline = args.auto_offline;
        return ok(await client.app.post('/agents', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_agent',
    'Update an existing agent in the Chatwoot account.',
    {
      id: z.number().describe('ID of the agent to update'),
      data: z.record(z.unknown()).describe('Agent fields to update (e.g. name, role, availability)'),
    },
    async (args) => {
      try {
        return ok(await client.app.patch(`/agents/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_agent',
    'Delete an agent from the Chatwoot account.',
    {
      id: z.number().describe('ID of the agent to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/agents/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );
}
