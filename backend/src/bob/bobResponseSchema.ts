import type {
  Confidence,
  ExpectedMigrationState,
  FeatureStatus,
  RecommendedDecision,
  ResolutionLevel,
  RiskValue,
  Severity
} from "@cloudshift-radar/shared";

export const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
export const confidences: Confidence[] = ["High", "Medium", "Low"];
export const resolutionLevels: ResolutionLevel[] = ["L1", "L2", "L3", "L4", "L5"];
export const recommendedDecisions: RecommendedDecision[] = [
  "Proceed",
  "Proceed with caution",
  "Prepare First",
  "Block Migration",
  "Requires Human Review"
];
export const expectedStates: ExpectedMigrationState[] = [
  "Likely working",
  "Partially working",
  "High risk",
  "Blocked",
  "Unknown"
];

export const featureStatuses: FeatureStatus[] = [
  "Ready",
  "Needs changes",
  "At risk",
  "Blocked",
  "Needs human review"
];

export const riskValues: RiskValue[] = ["Low", "Medium", "High", "Critical", "Needs review"];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function coerceString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function coerceEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

export function coerceNumber(value: unknown, fallback: number, min = 0, max = 100): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(parsed)));
}
