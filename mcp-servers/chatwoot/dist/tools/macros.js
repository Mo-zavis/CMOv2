import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerMacroTools({ server, client }) {
    server.tool('chatwoot_list_macros', 'List all macros in the Chatwoot account.', {}, async () => {
        try {
            return ok(await client.app.get('/macros'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_macro', 'Create a new macro.', {
        name: z.string().describe('Name of the macro'),
        actions: z.record(z.unknown()).describe('Actions object defining what the macro does'),
        visibility: z.enum(['personal', 'global']).describe('Visibility of the macro'),
    }, async (args) => {
        try {
            return ok(await client.app.post('/macros', {
                name: args.name,
                actions: args.actions,
                visibility: args.visibility,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_macro', 'Get a macro by ID.', {
        id: z.number().describe('ID of the macro'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/macros/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_macro', 'Update a macro.', {
        id: z.number().describe('ID of the macro to update'),
        data: z.record(z.unknown()).describe('Fields to update on the macro'),
    }, async (args) => {
        try {
            return ok(await client.app.put(`/macros/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_execute_macro', 'Execute a macro on one or more conversations.', {
        id: z.number().describe('ID of the macro to execute'),
        conversation_ids: z.array(z.number()).describe('Array of conversation IDs to execute the macro on'),
    }, async (args) => {
        try {
            return ok(await client.app.post(`/macros/${args.id}/execute`, {
                conversation_ids: args.conversation_ids,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=macros.js.map