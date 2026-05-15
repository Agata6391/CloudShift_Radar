import path from "node:path";
import dotenv from "dotenv";

const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
dotenv.config({ path: rootEnvPath });
dotenv.config();

export interface AppEnv {
  bobApiKey?: string;
  bobApiUrl?: string;
  bobModel?: string;
  bobTimeoutMs: number;
  port: number;
  frontendUrl: string;
}

export const BOB_CONFIGURATION_ERROR =
  "Bob API is required for this assessment. Configure BOB_API_KEY and BOB_API_URL.";

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadEnv(): AppEnv {
  return {
    bobApiKey: process.env.BOB_API_KEY,
    bobApiUrl: process.env.BOB_API_URL,
    bobModel: process.env.BOB_MODEL,
    bobTimeoutMs: numberFromEnv(process.env.BOB_TIMEOUT_MS, 60000),
    port: numberFromEnv(process.env.PORT, 4000),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
  };
}

export function isBobConfigured(env: AppEnv): boolean {
  return Boolean(env.bobApiKey && env.bobApiUrl);
}

export function assertBobConfigured(env: AppEnv): asserts env is AppEnv & {
  bobApiKey: string;
  bobApiUrl: string;
} {
  if (!isBobConfigured(env)) {
    throw new Error(BOB_CONFIGURATION_ERROR);
  }
}
