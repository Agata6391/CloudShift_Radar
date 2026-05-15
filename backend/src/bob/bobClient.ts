import type { AppEnv } from "../config/env";
import { callBobShell } from "./bobShellClient";

export interface BobClientInput {
  prompt: string;
}

export async function callBobApi(input: BobClientInput, env: AppEnv): Promise<unknown> {
  return callBobShell(input, env);
}
