import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerReportTools({ server, client }) {
    server.tool('chatwoot_get_account_summary', 'Get account-level summary report for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
        type: z.enum(['account']).optional().describe('Report type'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            if (args.type)
                params.type = args.type;
            return ok(await client.reports.get('/reports/summary', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_agent_summary', 'Get agent-level summary report for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/agents/summary', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_agent_conversations', 'Get agent conversation metrics for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
        type: z.enum(['account']).optional().describe('Report type'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            if (args.type)
                params.type = args.type;
            return ok(await client.reports.get('/reports/agents/conversations', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_inbox_summary', 'Get inbox-level summary report for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/inboxes/summary', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_inbox_conversations', 'Get inbox conversation metrics for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/inboxes/conversations', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_team_summary', 'Get team-level summary report for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/teams/summary', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_team_conversations', 'Get team conversation metrics for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/teams/conversations', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_label_summary', 'Get label-level summary report for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/labels/summary', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_label_conversations', 'Get label conversation metrics for a given time range.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/labels/conversations', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_conversation_metrics', 'Get overall conversation metrics for a given time range.', {
        type: z.enum(['account']).describe('Report type'),
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
    }, async (args) => {
        try {
            const params = {
                type: args.type,
                since: args.since,
                until: args.until,
            };
            return ok(await client.reports.get('/reports/conversations', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_csat_reports', 'Get CSAT (customer satisfaction) reports for agents.', {
        since: z.string().describe('Start time as Unix timestamp'),
        until: z.string().describe('End time as Unix timestamp'),
        page: z.number().optional().describe('Page number for pagination'),
    }, async (args) => {
        try {
            const params = {
                since: args.since,
                until: args.until,
            };
            if (args.page)
                params.page = String(args.page);
            return ok(await client.reports.get('/reports/agents/csat', params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_overview_reports', 'Get live overview/metrics for the account.', {}, async () => {
        try {
            return ok(await client.reports.get('/reports/overview'));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=reports.js.map