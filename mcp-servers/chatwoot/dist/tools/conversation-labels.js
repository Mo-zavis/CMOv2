import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerConversationLabelTools({ server, client }) {
    server.tool('chatwoot_get_conversation_labels', 'Get all labels assigned to a conversation.', {
        conversation_id: z.number().describe('ID of the conversation'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/conversations/${args.conversation_id}/labels`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_set_conversation_labels', 'Set labels on a conversation (replaces all existing labels).', {
        conversation_id: z.number().describe('ID of the conversation'),
        labels: z.array(z.string()).describe('Array of label names to set on the conversation'),
    }, async (args) => {
        try {
            return ok(await client.app.post(`/conversations/${args.conversation_id}/labels`, { labels: args.labels }));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=conversation-labels.js.map