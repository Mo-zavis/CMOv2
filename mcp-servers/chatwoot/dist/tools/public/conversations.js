import { z } from 'zod';
import { formatError, ok } from '../../utils/errors.js';
export function registerPublicConversationTools({ server, client }) {
    server.tool('chatwoot_public_create_conversation', 'Create a new conversation for a public contact.', {
        inbox_identifier: z.string().describe('Identifier of the inbox'),
        contact_identifier: z.string().describe('Identifier of the contact'),
        custom_attributes: z.record(z.unknown()).optional().describe('Custom attributes for the conversation'),
    }, async (args) => {
        try {
            const body = {};
            if (args.custom_attributes !== undefined)
                body.custom_attributes = args.custom_attributes;
            return ok(await client.pub.post(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_public_list_conversations', 'List all conversations for a public contact.', {
        inbox_identifier: z.string().describe('Identifier of the inbox'),
        contact_identifier: z.string().describe('Identifier of the contact'),
    }, async (args) => {
        try {
            return ok(await client.pub.get(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_public_get_conversation', 'Get a specific conversation for a public contact.', {
        inbox_identifier: z.string().describe('Identifier of the inbox'),
        contact_identifier: z.string().describe('Identifier of the contact'),
        conversation_id: z.number().describe('ID of the conversation'),
    }, async (args) => {
        try {
            return ok(await client.pub.get(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_public_toggle_conversation_status', 'Toggle the status of a public conversation (open/resolved).', {
        inbox_identifier: z.string().describe('Identifier of the inbox'),
        contact_identifier: z.string().describe('Identifier of the contact'),
        conversation_id: z.number().describe('ID of the conversation'),
    }, async (args) => {
        try {
            return ok(await client.pub.post(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}/toggle_status`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_public_toggle_conversation_typing', 'Toggle the typing indicator on a public conversation.', {
        inbox_identifier: z.string().describe('Identifier of the inbox'),
        contact_identifier: z.string().describe('Identifier of the contact'),
        conversation_id: z.number().describe('ID of the conversation'),
        typing_status: z.enum(['on', 'off']).describe('Typing status to set'),
    }, async (args) => {
        try {
            return ok(await client.pub.post(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}/toggle_typing`, { typing_status: args.typing_status }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_public_update_conversation_last_seen', 'Update the last seen timestamp on a public conversation.', {
        inbox_identifier: z.string().describe('Identifier of the inbox'),
        contact_identifier: z.string().describe('Identifier of the contact'),
        conversation_id: z.number().describe('ID of the conversation'),
    }, async (args) => {
        try {
            return ok(await client.pub.post(`/inboxes/${args.inbox_identifier}/contacts/${args.contact_identifier}/conversations/${args.conversation_id}/update_last_seen`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=conversations.js.map