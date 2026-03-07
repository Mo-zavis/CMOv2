import { z } from 'zod';
import { formatError, ok } from '../utils/errors.js';
export function registerConversationAssignmentTools({ server, client }) {
    server.tool('chatwoot_assign_conversation', 'Assign a conversation to an agent and/or team.', {
        conversation_id: z.number().describe('ID of the conversation to assign'),
        assignee_id: z.number().optional().describe('ID of the agent to assign'),
        team_id: z.number().optional().describe('ID of the team to assign'),
    }, async (args) => {
        try {
            const body = {};
            if (args.assignee_id !== undefined)
                body.assignee_id = args.assignee_id;
            if (args.team_id !== undefined)
                body.team_id = args.team_id;
            return ok(await client.app.post(`/conversations/${args.conversation_id}/assignments`, body));
        }
        catch (e) {
            return formatError(e);
        }
    });
}
//# sourceMappingURL=conversation-assignments.js.map