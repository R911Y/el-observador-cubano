import { headers } from "next/headers";
import { getAuth } from ".";
import {
  assertPermission,
  isRole,
  requiresMfa,
  type Permission,
  type Role,
} from "@/lib/rbac";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new AuthorizationError("Se requiere iniciar sesión.");
  }
  if (session.user.status && session.user.status !== "ACTIVE") {
    throw new AuthorizationError("La cuenta no está activa.");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  const roleValue = session.user.role;
  if (!roleValue || !isRole(roleValue)) {
    throw new AuthorizationError("El rol de la cuenta no es válido.");
  }

  const role: Role = roleValue;
  if (requiresMfa(role) && !session.user.twoFactorEnabled) {
    throw new AuthorizationError(
      "Este rol exige autenticación de dos factores.",
    );
  }

  assertPermission(role, permission);
  return session;
}
