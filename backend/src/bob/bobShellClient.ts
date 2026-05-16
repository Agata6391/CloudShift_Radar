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
  const isWindows = process.platform === "win32";

  console.log("[BobShell] prompt chars:", input.prompt.length);
  console.log("[BobShell] command:", bobCommand);
  console.log("[BobShell] platform:", process.platform);

  return await new Promise<string>((resolve, reject) => {
    const bobArgs = [
  "--accept-license",
  "--auth-method",
  "api-key",
  "--trust",
  "--chat-mode",
  "ask",
  "--output-format",
  "text"
];

    const child = spawn(bobCommand, bobArgs, {
      env: {
        ...process.env,
        BOBSHELL_API_KEY: env.bobShellApiKey
      },
      shell: isWindows,
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

      reject(
        new Error(
          [
            `Bob Shell request timed out after ${env.bobTimeoutMs} ms.`,
            stderr.trim() ? `stderr: ${stderr.slice(-2000)}` : "",
            stdout.trim() ? `stdout: ${stdout.slice(-2000)}` : ""
          ]
            .filter(Boolean)
            .join("\n")
        )
      );
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
  reject(
    new Error(
      [
        `Bob Shell exited with code ${code}.`,
        stderr.trim() ? `stderr: ${stderr.trim()}` : "",
        stdout.trim() ? `stdout: ${stdout.trim().slice(-2000)}` : ""
      ]
        .filter(Boolean)
        .join("\n")
    )
  );
  return;
}

      resolve(stdout.trim());
    });

   child.stdin.write(
  [
    "Analyze the repository assessment input below.",
    "Return only compact valid JSON.",
    "Do not run commands.",
    "Do not ask for confirmation.",
    "Do not include markdown.",
    "Do not include explanations outside JSON.",
    "",
    input.prompt
  ].join("\n")
);

child.stdin.end();
  });
}