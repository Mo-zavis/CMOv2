"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type SkillCategory =
  | "core"
  | "brand"
  | "optimization"
  | "plugin"
  | "document"
  | "design"
  | "utility";

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  tools: string[];
  connectedSkills: string[];
  status: "active" | "partial" | "planned";
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<
  SkillCategory,
  { label: string; color: string; description: string }
> = {
  core: {
    label: "Core Marketing",
    color: "#006828",
    description:
      "End-to-end marketing execution: campaigns, content, images, video, social, email, and ads.",
  },
  brand: {
    label: "Brand & Design System",
    color: "#b45309",
    description:
      "Zavis-specific brand rules, design system, and creative direction. Enforced across all outputs.",
  },
  optimization: {
    label: "Optimization & Analytics",
    color: "#7c3aed",
    description:
      "Performance tracking, SEO, and AI-engine optimization for visibility and conversions.",
  },
  plugin: {
    label: "Plugin Development",
    color: "#2563eb",
    description:
      "Claude Code plugin infrastructure: agents, commands, skills, hooks, MCP servers, and settings.",
  },
  document: {
    label: "Document Processing",
    color: "#0891b2",
    description:
      "Create, read, edit Word docs, spreadsheets, presentations, and PDFs.",
  },
  design: {
    label: "Frontend & Design",
    color: "#db2777",
    description:
      "Build web UIs, interactive playgrounds, generative art, and themed artifacts.",
  },
  utility: {
    label: "Utilities & Support",
    color: "#64748b",
    description:
      "Testing, documentation co-authoring, automation recommendations, and internal comms.",
  },
};

