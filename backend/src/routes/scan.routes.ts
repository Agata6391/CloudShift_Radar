import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import type { MigrationContext, RepositoryScanContext } from "@cloudshift-radar/shared";
import type { AppEnv } from "../config/env";
import { BOB_CONFIGURATION_ERROR, assertBobConfigured } from "../config/env";
import { buildBobAnalysisPrompt } from "../bob/buildBobAnalysisPrompt";
import { callBobApi } from "../bob/bobClient";
import { normalizeBobResponse } from "../bob/normalizeBobResponse";
import { loadDemoRepositoryScanContext } from "../demo/loadDemoRepository";
import { extractZip } from "../scanner/extractZip";
import { scanRepository } from "../scanner/scanRepository";
import { getScanResult, storeScanResult } from "../storage/scanResultStore";
import { validateZip } from "../security/validateZip";

const UPLOADS_DIR = path.resolve(process.cwd(), "..", "uploads");

function readField(fields: Record<string, string>, field: keyof MigrationContext, fallback: string): string {
  const value = fields[field];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildMigrationContext(fields: Record<string, string>): MigrationContext {
  return {
    projectName: readField(fields, "projectName", "Untitled migration"),
    currentProvider: readField(fields, "currentProvider", "Unknown"),
    targetProvider: readField(fields, "targetProvider", "Other"),
    applicationType: readField(fields, "applicationType", "Unknown")
  };
}

async function analyzeWithBob(
  migrationContext: MigrationContext,
  scanContext: RepositoryScanContext,
  scanId: string,
  env: AppEnv
) {
  assertBobConfigured(env);
  const prompt = buildBobAnalysisPrompt(migrationContext, scanContext);
  const rawBobResponse = await callBobApi({ prompt }, env);
  const scanResult = normalizeBobResponse(rawBobResponse, migrationContext, scanId);
  await storeScanResult(scanResult);
  return scanResult;
}

export async function registerScanRoutes(server: FastifyInstance, env: AppEnv) {
  server.post("/api/scans", async (request, reply) => {
    try {
      assertBobConfigured(env);
    } catch {
      return reply.status(503).send({
        error: BOB_CONFIGURATION_ERROR
      });
    }

    const fields: Record<string, string> = {};
    let zipBuffer: Buffer | null = null;
    let zipFilename = "";

    for await (const part of request.parts()) {
      if (part.type === "file") {
        zipFilename = part.filename;
        zipBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = String(part.value ?? "");
      }
    }

    if (!zipBuffer) {
      return reply.status(400).send({
        error: "Repository ZIP file is required."
      });
    }

    const scanId = randomUUID();
    const migrationContext = buildMigrationContext(fields);
    validateZip(zipBuffer, zipFilename);

    const extractionDir = path.join(UPLOADS_DIR, scanId);
    await fs.rm(extractionDir, { recursive: true, force: true });
    await extractZip(zipBuffer, extractionDir);
    const scanContext = await scanRepository(extractionDir);
    const result = await analyzeWithBob(migrationContext, scanContext, scanId, env);

    return reply.send(result);
  });

  server.post("/api/scans/demo", async (request, reply) => {
    try {
      assertBobConfigured(env);
    } catch {
      return reply.status(503).send({
        error: BOB_CONFIGURATION_ERROR
      });
    }

    const body = (request.body || {}) as Partial<MigrationContext>;
    const migrationContext: MigrationContext = {
      projectName: body.projectName || "Legacy Cloud API Demo",
      currentProvider: body.currentProvider || "AWS",
      targetProvider: body.targetProvider || "GCP",
      applicationType: body.applicationType || "Backend API"
    };

    const scanId = randomUUID();
    const scanContext = loadDemoRepositoryScanContext();
    const result = await analyzeWithBob(migrationContext, scanContext, scanId, env);

    return reply.send(result);
  });

  server.get<{ Params: { scanId: string } }>("/api/scans/:scanId", async (request, reply) => {
    const result = await getScanResult(request.params.scanId);
    if (!result) {
      return reply.status(404).send({
        error: "Scan result not found."
      });
    }

    return reply.send(result);
  });
}
