# 08 · Plan de seguridad y privacidad

**Marco de referencia:** OWASP Top 10 (2021/2025), OWASP ASVS nivel 2, guías de seguridad
de Next.js y buenas prácticas de protección de fuentes.

**Objetivo:** reducir el riesgo de compromiso, fuga o pérdida de contenido, proteger a las
fuentes y a los lectores, y poder demostrar que los controles funcionan.

---

## 1. Modelo de amenazas

### Activos a proteger
1. Identidad y comunicaciones de fuentes.
2. Borradores, notas editoriales y documentos sensibles.
3. Credenciales y sesiones del equipo.
4. Datos de suscriptores y comentaristas.
5. Integridad del archivo publicado.
6. Dominio, DNS, correo y cuentas de infraestructura.
7. Disponibilidad del sitio.

### Actores y riesgos

| Actor | Motivación | Riesgo principal |
|---|---|---|
| Vigilancia estatal / actores con recursos | Identificar fuentes y desacreditar al medio | Interceptación, ingeniería social, acceso a cuentas, presión legal |
| Atacantes oportunistas | Defacement, spam, ransomware | Vulnerabilidades no parcheadas, credenciales débiles |
| Scrapers y spam | Extraer datos, inundar comentarios | Abuso de formularios y APIs |
| Insider o colaborador descuidado | Error humano | Publicación accidental, fuga de enlaces, permisos excesivos |
| Proveedor comprometido | Cadena de suministro | Dependencia, registros, acceso a datos |
| Atacante físico | Acceso a dispositivos | Sesiones abiertas, discos sin cifrar |

### Supuestos y límites
- La plataforma **no puede garantizar anonimato absoluto** de fuentes. Ninguna web puede.
- Si el dispositivo del periodista está comprometido, la seguridad del servidor no ayuda.
- El equipo debe usar canal seguro (Signal/Proton) para contactar fuentes; el CMS no es un
  buzón de filtraciones.
- Los proveedores (Vercel, Neon, R2, correo) tienen acceso técnico a los datos. Se eligen
  por su reputación y se documentan las transferencias internacionales.

---

## 2. Autenticación y sesiones

- Contraseñas con **Argon2id** (o el algoritmo recomendado por Better Auth), mínimo 12
  caracteres, verificación contra listas de contraseñas filtradas.
- **MFA obligatoria** para `OWNER`, `ADMIN`, `EDITOR_IN_CHIEF`, `EDITOR` y `MODERATOR`.
  TOTP + códigos de recuperación; WebAuthn/passkeys recomendado.
- Sesiones en base de datos, token aleatorio de 256 bits, rotación al iniciar sesión y al
  cambiar contraseña o rol.
- Cookies `HttpOnly`, `Secure`, `SameSite=Lax` (o `Strict` en administración), `Path=/`,
  expiración absoluta de 30 días y expiración por inactividad de 8 horas en administración.
- Bloqueo progresivo tras intentos fallidos y notificación al usuario.
- Recuperación de cuenta con token de un solo uso, caducidad de 30 minutos y registro de
  auditoría. El `OWNER` dispone de un procedimiento de recuperación documentado y fuera de
  banda.
- Cierre de sesión en todos los dispositivos y revocación individual.
- Ninguna cuenta compartida. Cada persona tiene su cuenta.

---

## 3. Autorización (RBAC)

La autorización se comprueba **en el servidor en cada operación**. El menú y los botones
solo reflejan el permiso; no lo conceden.

| Capacidad | OWNER | ADMIN | EDITOR_IN_CHIEF | EDITOR | JOURNALIST | TRANSLATOR | MODERATOR |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Configuración del sitio | ✅ | ✅ | — | — | — | — | — |
| Gestión de usuarios y roles | ✅ | ✅ | — | — | — | — | — |
| Ver datos de suscriptores | ✅ | ✅ | — | — | — | — | — |
| Exportar suscriptores | ✅ | ✅ | — | — | — | — | — |
| Crear/editar artículos propios | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| Editar artículos de otros | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Aprobar y publicar | ✅ | ✅ | ✅ | — | — | — | — |
| Programar publicación | ✅ | ✅ | ✅ | — | — | — | — |
| Archivar/retirar | ✅ | ✅ | ✅ | — | — | — | — |
| Gestionar traducciones | ✅ | ✅ | ✅ | — | — | ✅ | — |
| Moderar comentarios | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| Gestionar radio/impreso | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Gestionar donaciones | ✅ | ✅ | — | — | — | — | — |
| Gestionar publicidad | ✅ | ✅ | — | — | — | — | — |
| Ver auditoría | ✅ | ✅ | — | — | — | — | — |
| Importar contenido | ✅ | ✅ | — | — | — | — | — |

Reglas adicionales:
- Un `JOURNALIST` solo edita sus propios borradores y no puede publicar ni cambiar
  permisos.
