import type { MigrationContext, ScanResult } from "@cloudshift-radar/shared";

export interface HealthResponse {
  ok: boolean;
  bobConfigured: boolean;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.error === "string" ? payload.error : "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");
  return parseJsonResponse<HealthResponse>(response);
}

export async function submitZipScan(context: MigrationContext, file: File): Promise<ScanResult> {
  const formData = new FormData();
  formData.append("projectName", context.projectName);
  formData.append("currentProvider", context.currentProvider);
  formData.append("targetProvider", context.targetProvider);
  formData.append("applicationType", context.applicationType);
  formData.append("repository", file);

  const response = await fetch("/api/scans", {
    method: "POST",
    body: formData
  });

  return parseJsonResponse<ScanResult>(response);
}

export async function submitDemoScan(context: MigrationContext): Promise<ScanResult> {
  const response = await fetch("/api/scans/demo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(context)
  });

  return parseJsonResponse<ScanResult>(response);
}

export async function getScan(scanId: string): Promise<ScanResult> {
  const response = await fetch(`/api/scans/${encodeURIComponent(scanId)}`);
  return parseJsonResponse<ScanResult>(response);
}