const SKILLS: Skill[] = [
  // Core Marketing (8)
  {
    id: "campaign-planner",
    name: "Campaign Planner",
    category: "core",
    description:
      "Orchestration layer: creates campaign plans, budgets, timelines, deliverable queues, and coordinates all other marketing skills.",
    tools: ["db-writer", "dashboard"],
    connectedSkills: [
      "content-writer",
      "image-creator",
      "video-producer",
      "ad-manager",
      "email-marketer",
      "social-publisher",
      "analytics-reporter",
      "zavis-master",
    ],
    status: "active",
  },
  {
    id: "content-writer",
    name: "Content Writer",
    category: "core",
    description:
      "Creates blog posts, ad copy, landing pages, email content, and social captions following Zavis brand rules and pillar messaging.",
    tools: ["db-writer", "brand-rules"],
    connectedSkills: [
      "campaign-planner",
      "image-creator",
      "social-publisher",
      "ad-manager",
      "email-marketer",
      "seo-optimizer",
      "aeo-optimizer",
      "zavis-master",
    ],
    status: "active",
  },
  {
    id: "image-creator",
    name: "Image Creator",
    category: "core",
    description:
      "Generates static images for social media, ads, and email headers using Gemini API via the nano-banana skill with brand governance.",
    tools: ["gemini-api", "db-writer", "brand-qa"],
    connectedSkills: [
      "campaign-planner",
      "content-writer",
      "nano-banana",
      "zavis-creative-director",
      "social-publisher",
      "ad-manager",
      "email-marketer",
      "video-producer",
    ],
    status: "active",
  },
  {
    id: "nano-banana",
    name: "Nano Banana",
    category: "core",
    description:
      "Wraps Google Gemini image generation API. Sends prompts, receives images, saves to filesystem. The engine behind image-creator.",
    tools: ["gemini-api", "python"],
    connectedSkills: ["image-creator", "zavis-creative-director"],
    status: "active",
  },
  {
    id: "video-producer",
    name: "Video Producer",
    category: "core",
    description:
      "Produces video content with scene-by-scene workflow. Uses Remotion for composition, Veo 3 for AI clips, FFmpeg for assembly.",
    tools: ["remotion", "ffmpeg", "veo-3", "db-writer"],
    connectedSkills: [
      "campaign-planner",
      "content-writer",
      "image-creator",
    ],
    status: "partial",
  },
  {
    id: "social-publisher",
    name: "Social Publisher",
    category: "core",
    description:
      "Manages social media posting and scheduling via self-hosted Postiz. Supports 20+ platforms including LinkedIn, X, Facebook, Instagram.",
    tools: ["postiz-api", "docker", "db-writer"],
    connectedSkills: [
      "campaign-planner",
      "content-writer",
      "image-creator",
      "analytics-reporter",
    ],
    status: "active",
  },
  {
    id: "email-marketer",
    name: "Email Marketer",
    category: "core",
    description:
      "Creates and sends email campaigns: drip sequences, newsletters, and promotions via SendGrid. Tracks open and click rates.",
    tools: ["sendgrid", "db-writer"],
    connectedSkills: [
      "campaign-planner",
      "content-writer",
      "image-creator",
      "analytics-reporter",
    ],
    status: "planned",
  },
  {
    id: "ad-manager",
    name: "Ad Manager",
    category: "core",
    description:
      "Manages paid ad campaigns on Google Ads and Meta. Full tracking with UTM parameters, GCLID/FBCLID, demo-as-conversion setup.",
    tools: ["google-ads-api", "meta-api", "db-writer"],
    connectedSkills: [
      "campaign-planner",
      "content-writer",
      "image-creator",
      "video-producer",
      "analytics-reporter",
    ],
    status: "partial",
  },

  // Brand & Design System (3)
  {
    id: "zavis-master",
    name: "Zavis Master",
    category: "brand",
    description:
      "325 lines of brand rules, positioning, content guidelines. Defines pillars (Revenue, No-Shows, Patient Satisfaction), voice, and target audiences.",
    tools: ["brand-rules"],
    connectedSkills: [
      "campaign-planner",
      "content-writer",
      "zavis-designer",
      "zavis-creative-director",
    ],
    status: "active",
  },
  {
    id: "zavis-designer",
    name: "Zavis Designer",
    category: "brand",
    description:
      "Visual design system: colors (#006828, #f8f8f6, #1c1c1c, #ecebe8), typography (Bricolage Grotesque + Geist), spacing, and component patterns.",
    tools: ["design-system"],
    connectedSkills: [
      "zavis-master",
      "zavis-creative-director",
      "image-creator",
    ],
    status: "active",
  },
  {
    id: "zavis-creative-director",
    name: "Zavis Creative Director",
    category: "brand",
    description:
      "Brand-governed image generation with 4-lens QA scoring: text legibility (35%), brand consistency (30%), visual quality (20%), contextual fit (15%).",
    tools: ["gemini-api", "brand-qa", "python"],
    connectedSkills: [
      "zavis-master",
      "zavis-designer",
      "nano-banana",
      "image-creator",
    ],
    status: "active",
  },

  // Optimization & Analytics (3)
  {
    id: "analytics-reporter",
    name: "Analytics Reporter",
    category: "optimization",
    description:
      "Aggregates metrics across all channels: GA4, Google Ads, Meta, GSC, SendGrid, social platforms. Reports KPIs, anomalies, and optimization recommendations.",
    tools: ["ga4", "google-ads", "meta-api", "gsc"],
    connectedSkills: [
      "campaign-planner",
      "ad-manager",
      "social-publisher",
      "email-marketer",
      "seo-optimizer",
    ],
    status: "planned",
  },
  {
    id: "seo-optimizer",
    name: "SEO Optimizer",
    category: "optimization",
    description:
      "Blog SEO, keyword research, ranking tracking, and content optimization. Integrates with Google Search Console data.",
    tools: ["gsc", "keyword-tools"],
    connectedSkills: [
      "content-writer",
      "analytics-reporter",
      "campaign-planner",
    ],
    status: "planned",
  },
  {
    id: "aeo-optimizer",
    name: "AEO Optimizer",
    category: "optimization",
    description:
      "Optimizes for AI chatbot citation (ChatGPT, Claude, Gemini, Perplexity). JSON-LD schema, entity optimization, citation-worthy content structure.",
    tools: ["schema-org", "entity-tools"],
    connectedSkills: ["content-writer", "campaign-planner"],
    status: "planned",
  },

  // Plugin Development (8)
  {
    id: "ao-agent-development",
    name: "Agent Development",
    category: "plugin",
    description:
      "Creates autonomous agents with triggering conditions, system prompts, tool access, and color-coded identification.",
    tools: ["claude-code-sdk"],
    connectedSkills: [
      "ao-plugin-structure",
      "ao-skill-development",
      "ao-hook-development",
    ],
    status: "active",
  },
  {
    id: "ao-command-development",
    name: "Command Development",
    category: "plugin",
    description:
      "Creates slash commands with YAML frontmatter, dynamic arguments, bash execution, file references, and user interaction patterns.",
    tools: ["claude-code-sdk"],
    connectedSkills: ["ao-plugin-structure", "ao-skill-development"],
    status: "active",
  },
  {
    id: "ao-skill-development",
    name: "Skill Development",
    category: "plugin",
    description:
      "Creates plugin skills with progressive disclosure: SKILL.md metadata, body content, and references/ directory for detailed material.",
    tools: ["claude-code-sdk"],
    connectedSkills: [
      "ao-plugin-structure",
      "ao-command-development",
      "ao-skill-creator",
    ],
    status: "active",
  },
  {
    id: "ao-hook-development",
    name: "Hook Development",
    category: "plugin",
    description:
      "Creates event-driven hooks: PreToolUse, PostToolUse, Stop, SubagentStop, SessionStart, SessionEnd, UserPromptSubmit, PreCompact, Notification.",
    tools: ["claude-code-sdk"],
    connectedSkills: [
      "ao-plugin-structure",
      "ao-agent-development",
      "ao-writing-rules",
    ],
    status: "active",
  },
  {
    id: "ao-mcp-builder",
    name: "MCP Builder",
    category: "plugin",
    description:
      "Builds MCP (Model Context Protocol) servers for external integrations. Supports Python (FastMCP) and Node/TypeScript (MCP SDK).",
    tools: ["fastmcp", "mcp-sdk"],
    connectedSkills: ["ao-mcp-integration", "ao-plugin-structure"],
    status: "active",
  },
  {
    id: "ao-mcp-integration",
    name: "MCP Integration",
    category: "plugin",
    description:
      "Integrates MCP servers into plugins. Supports SSE, stdio, HTTP, and WebSocket transport protocols.",
    tools: ["mcp-sdk"],
    connectedSkills: ["ao-mcp-builder", "ao-plugin-structure"],
    status: "active",
  },
  {
    id: "ao-plugin-structure",
    name: "Plugin Structure",
    category: "plugin",
    description:
      "Plugin directory layout, manifest (plugin.json), auto-discovery, component organization, and file naming conventions.",
    tools: ["claude-code-sdk"],
    connectedSkills: [
      "ao-agent-development",
      "ao-command-development",
      "ao-skill-development",
      "ao-hook-development",
      "ao-mcp-integration",
      "ao-plugin-settings",
    ],
    status: "active",
  },
  {
    id: "ao-plugin-settings",
    name: "Plugin Settings",
    category: "plugin",
    description:
      "Stores plugin configuration in .claude/plugin-name.local.md files with YAML frontmatter. Per-project, user-configurable settings.",
    tools: ["yaml-frontmatter"],
    connectedSkills: ["ao-plugin-structure"],
    status: "active",
  },

  // Document Processing (8)
  {
    id: "docx",
    name: "Word Documents",
    category: "document",
    description:
      "Creates and edits .docx files: tables of contents, headings, page numbers, letterheads, tracked changes, and comments.",
    tools: ["python-docx", "libreoffice"],
    connectedSkills: ["ao-docx"],
    status: "active",
  },
  {
    id: "xlsx",
    name: "Spreadsheets",
    category: "document",
    description:
      "Creates and edits Excel spreadsheets with formulas, financial models, charts, conditional formatting, and color coding.",
    tools: ["openpyxl", "libreoffice"],
    connectedSkills: ["ao-xlsx"],
    status: "active",
  },
  {
    id: "pptx",
    name: "Presentations",
    category: "document",
    description:
      "Creates and edits PowerPoint presentations with design philosophy approach. Slide layouts, speaker notes, and comments.",
    tools: ["python-pptx", "libreoffice"],
    connectedSkills: ["ao-pptx"],
    status: "active",
  },
  {
    id: "pdf",
    name: "PDF Processing",
    category: "document",
    description:
      "Reads, creates, merges, splits PDFs. OCR for scanned documents. Form filling, encryption, watermarks, and image extraction.",
    tools: ["pypdf", "ocrmypdf", "libreoffice"],
    connectedSkills: ["ao-pdf"],
    status: "active",
  },
  {
    id: "ao-docx",
    name: "Word Specialist",
    category: "document",
    description:
      "Advanced Word document processing. Find-and-replace, image insertion, template management, and complex formatting.",
    tools: ["python-docx"],
    connectedSkills: ["docx"],
    status: "active",
  },
  {
    id: "ao-xlsx",
    name: "Excel Specialist",
    category: "document",
    description:
      "Advanced spreadsheet processing. Data cleaning, formula validation, pivot-like aggregations, and multi-sheet workbooks.",
    tools: ["openpyxl"],
    connectedSkills: ["xlsx"],
    status: "active",
  },
  {
    id: "ao-pptx",
    name: "PowerPoint Specialist",
    category: "document",
    description:
      "Advanced presentation processing. Slide extraction, template application, and batch processing.",
    tools: ["python-pptx"],
    connectedSkills: ["pptx"],
    status: "active",
  },
  {
    id: "ao-pdf",
    name: "PDF Specialist",
    category: "document",
    description:
      "Advanced PDF processing. Page-level operations, text extraction, table parsing, and format conversion.",
    tools: ["pypdf"],
    connectedSkills: ["pdf"],
    status: "active",
  },

  // Frontend & Design (7)
  {
    id: "ao-brand-guidelines",
    name: "Brand Guidelines",
    category: "design",
    description:
      "Applies Anthropic official brand colors and typography to artifacts. Visual formatting and company design standards.",
    tools: ["css", "design-tokens"],
    connectedSkills: ["ao-theme-factory", "ao-frontend-design"],
    status: "active",
  },
  {
    id: "ao-canvas-design",
    name: "Canvas Design",
    category: "design",
    description:
      "Creates visual designs: posters, artwork, and static pieces using design philosophy approach with PNG and PDF output.",
    tools: ["canvas-api", "design-philosophy"],
    connectedSkills: ["ao-algorithmic-art", "ao-brand-guidelines"],
    status: "active",
  },
  {
    id: "ao-algorithmic-art",
    name: "Algorithmic Art",
    category: "design",
    description:
      "Creates generative art using p5.js with seeded randomness and interactive parameter exploration. Flow fields, particle systems.",
    tools: ["p5js", "canvas"],
    connectedSkills: ["ao-canvas-design", "ao-playground"],
    status: "active",
  },
  {
    id: "ao-theme-factory",
    name: "Theme Factory",
    category: "design",
    description:
      "10 pre-set themes with colors and fonts. Applied to slides, docs, reports, HTML pages, and any styled artifact.",
    tools: ["css", "design-tokens"],
    connectedSkills: ["ao-brand-guidelines", "ao-frontend-design"],
    status: "active",
  },
  {
    id: "ao-frontend-design",
    name: "Frontend Design",
    category: "design",
    description:
      "Creates production-grade React/Vue/Angular components with distinctive aesthetics. Avoids generic AI look-and-feel.",
    tools: ["react", "tailwind", "shadcn"],
    connectedSkills: [
      "ao-web-artifacts-builder",
      "ao-theme-factory",
      "ao-brand-guidelines",
    ],
    status: "active",
  },
  {
    id: "ao-web-artifacts-builder",
    name: "Web Artifacts Builder",
    category: "design",
    description:
      "Builds complex multi-component React + TypeScript + Tailwind + shadcn/ui artifacts with state management and routing.",
    tools: ["react", "typescript", "tailwind", "shadcn"],
    connectedSkills: ["ao-frontend-design", "ao-playground"],
    status: "active",
  },
  {
    id: "ao-playground",
    name: "Playground Builder",
    category: "design",
    description:
      "Creates interactive HTML playgrounds: self-contained single-file explorers with controls, live preview, and prompt export.",
    tools: ["html", "javascript", "css"],
    connectedSkills: [
      "ao-web-artifacts-builder",
      "ao-algorithmic-art",
    ],
    status: "active",
  },

  // Utilities & Support (8)
  {
    id: "ao-slack-gif-creator",
    name: "Slack GIF Creator",
    category: "utility",
    description:
      "Creates animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts.",
    tools: ["gifski", "ffmpeg"],
    connectedSkills: [],
    status: "active",
  },
  {
    id: "ao-webapp-testing",
    name: "Web App Testing",
    category: "utility",
    description:
      "Tests local web apps with Playwright. Browser automation, screenshots, UI debugging, and log capture.",
    tools: ["playwright", "chromium"],
    connectedSkills: ["ao-frontend-design"],
    status: "active",
  },
  {
    id: "ao-skill-creator",
    name: "Skill Creator",
    category: "utility",
    description:
      "Framework for creating new skills iteratively. Includes evals, benchmarking, variance analysis, and description optimization.",
    tools: ["claude-code-sdk"],
    connectedSkills: ["ao-skill-development"],
    status: "active",
  },
  {
    id: "ao-doc-coauthoring",
    name: "Doc Co-authoring",
    category: "utility",
    description:
      "Structured workflow for co-authoring documentation. Context transfer, iterative refinement, and reader verification stages.",
    tools: ["markdown"],
    connectedSkills: ["ao-internal-comms"],
    status: "active",
  },
  {
    id: "ao-claude-automation-recommender",
    name: "Automation Recommender",
    category: "utility",
    description:
      "Analyzes codebases and recommends Claude Code automations: hooks, subagents, skills, plugins, and MCP servers.",
    tools: ["codebase-analysis"],
    connectedSkills: [
      "ao-plugin-structure",
      "ao-skill-development",
      "ao-hook-development",
    ],
    status: "active",
  },
  {
    id: "ao-claude-md-improver",
    name: "CLAUDE.md Improver",
    category: "utility",
    description:
      "Audits and improves CLAUDE.md files. Evaluates quality against templates, outputs reports, makes targeted updates.",
    tools: ["markdown-analysis"],
    connectedSkills: [],
    status: "active",
  },
  {
    id: "ao-writing-rules",
    name: "Writing Rules",
    category: "utility",
    description:
      "Hookify pattern for writing automation rules. Regex-based tool event triggers for automated quality enforcement.",
    tools: ["regex", "hooks"],
    connectedSkills: ["ao-hook-development"],
    status: "active",
  },
  {
    id: "ao-internal-comms",
    name: "Internal Comms",
    category: "utility",
    description:
      "Templates for status reports, leadership updates, 3P updates, newsletters, FAQs, incident reports, and project updates.",
    tools: ["templates"],
    connectedSkills: ["ao-doc-coauthoring", "content-writer"],
    status: "active",
  },
];

