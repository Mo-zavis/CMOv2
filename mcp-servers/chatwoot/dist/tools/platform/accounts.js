import { z } from 'zod';
import { formatError, ok } from '../../utils/errors.js';
export function registerPlatformAccountTools({ server, client }) {
    server.tool('chatwoot_platform_list_accounts', 'List all accounts on the Chatwoot platform.', {}, async () => {
        try {
            return ok(await client.platform.get('/accounts'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_create_account', 'Create a new account on the Chatwoot platform.', {
        name: z.string().describe('Name of the account'),
    }, async (args) => {
        try {
            return ok(await client.platform.post('/accounts', { name: args.name }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_get_account', 'Get details of a specific account by ID.', {
        id: z.number().describe('ID of the account'),
    }, async (args) => {
        try {
            return ok(await client.platform.get(`/accounts/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_platform_update_account', 'Update an existing account on the Chatwoot platform.', {
        id: z.number().describe('ID of the account to update'),
        name: z.string().optional().describe('New name for the account'),
    }, async (args) => {
        try {
            const body = {};
            if (args.name !== undefined)
                body.name = args.name;
            return ok(await client.platform.patch(`/accounts/${args.id}`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=accounts.js.map