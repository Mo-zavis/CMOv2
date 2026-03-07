import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerDraftMessageTools({ server, client }) {
    server.tool('chatwoot_get_draft_message', 'Get the draft message for a conversation.', {
        conversation_id: z.number().describe('ID of the conversation'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/conversations/${args.conversation_id}/draft_messages`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_draft_message', 'Update or set the draft message for a conversation.', {
        conversation_id: z.number().describe('ID of the conversation'),
        content: z.string().describe('Content of the draft message'),
        reply_type: z.string().optional().describe('Reply type for the draft'),
    }, async (args) => {
        try {
            const body = { content: args.content };
            if (args.reply_type !== undefined)
                body.reply_type = args.reply_type;
            return ok(await client.app.put(`/conversations/${args.conversation_id}/draft_messages`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_draft_message', 'Delete the draft message for a conversation.', {
        conversation_id: z.number().describe('ID of the conversation'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/conversations/${args.conversation_id}/draft_messages`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=draft-messages.js.map