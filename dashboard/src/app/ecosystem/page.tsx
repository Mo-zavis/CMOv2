"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

type NodeCategory =
  | "core"
  | "infrastructure"
  | "api"
  | "dashboard"
  | "output"
  | "human";

interface EcoNode {
  id: string;
  label: string;
  category: NodeCategory;
  ring: number; // 0 = center, 1 = inner, 2 = outer
  angle: number; // degrees, 0 = top
  description: string;
  status: "active" | "partial" | "planned";
  tech: string;
  connections: string[];
  dataFlow: string;
  keyFiles: string[];
}

const CATEGORY_COLORS: Record<NodeCategory, string> = {
  core: "#006828",
  infrastructure: "#374151",
  api: "#2563eb",
  dashboard: "#7c3aed",
  output: "#ea580c",
  human: "#0891b2",
};

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  core: "AI Runtime",
  infrastructure: "Infrastructure",
  api: "External APIs",
  dashboard: "Dashboard",
  output: "Output Channels",
  human: "Human Control",
};

const NODES: EcoNode[] = [
  {
    id: "claude",
    label: "Claude Code",
    category: "core",
    ring: 0,
    angle: 0,
    description:
      "The AI-powered engine running in VS Code. Executes marketing workflows using 41 specialized skills, orchestrates content creation, and manages the entire marketing pipeline.",
    status: "active",
    tech: "Claude Opus 4, VS Code Extension, Claude Agent SDK",
    connections: ["skills", "scripts", "database", "files", "human"],
    dataFlow:
      "Reads skills and brand rules. Writes assets to filesystem. Writes metadata to DB via db-writer. Reads feedback from DB.",
    keyFiles: ["CLAUDE.md", "skills/", ".claude/"],
  },
  // Ring 1 — Infrastructure
  {
    id: "skills",
    label: "Skills Engine",
    category: "infrastructure",
    ring: 1,
    angle: 0,
    description:
      "41 specialized skills for marketing, content, design, plugin development, and automation. Each skill has a SKILL.md with capabilities, triggers, and reference material.",
    status: "active",
    tech: "Markdown + YAML frontmatter, progressive disclosure",
    connections: ["claude", "gemini", "remotion", "postiz"],
    dataFlow:
      "Loaded by Claude Code on demand. Skills reference external APIs (Gemini, Remotion, Postiz) and internal tools (db-writer, scripts).",
    keyFiles: ["skills/*/SKILL.md", "skills/zavis-master/", "skills/content-writer/"],
  },
  {
    id: "scripts",
    label: "Scripts & CLI",
    category: "infrastructure",
    ring: 1,
    angle: 90,
    description:
      "TypeScript and Python scripts for database operations (17 commands), video processing, voiceover generation, and frame extraction.",
    status: "active",
    tech: "TypeScript (tsx), Python 3, FFmpeg",
    connections: ["claude", "database", "remotion", "files"],
    dataFlow:
      "db-writer.ts writes to SQLite via Prisma. Python scripts process video with FFmpeg. All scripts invoked by Claude Code.",
    keyFiles: [
      "scripts/db-writer.ts",
      "scripts/generate_video_clip.py",
      "scripts/extract_end_frame.py",
      "scripts/generate_voiceover.py",
      "scripts/postiz-client.ts",
    ],
  },
  {
    id: "database",
    label: "SQLite + Prisma",
    category: "infrastructure",
    ring: 1,
    angle: 180,
    description:
      "Shared SQLite database with Prisma 5 ORM. Stores projects, assets, versions, feedback, campaigns, ad groups, creatives, video scenes, and calendar events.",
    status: "active",
    tech: "SQLite, Prisma 5.22.0, 10 models",
    connections: ["scripts", "dashboard"],
    dataFlow:
      "Written by db-writer CLI (runtime side). Read by Next.js Dashboard via Prisma client. Single source of truth for all asset state.",
    keyFiles: ["dashboard/prisma/schema.prisma", "dashboard/prisma/dev.db"],
  },
  {
    id: "files",
    label: "Asset Storage",
    category: "infrastructure",
    ring: 1,
    angle: 270,
    description:
      "Filesystem-based storage for all generated assets. Organized by type and asset ID with version numbering.",
    status: "active",
    tech: "Local filesystem, /assets/{type}/{id}/v{n}.{ext}",
    connections: ["claude", "scripts", "dashboard", "gemini", "remotion"],
    dataFlow:
      "Written by Claude Code and scripts. Images from Gemini, videos from Remotion/FFmpeg. Served by Dashboard via /api/files/ route.",
    keyFiles: ["assets/images/", "assets/videos/", "assets/copy/"],
  },
  // Ring 2 — External Services & Interfaces
  {
    id: "gemini",
    label: "Gemini API",
    category: "api",
    ring: 2,
    angle: 330,
    description:
      "Google Gemini image generation API. Used by nano-banana (basic generation) and zavis-creative-director (brand-governed generation with QA scoring).",
    status: "active",
    tech: "Google Gemini API, Python requests",
    connections: ["skills", "files"],
    dataFlow:
      "Claude Code invokes via skills. Python script sends prompt to Gemini. Generated image saved to /assets/images/. Brand QA scores written to DB.",
    keyFiles: [
      "skills/nano-banana/",
      "skills/zavis-creative-director/scripts/generate_image.py",
      "dashboard/.env (GEMINI_API_KEY)",
    ],
  },
  {
    id: "remotion",
    label: "Remotion + FFmpeg",
    category: "api",
    ring: 2,
    angle: 30,
    description:
      "Video rendering pipeline. Remotion for React-based video composition. FFmpeg for clip generation, frame extraction, and video concatenation.",
    status: "active",
    tech: "Remotion 4.0.261, React 18, FFmpeg, Python",
    connections: ["scripts", "skills", "files"],
    dataFlow:
      "Scene-by-scene workflow: script planning, Veo 3 generation, Remotion composition, FFmpeg assembly. Output to /assets/videos/.",
    keyFiles: [
      "remotion/",
      "remotion/remotion.config.ts",
      "scripts/generate_video_clip.py",
      "scripts/concat_video.sh",
    ],
  },
  {
    id: "postiz",
    label: "Postiz + Docker",
    category: "api",
    ring: 2,
    angle: 210,
    description:
      "Self-hosted social media scheduling platform running in Docker. 3 containers: Postiz app (port 4007), PostgreSQL, Redis. Supports 20+ social platforms.",
    status: "active",
    tech: "Docker Compose, Colima, PostgreSQL, Redis",
    connections: ["skills", "outputs"],
    dataFlow:
      "Claude Code schedules posts via postiz-client.ts CLI. Dashboard reads integrations via Postiz public API. Posts distributed to connected social accounts.",
    keyFiles: [
      "docker/docker-compose.postiz.yml",
      "docker/postiz.env",
      "scripts/postiz-client.ts",
      "dashboard/src/lib/postiz.ts",
    ],
  },
  {
    id: "dashboard",
    label: "Next.js Dashboard",
    category: "dashboard",
    ring: 2,
    angle: 150,
    description:
      "Web-based feedback layer for human oversight. Displays all assets, campaigns, calendar, and analytics. Captures feedback, manages approvals, runs brand checks, tracks versions.",
    status: "active",
    tech: "Next.js 16, React 19, Tailwind 4, shadcn/ui, Prisma 5",
    connections: ["database", "files", "human", "outputs"],
    dataFlow:
      "Reads from shared SQLite DB and asset filesystem. Humans submit feedback and approvals. Feedback stored in DB for Claude to read.",
    keyFiles: [
      "dashboard/src/app/",
      "dashboard/src/components/shared/",
      "dashboard/src/lib/status-machine.ts",
    ],
  },
  {
    id: "human",
    label: "Human Control",
    category: "human",
    ring: 2,
    angle: 270,
    description:
      "Two-way human-in-the-loop communication. Direct VS Code control of Claude Code sessions. Dashboard feedback that flows back to runtime. OpenClaw prompt injection for async guidance.",
    status: "active",
    tech: "VS Code Terminal, Dashboard UI, OpenClaw Prompts",
    connections: ["claude", "dashboard"],
    dataFlow:
      "Direct: Human types in VS Code terminal to Claude Code. Async: Human submits feedback in Dashboard, stored in DB, Claude reads via db-writer read-feedback command.",
    keyFiles: [
      "dashboard/src/components/shared/FeedbackPanel.tsx",
      "dashboard/src/components/shared/ApprovalBar.tsx",
    ],
  },
  {
    id: "outputs",
    label: "Output Channels",
    category: "output",
    ring: 2,
    angle: 90,
    description:
      "Final distribution endpoints for marketing content. Social media (20+ platforms via Postiz), Google Ads, Meta Ads, Email (SendGrid), and Blog/Website.",
    status: "partial",
    tech: "Postiz (social), Google Ads API (planned), Meta API (planned), SendGrid (planned)",
    connections: ["dashboard", "postiz"],
    dataFlow:
      "Social posts distributed via Postiz to connected accounts. Ads, email, and blog publishing are planned for Phase 2-4.",
    keyFiles: ["dashboard/src/lib/social-platforms.ts"],
  },
];

