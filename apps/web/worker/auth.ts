import { betterAuth } from "better-auth";

import type { WorkerBindings } from "./env";

export function authIsConfigured(env: WorkerBindings) {
  return Boolean(
    env.BETTER_AUTH_SECRET
      && env.GITHUB_CLIENT_ID
      && env.GITHUB_CLIENT_SECRET,
  );
}

export function createAuth(env: WorkerBindings, origin: string) {
  if (!authIsConfigured(env)) {
    throw new Error("Authentication is not configured");
  }
  const secret = env.BETTER_AUTH_SECRET as string;
  const clientId = env.GITHUB_CLIENT_ID as string;
  const clientSecret = env.GITHUB_CLIENT_SECRET as string;

  return betterAuth({
    baseURL: origin,
    database: env.DB,
    secret,
    socialProviders: {
      github: {
        clientId,
        clientSecret,
      },
    },
    trustedOrigins: [origin],
  });
}
