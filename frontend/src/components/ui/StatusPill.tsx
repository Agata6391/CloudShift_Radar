import type { ReactNode } from "react";

interface StatusPillProps {
  tone?: "critical" | "high" | "medium" | "low" | "success" | "neutral";
  children: ReactNode;
}

export function StatusPill({ tone = "neutral", children }: StatusPillProps) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}
