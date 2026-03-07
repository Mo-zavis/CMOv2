import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerAgentBotTools({ server, client }) {
    server.tool('chatwoot_list_agent_bots', 'List all agent bots in the Chatwoot account.', {}, async () => {
        try {
            return ok(await client.app.get('/agent_bots'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_agent_bot', 'Create a new agent bot.', {
        name: z.string().describe('Name of the agent bot'),
        description: z.string().optional().describe('Description of the agent bot'),
        outgoing_url: z.string().optional().describe('URL for outgoing webhook events'),
        bot_type: z.string().optional().describe('Type of the bot'),
        bot_config: z.record(z.unknown()).optional().describe('Configuration object for the bot'),
    }, async (args) => {
        try {
            const body = { name: args.name };
            if (args.description !== undefined)
                body.description = args.description;
            if (args.outgoing_url !== undefined)
                body.outgoing_url = args.outgoing_url;
            if (args.bot_type !== undefined)
                body.bot_type = args.bot_type;
            if (args.bot_config !== undefined)
                body.bot_config = args.bot_config;
            return ok(await client.app.post('/agent_bots', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_agent_bot', 'Get an agent bot by ID.', {
        id: z.number().describe('ID of the agent bot'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/agent_bots/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_agent_bot', 'Update an agent bot.', {
        id: z.number().describe('ID of the agent bot to update'),
        data: z.record(z.unknown()).describe('Fields to update on the agent bot'),
    }, async (args) => {
        try {
            return ok(await client.app.patch(`/agent_bots/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_agent_bot', 'Delete an agent bot.', {
        id: z.number().describe('ID of the agent bot to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/agent_bots/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=agent-bots.js.map