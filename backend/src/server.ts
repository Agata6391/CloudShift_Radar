import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { loadEnv } from "./config/env";
import { registerHealthRoutes } from "./routes/health.routes";
import { registerScanRoutes } from "./routes/scan.routes";
import { MAX_ZIP_SIZE_BYTES } from "./security/validateZip";

const env = loadEnv();

function getErrorStatusCode(error: unknown): number {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unexpected server error.";
}

async function buildServer() {
  const server = Fastify({
    logger: {
      level: "info"
    }
  });

  await server.register(cors, {
    origin: env.frontendUrl,
    methods: ["GET", "POST"]
  });

  await server.register(multipart, {
    limits: {
      fileSize: MAX_ZIP_SIZE_BYTES,
      files: 1,
      fields: 8
    }
  });

  await registerHealthRoutes(server, env);
  await registerScanRoutes(server, env);

  server.setErrorHandler((error, _request, reply) => {
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);

    reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : message,
      message
    });
  });

  return server;
}

buildServer()
  .then((server) =>
    server.listen({
      port: env.port,
      host: "0.0.0.0"
    })
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });