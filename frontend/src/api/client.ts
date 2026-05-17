import type { MigrationContext, ScanResult, ValidationResult } from "@cloudshift-radar/shared";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

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
  const response = await fetch(apiUrl("/api/health"));
  return parseJsonResponse<HealthResponse>(response);
}

export async function submitZipScan(context: MigrationContext, file: File): Promise<ScanResult> {
  const formData = new FormData();
  formData.append("projectName", context.projectName);
  formData.append("currentProvider", context.currentProvider);
  formData.append("targetProvider", context.targetProvider);
  formData.append("applicationType", context.applicationType);
  formData.append("repository", file);

  const response = await fetch(apiUrl("/api/scans"), {
    method: "POST",
    body: formData
  });

  return parseJsonResponse<ScanResult>(response);
}

export async function validateZip(file: File): Promise<ValidationResult> {
  const formData = new FormData();
  formData.append("repository", file);

  const response = await fetch(apiUrl("/api/scans/validate"), {
    method: "POST",
    body: formData
  });

  return parseJsonResponse<ValidationResult>(response);
}

export async function submitDemoScan(context: MigrationContext): Promise<ScanResult> {
  const response = await fetch(apiUrl("/api/scans/demo"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(context)
  });

  return parseJsonResponse<ScanResult>(response);
}

export async function getScan(scanId: string): Promise<ScanResult> {
  const response = await fetch(apiUrl(`/api/scans/${encodeURIComponent(scanId)}`));
  return parseJsonResponse<ScanResult>(response);
}

export async function exportScan(scanId: string, format: "json" | "csv" | "markdown"): Promise<Blob> {
  const response = await fetch(
    apiUrl(`/api/scans/${encodeURIComponent(scanId)}/export?format=${format}`)
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === "string" ? payload.error : "Export failed.";
    throw new Error(message);
  }

  return response.blob();
}