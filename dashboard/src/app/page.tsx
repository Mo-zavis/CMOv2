"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const STATS = [
  { label: "Skills", value: "41", detail: "Specialized AI skills" },
  { label: "Channels", value: "6", detail: "Content types supported" },
  { label: "APIs", value: "5+", detail: "External integrations" },
];

const STEPS = [
  {
    key: "brief",
    title: "Brief",
    description: "Describe what you need in natural language. Claude interprets and activates the right skills.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    key: "generate",
    title: "Generate",
    description: "Claude calls Gemini, Veo 3, and other APIs to produce images, copy, video, and ads.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    key: "review",
    title: "Review",
    description: "Every asset passes through human review. Approve, request revisions, or provide feedback.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  {
    key: "optimize",
    title: "Optimize",
    description: "Agentic loops monitor performance and continuously optimize across channels.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    ),
  },
];

const CAPABILITIES = [
  {
    title: "Image Generation",
    description: "Brand-compliant images via Gemini with automatic 4-lens QA scoring.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    title: "Content Writing",
    description: "Blog posts, ad copy, landing pages, and captions with brand voice built in.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Video Production",
    description: "Scene-by-scene workflows with Veo 3 generation and Remotion composition.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    title: "Ad Campaigns",
    description: "Google Ads and Meta Ads with targeting, bidding, and performance tracking.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 18-5v12L3 13v-2z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
  },
  {
    title: "Social Media",
    description: "Schedule and publish across 20+ platforms via Postiz with engagement analytics.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    description: "Campaign creation with segmentation, templates, and A/B testing.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [activeStep, setActiveStep] = useState<string>("brief");

  const currentStep = STEPS.find((s) => s.key === activeStep) || STEPS[0];

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-12">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -mx-4 sm:-mx-6 bg-gradient-to-b from-[#006828]/[0.03] to-transparent rounded-2xl pointer-events-none" />

        <div className="relative">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#1c1c1c]">
            <span className="text-[#006828]">Zavis</span> CMO
          </h1>
          <p className="mt-3 text-base text-[#1c1c1c]/60 max-w-lg">
            AI-powered marketing operations for healthcare patient engagement.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 rounded-full border border-[#ecebe8] bg-white px-4 py-2 transition-colors hover:border-[#006828]/20"
              >
                <span className="text-lg font-heading font-bold text-[#006828]">
                  {stat.value}
                </span>
                <span className="text-xs text-[#1c1c1c]/50">
                  {stat.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section className="py-10">
        <h2 className="font-heading text-xl font-bold text-[#1c1c1c] mb-6">
          How It Works
        </h2>

        {/* Horizontal stepper */}
        <div className="flex items-start gap-0">
          {STEPS.map((step, i) => {
            const isActive = step.key === activeStep;
            return (
              <div key={step.key} className="flex items-start flex-1 min-w-0">
                <button
                  onClick={() => setActiveStep(step.key)}
                  className="flex flex-col items-center w-full group"
                >
                  {/* Step indicator row */}
                  <div className="flex items-center w-full">
                    {/* Leading line */}
                    {i > 0 && (
                      <div className="flex-1 h-px bg-[#ecebe8]" />
                    )}
                    {i === 0 && <div className="flex-1" />}

                    {/* Circle */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-[#006828] text-white shadow-lg shadow-[#006828]/20 scale-110"
                          : "bg-[#ecebe8] text-[#1c1c1c]/50 group-hover:bg-[#006828]/10 group-hover:text-[#006828]"
                      }`}
                    >
                      {step.icon}
                    </div>

                    {/* Trailing line */}
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px bg-[#ecebe8]" />
                    )}
                    {i === STEPS.length - 1 && <div className="flex-1" />}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2.5 text-xs font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-[#006828]"
                        : "text-[#1c1c1c]/40 group-hover:text-[#1c1c1c]/70"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Active step detail */}
        <div className="mt-6 rounded-lg border border-[#ecebe8] bg-[#f8f8f6] px-5 py-4">
          <p className="text-sm text-[#1c1c1c]/70 leading-relaxed">
            <span className="font-semibold text-[#1c1c1c]">{currentStep.title}.</span>{" "}
            {currentStep.description}
          </p>
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  CAPABILITIES                                                */}
      {/* ============================================================ */}
      <section className="py-10">
        <h2 className="font-heading text-xl font-bold text-[#1c1c1c] mb-6">
          Capabilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAPABILITIES.map((cap) => (
            <Card
              key={cap.title}
              className="group p-5 border-[#ecebe8] hover:border-[#006828]/20 transition-all duration-200 hover:shadow-sm"
            >
              <div className="text-[#006828]/70 group-hover:text-[#006828] transition-colors duration-200 mb-3">
                {cap.icon}
              </div>
              <h3 className="font-heading font-semibold text-sm text-[#1c1c1c]">
                {cap.title}
              </h3>
              <p className="text-xs text-[#1c1c1c]/50 mt-1.5 leading-relaxed">
                {cap.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="bg-[#ecebe8]" />

      {/* ============================================================ */}
      {/*  ARCHITECTURE                                                */}
      {/* ============================================================ */}
      <section className="py-10">
        <h2 className="font-heading text-xl font-bold text-[#1c1c1c] mb-6">
          Architecture
        </h2>

        <div className="rounded-xl border border-[#ecebe8] bg-[#f8f8f6] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            {/* Runtime */}
            <div className="flex-1 rounded-lg bg-white border border-[#006828]/15 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#006828]" />
                <span className="text-xs font-semibold text-[#006828] uppercase tracking-wider">
                  Runtime
                </span>
              </div>
              <p className="text-[11px] text-[#1c1c1c]/50 leading-relaxed">
                Claude Code + 41 skills + external APIs. Writes assets and metadata to the shared layer.
              </p>
            </div>

            {/* Connector */}
            <div className="flex sm:flex-col items-center justify-center gap-1 py-1 sm:py-0 sm:px-1">
              <div className="w-8 h-px sm:w-px sm:h-8 bg-[#006828]/30" />
              <div className="rounded border border-dashed border-[#006828]/30 bg-white px-3 py-1.5 text-center">
                <p className="text-[10px] font-semibold text-[#006828] uppercase tracking-wider">
                  SQLite + /assets/
                </p>
              </div>
              <div className="w-8 h-px sm:w-px sm:h-8 bg-[#006828]/30" />
            </div>

            {/* Dashboard */}
            <div className="flex-1 rounded-lg bg-white border border-[#006828]/15 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#006828]/50" />
                <span className="text-xs font-semibold text-[#006828] uppercase tracking-wider">
                  Dashboard
                </span>
              </div>
              <p className="text-[11px] text-[#1c1c1c]/50 leading-relaxed">
                This Next.js app. Reads assets, captures human feedback, and writes it back for Claude.
              </p>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-[#1c1c1c]/40 text-center">
            The two systems never call each other. The database and filesystem are the only communication layer.
          </p>
        </div>
      </section>
    </div>
  );
}