- Un `TRANSLATOR` no puede modificar el artículo original ni publicar sin aprobación.
- Un `MODERATOR` no puede ver correos ni datos de suscriptores.
- El último `OWNER` no puede eliminarse ni degradarse sin un procedimiento de traspaso.
- Toda operación sensible se registra en `AuditLog`.

---

## 4. Validación, sanitización y XSS

- **Zod** valida toda entrada: formularios, *server actions*, rutas, webhooks y variables
  de entorno.
- El contenido enriquecido se guarda como **JSON de TipTap** con un esquema cerrado. El HTML
  se genera en el servidor a partir de ese esquema; no se acepta HTML arbitrario.
- Lista blanca de nodos y atributos: párrafo, encabezados 2–4, negrita, cursiva, enlace,
  listas, cita, tabla, imagen, audio, código. Sin `script`, `style`, `iframe`, `object`,
  `form`, `svg` ni atributos `on*`.
- URLs de enlace validadas: solo `https:`, `http:` y rutas internas; se rechazan
  `javascript:`, `data:` y `vbscript:`.
- Los comentarios son texto plano con saltos de línea; nunca HTML.
- Escapado automático de React; `dangerouslySetInnerHTML` solo con el HTML ya saneado en
  servidor y con revisión de código obligatoria.
- Protección CSRF mediante `SameSite`, comprobación de `Origin`/`Referer` y tokens en
  formularios sensibles.

---

## 5. Cabeceras y transporte

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-<aleatorio>' 'strict-dynamic';
  style-src 'self' 'nonce-<aleatorio>';
  img-src 'self' data: https://cdn.<dominio>;
  media-src 'self' https://cdn.<dominio>;
  font-src 'self';
  connect-src 'self' https://<analitica>;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
```

- HSTS solo se activa con `preload` después de verificar el dominio y todos los
  subdominios en HTTPS. Antes, `max-age` corto.
- La CSP se prueba primero en `Report-Only` y se corrige hasta no tener violaciones.
- No se permite `unsafe-inline` ni `unsafe-eval` en producción.
- El sitio fuerza HTTPS y no sirve contenido mixto.

**Nota sobre caché y CSP:** un `nonce` distinto por petición impide servir HTML estático o
ISR. Por eso se aplican dos políticas: en las páginas públicas cacheadas se usan **hashes**
de los pocos scripts inline (o ninguno) y una CSP sin nonce; el `nonce` se reserva para las
rutas dinámicas (administración, formularios, comentarios). Si algún componente de Next
exige atributos `style` en línea, se habilita `style-src-attr` con el mínimo necesario y se
documenta; no se abre `script-src`.

---

## 6. Límites de peticiones

| Acción | Límite propuesto |
|---|---|
| Inicio de sesión | 5 intentos / 15 min por IP y por cuenta |
| Recuperación de contraseña | 3 / hora por cuenta |
| Suscripción al boletín | 5 / hora por IP; 1 / minuto por correo |
| Confirmación de suscripción | 10 / hora por IP; token de un solo uso |
| Comentario | 3 / 10 min por IP; 10 / día por identidad |
| Denuncia de comentario | 5 / hora por IP |
| Formulario de contacto | 3 / hora por IP |
| Checkout de donación | 10 / hora por IP |
| Subida de medios | 30 / hora por usuario |
| API pública | 100 / minuto por IP |
| Webhooks | Firma obligatoria; ventana de 5 minutos |

Implementación distribuida con Upstash Redis. Los límites se ajustan con datos reales, no
se desactivan para «solucionar» un error.

---

## 7. Subidas de archivos

- Tipo real verificado por *magic bytes*, no por extensión ni `Content-Type` del cliente.
- Límites: imágenes 15 MB; audio 200 MB; PDF 50 MB (configurables).
- Nombres de archivo generados por el servidor; nunca se usa el nombre original como ruta.
- Imágenes reprocesadas con `sharp`: se eliminan EXIF, GPS, XMP y miniaturas incrustadas.
- PDF: se valida estructura, se rechazan JavaScript embebido, archivos adjuntos y
  formularios; se calcula checksum. **El antivirus es obligatorio antes de publicar**; el
  proveedor se definirá en la Fase 5.
- Audio: se valida códec, duración y tamaño; se sirve con `Range` y sin autoplay.
- Los archivos se sirven desde un dominio de CDN distinto del de la aplicación, con
  `Content-Disposition` adecuado y sin ejecución.
- Los archivos huérfanos se marcan y se eliminan según política de retención.

---

## 8. Protección de fuentes

Medidas técnicas:
- No se registran direcciones IP completas en logs de aplicación; si se necesita
  seguridad, se guarda un hash con sal rotativa y retención corta.
- No se integra analítica de terceros en artículos sensibles; la analítica es agregada.
- No se publican correos personales de periodistas; los formularios de contacto usan
  alias.
- Los documentos internos se guardan en un espacio restringido, con URL firmadas de corta
  duración y registro de acceso.
- No se permite indexar el panel de administración (`X-Robots-Tag: noindex` + `robots.txt`).
- El CMS no se presenta como canal seguro para filtraciones. Se indica a las fuentes usar
  canales acordados fuera de la plataforma.

Medidas organizativas (obligatorias, no opcionales):
- Formación del equipo en higiene digital, phishing y gestión de dispositivos.
- Dispositivos con cifrado de disco y bloqueo.
- Cuentas individuales, MFA y gestor de contraseñas.
- Revisión periódica de permisos y bajas.
- Protocolo de comunicación con fuentes y de publicación de documentos.
- Evaluación de riesgos legales antes de publicar material sensible.

**Declaración honesta:** la plataforma reduce la exposición, pero no promete anonimato
absoluto. Prometerlo sería engañoso y peligroso.

---

## 9. Privacidad y cumplimiento

- Minimización: solo se recoge lo necesario para cada finalidad.
- Base jurídica documentada para cada tratamiento (consentimiento, interés legítimo,
  obligación legal).
- Sin cookies no esenciales por defecto. Analítica sin cookies ni identificadores
  persistentes.
- Consentimiento explícito para el boletín con doble confirmación y registro de evidencia.
- Derechos del lector: acceso, rectificación, supresión, oposición y portabilidad, con
  procedimiento y plazo documentados.
- Retención limitada (ver documento 05) y borrado verificable.
- Contratos de tratamiento con proveedores y registro de transferencias internacionales.
- Los textos legales se publican como **borradores identificados** hasta su revisión
  profesional.
- No se afirma «cumplimiento automático» de RGPD ni de ninguna otra norma.

---

## 10. Registro y auditoría

Se registra:
- inicio y cierre de sesión, fallos de autenticación y cambios de MFA;
- creación, edición, aprobación, publicación, despublicación y borrado;
- cambios de roles y permisos;
- exportaciones de suscriptores;
- accesos a documentos restringidos;
- cambios de configuración y de proveedores;
- webhooks de pago y su resultado.

No se registra:
- contraseñas, tokens, códigos MFA ni claves;
- contenido completo de artículos en borrador;
- correos de suscriptores en texto claro;
- IP completa;
- datos de fuentes.

Los registros son inmutables desde la aplicación y se conservan 24 meses.

---

## 11. Copias de seguridad y recuperación

| Elemento | Método | Frecuencia | Retención |
|---|---|---|---|
| PostgreSQL | PITR del proveedor + volcado lógico cifrado | Continua + diario | 7 días PITR; 30 días diarios; 12 mensuales |
| Multimedia (R2) | Versionado + copia a segundo *bucket* | Diaria | 30 días |
| PDF y documentos | Copia cifrada independiente | Diaria | 12 meses |
| Configuración y secretos | Exportación cifrada fuera del repositorio | Al cambiar | Permanente controlada |

- **RPO objetivo:** 15 minutos (base de datos), 24 horas (medios).
- **RTO objetivo:** 4 horas para el sitio público; 24 horas para el archivo completo.
- Las copias se cifran con claves gestionadas fuera del proveedor principal.
- Se prueba una restauración completa **trimestralmente** y se documenta el resultado.
- Una copia no se considera válida hasta que se ha restaurado y verificado.

---

## 12. Respuesta ante incidentes

1. **Detección y clasificación** (P1 crítico, P2 alto, P3 medio, P4 bajo).
2. **Contención:** revocar sesiones, rotar claves, aislar servicios, desactivar módulos.
3. **Erradicación:** corregir la causa, parchear, revisar dependencias.
4. **Recuperación:** restaurar desde copia verificada y comprobar integridad.
5. **Notificación:** a afectados y autoridades cuando corresponda, dentro de los plazos
   legales aplicables (por ejemplo, 72 horas en RGPD si procede).
6. **Comunicación pública:** mensaje breve, verificado y sin detalles explotables.
7. **Postmortem:** causa raíz, impacto, acciones y responsables, sin culpar a personas.

Se mantiene una lista de contactos fuera de línea y un procedimiento en papel para el caso
de que la infraestructura esté caída.

---

## 13. Verificación

Antes del lanzamiento:
- Revisión ASVS nivel 2 con evidencias.
- Pruebas negativas automatizadas (ver documento 25 del encargo).
- Escaneo de dependencias y contenedores.
- Prueba de penetración externa sobre *staging*.
- Revisión de cabeceras con `securityheaders.com` y pruebas propias.
- Prueba de restauración de copia.
- Revisión de accesibilidad con axe y lector de pantalla.
- Simulación de incidente y de recuperación.

Nada se marca como «seguro» por tener una interfaz que lo parezca.
