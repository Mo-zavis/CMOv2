"use client";

interface MetricCardProps {
  label: string;
  value: string;
  target?: string;
  trend?: "up" | "down" | "flat";
  status?: "good" | "warning" | "bad";
}

const STATUS_COLORS = {
  good: "text-green-600",
  warning: "text-amber-600",
  bad: "text-red-600",
};

export function MetricCard({ label, value, target, trend, status }: MetricCardProps) {
  return (
    <div className="p-3 space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-xl font-heading font-semibold ${status ? STATUS_COLORS[status] : ""}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
            {trend === "up" ? "+" : trend === "down" ? "-" : "~"}
          </span>
        )}
      </div>
      {target && (
        <p className="text-[10px] text-muted-foreground">Target: {target}</p>
      )}
    </div>
  );
}
