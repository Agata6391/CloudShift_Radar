#!/usr/bin/env tsx
/**
 * Pre-generate demo result for consistent demos
 * 
 * This script generates and saves the demo result to ensure
 * 100% consistent results across all demo runs, including timestamps.
 * 
 * Usage:
 *   npm run generate-demo
 *   or
 *   tsx scripts/generate-demo-result.ts
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { MigrationContext } from "@cloudshift-radar/shared";
import { generateDemoFallbackResult } from "../src/demo/demoFallbackResult";

const SCAN_RESULTS_DIR = path.resolve(process.cwd(), "..", "scan-results");
const DEMO_SCAN_ID = "demo-legacy-cloud-api";

async function generateDemoResult() {
  console.log("🎯 Generating demo result...");

  const migrationContext: MigrationContext = {
    projectName: "Legacy Cloud API Demo",
    currentProvider: "AWS",
    targetProvider: "GCP",
    applicationType: "Backend API"
  };

  // Generate the demo result
  const demoResult = generateDemoFallbackResult(migrationContext, DEMO_SCAN_ID);

  // Ensure scan-results directory exists
  await fs.mkdir(SCAN_RESULTS_DIR, { recursive: true });

  // Save the result
  const resultPath = path.join(SCAN_RESULTS_DIR, `${DEMO_SCAN_ID}.json`);
  await fs.writeFile(resultPath, JSON.stringify(demoResult, null, 2), "utf-8");

  console.log("✅ Demo result generated and saved!");
  console.log(`📁 Location: ${resultPath}`);
  console.log(`🆔 Scan ID: ${demoResult.scanId}`);
  console.log(`📊 Readiness Score: ${demoResult.readinessScore}`);
  console.log(`🔍 Findings: ${demoResult.findings.length}`);
  console.log(`⏰ Created At: ${demoResult.createdAt}`);
  console.log("");
  console.log("💡 Tip: Commit this file to version control for 100% consistent demos");
  console.log("   git add scan-results/demo-legacy-cloud-api.json");
}

generateDemoResult().catch((error) => {
  console.error("❌ Failed to generate demo result:", error);
  process.exit(1);
});

// Made with Bob
