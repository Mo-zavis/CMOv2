import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerCustomFilterTools({ server, client }) {
    server.tool('chatwoot_list_custom_filters', 'List custom filters, optionally filtered by type.', {
        filter_type: z.enum(['conversation', 'contact']).optional().describe('Filter by type (conversation or contact)'),
    }, async (args) => {
        try {
            const params = {};
            if (args.filter_type)
                params.filter_type = args.filter_type;
            return ok(await client.app.get('/custom_filters', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_custom_filter', 'Create a new custom filter.', {
        name: z.string().describe('Name of the custom filter'),
        filter_type: z.enum(['conversation', 'contact']).describe('Type of the filter'),
        query: z.record(z.unknown()).describe('Query object defining the filter conditions'),
    }, async (args) => {
        try {
            return ok(await client.app.post('/custom_filters', {
                name: args.name,
                filter_type: args.filter_type,
                query: args.query,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_custom_filter', 'Get a custom filter by ID.', {
        id: z.number().describe('ID of the custom filter'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/custom_filters/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_custom_filter', 'Update a custom filter.', {
        id: z.number().describe('ID of the custom filter to update'),
        data: z.record(z.unknown()).describe('Fields to update on the custom filter'),
    }, async (args) => {
        try {
            return ok(await client.app.put(`/custom_filters/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_custom_filter', 'Delete a custom filter.', {
        id: z.number().describe('ID of the custom filter to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/custom_filters/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=custom-filters.js.map