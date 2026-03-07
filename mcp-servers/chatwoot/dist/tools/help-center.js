import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerHelpCenterTools({ server, client }) {
    server.tool('chatwoot_list_portals', 'List all help center portals.', {}, async () => {
        try {
            return ok(await client.app.get('/portals'));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_portal', 'Create a new help center portal.', {
        name: z.string().describe('Name of the portal'),
        slug: z.string().describe('URL slug for the portal'),
        color: z.string().optional().describe('Theme color for the portal'),
        homepage_link: z.string().optional().describe('Homepage link for the portal'),
        page_title: z.string().optional().describe('Page title for the portal'),
        header_text: z.string().optional().describe('Header text for the portal'),
        config: z.record(z.unknown()).optional().describe('Additional configuration for the portal'),
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                slug: args.slug,
            };
            if (args.color !== undefined)
                body.color = args.color;
            if (args.homepage_link !== undefined)
                body.homepage_link = args.homepage_link;
            if (args.page_title !== undefined)
                body.page_title = args.page_title;
            if (args.header_text !== undefined)
                body.header_text = args.header_text;
            if (args.config !== undefined)
                body.config = args.config;
            return ok(await client.app.post('/portals', body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_get_portal', 'Get a help center portal by its slug or ID.', {
        id: z.string().describe('Portal slug or ID'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/portals/${args.id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_portal', 'Update a help center portal.', {
        id: z.string().describe('Portal slug or ID'),
        data: z.record(z.unknown()).describe('Fields to update on the portal'),
    }, async (args) => {
        try {
            return ok(await client.app.put(`/portals/${args.id}`, args.data));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_list_portal_categories', 'List categories for a help center portal.', {
        portal_id: z.string().describe('Portal slug or ID'),
        locale: z.string().optional().describe('Locale to filter categories by'),
    }, async (args) => {
        try {
            const params = {};
            if (args.locale)
                params.locale = args.locale;
            return ok(await client.app.get(`/portals/${args.portal_id}/categories`, params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_portal_category', 'Create a category in a help center portal.', {
        portal_id: z.string().describe('Portal slug or ID'),
        name: z.string().describe('Name of the category'),
        locale: z.string().describe('Locale for the category'),
        description: z.string().optional().describe('Description of the category'),
        position: z.number().optional().describe('Position/order of the category'),
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                locale: args.locale,
            };
            if (args.description !== undefined)
                body.description = args.description;
            if (args.position !== undefined)
                body.position = args.position;
            return ok(await client.app.post(`/portals/${args.portal_id}/categories`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_list_portal_articles', 'List articles in a help center portal.', {
        portal_id: z.string().describe('Portal slug or ID'),
        page: z.number().optional().describe('Page number for pagination'),
        category_slug: z.string().optional().describe('Filter articles by category slug'),
    }, async (args) => {
        try {
            const params = {};
            if (args.page)
                params.page = String(args.page);
            if (args.category_slug)
                params.category_slug = args.category_slug;
            return ok(await client.app.get(`/portals/${args.portal_id}/articles`, params));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_portal_article', 'Create an article in a help center portal.', {
        portal_id: z.string().describe('Portal slug or ID'),
        title: z.string().describe('Title of the article'),
        content: z.string().describe('Content/body of the article'),
        description: z.string().optional().describe('Short description of the article'),
        status: z.enum(['draft', 'published', 'archived']).optional().describe('Publication status of the article'),
        category_id: z.number().optional().describe('ID of the category to place the article in'),
        author_id: z.number().optional().describe('ID of the author'),
    }, async (args) => {
        try {
            const body = {
                title: args.title,
                content: args.content,
            };
            if (args.description !== undefined)
                body.description = args.description;
            if (args.status !== undefined)
                body.status = args.status;
            if (args.category_id !== undefined)
                body.category_id = args.category_id;
            if (args.author_id !== undefined)
                body.author_id = args.author_id;
            return ok(await client.app.post(`/portals/${args.portal_id}/articles`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=help-center.js.map