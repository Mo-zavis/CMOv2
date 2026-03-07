# Zavis CMO - System Status & Capabilities

**Last Updated:** March 7, 2026

AI-powered Chief Marketing Officer system for Zavis, a healthcare patient engagement platform. Two-layer architecture: Claude Code (runtime) generates assets, Next.js dashboard (feedback layer) displays them for human review.

---

## Table of Contents

0. [Core Operating Principle](#0-core-operating-principle)
1. [Capabilities](#1-capabilities)
2. [Integrations & APIs](#2-integrations--apis)
3. [MCP Servers](#3-mcp-servers)
4. [Workflows](#4-workflows)
5. [Tech Stack](#5-tech-stack)
6. [Database Models](#6-database-models)
7. [Skills (41 Total)](#7-skills-41-total)
8. [Scripts & CLI Tools](#8-scripts--cli-tools)
9. [Dashboard Pages](#9-dashboard-pages)
10. [File Map](#10-file-map)
11. [Credentials & Environment Variables](#11-credentials--environment-variables)
12. [What Is Working Today](#12-what-is-working-today)
13. [What Needs Setup](#13-what-needs-setup)
14. [What Is Planned](#14-what-is-planned)

---

## 0. Core Operating Principle

**Marketing Power = (Total Range of Distribution x Weight of Content) ^ Value of Brand**

Every CMO decision is evaluated against this formula.

- **Range of Distribution**: Total touchpoints where Zavis appears. Owned (website, blog, social), paid (Google/Meta/LinkedIn Ads), earned (PR, press, podcasts), community (forums, founder accounts), events (conferences, expos, networking).
- **Weight of Content**: Credibility and persuasive power. Doctor testimonials > case studies with metrics > founder thought leadership > expert interviews > generic product posts.
- **Value of Brand**: The exponential multiplier. Consistent identity, messaging on three pillars, market positioning as AI-native patient engagement, trust signals. Compounds over time.

**Event Strategy**: The CMO tracks UAE/GCC healthcare events (conferences, expos, healthtech meetups, government digitization initiatives) and recommends which to attend, speak at, or sponsor based on audience overlap with Zavis target market.

---

## 1. Capabilities

| # | Capability | Status | Description |
|---|-----------|--------|-------------|
| 1 | Image Generation | WORKING | Generate brand-compliant marketing images via Gemini API. 4-lens brand QA scoring. Models: gemini-2.5-flash-image, gemini-3-pro-image-preview, gemini-3.1-flash-image-preview, imagen-4.0-ultra-generate-001 |
| 2 | Video Production | WORKING | Scene-by-scene video workflow. Veo 3 for AI generation, Remotion for React-based composition, FFmpeg for assembly. Models: veo-3.0-generate-001, veo-3.0-fast-generate-001, veo-3.1-generate-preview, veo-3.1-fast-generate-preview |
| 3 | Content Writing | WORKING | Blog posts, ad copy, landing pages, social captions. Brand voice compliance built in. SEO and AIO optimization. |
| 4 | Ad Campaign Management | WORKING (scripts built, APIs need credentials) | Full campaign lifecycle: targeting, bidding, creative pairing, performance tracking. Google Ads REST API v18, Meta Ads API v21. |
| 5 | Social Media Publishing | WORKING (Postiz needs platform OAuth) | Schedule and publish across 20+ platforms via self-hosted Postiz. Platform-specific formatting. |
| 6 | Brand Compliance | WORKING | Automated 4-lens brand QA for every image. Copy compliance checks for written content. Scores stored in DB. |
| 7 | Feedback & Approval | WORKING | Human-in-the-loop review. Approve, request revision, or provide feedback. Version timeline preserved. |
| 8 | Campaign Targeting | WORKING | Audience segments, locations, age ranges, job titles, industries, keywords, ad groups with bid strategies. |
| 9 | Agentic Optimization Loops | WORKING | Self-improving loops: ads (6 phases), content/SEO (6), social (5), email (5), cross-channel (3). Autonomous monitoring and optimization. |
| 10 | Calendar Management | WORKING | Content calendar with scheduled events across channels. |
| 11 | Analytics & Reporting | WORKING (needs API credentials for live data) | North star metrics, channel performance aggregation, optimization decisions. |
| 12 | Email Marketing | PLANNED | Campaign creation, segmentation, HTML templates, A/B testing via Plunk. |
| 13 | Research Layer | WORKING | Mandatory research briefs before campaign decisions. Market, competitor, audience, channel, content, performance, and industry research with findings, confidence scores, and decision linking. |
| 14 | Daily Standups | WORKING | Scheduled alignment sessions. Claude surfaces what was done, what is planned, blockers, permissions needed, and dependencies. Human reviews and responds. |
| 15 | Progress Tracking | WORKING | Session-level progress logs capturing decisions, assets created, loops advanced, blockers, and next steps. |
| 16 | Event Strategy | WORKING | Track UAE/GCC healthcare events (conferences, expos, meetups). Evaluate audience overlap, networking value, speaking/sponsorship opportunities. |
| 17 | Macro/Micro Cycles | WORKING | Nested cyclic processes. Macro loops (campaign lifecycle) contain micro loops (creative iteration, bid optimization). Loops reference parent loops. |

---

## 2. Integrations & APIs

### Direct APIs (called by scripts/skills)

| Service | Status | What It Does | Credentials Location | Required Keys |
|---------|--------|-------------|---------------------|---------------|
| Gemini API | CONNECTED | Image generation, video generation | dashboard/.env | GEMINI_API_KEY |
| Google Ads API | NEEDS SETUP | Campaign management, bidding, keyword targeting, performance reporting | dashboard/.env | GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_LOGIN_CUSTOMER_ID |
| Meta Ads API | NEEDS SETUP | Facebook/Instagram ad campaign management, audience targeting | dashboard/.env | META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN, META_AD_ACCOUNT_ID |
| Postiz API | CONFIGURED (needs platform OAuth) | Social media scheduling and publishing | dashboard/.env + docker/postiz.env | POSTIZ_API_URL, POSTIZ_API_KEY, plus social platform OAuth keys in docker/postiz.env |

### Self-Hosted Services

| Service | Status | What It Does | How to Start |
|---------|--------|-------------|-------------|
| Postiz | CONFIGURED | Social media scheduling. 3 Docker containers: app (port 4007), PostgreSQL, Redis | cd docker && docker compose -f docker-compose.postiz.yml up -d |

### Local Runtimes

| Tool | Status | What It Does |
|------|--------|-------------|
| Remotion 4.0.261 | INSTALLED | React-based video composition |
| FFmpeg | INSTALLED | Video processing, clip concatenation, frame extraction |
| Python 3 + google-genai SDK | INSTALLED | Image and video generation scripts |
| Prisma 5.22.0 + SQLite | INSTALLED | Database ORM and local database |

---

## 3. MCP Servers

All configured in `.mcp.json` at project root. When this project is cloned, these are available to any Claude Code user automatically.

| # | Server | Type | Status | Install Method | Required Credentials |
|---|--------|------|--------|---------------|---------------------|
| 1 | Figma | HTTP | READY (no setup needed) | Auto-connects to mcp.figma.com | None (uses Figma desktop auth) |
| 2 | Screenshot | stdio | READY (no setup needed) | uvx (auto-installs) | None |
| 3 | Chrome DevTools | stdio | READY (no setup needed) | npx chrome-devtools-mcp | None |
| 4 | Twenty CRM | stdio | NEEDS CREDENTIALS | Bundled in mcp-servers/twenty/ | TWENTY_API_KEY, TWENTY_BASE_URL |
| 5 | Chatwoot | stdio | NEEDS CREDENTIALS | Bundled in mcp-servers/chatwoot/ | CHATWOOT_BASE_URL, CHATWOOT_API_ACCESS_TOKEN, CHATWOOT_ACCOUNT_ID |
| 6 | Google Search Console | stdio | NEEDS CREDENTIALS | npx mcp-server-gsc | GOOGLE_APPLICATION_CREDENTIALS (service account JSON file) |
| 7 | Google Analytics | stdio | NEEDS CREDENTIALS | npx mcp-server-google-analytics | GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GA_PROPERTY_ID |
| 8 | Meta Ads | stdio | NEEDS CREDENTIALS | uvx meta-ads-mcp | META_ACCESS_TOKEN, META_AD_ACCOUNT_ID |

**Note:** Figma, Screenshot, and Chrome DevTools work immediately with no setup. The other 5 need credentials filled in the `.mcp.json` env fields.

---

## 4. Workflows

### 4.1 Image Creation Pipeline (WORKING)

```
You provide a brief
    |
    v
Claude activates zavis-creative-director skill
    |
    v
Python script calls Gemini API (generate_image.py)
    |
    v
Image saved to /assets/images/{assetId}/v{n}.png
    |
    v
4-lens brand QA scoring (colors, typography, composition, messaging)
    |
    v
db-writer creates asset record in SQLite (status: DRAFT)
    |
    v
Dashboard shows image in Images section
    |
    v
Human reviews: Approve / Request Revision / Publish
    |
    v
If revision requested: Claude reads feedback, generates v2, cycle repeats
```

### 4.2 Video Production Pipeline (WORKING)

```
Script planning (scene descriptions, durations)
    |
    v
Scene-by-scene Veo 3 generation (generate_video_clip.py)
    |
    v
Frame extraction for continuity between scenes
    |
    v
Remotion composition (React-based video assembly)
    |
    v
FFmpeg final assembly and encoding
    |
    v
Video saved to /assets/videos/{assetId}/v{n}.mp4
    |
    v
db-writer creates asset record (status: DRAFT)
    |
    v
Dashboard review and feedback loop
```

### 4.3 Content Writing Pipeline (WORKING)

```
Campaign brief or topic
    |
    v
Claude activates content-writer skill
    |
    v
Brand voice compliance applied automatically
    |
    v
SEO/AIO optimization
    |
    v
Content saved to /assets/copy/{assetId}/v{n}.md
    |
    v
db-writer creates asset record (status: DRAFT)
    |
    v
Dashboard review and feedback loop
```

### 4.4 Ad Campaign Pipeline - Agentic Loop (WORKING, needs API credentials for deploy/monitor)

```
Phase 1: RESEARCH
    Market analysis, competitor review, audience research
    |
    v
Phase 2: PLAN
    Campaign strategy, targeting, messaging framework, budget allocation
    |
    v
Phase 3: CREATE
    Ad creative pairing (image + copy), platform-specific formatting
    |
    v
Phase 4: DEPLOY
    Push campaigns to Google Ads / Meta Ads via API
    |
    v
Phase 5: MONITOR
    Pull performance metrics (impressions, clicks, conversions, CPA)
    |
    v
Phase 6: OPTIMIZE
    AI analyzes performance, recommends bid/targeting/creative changes
    |
    v
    Cycle repeats from Phase 5 or Phase 3
```

Run with: `npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase research`

### 4.5 Social Publishing Pipeline (WORKING, needs Postiz platform OAuth)

```
Content + Image ready
    |
    v
Claude activates social-publisher skill
    |
    v
Platform-specific caption formatting (LinkedIn, Instagram, X, etc.)
    |
    v
Postiz scheduling via postiz-client.ts CLI
    |
    v
Distribution to connected social accounts
    |
    v
Engagement tracking
```

### 4.6 Feedback Loop (WORKING)

```
Asset appears in Dashboard (any type)
    |
    v
Human reviews in Dashboard UI
    |
    v
Feedback submitted via FeedbackPanel component
    |
    v
Stored in Feedback table in SQLite DB
    |
    v
Claude reads: npx tsx scripts/db-writer.ts read-feedback
    |
    v
Claude generates new version (v2, v3, etc.)
    |
    v
Version timeline updated, cycle repeats until approved
```

### 4.7 Email Campaign Pipeline (PLANNED)

```
Segment definition
    |
    v
Template creation (HTML)
    |
    v
Content personalization
    |
    v
A/B variant setup
    |
    v
Send via Plunk API
    |
    v
Track opens/clicks
    |
    v
Optimize subject lines, send times, content
```

---

## 5. Tech Stack

### AI and Generation

| Technology | Version/Model | Purpose |
|-----------|--------------|---------|
| Claude Opus 4 | Agent SDK | Core AI runtime, 41 skills, orchestrates all workflows |
| Gemini API | gemini-2.5-flash-image | Primary image generation model |
| Gemini API | gemini-3-pro-image-preview | Alternative image model |
| Gemini API | gemini-3.1-flash-image-preview | Alternative image model |
| Gemini API | imagen-4.0-ultra-generate-001 | High-quality image model |
| Veo 3 API | veo-3.0-generate-001 | Primary video generation model |
| Veo 3 API | veo-3.0-fast-generate-001 | Fast video generation |
| Veo 3 API | veo-3.1-generate-preview | Next-gen video model |
| Veo 3 API | veo-3.1-fast-generate-preview | Next-gen fast video model |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.6 | App Router, server/client components |
| React | 19 | UI framework |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | latest | Component library (Card, Badge, Tabs, Button, Dialog, etc.) |

### Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| SQLite | file-based | Local database at dashboard/prisma/dev.db |
| Prisma | 5.22.0 | ORM with 10+ models |

### Backend and Scripts

| Technology | Purpose |
|-----------|---------|
| TypeScript (tsx) | All CLI scripts and pipeline runners |
| Python 3 | Image generation, video generation, frame extraction, voiceover |
| db-writer.ts | 17+ CLI commands for database operations |

### Video

| Technology | Version | Purpose |
|-----------|---------|---------|
| Remotion | 4.0.261 | React-based video composition |
| FFmpeg | system | Video processing, concatenation, frame extraction |

### Distribution

| Technology | Purpose |
|-----------|---------|
| Postiz | Social media scheduling (20+ platforms, Docker) |
| Google Ads REST API | v18, campaign management |
| Meta Ads API | v21, Facebook/Instagram ads |
| Plunk | Email marketing (planned) |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| Docker + Colima | Container runtime (macOS 13 Ventura) |
| Git | Version control |
| Node.js 20 | JavaScript runtime |

---

## 6. Database Models

Schema at `dashboard/prisma/schema.prisma`.

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| Project | Top-level project (Zavis) | name, description |
| Asset | Any generated asset | type (image/copy/video/ad_creative/social_post/email), title, status, platform, currentVersion |
| AssetVersion | Versioned output for an asset | version number, filePath, content, metadata JSON, changelog |
| Feedback | Human feedback on assets | comment, rating, category, actioned flag |
| ApprovalAction | Status transitions | fromStatus, toStatus, actor |
| BrandCheck | Brand compliance scores | checkType, score, passed, details JSON |
| Campaign | Marketing campaigns | name, targeting JSON, northStarTarget, northStarActual |
| AdGroup | Ad groups within campaigns | name, keywords, bidStrategy, targeting JSON |
| AdCreative | Paired image + copy for ads | headline, description, imageAssetId, copyAssetId |
| CalendarEvent | Scheduled content | date, assetId, platform |
| LoopExecution | Agentic optimization loops | loopType, currentPhase, cycleCount |
| LoopPhaseLog | Phase execution history | phase, status, durationMs, output JSON |
| MetricSnapshot | Performance metrics | channel, metric, value, timestamp |
| OptimizationDecision | AI optimization recommendations | type, rationale, impact, applied flag |
| ResearchArtifact | Research phase outputs | artifactType, content JSON |
| ResearchBrief | Research questions that must be answered before decisions | briefType, question, status, findings, confidence, sources, expiresAt, linkedDecisionId |
| StandupSession | Scheduled alignment sessions | sessionDate, status (PENDING/ACTIVE/AWAITING_RESPONSE/COMPLETED), summary |
| StandupItem | Individual items within a standup | category (DONE/PLANNED/BLOCKED/PERMISSION/DEPENDENCY/INSIGHT/RESEARCH_NEEDED), content, priority, response, resolved |
| ProgressLog | Session-level progress tracking | sessionType, summary, decisions, assetsCreated, loopsAdvanced, blockers, nextSteps |
| EventOpportunity | Industry events to track and attend | name, eventType, location, region, relevanceScore, audienceOverlap, opportunities, strategy, status, outcome |

---

## 7. Skills (41 Total)

Located in `/skills/`. Each has a SKILL.md with triggers, tools, workflows, and constraints.

### Core Marketing Skills

| Skill | Purpose |
|-------|---------|
| zavis-master | Brand context, positioning, 3-pillar framework, rules |
| zavis-designer | Visual design system (colors, fonts, spacing) |
| zavis-creative-director | Brand-governed image generation with QA scoring |
| content-writer | Blog posts, ad copy, landing pages, captions |
| nano-banana | Image generation via Gemini API |
| video-producer | Remotion + Veo 3 + FFmpeg video pipeline |
| social-publisher | Platform-specific formatting and scheduling |
| email-marketer | Email campaigns, segmentation, templates |
| ad-manager | Ad creative pairing and campaign setup |
| aeo-optimizer | Search engine optimization |
| analytics-reporter | Performance reporting across channels |

### Plugin and Automation Skills

| Skill | Purpose |
|-------|---------|
| ao-agent-development | Building custom Claude Code agents |
| ao-hook-development | Event-driven automation hooks |
| ao-command-development | Custom slash commands |
| ao-skill-development | Creating new skills |
| ao-skill-creator | Skill framework and evals |
| ao-plugin-structure | Plugin directory layout |
| ao-plugin-settings | Plugin configuration |
| ao-mcp-integration | MCP server setup |
| ao-mcp-builder | Building MCP servers |
| ao-claude-md-improver | CLAUDE.md maintenance |
| ao-claude-automation-recommender | Automation recommendations |
| ao-writing-rules | Hookify rule configuration |

### Content and Design Skills

| Skill | Purpose |
|-------|---------|
| ao-frontend-design | Production-grade UI design |
| ao-web-artifacts-builder | Multi-component HTML artifacts |
| ao-canvas-design | Visual art in PNG/PDF |
| ao-algorithmic-art | Generative art with p5.js |
| ao-brand-guidelines | Anthropic brand application |
| ao-playground | Interactive HTML playgrounds |
| ao-doc-coauthoring | Documentation co-authoring |
| ao-internal-comms | Internal communications |
| ao-theme-factory | Theme styling for artifacts |
| ao-slack-gif-creator | Animated GIFs for messaging |

### Document and File Skills

| Skill | Purpose |
|-------|---------|
| ao-docx | Word document creation/editing |
| ao-pdf | PDF manipulation |
| ao-pptx | PowerPoint presentations |
| ao-xlsx | Spreadsheet operations |

### Other Skills

| Skill | Purpose |
|-------|---------|
| ao-webapp-testing | Playwright browser testing |
| remotion-best-practices | Remotion video best practices |
| claude-developer-platform | Claude API/SDK development |
| fsp-knowledge-graph | FSP Knowledge Graph |

---

## 8. Scripts & CLI Tools

### Database Writer (primary CLI)

```
npx tsx scripts/db-writer.ts <command> [flags]
```

| Command | Purpose |
|---------|---------|
| seed-project | Create the Zavis project record |
| create-asset | Create a new asset (--type, --title, --platform, --filePath, --content, --metadata) |
| add-version | Add a version to an asset (--assetId, --filePath, --content, --changelog) |
| add-brand-check | Add brand compliance score (--assetId, --version, --checkType, --details) |
| read-feedback | Read unactioned human feedback (--assetId optional) |
| mark-feedback-actioned | Mark feedback as handled (--feedbackId, --actionTaken) |
| create-loop | Create an agentic loop execution |
| advance-loop | Move loop to next phase |
| record-metric | Store a performance metric snapshot |
| record-optimization | Create an optimization decision |
| apply-optimization | Mark optimization as applied |
| measure-optimization | Record optimization outcome |
| create-research | Store research artifact |
| update-north-star | Update campaign north star metrics |
| loop-status | Get current loop status |
| metrics-summary | Get metrics summary for a channel |
| create-research-brief | Create a research question that must be answered (--briefType, --question) |
| update-research-brief | Update research findings, status, confidence (--briefId, --status, --findings) |
| list-research-briefs | List research briefs with filters (--campaignId, --status, --briefType) |
| create-standup | Create a new standup session |
| add-standup-item | Add item to standup (--standupId, --category, --content, --priority) |
| respond-standup-item | Respond to a standup item (--itemId, --response) |
| complete-standup | Complete a standup session (--standupId, --summary) |
| list-standups | List standup sessions (--status, --limit) |
| log-progress | Log session progress (--sessionType, --summary, --decisions, --blockers, --nextSteps) |
| list-progress | List progress logs (--sessionType, --days, --limit) |

### Generation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| scripts/generate_video_clip.py | Veo 3 video generation | python generate_video_clip.py --prompt "..." --output /path/to/clip.mp4 |
| skills/zavis-creative-director/scripts/generate_image.py | Gemini image generation | python generate_image.py --prompt "..." --output /path/to/image.png |
| scripts/extract_end_frame.py | Extract last frame from video | For scene continuity |
| scripts/generate_voiceover.py | Text-to-speech voiceover | For video narration |
| scripts/concat_video.sh | FFmpeg video concatenation | Merge multiple clips |

### Integration CLIs

| Script | Purpose | Usage |
|--------|---------|-------|
| scripts/postiz-client.ts | Postiz social media API | npx tsx scripts/postiz-client.ts list-integrations |
| scripts/google-ads-client.ts | Google Ads API | npx tsx scripts/google-ads-client.ts list-campaigns |
| scripts/meta-ads-client.ts | Meta Ads API | npx tsx scripts/meta-ads-client.ts list-campaigns |
| scripts/google-ads-setup.ts | Google Ads credential setup | npx tsx scripts/google-ads-setup.ts |

### Pipeline Runner

| Script | Purpose | Usage |
|--------|---------|-------|
| scripts/pipelines/loop-runner.ts | Agentic loop orchestrator | npx tsx scripts/pipelines/loop-runner.ts --loopType ads --campaignId <id> --phase research |
| scripts/pipelines/ads-research.ts | Ads loop: research phase | Called by loop-runner |
| scripts/pipelines/ads-plan.ts | Ads loop: planning phase | Called by loop-runner |
| scripts/pipelines/ads-create.ts | Ads loop: creation phase | Called by loop-runner |
| scripts/pipelines/ads-deploy.ts | Ads loop: deployment phase | Called by loop-runner |
| scripts/pipelines/ads-monitor.ts | Ads loop: monitoring phase | Called by loop-runner |
| scripts/pipelines/ads-optimize.ts | Ads loop: optimization phase | Called by loop-runner |

---

## 9. Dashboard Pages

All at `dashboard/src/app/`.

| Route | Page | Purpose |
|-------|------|---------|
| / | Hub | Onboarding guide, system overview, how-it-works flow |
| /command-center | Command Center | North star metrics, active loops, channel performance, optimizations |
| /images | Images | Browse and manage generated images |
| /images/[id] | Image Detail | Version timeline, brand QA scores, feedback panel, approval bar |
| /content | Content | Browse and manage written content |
| /content/[id] | Content Detail | Full text view, versions, feedback |
| /videos | Videos | Browse video projects |
| /videos/[id] | Video Detail | Scene breakdown, versions, feedback |
| /ads | Ads | Ad creative management, campaign pairing |
| /ads/[id] | Ad Detail | Creative preview, targeting, performance |
| /social | Social | Postiz integration, connected platforms, scheduled posts |
| /social/[id] | Social Detail | Post preview, engagement metrics |
| /emails | Email | Email campaign management |
| /emails/[id] | Email Detail | Template preview, send history |
| /campaigns | Campaigns | Campaign planning, targeting, ad groups, budgets |
| /campaigns/[id] | Campaign Detail | Full campaign view with all ad groups and creatives |
| /calendar | Calendar | Content calendar grid view |
| /loops | Loops | Agentic optimization loop monitoring |
| /library | Library | Unified search across all asset types |
| /ecosystem | Ecosystem | Interactive SVG architecture diagram |
| /skills | Skill Map | All 41 skills organized by category |
| /status | System Status | Capabilities, integrations, workflows, tech stack (React page) |
| /standups | Standups | Daily alignment sessions timeline, item responses |

---

## 10. File Map

```
CMOv2/
|
|-- CLAUDE.md                    Project instructions for Claude Code
|-- STATUS.md                    THIS FILE. Full system documentation.
|-- .mcp.json                    MCP server configs (9 servers, shared with team)
|
|-- dashboard/                   Next.js 16 dashboard application
|   |-- .env                     API keys (GEMINI_API_KEY, Google Ads, Meta Ads, Postiz)
|   |-- .env.production          Production overrides (static data mode)
|   |-- prisma/
|   |   |-- schema.prisma        Database schema (15+ models)
|   |   |-- dev.db               SQLite database file
|   |-- src/
|   |   |-- app/                 All page routes (20+ pages)
|   |   |-- components/
|   |   |   |-- ui/              shadcn/ui components (Card, Badge, Tabs, Button, etc.)
|   |   |   |-- shared/          Reusable components (AssetCard, VersionTimeline, FeedbackPanel, ApprovalBar, StatusBadge, BrandCheckReport)
|   |   |   |-- layout/          DashboardShell, Sidebar, TopBar
|   |   |   |-- calendar/        CalendarGrid, CalendarDayCell
|   |   |-- lib/
|   |       |-- db.ts            Prisma client singleton
|   |       |-- status-machine.ts Status transitions and validation
|   |       |-- postiz.ts        Postiz API client (server-side)
|   |       |-- google-ads.ts    Google Ads API client
|   |       |-- meta-ads.ts      Meta Ads API client
|   |       |-- social-platforms.ts Platform metadata (icons, colors, names)
|   |       |-- loop-types.ts    Agentic loop definitions
|
|-- scripts/
|   |-- db-writer.ts             Database writer CLI (17+ commands)
|   |-- postiz-client.ts         Postiz CLI (check-connection, list-integrations, schedule-post)
|   |-- google-ads-client.ts     Google Ads CLI
|   |-- meta-ads-client.ts       Meta Ads CLI
|   |-- google-ads-setup.ts      Google Ads credential setup
|   |-- generate-static-data.ts  Static data generation for Vercel
|   |-- generate_video_clip.py   Veo 3 video generation
|   |-- extract_end_frame.py     Video frame extraction
|   |-- generate_voiceover.py    Text-to-speech
|   |-- concat_video.sh          FFmpeg video concatenation
|   |-- pipelines/
|       |-- loop-runner.ts       Agentic loop orchestrator
|       |-- ads-research.ts      Ads loop phase 1
|       |-- ads-plan.ts          Ads loop phase 2
|       |-- ads-create.ts        Ads loop phase 3
|       |-- ads-deploy.ts        Ads loop phase 4
|       |-- ads-monitor.ts       Ads loop phase 5
|       |-- ads-optimize.ts      Ads loop phase 6
|
|-- skills/                      41 skill definitions (each has SKILL.md)
|
|-- assets/                      Generated files
|   |-- images/{assetId}/v{n}.png
|   |-- copy/{assetId}/v{n}.md
|   |-- videos/{assetId}/v{n}.mp4
|
|-- remotion/                    Remotion video compositions
|
|-- docker/
|   |-- docker-compose.postiz.yml  Postiz Docker Compose (3 containers)
|   |-- postiz.env                 Postiz environment variables
|
|-- mcp-servers/                 Bundled MCP servers (distributed with project)
    |-- twenty/                  Twenty CRM MCP server
    |-- chatwoot/                Chatwoot MCP server
```

---

## 11. Credentials & Environment Variables

### dashboard/.env

| Variable | Status | Purpose |
|----------|--------|---------|
| DATABASE_URL | SET | SQLite path (file:./dev.db) |
| GEMINI_API_KEY | SET | Gemini API for image and video generation |
| POSTIZ_API_URL | SET | Postiz API endpoint (http://localhost:4007/api/public/v1) |
| POSTIZ_API_KEY | EMPTY | Postiz API key (get from Postiz admin UI) |
| GOOGLE_ADS_CLIENT_ID | EMPTY | Google Ads OAuth client ID |
| GOOGLE_ADS_CLIENT_SECRET | EMPTY | Google Ads OAuth client secret |
| GOOGLE_ADS_REFRESH_TOKEN | EMPTY | Google Ads OAuth refresh token |
| GOOGLE_ADS_DEVELOPER_TOKEN | EMPTY | Google Ads developer token (from ads.google.com API Center) |
| GOOGLE_ADS_CUSTOMER_ID | EMPTY | Google Ads account ID (e.g. 6936745144) |
| GOOGLE_ADS_LOGIN_CUSTOMER_ID | EMPTY | Google Ads login customer ID |
| META_APP_ID | EMPTY | Meta Developer App ID |
| META_APP_SECRET | EMPTY | Meta Developer App secret |
| META_ACCESS_TOKEN | EMPTY | Meta long-lived access token |
| META_AD_ACCOUNT_ID | EMPTY | Meta ad account ID (act_XXXXXXXXX) |

### .mcp.json environment variables

| Variable | MCP Server | Purpose |
|----------|-----------|---------|
| TWENTY_API_KEY | twenty-crm | Twenty CRM API key |
| TWENTY_BASE_URL | twenty-crm | Twenty CRM API URL |
| CHATWOOT_BASE_URL | chatwoot | Chatwoot instance URL |
| CHATWOOT_API_ACCESS_TOKEN | chatwoot | Chatwoot API token |
| CHATWOOT_ACCOUNT_ID | chatwoot | Chatwoot account ID |
| GOOGLE_APPLICATION_CREDENTIALS | google-search-console | Path to service account JSON |
| GOOGLE_CLIENT_EMAIL | google-analytics | Service account email |
| GOOGLE_PRIVATE_KEY | google-analytics | Service account private key |
| GA_PROPERTY_ID | google-analytics | GA4 property ID |
| META_ACCESS_TOKEN | meta-ads | Meta access token |
| META_AD_ACCOUNT_ID | meta-ads | Meta ad account ID |

### docker/postiz.env

| Variable | Status | Purpose |
|----------|--------|---------|
| JWT_SECRET | SET | Postiz JWT secret |
| DATABASE_URL | SET | PostgreSQL connection |
| REDIS_URL | SET | Redis connection |
| X_API_KEY / X_API_SECRET | EMPTY | X (Twitter) OAuth |
| LINKEDIN_CLIENT_ID / SECRET | EMPTY | LinkedIn OAuth |
| FACEBOOK_CLIENT_ID / SECRET | EMPTY | Facebook/Instagram OAuth |
| TIKTOK_CLIENT_ID / SECRET | EMPTY | TikTok OAuth |
| YOUTUBE_CLIENT_ID / SECRET | EMPTY | YouTube OAuth |
| REDDIT_CLIENT_ID / SECRET | EMPTY | Reddit OAuth |

---

## 12. What Is Working Today

These work right now with no additional setup:

1. **Image generation** via Gemini API (GEMINI_API_KEY is set)
2. **Video generation** via Veo 3 API (uses same GEMINI_API_KEY)
3. **Content writing** via Claude Code skills
4. **Brand compliance checking** (4-lens QA scoring)
5. **Dashboard** with all 20+ pages, version timelines, feedback panels
6. **Feedback loop** (human review in dashboard, Claude reads feedback via db-writer)
7. **Campaign planning** with targeting, ad groups, keywords
8. **Agentic loop infrastructure** (loop runner, all 6 ads pipeline phases scripted)
9. **Calendar** for content scheduling
10. **Database** with 15+ models, fully seeded with test data
11. **MCP: Figma** (design-to-code workflows)
12. **MCP: Screenshot** (screen capture for debugging)
13. **MCP: Chrome DevTools** (browser inspection)
14. **Research briefs** (create, track, complete research before decisions)
15. **Daily standups** (create sessions, add items by category, respond, complete)
16. **Progress logging** (session-level tracking of work, decisions, blockers)
17. **Event tracking** (identify, evaluate, and plan for industry events)
18. **Campaign cyclic view** (6-tab process: Overview, Research, Assets, Distribution, Tracking, Optimize)
19. **Macro/micro cycle nesting** (loops can reference parent loops for nested cycles)

---

## 13. What Needs Setup

These are built but need credentials:

1. **Google Ads API** - Need: developer token (from ads.google.com API Center), OAuth Client ID/Secret (Google Cloud Console, Desktop app), refresh token (auth flow). Account: 693-674-5144.
2. **Meta Ads API** - Need: Meta Developer App credentials (App ID, Secret, Access Token, Ad Account ID).
3. **Postiz social publishing** - Postiz is installed (Docker). Need: social platform OAuth keys in docker/postiz.env (X, LinkedIn, Facebook, Instagram, etc.), then connect accounts in Postiz UI at http://localhost:4007, then get API key for dashboard.
4. **Twenty CRM MCP** - Need: TWENTY_API_KEY and TWENTY_BASE_URL in .mcp.json.
5. **Chatwoot MCP** - Need: CHATWOOT_BASE_URL, CHATWOOT_API_ACCESS_TOKEN, CHATWOOT_ACCOUNT_ID in .mcp.json.
6. **Google Search Console MCP** - Need: service account JSON with Search Console API enabled.
7. **Google Analytics MCP** - Need: service account email, private key, GA4 property ID.
8. **Meta Ads MCP** - Need: META_ACCESS_TOKEN and META_AD_ACCOUNT_ID in .mcp.json.

---

## 14. What Is Planned

Not yet built:

1. **Email marketing pipeline** - Plunk integration (REST API). No existing MCP server; needs custom build or direct API calls.
2. **Content/SEO loop pipeline scripts** - Loop type defined, needs phase scripts (content-research, content-plan, seo-track).
3. **Social loop pipeline scripts** - Loop type defined, needs phase scripts.
4. **Email loop pipeline scripts** - Loop type defined, needs phase scripts.
5. **Cross-channel optimization pipeline** - Loop type defined (3 phases), needs implementation.
6. **Microsoft Teams MCP** - Identified candidates (InditexTech, floriscornel), security audit pending.
7. **YouTube MCP** - Identified (pauling-ai/youtube-mcp-server), security audit pending.
8. **Live analytics dashboards** - Needs Google Analytics and ad platform credentials to pull real data.

---

## How to Get Started (New Team Member)

1. Clone this repo
2. `cd dashboard && npm install && npx prisma generate`
3. Copy `dashboard/.env` and fill in your API keys
4. Fill in credentials in `.mcp.json` for any MCP servers you want to use
5. `cd dashboard && npm run dev` to start the dashboard at localhost:3000
6. Open the project in VS Code with Claude Code
7. Give Claude a marketing brief and watch assets appear in the dashboard
