"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Data: Capabilities                                                 */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  {
    title: "Image Generation",
    description:
      "Generate brand-compliant marketing images with 4-lens QA scoring. Multiple model options for different quality and speed tradeoffs.",
    status: "Active" as const,
    tools:
      "Gemini API (gemini-2.5-flash-image, gemini-3-pro-image-preview, imagen-4.0-ultra-generate-001), Python scripts",
  },
  {
    title: "Video Production",
    description:
      "Scene-by-scene video workflow with AI generation and composition. Supports multiple generation models and React-based composition.",
    status: "Active" as const,
    tools:
      "Veo 3 API (veo-3.0-generate-001, veo-3.0-fast-generate-001, veo-3.1-generate-preview), Remotion 4, FFmpeg",
  },
  {
    title: "Content Writing",
    description:
      "Blog posts, ad copy, landing pages, social captions with brand voice. SEO and AIO optimization built in.",
    status: "Active" as const,
    tools: "Claude Code (content-writer skill), SEO/AIO optimization",
  },
  {
    title: "Ad Campaign Management",
    description:
      "Full campaign lifecycle with targeting, bidding, creative pairing. Supports both search and display campaigns.",
    status: "Active" as const,
    tools:
      "Google Ads API (REST v18, GAQL), Meta Ads API (v21), db-writer CLI",
  },
  {
    title: "Social Media Publishing",
    description:
      "Schedule and publish across 20+ platforms. Platform-specific formatting and engagement analytics.",
    status: "Active" as const,
    tools: "Postiz (self-hosted Docker), postiz-client.ts CLI",
  },
  {
    title: "Email Marketing",
    description:
      "Campaign creation, segmentation, templates. A/B testing and deliverability optimization.",
    status: "Planned" as const,
    tools: "Plunk (REST API integration planned)",
  },
  {
    title: "Brand Compliance",
    description:
      "Automated 4-lens brand QA for every asset. Scores on color, typography, messaging, and visual identity.",
    status: "Active" as const,
    tools: "zavis-creative-director skill, BrandCheck model in DB",
  },
  {
    title: "Feedback & Approval",
    description:
      "Human-in-the-loop review workflow. Every asset goes through human review before publishing.",
    status: "Active" as const,
    tools:
      "Dashboard UI, FeedbackPanel, ApprovalBar components, status machine",
  },
  {
    title: "Campaign Targeting",
    description:
      "Audience segments, locations, job titles, industries, keywords. Detailed targeting with ad group organization.",
    status: "Active" as const,
    tools: "Campaign model with targeting JSON, AdGroup model",
  },
  {
    title: "Agentic Optimization",
    description:
      "Self-improving loops that monitor and optimize campaigns. Six-phase lifecycle from research to optimization.",
    status: "Active" as const,
    tools:
      "Loop runner pipeline, 6-phase ads loop, MetricSnapshot, OptimizationDecision",
  },
  {
    title: "Calendar Management",
    description:
      "Content calendar with scheduled events across all channels. Visual monthly grid with asset previews.",
    status: "Active" as const,
    tools: "CalendarEvent model, CalendarGrid component",
  },
  {
    title: "Analytics & Reporting",
    description:
      "Performance metrics across channels. North star tracking and channel performance aggregation.",
    status: "Active" as const,
    tools:
      "North star metrics, MetricSnapshot, channel performance aggregation",
  },
];

/* ------------------------------------------------------------------ */
/*  Data: Integrations                                                 */
/* ------------------------------------------------------------------ */

type IntegrationStatus =
  | "Connected"
  | "Configured"
  | "Needs Setup"
  | "Planned";

