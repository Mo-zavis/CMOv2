"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const VALUE_PROPS = [
  {
    title: "AI-Powered Creation",
    description:
      "Claude generates images, copy, video, ads, email, and social posts using 41 specialized skills.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    title: "Human-in-the-Loop",
    description:
      "Every asset goes through human review. You approve, request revisions, or provide feedback before anything publishes.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Continuous Optimization",
    description:
      "Agentic loops monitor performance and automatically optimize campaigns across channels.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    ),
  },
];

const FLOW_STEPS = [
  {
    number: 1,
    title: "Brief",
    summary: "You provide a brief or prompt to Claude.",
    detail:
      "In VS Code, describe what you need. For example: 'Create a social media campaign for our patient engagement feature targeting dental clinics.' Claude interprets the brief and determines which skills and APIs to activate.",
  },
  {
    number: 2,
    title: "Claude Activates Skills",
    summary: "Claude loads relevant skills from 41 available.",
    detail:
      "For a social campaign brief, Claude might activate: content-writer for captions and copy, zavis-creative-director for brand-governed image generation, social-publisher for platform formatting, and ad-manager for paid distribution. Each skill has its own SKILL.md with instructions and constraints.",
  },
  {
    number: 3,
    title: "Asset Generation",
    summary: "Claude calls external APIs to generate assets.",
    detail:
      "Images are generated via Gemini API (models include Gemini 2.5 Flash and Imagen 4 Ultra). Videos use Veo 3 for AI generation plus Remotion for React-based composition. Copy is produced by the content-writer skill with brand voice compliance built in. Each asset is written to the filesystem at /assets/{type}/{id}/v{n}.{ext}.",
  },
  {
    number: 4,
    title: "Database Record",
    summary: "Claude writes metadata to the shared SQLite database.",
    detail:
      "Using the db-writer CLI, Claude creates an asset record with title, type, platform, status (DRAFT), and links to the generated files. The command looks like: npx tsx scripts/db-writer.ts create-asset --type image --title \"Campaign Hero\" --filePath /assets/images/abc123/v1.png. Metadata such as the AI model used, dimensions, and prompt are stored as JSON.",
  },
  {
    number: 5,
    title: "Dashboard Displays",
    summary: "This dashboard reads from the same database.",
    detail:
      "Assets appear automatically in the Images, Content, Videos, Ads, Social, or Email sections. You can browse all assets, compare versions side by side, view brand compliance scores from the 4-lens QA system, and see which AI model generated each piece. The Library page provides unified search across all asset types.",
  },
  {
    number: 6,
    title: "Human Review",
    summary: "You review each asset and decide its fate.",
    detail:
      "Three options are available for every asset. Approve moves it to APPROVED status, making it ready for distribution. Request Revision sends structured feedback back to Claude with specific notes on what to change. Publish pushes the asset to its target distribution channel (social platform, ad network, email service).",
  },
  {
    number: 7,
    title: "Feedback Loop",
    summary: "Claude reads your feedback and generates a new version.",
    detail:
      "When you request revisions, Claude reads your feedback via the db-writer read-feedback command. It then generates a new version addressing your notes, increments the version number, and writes the updated asset. The cycle repeats until you approve. Every version is preserved, so you can always compare or roll back.",
  },
];

