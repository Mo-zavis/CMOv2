import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerMessageTools({ server, client }) {
    server.tool('chatwoot_list_messages', 'List all messages in a conversation.', {
        conversation_id: z.number().describe('ID of the conversation to list messages from'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/conversations/${args.conversation_id}/messages`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_message', 'Create a new message in a conversation.', {
        conversation_id: z.number().describe('ID of the conversation to send the message in'),
        content: z.string().describe('Content of the message'),
        message_type: z.enum(['outgoing', 'incoming']).optional().describe('Type of message'),
        private: z.boolean().optional().describe('Whether the message is a private note'),
        content_type: z.string().optional().describe('Content type of the message'),
    }, async (args) => {
        try {
            const body = { content: args.content };
            if (args.message_type !== undefined)
                body.message_type = args.message_type;
            if (args.private !== undefined)
                body.private = args.private;
            if (args.content_type !== undefined)
                body.content_type = args.content_type;
            return ok(await client.app.post(`/conversations/${args.conversation_id}/messages`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_message', 'Update the content of an existing message.', {
        conversation_id: z.number().describe('ID of the conversation containing the message'),
        message_id: z.number().describe('ID of the message to update'),
        content: z.string().describe('New content for the message'),
    }, async (args) => {
        try {
            return ok(await client.app.patch(`/conversations/${args.conversation_id}/messages/${args.message_id}`, { content: args.content }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_message', 'Delete a message from a conversation.', {
        conversation_id: z.number().describe('ID of the conversation containing the message'),
        message_id: z.number().describe('ID of the message to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/conversations/${args.conversation_id}/messages/${args.message_id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=messages.js.map