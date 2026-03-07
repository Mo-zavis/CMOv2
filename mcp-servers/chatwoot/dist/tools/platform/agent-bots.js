import { z } from 'zod';
import { formatError, ok } from '../../utils/errors.js';
export function registerPlatformAgentBotTools({ server, client }) {
    server.tool('chatwoot_platform_list_agent_bots', 'List all platform-level agent bots.', {}, async () => {
        try {
            return ok(await client.platform.get('/agent_bots'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_create_agent_bot', 'Create a new platform-level agent bot.', {
        name: z.string().describe('Name of the agent bot'),
        description: z.string().optional().describe('Description of the agent bot'),
        outgoing_url: z.string().optional().describe('Webhook URL for outgoing events'),
    }, async (args) => {
        try {
            const body = { name: args.name };
            if (args.description !== undefined)
                body.description = args.description;
            if (args.outgoing_url !== undefined)
                body.outgoing_url = args.outgoing_url;
            return ok(await client.platform.post('/agent_bots', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_get_agent_bot', 'Get details of a specific platform-level agent bot.', {
        id: z.number().describe('ID of the agent bot'),
    }, async (args) => {
        try {
            return ok(await client.platform.get(`/agent_bots/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_update_agent_bot', 'Update an existing platform-level agent bot.', {
        id: z.number().describe('ID of the agent bot to update'),
        data: z.record(z.unknown()).describe('Agent bot fields to update (e.g. name, description, outgoing_url)'),
    }, async (args) => {
        try {
            return ok(await client.platform.patch(`/agent_bots/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_delete_agent_bot', 'Delete a platform-level agent bot.', {
        id: z.number().describe('ID of the agent bot to delete'),
    }, async (args) => {
        try {
            return ok(await client.platform.delete(`/agent_bots/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=agent-bots.js.map