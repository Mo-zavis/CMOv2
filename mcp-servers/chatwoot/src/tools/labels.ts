import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerLabelTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_labels',
    'List all labels in the Chatwoot account.',
    {},
    async () => {
      try {
        return ok(await client.app.get('/labels'));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_label',
    'Create a new label in the Chatwoot account.',
    {
      title: z.string().describe('Title of the label'),
      description: z.string().optional().describe('Description of the label'),
      color: z.string().optional().describe('Color hex code for the label (e.g. #FF0000)'),
      show_on_sidebar: z.boolean().optional().describe('Whether to show the label on the sidebar'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { title: args.title };
        if (args.description !== undefined) body.description = args.description;
        if (args.color !== undefined) body.color = args.color;
        if (args.show_on_sidebar !== undefined) body.show_on_sidebar = args.show_on_sidebar;
        return ok(await client.app.post('/labels', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_label',
    'Update an existing label.',
    {
      id: z.number().describe('ID of the label to update'),
      data: z.record(z.unknown()).describe('Label fields to update (e.g. title, description, color, show_on_sidebar)'),
    },
    async (args) => {
      try {
        return ok(await client.app.put(`/labels/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_label',
    'Delete a label from the Chatwoot account.',
    {
      id: z.number().describe('ID of the label to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/labels/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );
}
