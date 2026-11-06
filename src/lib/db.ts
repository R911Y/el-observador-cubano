import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requireEnv } from "./env";

/**
 * Cliente Prisma con el adaptador oficial de PostgreSQL.
 *
 * Prisma 7 no usa el motor binario: el runtime habla con `pg` a través de
 * `@prisma/adapter-pg`. La instancia se reutiliza entre recargas en desarrollo
 * para no agotar el pool de conexiones.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(requireEnv("DATABASE_URL"));
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient {
  const client = globalForPrisma.prisma ?? createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}
