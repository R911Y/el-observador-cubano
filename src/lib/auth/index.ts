import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { getDb } from "@/lib/db";
import { requireEnv } from "@/lib/env";

/**
 * Configuración de Better Auth.
 *
 * Se construye de forma perezosa para que `next build` no necesite una base de
 * datos ni el secreto. El registro público queda cerrado: las cuentas internas
 * se crean desde administración (Fase 1, criterio de salida).
 */
function buildAuth() {
  return betterAuth({
    appName: "El Observador Cubano",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: requireEnv("BETTER_AUTH_SECRET"),
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      // Las cuentas son internas: se crean desde administración, no por alta
      // pública. La interfaz de alta llegará con el CMS (Fase 3).
      disableSignUp: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "JOURNALIST",
          input: false,
        },
        status: {
          type: "string",
          required: false,
          defaultValue: "ACTIVE",
          input: false,
        },
      },
    },
    plugins: [
      twoFactor({ issuer: "El Observador Cubano" }),
      // Debe ir al final: escribe las cookies desde Server Actions.
      nextCookies(),
    ],
  });
}

let authInstance: ReturnType<typeof buildAuth> | undefined;

export function getAuth(): ReturnType<typeof buildAuth> {
  authInstance ??= buildAuth();
  return authInstance;
}

export type Auth = ReturnType<typeof getAuth>;
