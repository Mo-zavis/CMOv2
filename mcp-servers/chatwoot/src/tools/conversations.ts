import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerConversationTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_conversations',
    'List conversations with optional filters for status, assignee type, inbox, team, labels, and pagination.',
    {
      status: z.enum(['open', 'resolved', 'pending', 'snoozed', 'all']).optional().describe('Filter by conversation status'),
      assignee_type: z.enum(['me', 'unassigned', 'all', 'assigned']).optional().describe('Filter by assignee type'),
      inbox_id: z.number().optional().describe('Filter by inbox ID'),
      team_id: z.number().optional().describe('Filter by team ID'),
      labels: z.array(z.string()).optional().describe('Filter by labels'),
      page: z.number().optional().describe('Page number for pagination'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.status) params.status = args.status;
        if (args.assignee_type) params.assignee_type = args.assignee_type;
        if (args.inbox_id) params.inbox_id = String(args.inbox_id);
        if (args.team_id) params.team_id = String(args.team_id);
        if (args.labels) params['labels[]'] = args.labels.join(',');
        if (args.page) params.page = String(args.page);
        return ok(await client.app.get('/conversations', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_conversation',
    'Create a new conversation in a given inbox for a contact.',
    {
      inbox_id: z.number().describe('ID of the inbox to create the conversation in'),
      contact_id: z.number().describe('ID of the contact'),
      source_id: z.string().optional().describe('Source ID for the conversation'),
      status: z.string().optional().describe('Initial status of the conversation'),
      assignee_id: z.number().optional().describe('ID of the agent to assign'),
      team_id: z.number().optional().describe('ID of the team to assign'),
      message: z.object({
        content: z.string().describe('Content of the initial message'),
        message_type: z.string().optional().describe('Type of message (e.g. outgoing, incoming)'),
      }).optional().describe('Initial message for the conversation'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          inbox_id: args.inbox_id,
          contact_id: args.contact_id,
        };
        if (args.source_id !== undefined) body.source_id = args.source_id;
        if (args.status !== undefined) body.status = args.status;
        if (args.assignee_id !== undefined) body.assignee_id = args.assignee_id;
        if (args.team_id !== undefined) body.team_id = args.team_id;
        if (args.message !== undefined) body.message = args.message;
        return ok(await client.app.post('/conversations', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_conversation',
    'Get a single conversation by its ID.',
    {
      conversation_id: z.number().describe('ID of the conversation to retrieve'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/conversations/${args.conversation_id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_conversation',
    'Update a conversation (e.g. custom attributes, status).',
    {
      conversation_id: z.number().describe('ID of the conversation to update'),
      data: z.record(z.unknown()).describe('Fields to update on the conversation'),
    },
    async (args) => {
      try {
        return ok(await client.app.patch(`/conversations/${args.conversation_id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_filter_conversations',
    'Filter conversations using advanced query filters.',
    {
      payload: z.array(z.object({
        attribute_key: z.string().describe('Attribute to filter on'),
        filter_operator: z.string().describe('Operator (e.g. equal_to, not_equal_to, contains, is_present)'),
        values: z.array(z.union([z.string(), z.number()])).describe('Values to match'),
        query_operator: z.string().optional().describe('Logical operator to chain filters (AND/OR)'),
      })).describe('Array of filter conditions'),
      page: z.number().optional().describe('Page number for pagination'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.page) params.page = String(args.page);
        const path = Object.keys(params).length > 0
          ? `/conversations/filter?${new URLSearchParams(params).toString()}`
          : '/conversations/filter';
        return ok(await client.app.post(path, { payload: args.payload }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_toggle_conversation_status',
    'Toggle the status of a conversation (open, resolved, pending, snoozed).',
    {
      conversation_id: z.number().describe('ID of the conversation'),
      status: z.enum(['open', 'resolved', 'pending', 'snoozed']).describe('New status for the conversation'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/conversations/${args.conversation_id}/toggle_status`, { status: args.status }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_toggle_conversation_priority',
    'Toggle the priority of a conversation (none, low, medium, high, urgent).',
    {
      conversation_id: z.number().describe('ID of the conversation'),
      priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).describe('New priority for the conversation'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/conversations/${args.conversation_id}/toggle_priority`, { priority: args.priority }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_mute_conversation',
    'Mute a conversation to stop receiving notifications.',
    {
      conversation_id: z.number().describe('ID of the conversation to mute'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/conversations/${args.conversation_id}/mute`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_unmute_conversation',
    'Unmute a conversation to resume receiving notifications.',
    {
      conversation_id: z.number().describe('ID of the conversation to unmute'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/conversations/${args.conversation_id}/unmute`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_conversation_counts',
    'Get conversation counts grouped by status and assignee type.',
    {
      status: z.enum(['open', 'resolved', 'pending', 'snoozed', 'all']).optional().describe('Filter counts by status'),
      inbox_id: z.number().optional().describe('Filter counts by inbox ID'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.status) params.status = args.status;
        if (args.inbox_id) params.inbox_id = String(args.inbox_id);
        return ok(await client.app.get('/conversations/meta', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_snooze_conversation',
    'Snooze a conversation until a specified date/time.',
    {
      conversation_id: z.number().describe('ID of the conversation to snooze'),
      snoozed_until: z.string().describe('ISO 8601 datetime string for when to unsnooze'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/conversations/${args.conversation_id}/snooze`, { snoozed_until: args.snoozed_until }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_conversation_activities',
    'Get the activity/audit log for a conversation.',
    {
      conversation_id: z.number().describe('ID of the conversation'),
      page: z.number().optional().describe('Page number for pagination'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.page) params.page = String(args.page);
        return ok(await client.app.get(`/conversations/${args.conversation_id}/activities`, params));
      } catch (e) { return formatError(e); }
    },
  );
}
