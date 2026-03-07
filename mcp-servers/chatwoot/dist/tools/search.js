import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerSearchTools({ server, client }) {
    server.tool('chatwoot_search', 'Global search across conversations, messages, and contacts.', {
        q: z.string().describe('Search query string'),
        page: z.number().optional().describe('Page number for pagination'),
        multi_search: z.boolean().optional().describe('Whether to search across multiple types'),
    }, async (args) => {
        try {
            const params = { q: args.q };
            if (args.page)
                params.page = String(args.page);
            if (args.multi_search !== undefined)
                params.multi_search = String(args.multi_search);
            return ok(await client.app.get('/search', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=search.js.map