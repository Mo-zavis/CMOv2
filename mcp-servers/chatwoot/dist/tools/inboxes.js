import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerInboxTools({ server, client }) {
    server.tool('chatwoot_list_inboxes', 'List all inboxes in the Chatwoot account.', {}, async () => {
        try {
            return ok(await client.app.get('/inboxes'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_inbox', 'Create a new inbox in the Chatwoot account.', {
        name: z.string().describe('Name of the inbox'),
        channel: z.record(z.unknown()).describe('Channel configuration object (varies by inbox type, e.g. website, email, api)'),
    }, async (args) => {
        try {
            return ok(await client.app.post('/inboxes', {
                name: args.name,
                channel: args.channel,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_inbox', 'Get details of a specific inbox.', {
        id: z.number().describe('ID of the inbox'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/inboxes/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_inbox', 'Update an existing inbox.', {
        id: z.number().describe('ID of the inbox to update'),
        data: z.record(z.unknown()).describe('Inbox fields to update (e.g. name, enable_auto_assignment)'),
    }, async (args) => {
        try {
            return ok(await client.app.patch(`/inboxes/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_inbox', 'Delete an inbox from the Chatwoot account.', {
        id: z.number().describe('ID of the inbox to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/inboxes/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_inbox_agent_bot', 'Get the agent bot configuration for an inbox.', {
        id: z.number().describe('ID of the inbox'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/inboxes/${args.id}/get_agent_bot`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_set_inbox_agent_bot', 'Set or remove the agent bot for an inbox.', {
        id: z.number().describe('ID of the inbox'),
        agent_bot: z.number().nullable().describe('ID of the agent bot to assign, or null to remove'),
    }, async (args) => {
        try {
            return ok(await client.app.post(`/inboxes/${args.id}/set_agent_bot`, {
                agent_bot: args.agent_bot,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_list_inbox_assignable_agents', 'List agents that can be assigned to conversations in an inbox.', {
        id: z.number().describe('ID of the inbox'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/inboxes/${args.id}/assignable_agents`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_list_inbox_campaigns', 'List campaigns associated with an inbox.', {
        id: z.number().describe('ID of the inbox'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/inboxes/${args.id}/campaigns`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_inbox_csat', 'Get CSAT survey settings for an inbox.', {
        id: z.number().describe('ID of the inbox'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/inboxes/${args.id}/csat_survey`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=inboxes.js.map