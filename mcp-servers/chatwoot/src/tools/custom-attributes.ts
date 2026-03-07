import { z } from 'zod';
import type { ToolContext } from './_context.js';
import { formatError, ok } from '../utils/errors.js';

export function registerCustomAttributeTools({ server, client }: ToolContext): void {
  server.tool(
    'chatwoot_list_custom_attributes',
    'List custom attribute definitions, optionally filtered by model type.',
    {
      attribute_model: z.enum(['conversation_attribute', 'contact_attribute']).optional().describe('Filter by attribute model type'),
    },
    async (args) => {
      try {
        const params: Record<string, string> = {};
        if (args.attribute_model) params.attribute_model = args.attribute_model;
        return ok(await client.app.get('/custom_attribute_definitions', params));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_create_custom_attribute',
    'Create a new custom attribute definition.',
    {
      attribute_display_name: z.string().describe('Display name for the attribute'),
      attribute_display_type: z.enum(['text', 'number', 'currency', 'percent', 'link', 'date', 'list', 'checkbox']).describe('Display type of the attribute'),
      attribute_model: z.enum(['conversation_attribute', 'contact_attribute']).describe('Model the attribute applies to'),
      attribute_key: z.string().describe('Unique key for the attribute'),
      attribute_description: z.string().optional().describe('Description of the attribute'),
      attribute_values: z.array(z.string()).optional().describe('Allowed values (for list type)'),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          attribute_display_name: args.attribute_display_name,
          attribute_display_type: args.attribute_display_type,
          attribute_model: args.attribute_model,
          attribute_key: args.attribute_key,
        };
        if (args.attribute_description !== undefined) body.attribute_description = args.attribute_description;
        if (args.attribute_values !== undefined) body.attribute_values = args.attribute_values;
        return ok(await client.app.post('/custom_attribute_definitions', body));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_get_custom_attribute',
    'Get a custom attribute definition by ID.',
    {
      id: z.number().describe('ID of the custom attribute definition'),
    },
    async (args) => {
      try {
        return ok(await client.app.get(`/custom_attribute_definitions/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_update_custom_attribute',
    'Update a custom attribute definition.',
    {
      id: z.number().describe('ID of the custom attribute definition to update'),
      data: z.record(z.unknown()).describe('Fields to update on the custom attribute definition'),
    },
    async (args) => {
      try {
        return ok(await client.app.put(`/custom_attribute_definitions/${args.id}`, args.data));
      } catch (e) { return formatError(e); }
    },
  );

  server.tool(
    'chatwoot_delete_custom_attribute',
    'Delete a custom attribute definition.',
    {
      id: z.number().describe('ID of the custom attribute definition to delete'),
    },
    async (args) => {
      try {
        return ok(await client.app.delete(`/custom_attribute_definitions/${args.id}`));
      } catch (e) { return formatError(e); }
    },
  );
}
