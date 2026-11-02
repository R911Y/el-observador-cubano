# 11 · Servicios y costes recurrentes (estimación)

**Moneda:** USD. **Fecha de consulta de precios:** 2 de noviembre de 2026.
**Naturaleza:** estimación para planificación. No se ha contratado ni comprado nada.
Los precios de los proveedores cambian; deben verificarse antes de contratar.

---

## 1. Resumen

| Escenario | Coste mensual estimado | Coste anual estimado |
|---|---:|---:|
| Lanzamiento con tráfico bajo (< 10.000 visitas/mes, < 1.000 suscriptores) | **USD 55–85** | **USD 660–1.020** |
| Crecimiento (10.000–50.000 visitas/mes, 1.000–5.000 suscriptores) | **USD 85–140** | **USD 1.020–1.680** |
| Con auditoría y herramientas adicionales | **USD 130–180** | **USD 1.560–2.160** |

No incluye:
- salarios del equipo;
- diseño o desarrollo externo;
- revisión legal;
- prueba de penetración;
- publicidad;
- comisiones de la pasarela de pago (solo si se activa).

---

## 2. Detalle por servicio

### Dominio

| Concepto | Estimación | Notas |
|---|---:|---|
| `.com` | USD 10–13/año | Precio de registro a coste en Cloudflare; renovación similar |
| `.org` defensivo | USD 12–16/año | Opcional pero recomendado |
| Transferencia/renovación | Incluida | Renovación automática y bloqueo de transferencia |

Cloudflare Registrar vende **a coste** y ofrece WHOIS redactado, DNSSEC y bloqueo por
defecto. Los precios exactos dependen del TLD y deben confirmarse en el buscador del
registrador.

### Alojamiento y base de datos

| Servicio | Plan | Estimación mensual | Notas |
|---|---|---:|---|
| Vercel | Hobby (desarrollo) | USD 0 | Solo para las primeras fases, sin uso comercial |
| Vercel | Pro | ~USD 20 por miembro | 1–2 cuentas de despliegue; el resto del equipo no necesita cuenta |
| Neon PostgreSQL | Launch | USD 15–22 | Escala a cero; 0,35 USD/GB-mes; PITR 7 días |
| Cloudflare R2 | Free/Standard | USD 0–5 | 10 GB gratis; 0,015 USD/GB-mes; egreso gratis |
| Cloudflare DNS/WAF | Free | USD 0 | DNSSEC, reglas básicas, Turnstile |
| Upstash Redis | Free/Pay-as-you-go | USD 0–5 | Rate limiting |

Notas:
- Neon publica un coste típico de **USD 15/mes** para carga intermitente y **USD 22/mes**
  para una base pequeña siempre activa.
- R2 no cobra egreso; el coste principal es almacenamiento y operaciones. Con 10 GB de
  imágenes y audio cabe en el nivel gratuito o muy cerca.
- Vercel Pro se recomienda antes del lanzamiento. El precio exacto debe verificarse en la
  página oficial (no fue accesible durante esta consulta).

### Correo

| Servicio | Plan | Estimación mensual | Notas |
|---|---|---:|---|
| Resend | Free | USD 0 | 3.000 correos/mes, 100/día, 1.000 contactos de marketing |
| Resend | Pro transaccional | USD 20 | 50.000 correos/mes |
| Resend | Marketing 5.000 contactos | USD 40 | Sin límite de envíos por contacto |
| Alternativa | Postmark / SES | USD 15–50 | Evaluar entregabilidad y coste |

Para una lista de 1.000–5.000 suscriptores y 2–4 envíos al mes, el coste realista es
**USD 0–40/mes**. Si se supera el nivel gratuito, conviene separar correo transaccional
(confirmaciones, bajas) del boletín.

### Analítica

| Servicio | Plan | Estimación mensual |
|---|---|---:|
| Plausible | Starter (10.000 páginas vistas) | USD 9 |
| Plausible | Growth (3 sitios, 3 usuarios) | USD 14 |
| Alternativa | Umami autoalojado | USD 0–5 (infraestructura) |

Sin cookies y sin banner de consentimiento para la analítica esencial. Si se añaden
herramientas de marketing, el coste y las obligaciones de consentimiento cambian.

### Observabilidad y desarrollo

