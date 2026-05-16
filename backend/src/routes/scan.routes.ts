import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import type { MigrationContext, RepositoryScanContext } from "@cloudshift-radar/shared";
import type { AppEnv } from "../config/env";
import { BOB_CONFIGURATION_ERROR, BOB_EXECUTABLE_ERROR, BOB_PROVIDER_ERROR, assertBobConfigured } from "../config/env";
import { buildBobAnalysisPrompt } from "../bob/buildBobAnalysisPrompt";
import { callBobApi } from "../bob/bobClient";
import { normalizeBobResponse } from "../bob/normalizeBobResponse";
import { loadDemoRepositoryScanContext } from "../demo/loadDemoRepository";
import { extractZip } from "../scanner/extractZip";
import { scanRepository } from "../scanner/scanRepository";
import { getScanResult, storeScanResult } from "../storage/scanResultStore";
import { validateZip } from "../security/validateZip";
import { generateCSV, generateMarkdown, generateJSON } from "../export/exportFormats";

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

function bobErrorStatus(message: string): number {
  if (message === BOB_CONFIGURATION_ERROR || message === BOB_EXECUTABLE_ERROR || message === BOB_PROVIDER_ERROR) {
    return 503;
  }

  if (message.includes("could not be parsed as ScanResult JSON") || message.includes("empty output")) {
    return 502;
  }

  return 502;
}

function sendBobError(reply: { status: (statusCode: number) => { send: (payload: unknown) => unknown } }, error: unknown) {
  const message = error instanceof Error ? error.message : "Bob Shell assessment failed.";
  return reply.status(bobErrorStatus(message)).send({
    error: message
  });
}

export async function registerScanRoutes(server: FastifyInstance, env: AppEnv) {
  server.post("/api/scans", async (request, reply) => {
    try {
      assertBobConfigured(env);
    } catch (error) {
      return reply.status(503).send({
        error: error instanceof Error ? error.message : BOB_CONFIGURATION_ERROR
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

    try {
      const result = await analyzeWithBob(migrationContext, scanContext, scanId, env);
      return reply.send(result);
    } catch (error) {
      return sendBobError(reply, error);
    }
  });

  server.post("/api/scans/demo", async (request, reply) => {
    try {
      assertBobConfigured(env);
    } catch (error) {
      return reply.status(503).send({
        error: error instanceof Error ? error.message : BOB_CONFIGURATION_ERROR
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

    try {
      const result = await analyzeWithBob(migrationContext, scanContext, scanId, env);
      return reply.send(result);
    } catch (error) {
      return sendBobError(reply, error);
    }
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

  server.get<{ Params: { scanId: string }; Querystring: { format?: string } }>(
    "/api/scans/:scanId/export",
    async (request, reply) => {
      const { scanId } = request.params;
      const format = request.query.format || "json";

      const result = await getScanResult(scanId);
      if (!result) {
        return reply.status(404).send({
          error: "Scan result not found."
        });
      }

      const validFormats = ["json", "csv", "markdown", "md"];
      if (!validFormats.includes(format.toLowerCase())) {
        return reply.status(400).send({
          error: `Invalid format. Supported formats: ${validFormats.join(", ")}`
        });
      }

      let content: string;
      let contentType: string;
      let filename: string;
      const sanitizedProjectName = result.projectName.replace(/[^a-zA-Z0-9-_]/g, "_");
      const timestamp = new Date().toISOString().split("T")[0];

      switch (format.toLowerCase()) {
        case "csv":
          content = generateCSV(result);
          contentType = "text/csv";
          filename = `cloudshift-radar-${sanitizedProjectName}-${timestamp}.csv`;
          break;
        case "markdown":
        case "md":
          content = generateMarkdown(result);
          contentType = "text/markdown";
          filename = `cloudshift-radar-${sanitizedProjectName}-${timestamp}.md`;
          break;
        case "json":
        default:
          content = generateJSON(result);
          contentType = "application/json";
          filename = `cloudshift-radar-${sanitizedProjectName}-${timestamp}.json`;
          break;
      }

      reply.header("Content-Type", contentType);
      reply.header("Content-Disposition", `attachment; filename="${filename}"`);
      return reply.send(content);
    }
  );
}
