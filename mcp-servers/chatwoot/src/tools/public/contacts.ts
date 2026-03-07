import { z } from 'zod';
import type { ToolContext } from '../_context.js';
import { formatError, ok } from '../../utils/errors.js';

export function registerPublicContactTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_public_create_contact',
    'Create a new contact via the public API for a specific inbox.',
    {
      inbox_identifier: z.string().describe('Identifier of the inbox'),
      name: z.string().optional().describe('Name of the contact'),
      email: z.string().optional().describe('Email address of the contact'),
      phone_number: z.string().optional().describe('Phone number of the contact'),
      identifier: z.string().optional().describe('External identifier for the contact'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.email !== undefined) body.email = args.email;
        if (args.phone_number !== undefined) body.phone_number = args.phone_number;
        if (args.identifier !== undefined) body.identifier = args.identifier;
        return ok(await client.pub.post(`/inboxes/${args.inbox_identifier}/contacts`, body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_public_get_contact',
    'Get a public contact by inbox and contact identifier.',
    {
      inbox_identifier: z.string().describe('Identifier of the inbox'),
      contact_identifier: z.string().describe('Identifier of the contact'),
    },
    async (args) => {
      try {
        return ok(await client.pub.get(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_public_update_contact',
    'Update a public contact by inbox and contact identifier.',
    {
      inbox_identifier: z.string().describe('Identifier of the inbox'),
      contact_identifier: z.string().describe('Identifier of the contact'),
      data: z.record(z.unknown()).describe('Contact fields to update (e.g. name, email, phone_number)'),
    },
    async (args) => {
      try {
        return ok(await client.pub.patch(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );
}
