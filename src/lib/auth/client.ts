"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

/**
 * Cliente de Better Auth para componentes interactivos.
 * Las cookies se gestionan en el mismo origen; no se necesita baseURL aparte.
 */
export const authClient = createAuthClient({
  plugins: [twoFactorClient()],
});
