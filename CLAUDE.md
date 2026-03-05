# Zavis CMO — Runtime Environment

This is the AI-powered CMO (Chief Marketing Officer) system for **Zavis**, an AI-powered Patient Engagement Platform for Healthcare.

## Architecture

Two isolated systems sharing a database + filesystem:

1. **Runtime** (this VS Code + Claude Code session) — generates assets using skills, writes to DB + filesystem
2. **Dashboard** (`/dashboard/`) — Next.js web app, reads from DB + filesystem, displays outputs, captures human feedback

They share:
- **SQLite DB** at `/dashboard/prisma/dev.db` (Prisma ORM)
- **Asset files** at `/assets/` (images, copy, videos, ads, social, emails)

## DB-Writer Script

Write to the shared database using:
```bash
npx tsx scripts/db-writer.ts <command> [flags]
```

Commands:
- `seed-project` — Create the Zavis project record
- `create-asset --type <type> --title <title> [--platform <p>] [--subtype <s>] [--filePath <f>] [--content <c>] [--metadata <json>]`
- `add-version --assetId <id> [--filePath <f>] [--content <c>] [--changelog <text>] [--metadata <json>]`
- `add-brand-check --assetId <id> --version <n> --checkType <type> --details <json> [--score <n>] [--passed true|false]`
- `read-feedback [--assetId <id>]` — Read unactioned human feedback
- `mark-feedback-actioned --feedbackId <id> [--actionTaken <text>] [--resultVersionId <id>]`

## Asset Types
- `image` — Generated images (Nano Banana / Zavis Creative Director)
- `copy` — Written content (blog posts, ad copy, landing pages, captions)
- `video` — Video projects (Remotion + Veo 3)
- `ad_creative` — Ad creatives (paired image + copy for Google/Meta)
- `social_post` — Social media posts
- `email` — Email campaigns

## Asset File Structure
```
/assets/{type}/{assetId}/v{n}.{ext}
```
Example: `/assets/images/clxyz123/v1.png`

## Status Flow
```
DRAFT → IN_REVIEW → APPROVED → PUBLISHED
                  → REVISION_REQUESTED → DRAFT (new version)
```

## Skills Directory
41 skills in `/skills/` — see individual SKILL.md files for each.

Key skills for Phase 1:
- `nano-banana` — Image generation via Gemini API
- `zavis-creative-director` — Brand-governed image generation + QA
- `content-writer` — Blog posts, ad copy, landing pages, captions
- `zavis-master` — Brand context, positioning, rules
- `zavis-designer` — Visual design system

## Dashboard
```bash
cd dashboard && npm run dev  # Starts at localhost:3000
```

## Brand Rules (Always Apply)
- No em dashes — use periods, commas, semicolons
- No emojis
- No negative framing in headlines
- Use "patient" not "customer"
- Every piece connects to a pillar: Increase Revenue, Reduce No-Shows, or Patient Satisfaction
- Colors: Off-White #f8f8f6, Off-Black #1c1c1c, Zavis Green #006828
- Fonts: Bricolage Grotesque (headings), Geist (body)
