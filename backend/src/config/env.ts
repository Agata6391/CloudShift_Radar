import path from "node:path";
import dotenv from "dotenv";

const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
dotenv.config({ path: rootEnvPath });
dotenv.config();

export interface AppEnv {
  bobProvider: "shell";
  bobShellApiKey?: string;
  bobShellCommand: string;
  bobTimeoutMs: number;
  port: number;
  frontendUrl: string;
}

export const BOB_CONFIGURATION_ERROR =
  "Bob Shell is required for this assessment. Configure BOBSHELL_API_KEY and BOB_SHELL_COMMAND.";

export const BOB_EXECUTABLE_ERROR =
  "Bob Shell executable was not found. Install Bob Shell or configure BOB_SHELL_COMMAND.";

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadEnv(): AppEnv {
  return {
    bobProvider: "shell",
    bobShellApiKey: process.env.BOBSHELL_API_KEY,
    bobShellCommand: process.env.BOB_SHELL_COMMAND || "bob",
    bobTimeoutMs: numberFromEnv(process.env.BOB_TIMEOUT_MS, 60000),
    port: numberFromEnv(process.env.PORT, 4000),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
  };
}

export function isBobConfigured(env: AppEnv): boolean {
  return Boolean(env.bobShellApiKey && env.bobShellCommand);
}

export function isBobCommandConfigured(env: AppEnv): boolean {
  return Boolean(env.bobShellCommand);
}

export function assertBobConfigured(env: AppEnv): asserts env is AppEnv & {
  bobShellApiKey: string;
  bobShellCommand: string;
} {
  if (!isBobConfigured(env)) {
    throw new Error(BOB_CONFIGURATION_ERROR);
  }
}
