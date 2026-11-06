import { describe, expect, it } from "vitest";
import {
  assertPermission,
  can,
  canAll,
  canAny,
  isRole,
  permissions,
  requiresMfa,
  roles,
  type Role,
} from "@/lib/rbac";

describe("RBAC", () => {
  it("reconoce solo los roles declarados", () => {
    expect(isRole("OWNER")).toBe(true);
    expect(isRole("owner")).toBe(false);
    expect(isRole("SUPERADMIN")).toBe(false);
  });

  it("da todos los permisos a OWNER y ADMIN", () => {
    for (const role of ["OWNER", "ADMIN"] as const) {
      for (const permission of permissions) {
        expect(can(role, permission)).toBe(true);
      }
    }
  });

  it("no permite publicar a un periodista", () => {
    expect(can("JOURNALIST", "article.create")).toBe(true);
    expect(can("JOURNALIST", "article.publish")).toBe(false);
    expect(can("JOURNALIST", "user.manage")).toBe(false);
  });

  it("separa la revisión de la publicación", () => {
    expect(can("EDITOR", "article.review")).toBe(true);
    expect(can("EDITOR", "article.publish")).toBe(false);
    expect(can("EDITOR", "user.manage")).toBe(false);
    expect(can("EDITOR_IN_CHIEF", "article.publish")).toBe(true);
    expect(can("EDITOR_IN_CHIEF", "user.manage")).toBe(false);
    expect(can("EDITOR_IN_CHIEF", "audit.view")).toBe(false);
  });

  it("limita al traductor a las tareas de traducción", () => {
    expect(can("TRANSLATOR", "translation.edit")).toBe(true);
    expect(can("TRANSLATOR", "translation.review")).toBe(true);
    expect(can("TRANSLATOR", "article.publish")).toBe(false);
  });

  it("permite moderar comentarios sin acceso editorial", () => {
    expect(can("MODERATOR", "comment.moderate")).toBe(true);
    expect(can("MODERATOR", "article.edit")).toBe(false);
  });

  it("exige MFA a los roles privilegiados", () => {
    const privileged: Role[] = [
      "OWNER",
      "ADMIN",
      "EDITOR_IN_CHIEF",
      "EDITOR",
      "MODERATOR",
    ];
    for (const role of privileged) {
      expect(requiresMfa(role)).toBe(true);
    }
    expect(requiresMfa("JOURNALIST")).toBe(false);
    expect(requiresMfa("TRANSLATOR")).toBe(false);
  });

  it("evalúa listas de permisos", () => {
    expect(canAny("JOURNALIST", ["article.publish", "article.create"])).toBe(
      true,
    );
    expect(canAll("JOURNALIST", ["article.create", "article.publish"])).toBe(
      false,
    );
  });

  it("lanza un error explicable al denegar un permiso", () => {
    expect(() => assertPermission("TRANSLATOR", "article.publish")).toThrow(
      /TRANSLATOR.*article\.publish/,
    );
    expect(() => assertPermission("OWNER", "article.publish")).not.toThrow();
  });

  it("cubre todos los roles en la matriz", () => {
    expect(roles).toHaveLength(7);
  });
});
