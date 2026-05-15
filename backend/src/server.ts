import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { loadEnv } from "./config/env";
import { registerHealthRoutes } from "./routes/health.routes";
import { registerScanRoutes } from "./routes/scan.routes";
import { MAX_ZIP_SIZE_BYTES } from "./security/validateZip";

const env = loadEnv();

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
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : error.message,
      message: error.message
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
