import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerContactTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_contacts',
    'List contacts with pagination and sorting options.',
    {
      page: z.number().optional().describe('Page number for pagination'),
      sort: z.enum(['name', 'email', 'phone_number', 'last_activity_at', 'created_at']).optional().describe('Field to sort by'),
      include_count: z.boolean().optional().describe('Whether to include total count in response'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.page) params.page = String(args.page);
        if (args.sort) params.sort = args.sort;
        if (args.include_count !== undefined) params.include_count = String(args.include_count);
        return ok(await client.app.get('/contacts', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_contact',
    'Create a new contact.',
    {
      name: z.string().optional().describe('Name of the contact'),
      email: z.string().optional().describe('Email address of the contact'),
      phone_number: z.string().optional().describe('Phone number of the contact'),
      identifier: z.string().optional().describe('External identifier for the contact'),
      custom_attributes: z.record(z.unknown()).optional().describe('Custom attributes for the contact'),
      avatar_url: z.string().optional().describe('URL of the contact avatar'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.email !== undefined) body.email = args.email;
        if (args.phone_number !== undefined) body.phone_number = args.phone_number;
        if (args.identifier !== undefined) body.identifier = args.identifier;
        if (args.custom_attributes !== undefined) body.custom_attributes = args.custom_attributes;
        if (args.avatar_url !== undefined) body.avatar_url = args.avatar_url;
        return ok(await client.app.post('/contacts', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_contact',
    'Get a single contact by ID.',
    {
      id: z.number().describe('ID of the contact to retrieve'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/contacts/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_contact',
    'Update a contact by ID.',
    {
      id: z.number().describe('ID of the contact to update'),
      data: z.record(z.unknown()).describe('Fields to update on the contact'),
    },
    async (args) => {
      try {
        return ok(await client.app.put(`/contacts/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_contact',
    'Delete a contact by ID.',
    {
      id: z.number().describe('ID of the contact to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/contacts/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_search_contacts',
    'Search contacts by name, email, phone number, or identifier.',
    {
      q: z.string().describe('Search query string'),
      page: z.number().optional().describe('Page number for pagination'),
      sort: z.string().optional().describe('Field to sort by'),
      include_count: z.boolean().optional().describe('Whether to include total count in response'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = { q: args.q };
        if (args.page) params.page = String(args.page);
        if (args.sort) params.sort = args.sort;
        if (args.include_count !== undefined) params.include_count = String(args.include_count);
        return ok(await client.app.get('/contacts/search', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_filter_contacts',
    'Filter contacts using advanced query filters.',
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
          ? `/contacts/filter?${new URLSearchParams(params).toString()}`
          : '/contacts/filter';
        return ok(await client.app.post(path, { payload: args.payload }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_import_contacts',
    'Import contacts from a JSON array.',
    {
      contacts: z.array(z.record(z.unknown())).describe('Array of contact objects to import'),
    },
    async (args) => {
      try {
        return ok(await client.app.post('/contacts/import', { contacts: args.contacts }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_merge_contacts',
    'Merge a contact into another (base) contact.',
    {
      id: z.number().describe('ID of the base contact to merge into'),
      mergee_id: z.number().describe('ID of the contact to merge (will be removed)'),
    },
    async (args) => {
      try {
        return ok(await client.app.post(`/contacts/${args.id}/contact_merge`, { mergee_id: args.mergee_id }));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_list_contact_conversations',
    'List all conversations for a specific contact.',
    {
      id: z.number().describe('ID of the contact'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/contacts/${args.id}/conversations`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_list_contactable_inboxes',
    'List inboxes that are available for a specific contact.',
    {
      id: z.number().describe('ID of the contact'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/contacts/${args.id}/contactable_inboxes`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_contact_activities',
    'Get the activity log for a specific contact.',
    {
      id: z.number().describe('ID of the contact'),
      page: z.number().optional().describe('Page number for pagination'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.page) params.page = String(args.page);
        return ok(await client.app.get(`/contacts/${args.id}/activities`, params));
      } catch (e) { return formatError(e); }
    },
  );
}