| Servicio | Plan | Estimación mensual |
|---|---|---:|
| Sentry | Free / Team | USD 0–26 |
| GitHub | Free / Team | USD 0–16 (2–4 usuarios) |
| UptimeRobot o similar | Free | USD 0 |
| Backups externos (R2/B2) | — | USD 1–10 |

### Medios

| Concepto | Estimación | Cálculo |
|---|---:|---|
| Imágenes | < USD 1/mes | 50 imágenes × ~300 KB ≈ 15 MB |
| Audio | USD 1–3/mes | 1 hora MP3 ≈ 56 MB; 50 episodios ≈ 2,8 GB |
| PDF | < USD 1/mes | 1–12 números × 5–20 MB |
| Tráfico | USD 0 en R2 | Egreso gratuito |

El almacenamiento no es el coste dominante; lo son el correo y el tiempo de gestión.

---

## 3. Costes únicos (no recurrentes)

| Concepto | Rango estimado | Cuándo |
|---|---:|---|
| Dominio (2 años, 2 TLD) | USD 25–60 | Fase 1 |
| Diseño de identidad (si se externaliza) | USD 800–4.000 | Fase 1–2 |
| Revisión legal de textos | USD 300–1.500 | Fase 7–8 |
| Prueba de penetración externa | USD 2.000–8.000 | Fase 7 |
| Auditoría de accesibilidad | USD 500–2.000 | Fase 7 |
| Traducción profesional (si se externaliza) | USD 0,08–0,15/palabra | Continuo |

Estos rangos son orientativos y dependen del proveedor y del país. **No se ha solicitado
ninguna cotización.**

---

## 4. Costes que crecen con el uso

| Variable | Umbral | Impacto |
|---|---|---|
| Visitas | > 100 GB/mes de transferencia en Vercel | Plan superior o revisión de caché |
| Suscriptores | > 1.000 / 5.000 contactos | Salto de plan de correo |
| Audio | > 10 GB | Centavos en R2, pero más ancho de banda de CDN |
| Almacenamiento de PDF | > 10 GB | Coste bajo, pero requiere respaldo |
| Base de datos | > 1 GB / cómputo alto | Neon escala por uso |
| Correos | > 3.000/mes | Resend Pro |

---

## 5. Comparativa de alternativas

| Necesidad | Opción A | Opción B | Opción C |
|---|---|---|---|
| Base de datos | Neon (recomendada) | Supabase | RDS/Postgres gestionado |
| Almacenamiento | Cloudflare R2 (recomendada) | Backblaze B2 | S3 |
| Correo | Resend (recomendada) | Postmark | Amazon SES |
| Analítica | Plausible (recomendada) | Umami autoalojado | Matomo |
| Pagos | Stripe (si la entidad es elegible) | Donorbox | PayPal/Ko-fi |
| Búsqueda | PostgreSQL (inicial) | Meilisearch | Typesense |

Criterios: coste total, facilidad de salida, soporte, privacidad, disponibilidad en el país
de la entidad y cumplimiento.

---

## 6. Advertencias

1. **Vercel, Stripe y otros proveedores aplican restricciones territoriales y sanciones.**
   Antes de contratar hay que verificar el país de la entidad, el país de residencia de los
   administradores y las condiciones del proveedor.
2. **Las donaciones transfronterizas requieren asesoría legal y fiscal.** El módulo se
   entrega desactivado si no hay una vía viable.
3. **El correo puede ser el coste más variable.** La entregabilidad y el crecimiento de la
   lista deben monitorizarse desde el primer envío.
4. **No se contrata nada sin autorización expresa del propietario.**
5. Los precios de este documento no constituyen una oferta ni una garantía.

---

## 7. Recomendación de contratación por fases

| Fase | Contratar |
|---|---|
| Fase 1 | Dominio, GitHub, Vercel Hobby, Neon Free, R2 Free, Resend Free |
| Fase 2–3 | Vercel Pro, Neon Launch, Sentry Free |
| Fase 4 | Resend Pro/Marketing, Plausible Starter |
| Fase 5 | R2 ampliado, respaldo externo |
| Fase 6 | Pasarela de pago **solo si está validada** |
| Fase 7 | Auditoría externa y prueba de penetración |
| Fase 8 | Producción, monitorización y backups verificados |
