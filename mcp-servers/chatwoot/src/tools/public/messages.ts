import { z } from 'zod';
import type { ToolContext } from '../_context.js';
import { formatError, ok } from '../../utils/errors.js';

export function registerPublicMessageTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_public_list_messages',
    'List all messages in a public conversation.',
    {
      inbox_identifier: z.string().describe('Identifier of the inbox'),
      contact_identifier: z.string().describe('Identifier of the contact'),
      conversation_id: z.number().describe('ID of the conversation'),
    },
    async (args) => {
      try {
        return ok(await client.pub.get(
          `/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}/messages`,
        ));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_public_create_message',
    'Create a new message in a public conversation.',
    {
      inbox_identifier: z.string().describe('Identifier of the inbox'),
      contact_identifier: z.string().describe('Identifier of the contact'),
      conversation_id: z.number().describe('ID of the conversation'),
      content: z.string().describe('Content of the message'),
      echo_id: z.string().optional().describe('Temporary ID for the message used by clients'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { content: args.content };
        if (args.echo_id !== undefined) body.echo_id = args.echo_id;
        return ok(await client.pub.post(
          `/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}/messages`,
          body,
        ));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_public_update_message',
    'Update an existing message in a public conversation.',
    {
      inbox_identifier: z.string().describe('Identifier of the inbox'),
      contact_identifier: z.string().describe('Identifier of the contact'),
      conversation_id: z.number().describe('ID of the conversation'),
      message_id: z.number().describe('ID of the message to update'),
      content: z.string().describe('New content for the message'),
    },
    async (args) => {
      try {
        return ok(await client.pub.patch(
          `/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}/messages/${args.message_id}`,
          { content: args.content },
        ));
      } catch (e) { return formatError(e); }
    },
  );
}
