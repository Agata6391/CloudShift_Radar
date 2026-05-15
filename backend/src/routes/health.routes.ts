import type { FastifyInstance } from "fastify";
import type { AppEnv } from "../config/env";
import { isBobCommandConfigured, isBobConfigured } from "../config/env";

export async function registerHealthRoutes(server: FastifyInstance, env: AppEnv) {
  server.get("/api/health", async () => ({
    ok: true,
    bobProvider: env.bobProvider,
    bobConfigured: isBobConfigured(env),
    bobCommandConfigured: isBobCommandConfigured(env)
  }));
}
