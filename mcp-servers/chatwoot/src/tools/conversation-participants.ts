import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerConversationParticipantTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_conversation_participants',
    'List all participants in a conversation.',
    {
      conversation_id: z.number().describe('ID of the conversation'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/conversations/${args.conversation_id}/participants`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_add_conversation_participants',
    'Add participants to a conversation.',
    {
      conversation_id: z.number().describe('ID of the conversation'),
      user_ids: z.array(z.number()).describe('Array of user IDs to add as participants'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/conversations/${args.conversation_id}/participants`, { user_ids: args.user_ids }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_conversation_participants',
    'Update (replace) participants in a conversation.',
    {
      conversation_id: z.number().describe('ID of the conversation'),
      user_ids: z.array(z.number()).describe('Array of user IDs to set as participants (replaces existing)'),
    },
    async (args) => {
      try {
        return ok(await client.app.patch(`/conversations/${args.conversation_id}/participants`, { user_ids: args.user_ids }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_conversation_participants',
    'Remove participants from a conversation.',
    {
      conversation_id: z.number().describe('ID of the conversation'),
      user_ids: z.array(z.number()).describe('Array of user IDs to remove from participants'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/conversations/${args.conversation_id}/participants`, { user_ids: args.user_ids }));
      } catch (e) { return formatError(e); }
    },
  );
}
