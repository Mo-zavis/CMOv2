import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerWebhookTools({ server, client }) {
    server.tool('chatwoot_list_webhooks', 'List all webhooks configured in the Chatwoot account.', {}, async () => {
        try {
            return ok(await client.app.get('/webhooks'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_webhook', 'Create a new webhook.', {
        url: z.string().describe('URL the webhook will POST to'),
        subscriptions: z.array(z.string()).optional().describe('List of event types to subscribe to'),
    }, async (args) => {
        try {
            const body = { url: args.url };
            if (args.subscriptions !== undefined)
                body.subscriptions = args.subscriptions;
            return ok(await client.app.post('/webhooks', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_webhook', 'Update an existing webhook.', {
        id: z.number().describe('ID of the webhook to update'),
        url: z.string().optional().describe('New URL for the webhook'),
        subscriptions: z.array(z.string()).optional().describe('Updated list of event types to subscribe to'),
    }, async (args) => {
        try {
            const body = {};
            if (args.url !== undefined)
                body.url = args.url;
            if (args.subscriptions !== undefined)
                body.subscriptions = args.subscriptions;
            return ok(await client.app.put(`/webhooks/${args.id}`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_webhook', 'Delete a webhook.', {
        id: z.number().describe('ID of the webhook to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/webhooks/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=webhooks.js.map