interface Workflow {
  id: string;
  title: string;
  steps: string[];
  status: "active" | "partial" | "planned";
  phase: string;
}

const WORKFLOWS: Workflow[] = [
  {
    id: "image",
    title: "Image Creation",
    steps: [
      "Campaign Brief",
      "Content Writer (prompt)",
      "Image Creator skill",
      "Gemini API",
      "Brand QA (4-lens)",
      "Dashboard Review",
      "Approve / Revise",
    ],
    status: "active",
    phase: "Phase 1",
  },
  {
    id: "content",
    title: "Content Writing",
    steps: [
      "Campaign Brief",
      "Content Writer skill",
      "Copy Compliance Check",
      "Dashboard Review",
      "Approve / Revise",
      "Publish",
    ],
    status: "active",
    phase: "Phase 1",
  },
  {
    id: "video",
    title: "Video Production",
    steps: [
      "Script Writing",
      "Scene Planning",
      "Veo 3 / Remotion Render",
      "FFmpeg Assembly",
      "Dashboard Review",
      "Publish",
    ],
    status: "partial",
    phase: "Phase 3",
  },
  {
    id: "social",
    title: "Social Publishing",
    steps: [
      "Content + Image",
      "Caption Writing",
      "Postiz Scheduling",
      "Platform APIs",
      "Engagement Analytics",
    ],
    status: "active",
    phase: "Phase 4",
  },
  {
    id: "ads",
    title: "Ad Campaigns",
    steps: [
      "Creative Pairing",
      "Platform Setup",
      "Audience Targeting",
      "Budget Allocation",
      "Performance Analytics",
    ],
    status: "partial",
    phase: "Phase 2",
  },
  {
    id: "feedback",
    title: "Feedback Loop",
    steps: [
      "Asset in Dashboard",
      "Human Reviews",
      "Feedback to DB",
      "Claude Reads Feedback",
      "New Version Generated",
      "Cycle Repeats",
    ],
    status: "active",
    phase: "Always Active",
  },
];

