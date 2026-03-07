import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerNotificationTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_notifications',
    'List notifications with optional pagination.',
    {
      page: z.number().optional().describe('Page number for pagination'),
      includes_count: z.boolean().optional().describe('Whether to include total count in the response'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.page) params.page = String(args.page);
        if (args.includes_count !== undefined) params.includes_count = String(args.includes_count);
        return ok(await client.app.get('/notifications', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_notification',
    'Mark a notification as read or unread.',
    {
      id: z.number().describe('ID of the notification'),
      read_at: z.string().optional().describe('ISO 8601 datetime to mark as read, or null to mark as unread'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.read_at !== undefined) body.read_at = args.read_at;
        return ok(await client.app.put(`/notifications/${args.id}`, body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_notification',
    'Delete a notification.',
    {
      id: z.number().describe('ID of the notification to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/notifications/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_read_all_notifications',
    'Mark all notifications as read.',
    {},
    async () => {
      try {
        return ok(await client.app.post('/notifications/read_all'));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_unread_notification_count',
    'Get the count of unread notifications.',
    {},
    async () => {
      try {
        return ok(await client.app.get('/notifications/unread_count'));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_all_notifications',
    'Delete all notifications.',
    {},
    async () => {
      try {
        return ok(await client.app.post('/notifications/destroy_all'));
      } catch (e) { return formatError(e); }
    },
  );
}
