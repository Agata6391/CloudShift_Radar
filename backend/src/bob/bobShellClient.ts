import { spawn } from "node:child_process";
import path from "node:path";
import type { AppEnv } from "../config/env";
import {
  BOB_CONFIGURATION_ERROR,
  BOB_EXECUTABLE_ERROR,
  assertBobConfigured
} from "../config/env";

export interface BobShellClientInput {
  prompt: string;
}

function workspaceRoot(): string {
  return path.basename(process.cwd()) === "backend"
    ? path.resolve(process.cwd(), "..")
    : process.cwd();
}

function resolveBobCommand(command: string): string {
  if (path.isAbsolute(command) || !/[\\/]/.test(command)) {
    return command;
  }

  return path.resolve(workspaceRoot(), command);
}

export async function callBobShell(
  input: BobShellClientInput,
  env: AppEnv
): Promise<string> {
  assertBobConfigured(env);

  if (!env.bobShellApiKey) {
    throw new Error(BOB_CONFIGURATION_ERROR);
  }

  const bobCommand = resolveBobCommand(env.bobShellCommand);
  console.log("[BobShell] prompt chars:", input.prompt.length);
console.log("[BobShell] command:", bobCommand);
console.log("[BobShell] platform:", process.platform);
await import("node:fs/promises").then((fs) =>
  fs.writeFile("bob-debug-prompt.txt", input.prompt, "utf-8")
);


  const isWindows = process.platform === "win32";

  return await new Promise<string>((resolve, reject) => {
    const bobArgs = [
  "--accept-license",
  "--auth-method",
  "api-key",
  "--trust",
  "--chat-mode",
  "ask",
  //"--hide-intermediary-output",
  "-p",
  "Analyze the repository assessment input provided through stdin. Return only the final assessment. Do not run commands. Do not ask for confirmation."
];

    const command = isWindows ? "cmd.exe" : bobCommand;

    const args = isWindows
      ? ["/d", "/s", "/c", bobCommand, ...bobArgs]
      : bobArgs;

    const child = spawn(command, args, {
      env: {
        ...process.env,
        BOBSHELL_API_KEY: env.bobShellApiKey
      },
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;

      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`Bob Shell request timed out after ${env.bobTimeoutMs} ms.`));
    }, env.bobTimeoutMs);

    if (!child.stdin || !child.stdout || !child.stderr) {
      settled = true;
      clearTimeout(timeout);
      reject(new Error("Bob Shell streams were not available."));
      return;
    }

    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");

    child.stdout.on("data", (chunk: string) => {
  stdout += chunk;
  console.log("[BobShell stdout]", chunk);
});

child.stderr.on("data", (chunk: string) => {
  stderr += chunk;
  console.error("[BobShell stderr]", chunk);
});

    child.stdin.on("error", (error: NodeJS.ErrnoException) => {
      if (settled) return;

      settled = true;
      clearTimeout(timeout);
      reject(new Error(`Bob Shell stdin failed: ${error.message}`));
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
        if (/hide-intermediary-output|unknown option|unrecognized option/i.test(stderr)) {
          reject(
            new Error(
              "Bob Shell does not support --hide-intermediary-output. Update Bob Shell or configure a compatible version."
            )
          );
          return;
        }

        reject(new Error(`Bob Shell exited with code ${code}. ${stderr.trim()}`.trim()));
        return;
      }

      if (!stdout.trim()) {
        reject(new Error("Bob Shell returned empty output."));
        return;
      }

      resolve(stdout.trim());
    });

    child.stdin.write(input.prompt);
    child.stdin.end();
  });
}