interface Connection {
  from: string;
  to: string;
  label?: string;
  bidirectional?: boolean;
}

const CONNECTIONS: Connection[] = [
  { from: "claude", to: "skills", label: "loads", bidirectional: false },
  { from: "claude", to: "scripts", label: "invokes", bidirectional: false },
  { from: "claude", to: "files", label: "writes", bidirectional: false },
  { from: "scripts", to: "database", label: "writes", bidirectional: false },
  { from: "skills", to: "gemini", label: "calls", bidirectional: false },
  { from: "skills", to: "remotion", label: "renders", bidirectional: false },
  { from: "skills", to: "postiz", label: "schedules", bidirectional: false },
  { from: "scripts", to: "remotion", label: "processes", bidirectional: false },
  { from: "gemini", to: "files", label: "images", bidirectional: false },
  { from: "remotion", to: "files", label: "videos", bidirectional: false },
  { from: "database", to: "dashboard", label: "reads", bidirectional: false },
  { from: "files", to: "dashboard", label: "serves", bidirectional: false },
  { from: "dashboard", to: "outputs", label: "distributes", bidirectional: false },
  { from: "postiz", to: "outputs", label: "publishes", bidirectional: false },
  { from: "human", to: "claude", label: "controls", bidirectional: false },
  { from: "dashboard", to: "human", label: "feedback UI", bidirectional: true },
];

/* ------------------------------------------------------------------ */
/*  GEOMETRY HELPERS                                                   */
/* ------------------------------------------------------------------ */

