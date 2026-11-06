/**
 * RBAC base. La autorización real se comprueba siempre en el servidor; el
 * menú de administración solo oculta lo que el rol no puede usar.
 *
 * La matriz sigue docs/08-plan-seguridad.md: un EDITOR revisa y edita, pero
 * solo OWNER, ADMIN y EDITOR_IN_CHIEF publican, programan o archivan.
 */

export const roles = [
  "OWNER",
  "ADMIN",
  "EDITOR_IN_CHIEF",
  "EDITOR",
  "JOURNALIST",
  "TRANSLATOR",
  "MODERATOR",
] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  "article.create",
  "article.edit",
  "article.submit",
  "article.review",
  "article.publish",
  "article.archive",
  "translation.edit",
  "translation.review",
  "comment.moderate",
  "media.upload",
  "page.edit",
  "page.publish",
  "newsletter.send",
  "analytics.view",
  "audit.view",
  "user.manage",
  "settings.manage",
] as const;

export type Permission = (typeof permissions)[number];

const rolePermissions: Record<Role, ReadonlySet<Permission>> = {
  OWNER: new Set(permissions),
  ADMIN: new Set(permissions),
  EDITOR_IN_CHIEF: new Set([
    "article.create",
    "article.edit",
    "article.submit",
    "article.review",
    "article.publish",
    "article.archive",
    "translation.edit",
    "translation.review",
    "comment.moderate",
    "media.upload",
    "page.edit",
    "page.publish",
    "newsletter.send",
    "analytics.view",
  ]),
  EDITOR: new Set([
    "article.create",
    "article.edit",
    "article.submit",
    "article.review",
    "comment.moderate",
    "media.upload",
    "page.edit",
    "analytics.view",
  ]),
  JOURNALIST: new Set([
    "article.create",
    "article.edit",
    "article.submit",
    "media.upload",
  ]),
  TRANSLATOR: new Set(["translation.edit", "translation.review"]),
  MODERATOR: new Set(["comment.moderate"]),
};

/** Los roles con acceso amplio exigen segundo factor. */
const mfaRequiredRoles: ReadonlySet<Role> = new Set([
  "OWNER",
  "ADMIN",
  "EDITOR_IN_CHIEF",
  "EDITOR",
  "MODERATOR",
]);

export function isRole(value: string): value is Role {
  return (roles as readonly string[]).includes(value);
}

export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role].has(permission);
}

export function canAny(role: Role, required: readonly Permission[]): boolean {
  return required.some((permission) => can(role, permission));
}

export function canAll(role: Role, required: readonly Permission[]): boolean {
  return required.every((permission) => can(role, permission));
}

export function requiresMfa(role: Role): boolean {
  return mfaRequiredRoles.has(role);
}

export function assertPermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`El rol ${role} no tiene el permiso ${permission}.`);
  }
}
