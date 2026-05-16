import { loadEnv } from "../config/env";
import { callBobShell } from "./bobShellClient";

async function main() {
  const env = loadEnv();
  const output = await callBobShell({ prompt: "Explain this project" }, env);
  
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Bob Shell check failed.";
  console.error(message);
  process.exit(1);
});