interface Integration {
  name: string;
  type: string;
  status: IntegrationStatus;
  configLocation: string;
  credentials: string;
  description: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: "Figma",
    type: "MCP Server (HTTP)",
    status: "Connected",
    configLocation: ".mcp.json",
    credentials: "No credentials needed (desktop auth)",
    description: "Design-to-code workflows, screenshot capture, design context extraction.",
  },
  {
    name: "Screenshot",
    type: "MCP Server (stdio)",
    status: "Connected",
    configLocation: ".mcp.json",
    credentials: "No credentials needed",
    description: "Capture screenshots of the user screen for visual context and debugging.",
  },
  {
    name: "Chrome DevTools",
    type: "MCP Server (stdio)",
    status: "Connected",
    configLocation: ".mcp.json",
    credentials: "No credentials needed",
    description: "Browser automation, page inspection, console access for testing.",
  },
  {
    name: "Twenty CRM",
    type: "MCP Server (stdio)",
    status: "Needs Setup",
    configLocation: ".mcp.json + mcp-servers/twenty/",
    credentials: "TWENTY_API_KEY, TWENTY_BASE_URL",
    description: "Patient relationship management, contact data, deal pipeline.",
  },
  {
    name: "Chatwoot",
    type: "MCP Server (stdio)",
    status: "Needs Setup",
    configLocation: ".mcp.json + mcp-servers/chatwoot/",
    credentials: "CHATWOOT_BASE_URL, CHATWOOT_API_ACCESS_TOKEN, CHATWOOT_ACCOUNT_ID",
    description: "Live chat and support inbox. Patient communication tracking.",
  },
  {
    name: "Google Search Console",
    type: "MCP Server (stdio/npx)",
    status: "Needs Setup",
    configLocation: ".mcp.json",
    credentials: "GOOGLE_APPLICATION_CREDENTIALS (service account JSON)",
    description: "Search performance data, indexing status, keyword rankings.",
  },
  {
    name: "Google Analytics",
    type: "MCP Server (stdio/npx)",
    status: "Needs Setup",
    configLocation: ".mcp.json",
    credentials: "GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GA_PROPERTY_ID",
    description: "Website traffic analytics, user behavior, conversion tracking.",
  },
  {
    name: "Meta Ads (MCP)",
    type: "MCP Server (stdio/uvx)",
    status: "Needs Setup",
    configLocation: ".mcp.json + dashboard/.env",
    credentials: "META_ACCESS_TOKEN, META_AD_ACCOUNT_ID",
    description: "MCP-based Meta Ads management for campaign operations.",
  },
  {
    name: "Gemini API",
    type: "Direct API",
    status: "Connected",
    configLocation: "dashboard/.env (GEMINI_API_KEY)",
    credentials: "GEMINI_API_KEY",
    description: "Image generation (multiple models) and video generation via Veo 3.",
  },
  {
    name: "Google Ads API",
    type: "Direct API (REST v18)",
    status: "Needs Setup",
    configLocation: "dashboard/.env",
    credentials:
      "GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_LOGIN_CUSTOMER_ID",
    description: "Search and display campaign management, keyword bidding, performance data.",
  },
  {
    name: "Meta Ads API",
    type: "Direct API (v21)",
    status: "Needs Setup",
    configLocation: "dashboard/.env",
    credentials: "META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN, META_AD_ACCOUNT_ID",
    description: "Facebook and Instagram ad campaigns, audience targeting, creative management.",
  },
  {
    name: "Postiz",
    type: "Self-hosted (Docker)",
    status: "Configured",
    configLocation: "docker/docker-compose.postiz.yml + docker/postiz.env",
    credentials: "Social platform OAuth keys in postiz.env",
    description: "Social media scheduling and publishing across 20+ platforms.",
  },
  {
    name: "Remotion",
    type: "Local Runtime",
    status: "Connected",
    configLocation: "remotion/ directory",
    credentials: "No external credentials",
    description: "React-based video composition for programmatic video production.",
  },
  {
    name: "FFmpeg",
    type: "Local Runtime",
    status: "Connected",
    configLocation: "System-installed",
    credentials: "No credentials",
    description: "Video processing, format conversion, scene assembly.",
  },
  {
    name: "Prisma + SQLite",
    type: "Database ORM",
    status: "Connected",
    configLocation: "dashboard/prisma/schema.prisma",
    credentials: "Auto-configured",
    description: "Shared database layer between runtime and dashboard. 10+ models.",
  },
];

/* ------------------------------------------------------------------ */
/*  Data: Workflows                                                    */
/* ------------------------------------------------------------------ */

interface Workflow {
  title: string;
  status: "Fully Active" | "Active" | "Planned";
  steps: string[];
}

