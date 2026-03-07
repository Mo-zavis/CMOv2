import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerCampaignTools({ server, client }) {
    server.tool('chatwoot_list_campaigns', 'List all campaigns in the Chatwoot account.', {}, async () => {
        try {
            return ok(await client.app.get('/campaigns'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_campaign', 'Create a new campaign.', {
        title: z.string().describe('Title of the campaign'),
        message: z.string().describe('Message content of the campaign'),
        inbox_id: z.number().describe('ID of the inbox to send the campaign from'),
        audience: z.record(z.unknown()).optional().describe('Audience targeting rules'),
        scheduled_at: z.string().optional().describe('ISO 8601 datetime for when to send the campaign'),
        trigger_rules: z.record(z.unknown()).optional().describe('Trigger rules for the campaign'),
    }, async (args) => {
        try {
            const body = {
                title: args.title,
                message: args.message,
                inbox_id: args.inbox_id,
            };
            if (args.audience !== undefined)
                body.audience = args.audience;
            if (args.scheduled_at !== undefined)
                body.scheduled_at = args.scheduled_at;
            if (args.trigger_rules !== undefined)
                body.trigger_rules = args.trigger_rules;
            return ok(await client.app.post('/campaigns', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_campaign', 'Update an existing campaign.', {
        id: z.number().describe('ID of the campaign to update'),
        data: z.record(z.unknown()).describe('Fields to update on the campaign'),
    }, async (args) => {
        try {
            return ok(await client.app.put(`/campaigns/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_campaign', 'Delete a campaign.', {
        id: z.number().describe('ID of the campaign to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/campaigns/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=campaigns.js.map