"use client";

import { Card } from "@/components/ui/card";

interface BrandCheckDimension {
  score: number;
  observations: string[];
  hard_fail: boolean;
}

interface BrandCheckData {
  text_legibility?: BrandCheckDimension;
  brand_consistency?: BrandCheckDimension;
  visual_quality?: BrandCheckDimension;
  contextual_fit?: BrandCheckDimension;
  composite_score?: number;
  pass?: boolean;
  summary?: string;
  // Copy compliance fields
  em_dashes?: boolean;
  emojis?: boolean;
  negative_headlines?: boolean;
  patient_terminology?: boolean;
  pillar_connection?: string;
}

interface BrandCheckReportProps {
  checkType: string;
  score: number | null;
  passed: boolean;
  details: BrandCheckData;
}

function ScoreBar({ score, label, weight }: { score: number; label: string; weight?: string }) {
  const pct = (score / 5) * 100;
  const color =
    score >= 4 ? "bg-green-500" : score >= 3 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {label} {weight && <span className="opacity-60">({weight})</span>}
        </span>
        <span className="font-medium">{score}/5</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function BrandCheckReport({
  checkType,
  score,
  passed,
  details,
}: BrandCheckReportProps) {
  if (checkType === "visual_qa") {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Brand QA</h4>
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              passed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {passed ? "PASS" : "FAIL"} &mdash; {score?.toFixed(1)}/5
          </div>
        </div>

        <div className="space-y-3">
          {details.text_legibility && (
            <ScoreBar score={details.text_legibility.score} label="Text Legibility" weight="35%" />
          )}
          {details.brand_consistency && (
            <ScoreBar score={details.brand_consistency.score} label="Brand Consistency" weight="30%" />
          )}
          {details.visual_quality && (
            <ScoreBar score={details.visual_quality.score} label="Visual Quality" weight="20%" />
          )}
          {details.contextual_fit && (
            <ScoreBar score={details.contextual_fit.score} label="Contextual Fit" weight="15%" />
          )}
        </div>

        {details.summary && (
          <p className="text-xs text-muted-foreground">{details.summary}</p>
        )}
      </Card>
    );
  }

  // Copy compliance
  if (checkType === "copy_compliance") {
    const checks = [
      { label: "No em dashes", passed: details.em_dashes === false },
      { label: "No emojis", passed: details.emojis === false },
      { label: "No negative headlines", passed: details.negative_headlines === false },
      { label: "Patient terminology", passed: details.patient_terminology === true },
      { label: "Pillar connection", passed: !!details.pillar_connection },
    ];

    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Copy Compliance</h4>
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              passed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {passed ? "PASS" : "FAIL"}
          </div>
        </div>
        <div className="space-y-1.5">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              <span className={c.passed ? "text-green-600" : "text-red-600"}>
                {c.passed ? "\u2713" : "\u2717"}
              </span>
              <span className="text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return null;
}