const WORKFLOWS: Workflow[] = [
  {
    title: "Image Creation Pipeline",
    status: "Fully Active",
    steps: [
      "Brief",
      "content-writer (prompt)",
      "zavis-creative-director (skill)",
      "Gemini API (generation)",
      "Brand QA (4-lens scoring)",
      "Save to /assets/images/",
      "db-writer create-asset",
      "Dashboard review",
      "Approve / Revise",
    ],
  },
  {
    title: "Video Production Pipeline",
    status: "Active",
    steps: [
      "Script planning",
      "Scene breakdown",
      "Veo 3 generation (per scene)",
      "Frame extraction",
      "Remotion composition",
      "FFmpeg assembly",
      "Save to /assets/videos/",
      "Dashboard review",
    ],
  },
  {
    title: "Content Writing Pipeline",
    status: "Active",
    steps: [
      "Campaign brief",
      "content-writer skill",
      "Brand voice compliance",
      "Copy compliance check",
      "Save to /assets/copy/",
      "db-writer create-asset",
      "Dashboard review",
      "Publish",
    ],
  },
  {
    title: "Ad Campaign Pipeline (Agentic Loop)",
    status: "Active",
    steps: [
      "Research phase",
      "Plan phase",
      "Create phase (creative pairing)",
      "Deploy phase (push to Google/Meta)",
      "Monitor phase (pull metrics)",
      "Optimize phase (AI recommendations)",
      "Cycle repeats",
    ],
  },
  {
    title: "Social Publishing Pipeline",
    status: "Active",
    steps: [
      "Content + Image",
      "Caption writing (social-publisher skill)",
      "Platform-specific formatting",
      "Postiz scheduling (postiz-client.ts)",
      "Distribution to connected accounts",
      "Engagement tracking",
    ],
  },
  {
    title: "Feedback Loop",
    status: "Active",
    steps: [
      "Asset in Dashboard",
      "Human reviews",
      "Feedback submitted (FeedbackPanel)",
      "Stored in DB",
      "Claude reads (db-writer read-feedback)",
      "New version generated",
      "Version timeline updated",
      "Cycle repeats",
    ],
  },
  {
    title: "Email Campaign Pipeline",
    status: "Planned",
    steps: [
      "Segment definition",
      "Template creation",
      "Content personalization",
      "A/B variant setup",
      "Send via Plunk",
      "Track opens/clicks",
      "Optimize",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data: Tech Stack                                                   */
/* ------------------------------------------------------------------ */

interface TechCategory {
  category: string;
  items: { name: string; detail: string }[];
}

const TECH_STACK: TechCategory[] = [
  {
    category: "AI & Generation",
    items: [
      { name: "Claude Opus 4", detail: "Agent SDK, 41 skills" },
      {
        name: "Gemini API",
        detail:
          "gemini-2.5-flash-image, gemini-3-pro-image-preview, gemini-3.1-flash-image-preview, imagen-4.0-ultra-generate-001",
      },
      {
        name: "Veo 3 API",
        detail:
          "veo-3.0-generate-001, veo-3.0-fast-generate-001, veo-3.1-generate-preview, veo-3.1-fast-generate-preview",
      },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "Next.js 16", detail: "App Router" },
      { name: "React 19", detail: "Server and client components" },
      { name: "Tailwind CSS 4", detail: "Utility-first styling" },
      { name: "shadcn/ui", detail: "Component library" },
    ],
  },
  {
    category: "Database",
    items: [
      { name: "SQLite", detail: "File-based database" },
      { name: "Prisma 5.22.0", detail: "ORM with typed queries" },
      {
        name: "10+ Models",
        detail:
          "Project, Asset, AssetVersion, Feedback, Campaign, AdGroup, AdCreative, BrandCheck, LoopExecution, etc.",
      },
    ],
  },
  {
    category: "Backend / Scripts",
    items: [
      { name: "TypeScript", detail: "tsx runtime" },
      { name: "Python 3", detail: "Image and video generation scripts" },
      { name: "db-writer.ts", detail: "17+ CLI commands for database operations" },
    ],
  },
  {
    category: "Video",
    items: [
      { name: "Remotion 4.0.261", detail: "React-based video composition" },
      { name: "FFmpeg", detail: "Video processing and assembly" },
      { name: "Python scripts", detail: "Video generation and frame extraction" },
    ],
  },
  {
    category: "Distribution",
    items: [
      { name: "Postiz", detail: "Social media, Docker Compose" },
      { name: "Google Ads REST API v18", detail: "Search and display campaigns" },
      { name: "Meta Ads API v21", detail: "Facebook and Instagram ads" },
      { name: "Plunk", detail: "Email marketing (planned)" },
    ],
  },
  {
    category: "Infrastructure",
    items: [
      { name: "Docker + Colima", detail: "Container runtime (macOS)" },
      { name: "Git", detail: "Version control" },
      { name: "Node.js 20", detail: "JavaScript runtime" },
    ],
  },
  {
    category: "MCP Servers (9 configured)",
    items: [
      { name: "Figma", detail: "Design-to-code workflows" },
      { name: "Screenshot", detail: "Screen capture" },
      { name: "Chrome DevTools", detail: "Browser automation" },
      { name: "Twenty CRM", detail: "Patient relationship management" },
      { name: "Chatwoot", detail: "Live chat and support" },
      { name: "Google Search Console", detail: "Search performance data" },
      { name: "Google Analytics", detail: "Website traffic analytics" },
      { name: "Meta Ads", detail: "MCP-based ad management" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data: File Map                                                     */
/* ------------------------------------------------------------------ */

interface FileMapEntry {
  path: string;
  purpose: string;
}

interface FileMapCategory {
  category: string;
  entries: FileMapEntry[];
}

const FILE_MAP: FileMapCategory[] = [
  {
    category: "Root Configuration",
    entries: [
      { path: "CLAUDE.md", purpose: "Project instructions and brand rules" },
      { path: ".mcp.json", purpose: "MCP server configurations (9 servers)" },
    ],
  },
  {
    category: "Dashboard Application",
    entries: [
      { path: "dashboard/", purpose: "Next.js dashboard app" },
      {
        path: "dashboard/prisma/schema.prisma",
        purpose: "Database schema (all models)",
      },
      { path: "dashboard/prisma/dev.db", purpose: "SQLite database" },
      { path: "dashboard/src/app/", purpose: "All pages (15+ routes)" },
      {
        path: "dashboard/src/components/shared/",
        purpose:
          "Reusable components (AssetCard, FeedbackPanel, VersionTimeline, etc.)",
      },
      {
        path: "dashboard/src/lib/",
        purpose:
          "Business logic (status-machine, postiz, google-ads, meta-ads)",
      },
      { path: "dashboard/.env", purpose: "API keys and credentials" },
    ],
  },
  {
    category: "CLI Scripts",
    entries: [
      {
        path: "scripts/db-writer.ts",
        purpose: "DB writer CLI (17+ commands)",
      },
      {
        path: "scripts/postiz-client.ts",
        purpose: "Postiz CLI (schedule-post, list-integrations)",
      },
      {
        path: "scripts/google-ads-client.ts",
        purpose: "Google Ads CLI",
      },
      {
        path: "scripts/meta-ads-client.ts",
        purpose: "Meta Ads CLI",
      },
      {
        path: "scripts/generate_video_clip.py",
        purpose: "Veo 3 video generation",
      },
      {
        path: "scripts/pipelines/loop-runner.ts",
        purpose: "Agentic loop orchestrator",
      },
    ],
  },
  {
    category: "Skills & Assets",
    entries: [
      { path: "skills/", purpose: "41 skill definitions" },
      {
        path: "assets/",
        purpose: "Generated files ({type}/{id}/v{n}.{ext})",
      },
    ],
  },
  {
    category: "Video & Infrastructure",
    entries: [
      { path: "remotion/", purpose: "Remotion video compositions" },
      {
        path: "docker/",
        purpose: "Docker Compose configs (Postiz)",
      },
      {
        path: "mcp-servers/",
        purpose: "Bundled MCP servers (Twenty, Chatwoot)",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Summary Counters                                                   */
/* ------------------------------------------------------------------ */

const SUMMARY = {
  capabilitiesActive: CAPABILITIES.filter((c) => c.status === "Active").length,
  integrationsConnected: INTEGRATIONS.filter(
    (i) => i.status === "Connected" || i.status === "Configured"
  ).length,
  workflowsActive: WORKFLOWS.filter(
    (w) => w.status === "Active" || w.status === "Fully Active"
  ).length,
  skillsLoaded: 41,
};

/* ------------------------------------------------------------------ */
/*  Helper: Status badge styling                                       */
/* ------------------------------------------------------------------ */

function statusBadgeClass(
  status: string
): { variant: "default" | "secondary" | "outline"; className: string } {
  switch (status) {
    case "Active":
    case "Fully Active":
    case "Connected":
      return {
        variant: "default",
        className: "bg-[#006828] text-white text-[10px]",
      };
    case "Configured":
      return {
        variant: "default",
        className: "bg-[#006828]/80 text-white text-[10px]",
      };
    case "Needs Setup":
      return {
        variant: "secondary",
        className: "bg-amber-100 text-amber-800 border-amber-200 text-[10px]",
      };
    case "Planned":
    case "Coming Soon":
      return {
        variant: "secondary",
        className: "bg-[#ecebe8] text-[#1c1c1c]/60 text-[10px]",
      };
    default:
      return { variant: "secondary", className: "text-[10px]" };
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: Integration type icon                                      */
/* ------------------------------------------------------------------ */

function IntegrationIcon({ type }: { type: string }) {
  if (type.includes("MCP")) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006828"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Z" />
        <circle cx="12" cy="14" r="2" />
        <path d="M12 16v2" />
      </svg>
    );
  }
  if (type.includes("Direct API")) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006828"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  }
  if (type.includes("Docker") || type.includes("Self-hosted")) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006828"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 12h.01" />
        <path d="M17 12h.01" />
        <path d="M7 12h.01" />
      </svg>
    );
  }
  if (type.includes("Local Runtime")) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#006828"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    );
  }
  // Database
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#006828"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function StatusPage() {
  const [expandedWorkflow, setExpandedWorkflow] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* ============================================================ */}
      {/*  Header                                                       */}
      {/* ============================================================ */}
      <section className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
              System Status
            </h1>
            <p className="mt-2 text-sm text-[#1c1c1c]/60 max-w-2xl leading-relaxed">
              Complete breakdown of all capabilities, integrations, workflows, and infrastructure.
            </p>
          </div>
          <p className="text-xs text-[#1c1c1c]/40 shrink-0">
            Last Updated: March 6, 2026
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Summary Counters                                             */}
      {/* ============================================================ */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-[#ecebe8]">
            <p className="text-2xl font-heading font-bold text-[#006828]">
              {SUMMARY.capabilitiesActive}
            </p>
            <p className="text-xs text-[#1c1c1c]/60 mt-1">Capabilities active</p>
          </Card>
          <Card className="p-4 border-[#ecebe8]">
            <p className="text-2xl font-heading font-bold text-[#006828]">
              {SUMMARY.integrationsConnected}
            </p>
            <p className="text-xs text-[#1c1c1c]/60 mt-1">Integrations connected</p>
          </Card>
          <Card className="p-4 border-[#ecebe8]">
            <p className="text-2xl font-heading font-bold text-[#006828]">
              {SUMMARY.workflowsActive}
            </p>
            <p className="text-xs text-[#1c1c1c]/60 mt-1">Workflows active</p>
          </Card>
          <Card className="p-4 border-[#ecebe8]">
            <p className="text-2xl font-heading font-bold text-[#006828]">
              {SUMMARY.skillsLoaded}
            </p>
            <p className="text-xs text-[#1c1c1c]/60 mt-1">Skills loaded</p>
          </Card>
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  Tabs                                                         */}
      {/* ============================================================ */}
      <Tabs defaultValue="capabilities">
        <TabsList className="w-full sm:w-auto flex-wrap">
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="file-map">File Map</TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------------- */}
        {/*  Tab 1: Capabilities                                            */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="capabilities" className="mt-6">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-bold text-[#1c1c1c]">
              What This System Can Do
            </h2>
            <p className="text-sm text-[#1c1c1c]/60 mt-1">
              Every capability of the Zavis CMO platform, with status and tooling details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {CAPABILITIES.map((cap) => {
              const badge = statusBadgeClass(cap.status);
              return (
                <Card
                  key={cap.title}
                  className={`p-5 border-[#ecebe8] ${
                    cap.status === "Planned" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                      {cap.title}
                    </h3>
                    <Badge variant={badge.variant} className={badge.className}>
                      {cap.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#1c1c1c]/60 leading-relaxed mb-3">
                    {cap.description}
                  </p>
                  <div className="rounded bg-[#f8f8f6] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#1c1c1c]/40 font-semibold mb-1">
                      Tools / APIs
                    </p>
                    <p className="text-xs text-[#1c1c1c]/70 leading-relaxed">
                      {cap.tools}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Tab 2: Integrations                                            */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="integrations" className="mt-6">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-bold text-[#1c1c1c]">
              All Connected Services
            </h2>
            <p className="text-sm text-[#1c1c1c]/60 mt-1">
              Every external service, API, and tool the system integrates with.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.map((integ) => {
              const badge = statusBadgeClass(integ.status);
              return (
                <Card key={integ.name} className="p-5 border-[#ecebe8]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="shrink-0 mt-0.5">
                      <IntegrationIcon type={integ.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                          {integ.name}
                        </h3>
                        <Badge
                          variant={badge.variant}
                          className={badge.className}
                        >
                          {integ.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[#1c1c1c]/40 mt-0.5">
                        {integ.type}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#1c1c1c]/60 leading-relaxed mb-3">
                    {integ.description}
                  </p>

                  <div className="space-y-2">
                    <div className="rounded bg-[#f8f8f6] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-[#1c1c1c]/40 font-semibold mb-0.5">
                        Config
                      </p>
                      <p className="text-xs text-[#1c1c1c]/70 font-mono">
                        {integ.configLocation}
                      </p>
                    </div>
                    <div className="rounded bg-[#f8f8f6] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-[#1c1c1c]/40 font-semibold mb-0.5">
                        Credentials
                      </p>
                      <p className="text-xs text-[#1c1c1c]/70 font-mono break-all">
                        {integ.credentials}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Tab 3: Workflows                                               */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="workflows" className="mt-6">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-bold text-[#1c1c1c]">
              End-to-End Processes
            </h2>
            <p className="text-sm text-[#1c1c1c]/60 mt-1">
              Every workflow in the system, from brief to delivery. Click to expand and see the step-by-step flow.
            </p>
          </div>

          <div className="space-y-3">
            {WORKFLOWS.map((wf, idx) => {
              const isExpanded = expandedWorkflow === idx;
              const badge = statusBadgeClass(wf.status);
              return (
                <Card
                  key={wf.title}
                  className={`overflow-hidden border-[#ecebe8] transition-all ${
                    isExpanded ? "shadow-md" : ""
                  }`}
                >
                  <button
                    onClick={() =>
                      setExpandedWorkflow(isExpanded ? null : idx)
                    }
                    className="w-full text-left p-5 flex items-center gap-4 hover:bg-[#f8f8f6]/50 transition-colors"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#006828]/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#006828]">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                        {wf.title}
                      </h3>
                      <p className="text-xs text-[#1c1c1c]/50 mt-0.5">
                        {wf.steps.length} steps
                      </p>
                    </div>
                    <Badge variant={badge.variant} className={badge.className}>
                      {wf.status}
                    </Badge>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-[#1c1c1c]/40 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pl-[72px]">
                      <div className="space-y-0">
                        {wf.steps.map((step, si) => (
                          <div key={si} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-[#006828] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                                {si + 1}
                              </div>
                              {si < wf.steps.length - 1 && (
                                <div className="w-px h-6 bg-[#006828]/20" />
                              )}
                            </div>
                            <p className="text-sm text-[#1c1c1c]/80 pt-0.5 pb-3">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Tab 4: Tech Stack                                              */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="tech-stack" className="mt-6">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-bold text-[#1c1c1c]">
              Everything Under the Hood
            </h2>
            <p className="text-sm text-[#1c1c1c]/60 mt-1">
              All technologies, frameworks, and services organized by category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TECH_STACK.map((cat) => (
              <Card key={cat.category} className="p-5 border-[#ecebe8]">
                <h3 className="font-heading font-semibold text-sm text-[#006828] mb-3">
                  {cat.category}
                </h3>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start justify-between gap-3 rounded bg-[#f8f8f6] px-3 py-2"
                    >
                      <p className="text-sm font-medium text-[#1c1c1c]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#1c1c1c]/50 text-right shrink-0 max-w-[55%]">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Tab 5: File Map                                                */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="file-map" className="mt-6">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-bold text-[#1c1c1c]">
              Key File Locations
            </h2>
            <p className="text-sm text-[#1c1c1c]/60 mt-1">
              Critical files and directories in the project, organized by function.
            </p>
          </div>

          <div className="space-y-4">
            {FILE_MAP.map((cat) => (
              <Card key={cat.category} className="p-5 border-[#ecebe8]">
                <h3 className="font-heading font-semibold text-sm text-[#006828] mb-3">
                  {cat.category}
                </h3>
                <div className="space-y-1">
                  {cat.entries.map((entry) => (
                    <div
                      key={entry.path}
                      className="grid grid-cols-[minmax(180px,1fr)_2fr] gap-4 rounded px-3 py-2 hover:bg-[#f8f8f6] transition-colors"
                    >
                      <p className="text-xs font-mono text-[#006828]/80 break-all">
                        {entry.path}
                      </p>
                      <p className="text-xs text-[#1c1c1c]/60">
                        {entry.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
