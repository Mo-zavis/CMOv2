import { z } from 'zod';
import { formatError } from '../utils/errors.js';
function ok(result) {
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
export function registerSpecialTools(server, client) {
    server.tool('duplicate_dashboard', 'Duplicate an existing dashboard by ID.', { id: z.string().describe('Dashboard ID to duplicate') }, async (args) => {
        try {
            return ok(await client.post(`/rest/dashboards/${args.id}/duplicate`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('get_openapi_core_schema', 'Fetch the OpenAPI specification for the core (data) API. Returns full schema with all objects, fields, and endpoints.', {}, async () => {
        try {
            return ok(await client.get('/rest/open-api/core'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('get_openapi_metadata_schema', 'Fetch the OpenAPI specification for the metadata API. Returns schema for managing objects, fields, views, webhooks.', {}, async () => {
        try {
            return ok(await client.get('/rest/open-api/metadata'));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=dashboard-tools.js.map