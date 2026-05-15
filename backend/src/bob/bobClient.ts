import { fetch } from "undici";
import type { AppEnv } from "../config/env";
import { assertBobConfigured } from "../config/env";

export interface BobClientInput {
  prompt: string;
}

function buildBobRequestPayload(prompt: string, model?: string) {
  return {
    ...(model ? { model } : {}),
    prompt,
    input: prompt,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  };
}

export async function callBobApi(input: BobClientInput, env: AppEnv): Promise<unknown> {
  assertBobConfigured(env);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.bobTimeoutMs);

  try {
    const response = await fetch(env.bobApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.bobApiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(buildBobRequestPayload(input.prompt, env.bobModel)),
      signal: controller.signal
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Bob API returned HTTP ${response.status}: ${text.slice(0, 300)}`);
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      if (text.trim().length === 0) {
        throw new Error("Bob API returned an empty response.");
      }
      return text;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Bob API request timed out after ${env.bobTimeoutMs} ms.`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Bob API request failed.");
  } finally {
    clearTimeout(timeout);
  }
}