const CX = 500;
const CY = 400;
const RING_RADII = [0, 155, 310];
const NODE_RADII = [58, 42, 38];

function getNodePos(node: EcoNode): { x: number; y: number } {
  if (node.ring === 0) return { x: CX, y: CY };
  const r = RING_RADII[node.ring];
  const rad = ((node.angle - 90) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));

/* ------------------------------------------------------------------ */
/*  SVG COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

function ConnectionLine({
  conn,
  isHighlighted,
}: {
  conn: Connection;
  isHighlighted: boolean;
}) {
  const fromNode = NODE_MAP.get(conn.from);
  const toNode = NODE_MAP.get(conn.to);
  if (!fromNode || !toNode) return null;

  const p1 = getNodePos(fromNode);
  const p2 = getNodePos(toNode);

  return (
    <line
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke={isHighlighted ? "#006828" : "#d1d5db"}
      strokeWidth={isHighlighted ? 2.5 : 1.2}
      strokeDasharray={isHighlighted ? "none" : "6 4"}
      opacity={isHighlighted ? 1 : 0.5}
      className="transition-all duration-300"
    />
  );
}

function NodeCircle({
  node,
  isSelected,
  isHighlighted,
  onClick,
}: {
  node: EcoNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const pos = getNodePos(node);
  const r = NODE_RADII[node.ring];
  const color = CATEGORY_COLORS[node.category];
  const dim = !isHighlighted && !isSelected;

  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      style={{ transition: "opacity 0.3s" }}
      opacity={dim ? 0.4 : 1}
    >
      {/* Outer glow on selected */}
      {isSelected && (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={r + 8}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values={`${r + 6};${r + 12};${r + 6}`}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main circle */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={r}
        fill="white"
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-200"
      />

      {/* Center pulse for core node */}
      {node.ring === 0 && (
        <circle cx={pos.x} cy={pos.y} r={r - 6} fill={color} opacity="0.08">
          <animate
            attributeName="r"
            values={`${r - 10};${r - 4};${r - 10}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Category dot */}
      <circle cx={pos.x} cy={pos.y - r + 10} r="4" fill={color} />

      {/* Label */}
      <text
        x={pos.x}
        y={pos.y + 2}
        textAnchor="middle"
        fontSize={node.ring === 0 ? "13" : "11"}
        fontWeight={node.ring === 0 ? "700" : "600"}
        fill="#1c1c1c"
        className="pointer-events-none select-none"
      >
        {node.label.length > 14
          ? node.label.split(/[\s+&]/)[0]
          : node.label}
      </text>
      {node.label.length > 14 && (
        <text
          x={pos.x}
          y={pos.y + 16}
          textAnchor="middle"
          fontSize="10"
          fill="#6b6b6b"
          className="pointer-events-none select-none"
        >
          {node.label.includes("+")
            ? node.label.split("+").pop()?.trim()
            : node.label.split(/\s/).slice(1).join(" ")}
        </text>
      )}

      {/* Status indicator */}
      <circle
        cx={pos.x + r - 6}
        cy={pos.y - r + 6}
        r="5"
        fill={
          node.status === "active"
            ? "#22c55e"
            : node.status === "partial"
            ? "#f59e0b"
            : "#94a3b8"
        }
        stroke="white"
        strokeWidth="2"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  DETAIL PANEL                                                       */
/* ------------------------------------------------------------------ */

function DetailPanel({
  node,
  onClose,
}: {
  node: EcoNode;
  onClose: () => void;
}) {
  const color = CATEGORY_COLORS[node.category];
  const connectedNodes = node.connections
    .map((id) => NODE_MAP.get(id))
    .filter(Boolean) as EcoNode[];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{ color }}
            >
              {CATEGORY_LABELS[node.category]}
            </span>
          </div>
          <h3 className="font-heading text-lg font-semibold">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
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
            node.status === "active"
              ? "#dcfce7"
              : node.status === "partial"
              ? "#fef3c7"
              : "#f1f5f9",
          color:
            node.status === "active"
              ? "#166534"
              : node.status === "partial"
              ? "#92400e"
              : "#475569",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor:
              node.status === "active"
                ? "#22c55e"
                : node.status === "partial"
                ? "#f59e0b"
                : "#94a3b8",
          }}
        />
        {node.status === "active"
          ? "Active"
          : node.status === "partial"
          ? "Partially Built"
          : "Planned"}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {node.description}
      </p>

      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Technology</p>
        <p className="text-xs text-muted-foreground">{node.tech}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Data Flow</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {node.dataFlow}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">
          Connected To ({connectedNodes.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {connectedNodes.map((cn) => (
            <span
              key={cn.id}
              className="text-[11px] px-2 py-0.5 rounded border"
              style={{
                borderColor: CATEGORY_COLORS[cn.category] + "40",
                color: CATEGORY_COLORS[cn.category],
                backgroundColor: CATEGORY_COLORS[cn.category] + "08",
              }}
            >
              {cn.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Key Files</p>
        {node.keyFiles.map((f) => (
          <p key={f} className="text-[11px] text-muted-foreground font-mono">
            {f}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WORKFLOW CARD                                                      */
/* ------------------------------------------------------------------ */

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">{workflow.title}</h4>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor:
                workflow.status === "active"
                  ? "#dcfce7"
                  : workflow.status === "partial"
                  ? "#fef3c7"
                  : "#f1f5f9",
              color:
                workflow.status === "active"
                  ? "#166534"
                  : workflow.status === "partial"
                  ? "#92400e"
                  : "#475569",
            }}
          >
            {workflow.phase}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="flex items-center gap-1 flex-wrap mt-3">
          {workflow.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[11px] bg-muted px-2 py-1 rounded whitespace-nowrap">
                {step}
              </span>
              {i < workflow.steps.length - 1 && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function EcosystemPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? NODE_MAP.get(selectedId) ?? null : null;

  // Determine which nodes to highlight (selected + its connections)
  const highlightedIds = new Set<string>();
  if (selected) {
    highlightedIds.add(selected.id);
    selected.connections.forEach((c) => highlightedIds.add(c));
  }

  const isConnectionHighlighted = (conn: Connection) => {
    if (!selected) return false;
    return highlightedIds.has(conn.from) && highlightedIds.has(conn.to);
  };

  const isNodeHighlighted = (node: EcoNode) => {
    if (!selected) return true; // all visible when none selected
    return highlightedIds.has(node.id);
  };

  // Stats
  const activeCount = NODES.filter((n) => n.status === "active").length;
  const totalConnections = CONNECTIONS.length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Ecosystem Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          How every component of the Zavis CMO system connects, communicates,
          and produces outcomes.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#006828]/10 flex items-center justify-center">
            <span className="text-sm font-bold text-[#006828]">
              {NODES.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Components</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#006828]/10 flex items-center justify-center">
            <span className="text-sm font-bold text-[#006828]">
              {totalConnections}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Connections</span>
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
          <div className="w-8 h-8 rounded-lg bg-[#006828]/10 flex items-center justify-center">
            <span className="text-sm font-bold text-[#006828]">41</span>
          </div>
          <Link
            href="/skills"
            className="text-xs text-[#006828] hover:underline"
          >
            Skills loaded
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#006828]/10 flex items-center justify-center">
            <span className="text-sm font-bold text-[#006828]">6</span>
          </div>
          <span className="text-xs text-muted-foreground">Workflows</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: CATEGORY_COLORS[key as NodeCategory],
              }}
            />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Active
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Partial
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-400" /> Planned
          </span>
        </div>
      </div>

      {/* Main diagram + detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* SVG Diagram */}
        <Card
          className={`${
            selected ? "xl:col-span-2" : "xl:col-span-3"
          } p-0 overflow-hidden transition-all duration-300`}
        >
          <div className="relative bg-gradient-to-br from-white to-[#f8f8f6]">
            <svg
              viewBox="0 0 1000 800"
              className="w-full h-auto"
              style={{ minHeight: 500 }}
            >
              {/* Ring guides */}
              {RING_RADII.slice(1).map((r, i) => (
                <circle
                  key={i}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="#e5e4e1"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.6"
                />
              ))}

              {/* Ring labels */}
              <text
                x={CX + RING_RADII[1] + 5}
                y={CY - RING_RADII[1] - 8}
                fontSize="9"
                fill="#9ca3af"
                className="select-none"
              >
                Core Infrastructure
              </text>
              <text
                x={CX + RING_RADII[2] - 30}
                y={CY - RING_RADII[2] - 8}
                fontSize="9"
                fill="#9ca3af"
                className="select-none"
              >
                Services & Interfaces
              </text>

              {/* Connections */}
              {CONNECTIONS.map((conn, i) => (
                <ConnectionLine
                  key={i}
                  conn={conn}
                  isHighlighted={isConnectionHighlighted(conn)}
                />
              ))}

              {/* Nodes */}
              {NODES.map((node) => (
                <NodeCircle
                  key={node.id}
                  node={node}
                  isSelected={selectedId === node.id}
                  isHighlighted={isNodeHighlighted(node)}
                  onClick={() =>
                    setSelectedId(selectedId === node.id ? null : node.id)
                  }
                />
              ))}
            </svg>

            {/* Click hint */}
            {!selected && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border">
                Click any node to see details
              </div>
            )}
          </div>
        </Card>

        {/* Detail Panel */}
        {selected && (
          <Card className="p-5 xl:col-span-1 self-start sticky top-20">
            <DetailPanel
              node={selected}
              onClose={() => setSelectedId(null)}
            />
          </Card>
        )}
      </div>

      {/* Data Flow Summary */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-1">
          Communication Architecture
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          The Runtime and Dashboard never call each other directly. They share a
          SQLite database and asset filesystem as the communication layer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-[#006828]">
            <h4 className="text-sm font-medium mb-2">
              Runtime writes
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Assets, versions, brand checks to DB</li>
              <li>Generated files to /assets/ filesystem</li>
              <li>Campaign structures and ad groups</li>
              <li>Calendar events and video scenes</li>
            </ul>
          </Card>
          <Card className="p-4 border-l-4 border-l-[#7c3aed]">
            <h4 className="text-sm font-medium mb-2">
              Dashboard reads + captures
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>All assets, versions, campaigns from DB</li>
              <li>Asset files via /api/files/ route</li>
              <li>Writes human feedback and approvals back to DB</li>
              <li>Status transitions (DRAFT to PUBLISHED)</li>
            </ul>
          </Card>
          <Card className="p-4 border-l-4 border-l-[#0891b2]">
            <h4 className="text-sm font-medium mb-2">
              Feedback closes the loop
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                Claude reads unactioned feedback via db-writer read-feedback
              </li>
              <li>Generates new asset versions based on feedback</li>
              <li>Marks feedback as actioned with result version ID</li>
              <li>Human verifies in Dashboard. Cycle repeats.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Workflows */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-1">Workflows</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Click to expand the step-by-step flow for each workflow.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKFLOWS.map((w) => (
            <WorkflowCard key={w.id} workflow={w} />
          ))}
        </div>
      </div>

      {/* Status Flow */}
      <Card className="p-5">
        <h3 className="text-sm font-medium mb-3">
          Asset Status Machine
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "DRAFT", color: "bg-gray-200 text-gray-700" },
            { label: "IN_REVIEW", color: "bg-amber-100 text-amber-700" },
            { label: "APPROVED", color: "bg-green-100 text-green-700" },
            { label: "PUBLISHED", color: "bg-blue-100 text-blue-700" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded font-medium ${s.color}`}>
                {s.label}
              </span>
              {i < 3 && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            (REVISION_REQUESTED loops back to DRAFT with new version)
          </span>
        </div>
      </Card>

      {/* Tech Stack */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-3">
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: "Claude Opus 4", cat: "AI" },
            { name: "Next.js 16", cat: "Frontend" },
            { name: "React 19", cat: "Frontend" },
            { name: "Tailwind 4", cat: "Styling" },
            { name: "shadcn/ui", cat: "Components" },
            { name: "Prisma 5", cat: "ORM" },
            { name: "SQLite", cat: "Database" },
            { name: "Gemini API", cat: "Image Gen" },
            { name: "Remotion 4", cat: "Video" },
            { name: "FFmpeg", cat: "Processing" },
            { name: "Postiz", cat: "Social" },
            { name: "Docker", cat: "Containers" },
            { name: "Python 3", cat: "Scripts" },
            { name: "TypeScript", cat: "Language" },
            { name: "Colima", cat: "Runtime" },
            { name: "Lucide", cat: "Icons" },
          ].map((t) => (
            <Card
              key={t.name}
              className="p-3 text-center hover:shadow-sm transition-shadow"
            >
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t.cat}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
