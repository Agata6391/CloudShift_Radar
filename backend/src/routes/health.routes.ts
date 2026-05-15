import type { FastifyInstance } from "fastify";
import type { AppEnv } from "../config/env";
import { isBobConfigured } from "../config/env";

export async function registerHealthRoutes(server: FastifyInstance, env: AppEnv) {
  server.get("/api/health", async () => ({
    ok: true,
    bobConfigured: isBobConfigured(env)
  }));
}
