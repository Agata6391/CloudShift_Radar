import type { ReactNode } from "react";

interface BadgeProps {
  tone?: "blue" | "green" | "cyan" | "amber" | "red" | "neutral";
  children: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