const SKILL_MAP = new Map(SKILLS.map((s) => [s.id, s]));

/* ------------------------------------------------------------------ */
/*  NEXUS VIEW — POSITIONS                                             */
/* ------------------------------------------------------------------ */

// Position skills in category clusters around the canvas
const CATEGORY_POSITIONS: Record<
  SkillCategory,
  { cx: number; cy: number; startAngle: number }
> = {
  core: { cx: 500, cy: 350, startAngle: -90 },
  brand: { cx: 190, cy: 200, startAngle: 0 },
  optimization: { cx: 810, cy: 200, startAngle: 0 },
  plugin: { cx: 850, cy: 550, startAngle: 0 },
  document: { cx: 150, cy: 550, startAngle: 0 },
  design: { cx: 810, cy: 380, startAngle: 0 },
  utility: { cx: 150, cy: 380, startAngle: 0 },
};

function getSkillNexusPos(
  skill: Skill,
  indexInCategory: number,
  totalInCategory: number
): { x: number; y: number } {
  const cp = CATEGORY_POSITIONS[skill.category];
  if (skill.category === "core") {
    // Core skills in a circle around center
    const r = 130;
    const angle =
      cp.startAngle + (360 / totalInCategory) * indexInCategory;
    const rad = (angle * Math.PI) / 180;
    return { x: cp.cx + r * Math.cos(rad), y: cp.cy + r * Math.sin(rad) };
  }
  // Other categories in smaller clusters
  const r = totalInCategory <= 3 ? 50 : totalInCategory <= 5 ? 65 : 80;
  const angle = (360 / totalInCategory) * indexInCategory;
  const rad = (angle * Math.PI) / 180;
  return { x: cp.cx + r * Math.cos(rad), y: cp.cy + r * Math.sin(rad) };
}

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

