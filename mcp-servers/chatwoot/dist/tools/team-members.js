import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerTeamMemberTools({ server, client }) {
    server.tool('chatwoot_list_team_members', 'List all members of a specific team.', {
        team_id: z.number().describe('ID of the team'),
    }, async (args) => {
        try {
            return ok(await client.app.get(`/teams/${args.team_id}/team_members`));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_add_team_members', 'Add members to a team.', {
        team_id: z.number().describe('ID of the team'),
        user_ids: z.array(z.number()).describe('Array of user IDs to add to the team'),
    }, async (args) => {
        try {
            return ok(await client.app.post(`/teams/${args.team_id}/team_members`, {
                user_ids: args.user_ids,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_update_team_members', 'Update (replace) the members of a team.', {
        team_id: z.number().describe('ID of the team'),
        user_ids: z.array(z.number()).describe('Array of user IDs that will replace current team members'),
    }, async (args) => {
        try {
            return ok(await client.app.patch(`/teams/${args.team_id}/team_members`, {
                user_ids: args.user_ids,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
    server.tool('chatwoot_delete_team_members', 'Remove members from a team.', {
        team_id: z.number().describe('ID of the team'),
        user_ids: z.array(z.number()).describe('Array of user IDs to remove from the team'),
    }, async (args) => {
        try {
            return ok(await client.app.delete(`/teams/${args.team_id}/team_members`, {
                user_ids: args.user_ids,
            }));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=team-members.js.map