import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import type { AppEnv } from "../config/env";
import { BOB_CONFIGURATION_ERROR, BOB_EXECUTABLE_ERROR, assertBobConfigured } from "../config/env";

export interface BobShellClientInput {
  prompt: string;
}

export async function callBobShell(input: BobShellClientInput, env: AppEnv): Promise<string> {
  assertBobConfigured(env);

  if (!env.bobShellApiKey) {
    throw new Error(BOB_CONFIGURATION_ERROR);
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cloudshift-bob-"));
  const promptPath = path.join(tempDir, "prompt.txt");

  try {
    await fs.writeFile(promptPath, input.prompt, "utf-8");
    const prompt = await fs.readFile(promptPath, "utf-8");

    return await new Promise<string>((resolve, reject) => {
      const child = spawn(
        env.bobShellCommand,
        ["--auth-method", "api-key", "--hide-intermediary-output", "-p", prompt],
        {
          cwd: tempDir,
          env: {
            ...process.env,
            BOBSHELL_API_KEY: env.bobShellApiKey
          },
          shell: false,
          windowsHide: true
        }
      );

      let stdout = "";
      let stderr = "";
      let settled = false;

      const timeout = setTimeout(() => {
        settled = true;
        child.kill("SIGTERM");
        reject(new Error(`Bob Shell request timed out after ${env.bobTimeoutMs} ms.`));
      }, env.bobTimeoutMs);

      if (!child.stdout || !child.stderr) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error("Bob Shell output streams were not available."));
        return;
      }

      child.stdout.setEncoding("utf-8");
      child.stderr.setEncoding("utf-8");

      child.stdout.on("data", (chunk: string) => {
        stdout += chunk;
      });

      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });

      child.on("error", (error: NodeJS.ErrnoException) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);

        if (error.code === "ENOENT") {
          reject(new Error(BOB_EXECUTABLE_ERROR));
          return;
        }

        reject(new Error(`Bob Shell could not be executed: ${error.message}`));
      });

      child.on("close", (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);

        if (code !== 0) {
          reject(new Error(`Bob Shell exited with code ${code}. ${stderr.trim()}`.trim()));
          return;
        }

        if (!stdout.trim()) {
          reject(new Error("Bob Shell returned empty output."));
          return;
        }

        resolve(stdout);
      });
    });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