const CAPABILITIES = [
  {
    title: "Image Generation",
    description:
      "Generate brand-compliant images using Gemini API. Automatic 4-lens brand QA scoring. Multiple models available: Gemini 2.5 Flash, Imagen 4 Ultra.",
    status: "Active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    title: "Content Writing",
    description:
      "Blog posts, ad copy, landing pages, social captions. SEO and AIO optimized. Brand voice compliance built in.",
    status: "Active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Video Production",
    description:
      "Scene-by-scene video workflow. Veo 3 for AI generation, Remotion for React-based composition, FFmpeg for assembly.",
    status: "Active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    title: "Ad Campaigns",
    description:
      "Full campaign management with Google Ads and Meta Ads integration. Audience targeting, bid optimization, performance tracking.",
    status: "Active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 18-5v12L3 13v-2z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
  },
  {
    title: "Social Media",
    description:
      "Schedule and publish across 20+ platforms via Postiz. Platform-specific formatting. Engagement analytics.",
    status: "Active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    title: "Email Marketing",
    description:
      "Campaign creation, segmentation, HTML templates. A/B testing and deliverability optimization.",
    status: "Coming Soon" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

const QUICK_REF = [
  {
    action: "Generate an image",
    command: "Ask Claude to create an image for [topic]",
    detail:
      "Claude activates the zavis-creative-director skill, generates via Gemini API, runs 4-lens brand QA, and writes the result to the database.",
  },
  {
    action: "Write content",
    command: "Ask Claude to write [type] about [topic]",
    detail:
      "Types include blog post, ad copy, landing page, social caption, or email. Claude applies brand voice rules automatically.",
  },
  {
    action: "Check feedback",
    command: "Claude runs: npx tsx scripts/db-writer.ts read-feedback",
    detail:
      "Returns all unactioned feedback from human reviewers. Claude reads this to understand what revisions are needed.",
  },
  {
    action: "View all assets",
    command: "Navigate to Library in the sidebar",
    detail:
      "The Library page shows a unified, searchable list of every asset across all types. Filter by status, type, or platform.",
  },
  {
    action: "Monitor campaigns",
    command: "Visit Command Center for north star metrics",
    detail:
      "The Command Center shows active optimization loops, channel performance, and progress toward campaign north star targets.",
  },
];

const NAV_SECTIONS = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        description: "This page. Onboarding guide and system overview.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        ),
      },
      {
        label: "Command Center",
        description: "North star metrics, active loops, channel performance at a glance.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Create",
    items: [
      {
        label: "Images",
        description: "Browse and manage AI-generated images. Compare versions, view brand QA scores.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
          </svg>
        ),
      },
      {
        label: "Content",
        description: "Written assets: blog posts, ad copy, landing pages, captions.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        label: "Videos",
        description: "Video projects with scene-by-scene workflows and AI generation.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Distribute",
    items: [
      {
        label: "Ads",
        description: "Google Ads and Meta Ads campaign management and creative pairing.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        ),
      },
      {
        label: "Social",
        description: "Social media scheduling and publishing across 20+ platforms via Postiz.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        ),
      },
      {
        label: "Email",
        description: "Email campaign creation, segmentation, and template management.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Plan",
    items: [
      {
        label: "Campaigns",
        description: "Campaign planning with targeting, ad groups, keywords, and budgets.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
        ),
      },
      {
        label: "Calendar",
        description: "Content calendar view. See all scheduled assets across channels by date.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        label: "Loops",
        description: "Agentic optimization cycles. Monitor and control autonomous campaign tuning.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
          </svg>
        ),
      },
      {
        label: "Analytics",
        description: "Performance analytics and reporting across all channels.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Library & System",
    items: [
      {
        label: "All Assets",
        description: "Unified search across every asset type. Filter by status, type, or platform.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
        ),
      },
      {
        label: "Ecosystem",
        description: "Full system architecture diagram showing all services and connections.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" />
          </svg>
        ),
      },
      {
        label: "Skill Map",
        description: "All 41 skills available to Claude, organized by category.",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        ),
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [quickRefOpen, setQuickRefOpen] = useState(false);
  const [expandedQuickRef, setExpandedQuickRef] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* ============================================================ */}
      {/*  1. HERO / WELCOME                                           */}
      {/* ============================================================ */}
      <section className="pt-4">
        <div className="space-y-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
              <span className="text-[#006828]">Zavis</span> CMO
            </h1>
            <p className="mt-2 text-lg text-[#1c1c1c]/70 max-w-2xl leading-relaxed">
              AI-powered marketing operations platform for healthcare. The system pairs Claude
              with a human feedback layer to create, distribute, and optimize marketing content
              for patient engagement.
            </p>
          </div>

          {/* Value prop cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {VALUE_PROPS.map((prop) => (
              <Card key={prop.title} className="p-5 border-[#ecebe8]">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{prop.icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[#1c1c1c]/60 mt-1 leading-relaxed">
                      {prop.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  2. HOW IT WORKS - THE CORE FLOW                             */}
      {/* ============================================================ */}
      <section>
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            How It Works
          </h2>
          <p className="text-sm text-[#1c1c1c]/60 mt-1">
            The core interaction model between you, Claude, and this dashboard. Click any step to learn more.
          </p>
        </div>

        {/* Horizontal step indicator (visible on sm+) */}
        <div className="hidden sm:flex items-center justify-between mb-8 px-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() =>
                  setExpandedStep(expandedStep === step.number ? null : step.number)
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${
                    expandedStep === step.number
                      ? "bg-[#006828] text-white shadow-md shadow-[#006828]/20"
                      : "bg-[#ecebe8] text-[#1c1c1c]/70 hover:bg-[#006828]/10 hover:text-[#006828]"
                  }`}
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                {step.number}
              </button>
              {i < FLOW_STEPS.length - 1 && (
                <div className="w-6 lg:w-10 xl:w-14 h-px bg-[#ecebe8] mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step cards */}
        <div className="space-y-3">
          {FLOW_STEPS.map((step) => {
            const isExpanded = expandedStep === step.number;
            return (
              <Card
                key={step.number}
                className={`overflow-hidden transition-all border-[#ecebe8] ${
                  isExpanded ? "shadow-md" : ""
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : step.number)
                  }
                  className="w-full text-left p-4 flex items-start gap-4 hover:bg-[#f8f8f6]/50 transition-colors"
                >
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isExpanded
                        ? "bg-[#006828] text-white"
                        : "bg-[#ecebe8] text-[#1c1c1c]/70"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#1c1c1c]/60 mt-0.5">
                      {step.summary}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 mt-1 text-[#1c1c1c]/40 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pl-16">
                    <div className="border-l-2 border-[#006828] pl-4 py-2">
                      <p className="text-sm text-[#1c1c1c]/80 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  3. KEY CAPABILITIES GRID                                     */}
      {/* ============================================================ */}
      <section>
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            Key Capabilities
          </h2>
          <p className="text-sm text-[#1c1c1c]/60 mt-1">
            Six core capabilities, each backed by specialized skills and external API integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap) => (
            <Card
              key={cap.title}
              className={`p-5 border-[#ecebe8] ${
                cap.status === "Coming Soon" ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-[#006828]">{cap.icon}</div>
                <Badge
                  variant={cap.status === "Active" ? "default" : "secondary"}
                  className={
                    cap.status === "Active"
                      ? "bg-[#006828] text-white text-[10px]"
                      : "text-[10px]"
                  }
                >
                  {cap.status}
                </Badge>
              </div>
              <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                {cap.title}
              </h3>
              <p className="text-xs text-[#1c1c1c]/60 mt-1.5 leading-relaxed">
                {cap.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  4. THE ECOSYSTEM ARCHITECTURE                                */}
      {/* ============================================================ */}
      <section>
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            Ecosystem Architecture
          </h2>
          <p className="text-sm text-[#1c1c1c]/60 mt-1">
            Two isolated systems sharing a database and filesystem. They never call each other directly.
          </p>
        </div>

        <Card className="p-6 sm:p-8 border-[#ecebe8] bg-[#f8f8f6]">
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Layer 1: Runtime */}
            <div className="flex-1 rounded-lg border-2 border-[#006828]/20 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#006828]" />
                <h3 className="font-heading font-semibold text-sm text-[#006828]">
                  Layer 1: Runtime
                </h3>
              </div>
              <p className="text-xs text-[#1c1c1c]/60 mb-3">
                VS Code + Claude Code session
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-[#f8f8f6] rounded px-3 py-2 text-[#1c1c1c]/70">
                  41 specialized skills
                </div>
                <div className="text-xs bg-[#f8f8f6] rounded px-3 py-2 text-[#1c1c1c]/70">
                  External APIs (Gemini, Veo 3, Meta, Google)
                </div>
                <div className="text-xs bg-[#f8f8f6] rounded px-3 py-2 text-[#1c1c1c]/70">
                  db-writer CLI for database writes
                </div>
              </div>
            </div>

            {/* Arrows / Shared layer */}
            <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0 lg:px-2">
              {/* Down/right arrow */}
              <div className="flex flex-col items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden lg:block">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:hidden">
                  <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                </svg>
              </div>

              {/* Shared box */}
              <div className="rounded-lg border-2 border-dashed border-[#006828]/30 bg-white px-4 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#006828] font-semibold mb-1">
                  Shared
                </p>
                <p className="text-xs text-[#1c1c1c]/60">SQLite DB</p>
                <p className="text-xs text-[#1c1c1c]/60">/assets/ files</p>
              </div>

              {/* Up/left arrow */}
              <div className="flex flex-col items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden lg:block">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:hidden">
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>

            {/* Layer 2: Dashboard */}
            <div className="flex-1 rounded-lg border-2 border-[#006828]/20 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#006828]/60" />
                <h3 className="font-heading font-semibold text-sm text-[#006828]">
                  Layer 2: Dashboard
                </h3>
              </div>
              <p className="text-xs text-[#1c1c1c]/60 mb-3">
                This Next.js web application
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-[#f8f8f6] rounded px-3 py-2 text-[#1c1c1c]/70">
                  Browse and manage assets
                </div>
                <div className="text-xs bg-[#f8f8f6] rounded px-3 py-2 text-[#1c1c1c]/70">
                  Human review and approval
                </div>
                <div className="text-xs bg-[#f8f8f6] rounded px-3 py-2 text-[#1c1c1c]/70">
                  Feedback capture for Claude
                </div>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="mt-6 rounded-lg bg-[#006828]/5 border border-[#006828]/10 px-4 py-3">
            <p className="text-xs text-[#1c1c1c]/70 leading-relaxed">
              <span className="font-semibold text-[#006828]">Key insight:</span>{" "}
              These two systems never call each other directly. The database and filesystem are the
              communication layer. Claude writes assets and metadata; the dashboard reads and
              displays them. Your feedback is written to the database by the dashboard, then read
              by Claude on the next iteration.
            </p>
          </div>
        </Card>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  5. QUICK REFERENCE                                           */}
      {/* ============================================================ */}
      <section>
        <button
          onClick={() => setQuickRefOpen(!quickRefOpen)}
          className="w-full flex items-center justify-between group"
        >
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#1c1c1c] text-left">
              Quick Reference
            </h2>
            <p className="text-sm text-[#1c1c1c]/60 mt-1 text-left">
              Common actions and how to perform them.
            </p>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#ecebe8] group-hover:bg-[#006828]/10 transition-all ${
              quickRefOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#1c1c1c]/60"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {quickRefOpen && (
          <div className="mt-4 space-y-2">
            {QUICK_REF.map((item, i) => {
              const isOpen = expandedQuickRef === i;
              return (
                <Card key={i} className="border-[#ecebe8] overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedQuickRef(isOpen ? null : i)
                    }
                    className="w-full text-left p-4 flex items-center gap-4 hover:bg-[#f8f8f6]/50 transition-colors"
                  >
                    <div className="shrink-0 w-6 h-6 rounded bg-[#006828]/10 flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#006828"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1c1c1c]">
                        {item.action}
                      </p>
                      <p className="text-xs text-[#1c1c1c]/50 mt-0.5 font-mono">
                        {item.command}
                      </p>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-[#1c1c1c]/30 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pl-14">
                      <div className="border-l-2 border-[#006828] pl-4 py-1">
                        <p className="text-xs text-[#1c1c1c]/70 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  6. DASHBOARD NAVIGATION GUIDE                                */}
      {/* ============================================================ */}
      <section>
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1c]">
            Dashboard Navigation
          </h2>
          <p className="text-sm text-[#1c1c1c]/60 mt-1">
            Every section in the sidebar, explained.
          </p>
        </div>

        <div className="space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.section}>
              <h3 className="text-[10px] uppercase tracking-wider text-[#1c1c1c]/40 font-semibold mb-2 px-1">
                {section.section}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <Card
                    key={item.label}
                    className="p-4 border-[#ecebe8] hover:border-[#006828]/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 text-[#006828]/70 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-sm text-[#1c1c1c]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[#1c1c1c]/60 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Footer note                                                  */}
      {/* ============================================================ */}
      <div className="pt-4 pb-8">
        <div className="rounded-lg bg-[#f8f8f6] border border-[#ecebe8] px-5 py-4">
          <p className="text-xs text-[#1c1c1c]/50 leading-relaxed">
            This dashboard is one half of the Zavis CMO system. The other half runs in VS Code
            with Claude Code. To start generating assets, open this project in VS Code and give
            Claude a marketing brief. Assets will appear here automatically as they are created.
            For the full ecosystem architecture, visit the{" "}
            <a href="/ecosystem" className="text-[#006828] hover:underline font-medium">
              Ecosystem
            </a>{" "}
            page. To explore all available skills, see the{" "}
            <a href="/skills" className="text-[#006828] hover:underline font-medium">
              Skill Map
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
