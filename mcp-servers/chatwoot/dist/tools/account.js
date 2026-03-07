import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerAccountTools({ server, client }) {
    server.tool('chatwoot_get_account', 'Get account details for the configured Chatwoot account.', {}, async () => {
        try {
            return ok(await client.app.get('/'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_account', 'Update account details (e.g. name) for the configured Chatwoot account.', {
        name: z.string().optional().describe('New name for the account'),
    }, async (args) => {
        try {
            const body = {};
            if (args.name !== undefined)
                body.name = args.name;
            return ok(await client.app.patch('/', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=account.js.map