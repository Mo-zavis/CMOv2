"use client";

import { LOOP_TYPES } from "@/lib/loop-types";

interface LoopStepperProps {
  loopType: string;
  currentPhase: string;
  cycleNumber: number;
}

export function LoopStepper({ loopType, currentPhase, cycleNumber }: LoopStepperProps) {
  const loopDef = LOOP_TYPES[loopType];
  if (!loopDef) return null;

  const currentIdx = loopDef.phases.findIndex((p) => p.key === currentPhase);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className={`px-1.5 py-0.5 rounded ${loopDef.color} ${loopDef.textColor} font-medium`}>
          {loopDef.label}
        </span>
        {cycleNumber > 1 && <span>Cycle {cycleNumber}</span>}
      </div>
      <div className="flex items-center gap-1">
        {loopDef.phases.map((phase, i) => {
          const isComplete = i < currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={phase.key} className="flex items-center gap-1">
              {i > 0 && (
                <div
                  className={`w-4 sm:w-6 h-px ${
                    isComplete ? "bg-[#006828]" : "bg-border"
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    isComplete
                      ? "border-[#006828] bg-[#006828]"
                      : isCurrent
                      ? "border-[#006828] bg-white"
                      : "border-border bg-white"
                  }`}
                >
                  {isComplete && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#006828]" />
                  )}
                </div>
                <span
                  className={`text-[8px] sm:text-[9px] leading-tight text-center max-w-[48px] ${
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {phase.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
