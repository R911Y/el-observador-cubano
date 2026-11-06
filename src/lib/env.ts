/**
 * Lectura de variables de entorno en servidor.
 *
 * Se valida de forma perezosa: el build puede completarse sin una base de
 * datos, pero cualquier ruta que necesite el servicio falla con un mensaje
 * claro en lugar de arrancar con una configuración incompleta.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y complétala.`,
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function siteUrl(): string {
  return optionalEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
