import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerContactLabelTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_get_contact_labels',
    'Get all labels assigned to a contact.',
    {
      contact_id: z.number().describe('ID of the contact'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/contacts/${args.contact_id}/labels`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_set_contact_labels',
    'Set labels on a contact (replaces all existing labels).',
    {
      contact_id: z.number().describe('ID of the contact'),
      labels: z.array(z.string()).describe('Array of label names to set on the contact'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/contacts/${args.contact_id}/labels`, { labels: args.labels }));
      } catch (e) { return formatError(e); }
    },
  );
}
