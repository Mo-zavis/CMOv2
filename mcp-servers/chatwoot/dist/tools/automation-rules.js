import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerAutomationRuleTools({ server, client }) {
    server.tool('chatwoot_list_automation_rules', 'List all automation rules with optional pagination.', {
        page: z.number().optional().describe('Page number for pagination'),
    }, async (args) => {
        try {
            const params = {};
            if (args.page)
                params.page = String(args.page);
            return ok(await client.app.get('/automation_rules', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_automation_rule', 'Create a new automation rule.', {
        name: z.string().describe('Name of the automation rule'),
        description: z.string().optional().describe('Description of the automation rule'),
        event_name: z.enum(['message_created', 'conversation_created', 'conversation_updated', 'conversation_opened']).describe('Event that triggers the rule'),
        conditions: z.record(z.unknown()).describe('Conditions object for the rule'),
        actions: z.record(z.unknown()).describe('Actions object for the rule'),
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                event_name: args.event_name,
                conditions: args.conditions,
                actions: args.actions,
            };
            if (args.description !== undefined)
                body.description = args.description;
            return ok(await client.app.post('/automation_rules', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_automation_rule', 'Get an automation rule by ID.', {
        id: z.number().describe('ID of the automation rule'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/automation_rules/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_automation_rule', 'Update an automation rule.', {
        id: z.number().describe('ID of the automation rule to update'),
        data: z.record(z.unknown()).describe('Fields to update on the automation rule'),
    }, async (args) => {
        try {
            return ok(await client.app.put(`/automation_rules/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_automation_rule', 'Delete an automation rule.', {
        id: z.number().describe('ID of the automation rule to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/automation_rules/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=automation-rules.js.map