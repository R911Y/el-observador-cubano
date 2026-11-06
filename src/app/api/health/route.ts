import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const payload: {
    status: "ok" | "degraded";
    database: "up" | "down";
    timestamp: string;
  } = {
    status: "ok",
    database: "up",
    timestamp: new Date().toISOString(),
  };

  try {
    await getDb().$queryRaw`SELECT 1`;
  } catch {
    payload.status = "degraded";
    payload.database = "down";
    return Response.json(payload, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
