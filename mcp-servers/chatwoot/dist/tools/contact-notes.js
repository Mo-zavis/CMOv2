import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerContactNoteTools({ server, client }) {
    server.tool('chatwoot_list_contact_notes', 'List all notes on a contact.', {
        contact_id: z.number().describe('ID of the contact'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/contacts/${args.contact_id}/notes`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_create_contact_note', 'Create a new note on a contact.', {
        contact_id: z.number().describe('ID of the contact'),
        content: z.string().describe('Content of the note'),
    }, async (args) => {
        try {
            return ok(await client.app.post(`/contacts/${args.contact_id}/notes`, { content: args.content }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_contact_note', 'Update an existing note on a contact.', {
        contact_id: z.number().describe('ID of the contact'),
        note_id: z.number().describe('ID of the note to update'),
        content: z.string().describe('New content for the note'),
    }, async (args) => {
        try {
            return ok(await client.app.put(`/contacts/${args.contact_id}/notes/${args.note_id}`, { content: args.content }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_contact_note', 'Delete a note from a contact.', {
        contact_id: z.number().describe('ID of the contact'),
        note_id: z.number().describe('ID of the note to delete'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/contacts/${args.contact_id}/notes/${args.note_id}`));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=contact-notes.js.map