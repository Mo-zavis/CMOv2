#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ChatwootClient } from './client/chatwoot-client.js';
// Import all tool registration functions
import { registerAccountTools } from './tools/account.js';
import { registerConversationTools } from './tools/conversations.js';
import { registerMessageTools } from './tools/messages.js';
import { registerContactTools } from './tools/contacts.js';
import { registerContactLabelTools } from './tools/contact-labels.js';
import { registerContactNoteTools } from './tools/contact-notes.js';
import { registerConversationAssignmentTools } from './tools/conversation-assignments.js';
import { registerConversationLabelTools } from './tools/conversation-labels.js';
import { registerConversationParticipantTools } from './tools/conversation-participants.js';
import { registerDraftMessageTools } from './tools/draft-messages.js';
import { registerAgentTools } from './tools/agents.js';
import { registerTeamTools } from './tools/teams.js';
import { registerTeamMemberTools } from './tools/team-members.js';
import { registerInboxTools } from './tools/inboxes.js';
import { registerInboxMemberTools } from './tools/inbox-members.js';
import { registerLabelTools } from './tools/labels.js';
import { registerCannedResponseTools } from './tools/canned-responses.js';
import { registerCustomAttributeTools } from './tools/custom-attributes.js';
import { registerCustomFilterTools } from './tools/custom-filters.js';
import { registerAutomationRuleTools } from './tools/automation-rules.js';
import { registerMacroTools } from './tools/macros.js';
import { registerWebhookTools } from './tools/webhooks.js';
import { registerCampaignTools } from './tools/campaigns.js';
import { registerAgentBotTools } from './tools/agent-bots.js';
import { registerNotificationTools } from './tools/notifications.js';
import { registerHelpCenterTools } from './tools/help-center.js';
import { registerSearchTools } from './tools/search.js';
import { registerReportTools } from './tools/reports.js';
import { registerProfileTools } from './tools/profile.js';
// Platform
import { registerPlatformAccountTools } from './tools/platform/accounts.js';
import { registerPlatformAccountUserTools } from './tools/platform/account-users.js';
import { registerPlatformUserTools } from './tools/platform/users.js';
import { registerPlatformAgentBotTools } from './tools/platform/agent-bots.js';
// Public
import { registerPublicContactTools } from './tools/public/contacts.js';
import { registerPublicConversationTools } from './tools/public/conversations.js';
import { registerPublicMessageTools } from './tools/public/messages.js';
async function main() {
    const baseUrl = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
    const apiAccessToken = process.env.CHATWOOT_API_ACCESS_TOKEN;
    const accountId = process.env.CHATWOOT_ACCOUNT_ID;
    const platformToken = process.env.CHATWOOT_PLATFORM_API_TOKEN;
    if (!apiAccessToken) {
        console.error('CHATWOOT_API_ACCESS_TOKEN environment variable is required');
        process.exit(1);
    }
    if (!accountId) {
        console.error('CHATWOOT_ACCOUNT_ID environment variable is required');
        process.exit(1);
    }
    const client = new ChatwootClient({
        baseUrl,
        apiAccessToken,
        accountId: parseInt(accountId, 10),
        platformToken,
    });
    const server = new McpServer({
        name: 'chatwoot',
        version: '1.0.0',
    });
    const ctx = { server, client };
    // Application API tools
    registerAccountTools(ctx);
    registerConversationTools(ctx);
    registerMessageTools(ctx);
    registerContactTools(ctx);
    registerContactLabelTools(ctx);
    registerContactNoteTools(ctx);
    registerConversationAssignmentTools(ctx);
    registerConversationLabelTools(ctx);
    registerConversationParticipantTools(ctx);
    registerDraftMessageTools(ctx);
    registerAgentTools(ctx);
    registerTeamTools(ctx);
    registerTeamMemberTools(ctx);
    registerInboxTools(ctx);
    registerInboxMemberTools(ctx);
    registerLabelTools(ctx);
    registerCannedResponseTools(ctx);
    registerCustomAttributeTools(ctx);
    registerCustomFilterTools(ctx);
    registerAutomationRuleTools(ctx);
    registerMacroTools(ctx);
    registerWebhookTools(ctx);
    registerCampaignTools(ctx);
    registerAgentBotTools(ctx);
    registerNotificationTools(ctx);
    registerHelpCenterTools(ctx);
    registerSearchTools(ctx);
    registerReportTools(ctx);
    registerProfileTools(ctx);
    // Platform API tools
    registerPlatformAccountTools(ctx);
    registerPlatformAccountUserTools(ctx);
    registerPlatformUserTools(ctx);
    registerPlatformAgentBotTools(ctx);
    // Public API tools
    registerPublicContactTools(ctx);
    registerPublicConversationTools(ctx);
    registerPublicMessageTools(ctx);
    // Connect via stdio
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Chatwoot MCP server running (172 tools)');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map