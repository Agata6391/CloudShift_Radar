import { promises as fs } from "node:fs";
import path from "node:path";
import type { ScanResult } from "@cloudshift-radar/shared";

const SCAN_RESULTS_DIR = path.resolve(process.cwd(), "..", "scan-results");

export async function storeScanResult(scanResult: ScanResult): Promise<void> {
  await fs.mkdir(SCAN_RESULTS_DIR, { recursive: true });
  const resultPath = path.join(SCAN_RESULTS_DIR, `${scanResult.scanId}.json`);
  await fs.writeFile(resultPath, JSON.stringify(scanResult, null, 2), "utf-8");
}

export async function getScanResult(scanId: string): Promise<ScanResult | null> {
  const safeScanId = scanId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (safeScanId !== scanId || safeScanId.length === 0) {
    return null;
  }

  const resultPath = path.join(SCAN_RESULTS_DIR, `${safeScanId}.json`);
  try {
    const content = await fs.readFile(resultPath, "utf-8");
    return JSON.parse(content) as ScanResult;
  } catch {
    return null;
  }
}