function SkillCard({
  skill,
  isExpanded,
  onClick,
}: {
  skill: Skill;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const cat = CATEGORY_META[skill.category];
  const connected = skill.connectedSkills
    .map((id) => SKILL_MAP.get(id))
    .filter(Boolean) as Skill[];

  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 ${
        isExpanded
          ? "ring-2 shadow-md"
          : "hover:shadow-sm"
      }`}
      style={isExpanded ? { borderColor: cat.color + "40", boxShadow: `0 4px 12px ${cat.color}15` } : {}}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: cat.color }}
          />
          <h4 className="text-sm font-medium">{skill.name}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor:
                skill.status === "active"
                  ? "#dcfce7"
                  : skill.status === "partial"
                  ? "#fef3c7"
                  : "#f1f5f9",
              color:
                skill.status === "active"
                  ? "#166534"
                  : skill.status === "partial"
                  ? "#92400e"
                  : "#475569",
            }}
          >
            {skill.status}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform text-muted-foreground ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
        {skill.description}
      </p>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              Tools & APIs
            </p>
            <div className="flex flex-wrap gap-1">
              {skill.tools.map((t) => (
                <span
                  key={t}
                  className="text-[11px] bg-muted px-1.5 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {connected.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                Connected Skills ({connected.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {connected.map((cs) => (
                  <span
                    key={cs.id}
                    className="text-[11px] px-1.5 py-0.5 rounded border"
                    style={{
                      borderColor:
                        CATEGORY_META[cs.category].color + "30",
                      color: CATEGORY_META[cs.category].color,
                    }}
                  >
                    {cs.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              Skill File
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              skills/{skill.id}/SKILL.md
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

function NexusNode({
  skill,
  x,
  y,
  isSelected,
  isHighlighted,
  onClick,
}: {
  skill: Skill;
  x: number;
  y: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const color = CATEGORY_META[skill.category].color;
  const r = skill.category === "core" ? 26 : 22;
  const dim = !isHighlighted && !isSelected;

  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      opacity={dim ? 0.25 : 1}
      style={{ transition: "opacity 0.3s" }}
    >
      {isSelected && (
        <circle cx={x} cy={y} r={r + 6} fill="none" stroke={color} strokeWidth="1.5" opacity="0.4">
          <animate
            attributeName="r"
            values={`${r + 4};${r + 9};${r + 4}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="white"
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <circle cx={x} cy={y} r={r - 5} fill={color} opacity="0.08" />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        fontSize="8"
        fontWeight="600"
        fill="#1c1c1c"
        className="pointer-events-none select-none"
      >
        {skill.name.length > 12
          ? skill.name.slice(0, 11) + "..."
          : skill.name}
      </text>
      <circle
        cx={x + r - 3}
        cy={y - r + 3}
        r="3.5"
        fill={
          skill.status === "active"
            ? "#22c55e"
            : skill.status === "partial"
            ? "#f59e0b"
            : "#94a3b8"
        }
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function SkillsPage() {
  const [view, setView] = useState<"list" | "nexus">("list");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedNexusId, setSelectedNexusId] = useState<string | null>(
    null
  );

  const filteredSkills = useMemo(() => {
    if (!search.trim()) return SKILLS;
    const q = search.toLowerCase();
    return SKILLS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.includes(q)
    );
  }, [search]);

  const byCategory = useMemo(() => {
    const map = new Map<SkillCategory, Skill[]>();
    for (const s of filteredSkills) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return map;
  }, [filteredSkills]);

  // Nexus positioning
  const nexusPositions = useMemo(() => {
    const catGroups = new Map<SkillCategory, Skill[]>();
    for (const s of SKILLS) {
      const arr = catGroups.get(s.category) ?? [];
      arr.push(s);
      catGroups.set(s.category, arr);
    }
    const positions = new Map<string, { x: number; y: number }>();
    for (const [cat, skills] of catGroups) {
      skills.forEach((s, i) => {
        positions.set(s.id, getSkillNexusPos(s, i, skills.length));
      });
    }
    return positions;
  }, []);

  // Nexus highlighting
  const selectedNexusSkill = selectedNexusId
    ? SKILL_MAP.get(selectedNexusId)
    : null;
  const highlightedNexusIds = new Set<string>();
  if (selectedNexusSkill) {
    highlightedNexusIds.add(selectedNexusSkill.id);
    selectedNexusSkill.connectedSkills.forEach((id) =>
      highlightedNexusIds.add(id)
    );
  }

  // All connection lines for nexus (deduplicated)
  const nexusConnections = useMemo(() => {
    const seen = new Set<string>();
    const conns: { from: string; to: string }[] = [];
    for (const s of SKILLS) {
      for (const cid of s.connectedSkills) {
        const key = [s.id, cid].sort().join("|");
        if (!seen.has(key) && SKILL_MAP.has(cid)) {
          seen.add(key);
          conns.push({ from: s.id, to: cid });
        }
      }
    }
    return conns;
  }, []);

  // Stats
  const activeCount = SKILLS.filter((s) => s.status === "active").length;
  const partialCount = SKILLS.filter((s) => s.status === "partial").length;
  const plannedCount = SKILLS.filter((s) => s.status === "planned").length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Skill Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {SKILLS.length} skills powering the Zavis CMO ecosystem. Toggle
            between list and nexus views.
          </p>
        </div>
      </div>

      {/* Stats + Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006828]/10 flex items-center justify-center">
              <span className="text-sm font-bold text-[#006828]">
                {SKILLS.length}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-sm font-bold text-green-700">
                {activeCount}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-700">
                {partialCount}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-600">
                {plannedCount}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Planned</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search (list view only) */}
          {view === "list" && (
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm px-3 py-1.5 border rounded-md bg-white w-48 focus:outline-none focus:ring-2 focus:ring-[#006828]/20"
            />
          )}

          {/* View toggle */}
          <div className="flex items-center rounded-md border overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-[#006828] text-white"
                  : "bg-white text-muted-foreground hover:text-foreground"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("nexus")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "nexus"
                  ? "bg-[#006828] text-white"
                  : "bg-white text-muted-foreground hover:text-foreground"
              }`}
            >
              Nexus View
            </button>
          </div>
        </div>
      </div>

      {/* Category legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const count = SKILLS.filter((s) => s.category === key).length;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-[11px] text-muted-foreground">
                {meta.label} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="space-y-6">
          {(
            [
              "core",
              "brand",
              "optimization",
              "plugin",
              "document",
              "design",
              "utility",
            ] as SkillCategory[]
          ).map((cat) => {
            const skills = byCategory.get(cat);
            if (!skills || skills.length === 0) return null;
            const meta = CATEGORY_META[cat];

            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: meta.color }}
                  />
                  <h2 className="font-heading text-base font-semibold">
                    {meta.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    ({skills.length})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 max-w-2xl">
                  {meta.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.map((s) => (
                    <SkillCard
                      key={s.id}
                      skill={s}
                      isExpanded={expandedId === s.id}
                      onClick={() =>
                        setExpandedId(
                          expandedId === s.id ? null : s.id
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEXUS VIEW */}
      {view === "nexus" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card
            className={`${
              selectedNexusSkill ? "xl:col-span-2" : "xl:col-span-3"
            } p-0 overflow-hidden transition-all duration-300`}
          >
            <div className="relative bg-gradient-to-br from-white to-[#f8f8f6]">
              <svg
                viewBox="0 0 1000 720"
                className="w-full h-auto"
                style={{ minHeight: 500 }}
              >
                {/* Category cluster labels */}
                {Object.entries(CATEGORY_POSITIONS).map(([cat, pos]) => (
                  <text
                    key={cat}
                    x={pos.cx}
                    y={
                      cat === "core"
                        ? pos.cy - 155
                        : pos.cy -
                          (SKILLS.filter((s) => s.category === cat)
                            .length <= 3
                            ? 65
                            : SKILLS.filter((s) => s.category === cat)
                                .length <= 5
                            ? 80
                            : 100)
                    }
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={
                      CATEGORY_META[cat as SkillCategory].color
                    }
                    opacity="0.6"
                    className="select-none"
                  >
                    {CATEGORY_META[cat as SkillCategory].label}
                  </text>
                ))}

                {/* Connection lines */}
                {nexusConnections.map((conn, i) => {
                  const p1 = nexusPositions.get(conn.from);
                  const p2 = nexusPositions.get(conn.to);
                  if (!p1 || !p2) return null;

                  const isHL =
                    selectedNexusSkill &&
                    highlightedNexusIds.has(conn.from) &&
                    highlightedNexusIds.has(conn.to);

                  return (
                    <line
                      key={i}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={
                        isHL ? "#006828" : "#d1d5db"
                      }
                      strokeWidth={isHL ? 2 : 0.8}
                      opacity={
                        selectedNexusSkill
                          ? isHL
                            ? 1
                            : 0.15
                          : 0.35
                      }
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Skill nodes */}
                {SKILLS.map((s) => {
                  const pos = nexusPositions.get(s.id);
                  if (!pos) return null;
                  return (
                    <NexusNode
                      key={s.id}
                      skill={s}
                      x={pos.x}
                      y={pos.y}
                      isSelected={selectedNexusId === s.id}
                      isHighlighted={
                        !selectedNexusSkill ||
                        highlightedNexusIds.has(s.id)
                      }
                      onClick={() =>
                        setSelectedNexusId(
                          selectedNexusId === s.id ? null : s.id
                        )
                      }
                    />
                  );
                })}
              </svg>

              {/* Click hint */}
              {!selectedNexusSkill && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border">
                  Click any skill to see connections and details
                </div>
              )}
            </div>
          </Card>

          {/* Detail panel for nexus view */}
          {selectedNexusSkill && (
            <Card className="p-5 xl:col-span-1 self-start sticky top-20">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_META[selectedNexusSkill.category]
                              .color,
                        }}
                      />
                      <span
                        className="text-[10px] uppercase tracking-wider font-medium"
                        style={{
                          color:
                            CATEGORY_META[selectedNexusSkill.category]
                              .color,
                        }}
                      >
                        {CATEGORY_META[selectedNexusSkill.category].label}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold">
                      {selectedNexusSkill.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNexusId(null)}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div
                  className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit"
                  style={{
                    backgroundColor:
                      selectedNexusSkill.status === "active"
                        ? "#dcfce7"
                        : selectedNexusSkill.status === "partial"
                        ? "#fef3c7"
                        : "#f1f5f9",
                    color:
                      selectedNexusSkill.status === "active"
                        ? "#166534"
                        : selectedNexusSkill.status === "partial"
                        ? "#92400e"
                        : "#475569",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        selectedNexusSkill.status === "active"
                          ? "#22c55e"
                          : selectedNexusSkill.status === "partial"
                          ? "#f59e0b"
                          : "#94a3b8",
                    }}
                  />
                  {selectedNexusSkill.status === "active"
                    ? "Active"
                    : selectedNexusSkill.status === "partial"
                    ? "Partially Built"
                    : "Planned"}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedNexusSkill.description}
                </p>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                    Tools & APIs
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNexusSkill.tools.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] bg-muted px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedNexusSkill.connectedSkills.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                      Connected Skills (
                      {selectedNexusSkill.connectedSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNexusSkill.connectedSkills
                        .map((id) => SKILL_MAP.get(id))
                        .filter(Boolean)
                        .map((cs) => (
                          <button
                            key={cs!.id}
                            onClick={() =>
                              setSelectedNexusId(cs!.id)
                            }
                            className="text-[11px] px-2 py-0.5 rounded border hover:shadow-sm transition-shadow"
                            style={{
                              borderColor:
                                CATEGORY_META[cs!.category].color +
                                "40",
                              color:
                                CATEGORY_META[cs!.category].color,
                            }}
                          >
                            {cs!.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                    Skill File
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    skills/{selectedNexusSkill.id}/SKILL.md
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
