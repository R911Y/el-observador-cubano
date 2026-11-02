# 06 · Mapa de páginas y rutas

Las rutas se localizan con `next-intl`. El español es el idioma por defecto (`/es`), pero
siempre se muestra el prefijo para evitar ambigüedad y facilitar `hreflang`.

Convención:

- **ES** = ruta en español · **EN** = ruta en inglés.
- `[slug]` se obtiene de `ArticleTranslation.slug` / `CategoryTranslation.slug`.
- Ninguna ruta pública requiere sesión.
- Todas las rutas de administración viven bajo `/admin`, sin prefijo de idioma.

---

## 1. Páginas públicas

### 1.1 Portada y navegación

| Página | ES | EN | Render |
|---|---|---|---|
| Portada | `/es` | `/en` | ISR |
| Últimas noticias | `/es/ultimas` | `/en/latest` | ISR |
| Buscar | `/es/buscar?q=` | `/en/search?q=` | SSR |
| Autor | `/es/autor/[slug]` | `/en/author/[slug]` | ISR |
| Etiqueta | `/es/etiqueta/[slug]` | `/en/tag/[slug]` | ISR |
| Archivo | `/es/archivo` | `/en/archive` | ISR |
| Multimedia | `/es/multimedia` | `/en/multimedia` | ISR |

### 1.2 Secciones

| Sección | ES | EN |
|---|---|---|
| Nacional | `/es/nacional` | `/en/national` |
| Internacional | `/es/internacional` | `/en/international` |
| Comunidades | `/es/comunidades` | `/en/communities` |
| Sociedad | `/es/sociedad` | `/en/society` |
| Economía | `/es/economia` | `/en/economy` |
| Política | `/es/politica` | `/en/politics` |
| Cultura | `/es/cultura` | `/en/culture` |
| Opinión | `/es/opinion` | `/en/opinion` |
| Reportajes | `/es/reportajes` | `/en/features` |
| Entrevistas | `/es/entrevistas` | `/en/interviews` |
| Comunicados | `/es/comunicados` | `/en/statements` |

Cada sección tiene paginación `?pagina=2` / `?page=2`, filtros por etiqueta y año, y su
propio RSS: `/es/nacional/rss.xml`.

### 1.3 Artículos

| Página | ES | EN |
|---|---|---|
| Artículo | `/es/noticias/[slug]` | `/en/news/[slug]` |

Elementos de la plantilla:

- migas de pan (`Inicio › Sección › Título`);
- etiqueta de sección y tipo (noticia, opinión, reportaje, entrevista, comunicado);
- titular, extracto, autor, fecha de publicación y de actualización;
- imagen principal con pie, crédito y licencia;
- cuerpo con jerarquía de encabezados;
- notas del editor y correcciones visibles;
- fuentes y metodología cuando existan;
- botones de compartir (WhatsApp, X, Facebook, correo, copiar enlace);
- artículos relacionados (máximo 3, sin repetir el actual);
- comentarios y enlace a normas;
- navegación anterior/siguiente dentro de la sección;
- `NewsArticle` JSON-LD y `canonical`.

### 1.4 Radio

| Página | ES | EN |
|---|---|---|
| Radio | `/es/radio` | `/en/radio` |
| Programa | `/es/radio/[programa]` | `/en/radio/[program]` |
| Episodio | `/es/radio/[programa]/[episodio]` | `/en/radio/[program]/[episode]` |
| RSS del podcast | `/es/radio/podcast.xml` | `/en/radio/podcast.xml` |

El reproductor nunca se inicia automáticamente con sonido. Muestra duración, progreso,
velocidad, descarga (si está autorizada) y transcripción cuando exista.

### 1.5 Edición impresa y hemeroteca

| Página | ES | EN |
|---|---|---|
| Ediciones | `/es/edicion-impresa` | `/en/print-editions` |
| Detalle | `/es/edicion-impresa/[numero-o-slug]` | `/en/print-editions/[number-or-slug]` |

Incluye visor adaptado a móvil, descarga del PDF, metadatos (número, fecha, páginas,
tamaño, idioma) y enlace para compartir.

### 1.6 Suscripción, donaciones y comunidad

| Página | ES | EN | Notas |
|---|---|---|---|
| Suscripción | `/es/suscripcion` | `/en/newsletter` | Formulario con doble confirmación |
| Confirmar suscripción | `/es/suscripcion/confirmar?token=` | `/en/newsletter/confirm?token=` | Token de un solo uso |
| Baja | `/es/suscripcion/baja?token=` | `/en/newsletter/unsubscribe?token=` | Sin necesidad de iniciar sesión |
| Preferencias | `/es/suscripcion/preferencias?token=` | `/en/newsletter/preferences?token=` | Idioma y frecuencia |
| Donar | `/es/donar` | `/en/donate` | Desactivada si no hay proveedor |
| Gracias | `/es/donar/gracias` | `/en/donate/thank-you` | Sin datos de tarjeta |
| Contacto | `/es/contacto` | `/en/contact` | Formulario con protección antispam |
| Sigue el canal | `/es/sigue` | `/en/follow` | WhatsApp, X, Facebook, RSS |

### 1.7 Institucional y legal

| Página | ES | EN | Estado |
|---|---|---|---|
| Acerca del periódico | `/es/acerca` | `/en/about` | Contenido existente revisado |
| Equipo editorial | `/es/equipo` | `/en/team` | Requiere datos del equipo |
| Privacidad | `/es/privacidad` | `/en/privacy` | **Borrador para revisión legal** |
| Cookies | `/es/cookies` | `/en/cookies` | **Borrador para revisión legal** |
| Aviso legal | `/es/aviso-legal` | `/en/legal-notice` | **Borrador para revisión legal** |
| Política de correcciones | `/es/correcciones` | `/en/corrections` | Borrador editorial |
| Normas de comentarios | `/es/normas-comentarios` | `/en/comment-policy` | Borrador editorial |
| Transparencia y financiación | `/es/transparencia` | `/en/transparency` | Borrador editorial |
| Política de suscripción | `/es/politica-suscripcion` | `/en/newsletter-policy` | Borrador |
| Política de donaciones | `/es/politica-donaciones` | `/en/donation-policy` | Borrador |
| Publicidad | `/es/publicidad` | `/en/advertising` | Solo si hay publicidad |

Ningún texto legal se publicará como definitivo sin revisión profesional. La interfaz
mostrará un aviso de borrador mientras `Page.requiresLegalReview` sea verdadero.

### 1.8 Errores y sistema

| Ruta | Contenido |
|---|---|
| `/[locale]/404` | Página no encontrada con buscador y enlaces útiles |
| `/500` | Error interno sin detalles técnicos |
| `/sitemap.xml` | Índice de sitemaps por idioma y tipo |
| `/robots.txt` | Reglas de rastreo |
| `/manifest.webmanifest` | PWA básica (icono, color, nombre) |
| `/opengraph-image` | Imagen social generada por plantilla |

---

## 2. Portada: composición editorial

Orden propuesto (ajustable desde el CMS con *rank* y vigencia):

1. Cabecera con logotipo, lema, fecha, buscador, idioma y menú.
2. Titular principal (1 noticia, imagen grande).
3. Dos noticias secundarias + 3 breves.
4. «Últimas» (6–8, excluyendo las anteriores).
5. Reportaje destacado (1) + entrevista (1).
6. Sección «Comunidades» (3–4).
7. Opinión (3, con firma y retrato).
8. Economía / Sociedad en dos columnas.
9. Radio: último episodio + enlace al archivo.
10. Edición impresa: portada y descarga.
11. Suscripción al boletín.
12. Apoyo con donaciones (discreto).
13. Pie completo.

**Regla de no repetición:** un artículo no puede aparecer dos veces en la portada. Si falta
contenido, el bloque se omite; no se rellena con duplicados.

La selección no depende solo de la fecha: el CMS permite fijar `isFeatured`, `featuredRank`
y vigencia editorial por bloque.

---

## 3. Administración

| Ruta | Función |
|---|---|
| `/admin/login` | Acceso con correo/contraseña + MFA |
| `/admin` | Panel con pendientes, publicaciones y alertas |
| `/admin/articulos` | Listado, filtros y estados |
| `/admin/articulos/nuevo` | Crear artículo |
| `/admin/articulos/[id]` | Editor, metadatos, traducciones, revisiones |
| `/admin/revision` | Cola de revisión y aprobación |
| `/admin/traducciones` | Estado de traducciones por idioma |
| `/admin/categorias` | Árbol de secciones y slugs |
| `/admin/etiquetas` | Etiquetas y fusión de duplicados |
| `/admin/autores` | Autores, seudónimos y biografías |
| `/admin/medios` | Biblioteca, alt, crédito, licencia, EXIF |
| `/admin/paginas` | Páginas institucionales y legales |
| `/admin/comentarios` | Moderación, denuncias y bloqueos |
| `/admin/suscriptores` | Altas, confirmaciones, bajas y exportación |
| `/admin/boletines` | Crear, previsualizar, probar, programar |
| `/admin/radio` | Programas y episodios |
| `/admin/ediciones` | Edición impresa y PDF |
| `/admin/publicidad` | Anunciantes, campañas y creatividades |
| `/admin/donaciones` | Transacciones y conciliación |
| `/admin/analitica` | Métricas agregadas |
| `/admin/usuarios` | Roles, MFA, suspensión |
| `/admin/configuracion` | Ajustes del sitio y proveedores |
| `/admin/auditoria` | Registro de actividad |
| `/admin/importar` | Importación de Blogger con simulación |

Cada pantalla exige permiso en servidor. El menú oculta lo que no corresponde, pero la
autorización real se repite en cada acción.

---

## 4. API y endpoints internos

| Ruta | Método | Uso |
|---|---|---|
| `/api/auth/[...all]` | varios | Better Auth |
| `/api/uploads/sign` | POST | URL firmada para subir a R2 |
| `/api/uploads/complete` | POST | Validar y registrar el archivo |
| `/api/comments` | POST | Crear comentario (rate limit + antispam) |
| `/api/comments/[id]/report` | POST | Denunciar |
| `/api/newsletter/subscribe` | POST | Alta con doble confirmación |
| `/api/newsletter/confirm` | GET/POST | Confirmar token |
| `/api/newsletter/unsubscribe` | GET/POST | Baja |
| `/api/webhooks/resend` | POST | Rebotes y quejas |
| `/api/webhooks/payments` | POST | Pago verificado por firma |
| `/api/donations/checkout` | POST | Crear sesión de pago (si está activo) |
| `/api/revalidate` | POST | Revalidación firmada desde el CMS |
| `/api/track` | POST | Evento agregado sin PII |
| `/api/health` | GET | Estado de aplicación y base de datos |

Las acciones de formulario internas usan **Server Actions** con validación Zod; la API
pública se reserva para webhooks, subidas y lectores.

---

## 5. Metadatos y SEO por página

| Página | `canonical` | `hreflang` | JSON-LD |
|---|---|---|---|
| Portada | Sí | es/en/x-default | `Organization`, `WebSite` |
| Artículo | Sí | es/en + traducciones | `NewsArticle`, `BreadcrumbList`, `Person` |
| Sección | Sí | Sí | `CollectionPage`, `BreadcrumbList` |
| Autor | Sí | Sí | `Person`, `ProfilePage` |
| Radio | Sí | Sí | `PodcastSeries` / `PodcastEpisode` |
| Edición impresa | Sí | Sí | `PublicationIssue` |
| Legal | Sí | Sí | `WebPage` |

Reglas:
- `canonical` apunta siempre a la versión publicada y localizada.
- Si una traducción no existe, no se emite `hreflang` para ese idioma; se enlaza a la
  versión disponible.
- Los datos estructurados solo describen contenido visible y verificable.
- Las fechas de publicación y modificación provienen de la base de datos, no de textos
  escritos a mano.

---

## 6. Navegación

### Escritorio
- Barra superior fina: fecha, «Sigue el canal», idioma, acceso a suscripción.
- Cabecera central: logotipo + lema.
- Menú principal: Inicio · Últimas · Nacional · Internacional · Comunidades · Sociedad ·
  Economía · Opinión · Radio · Impreso.
- «Más» agrupa Cultura, Política, Reportajes, Entrevistas, Comunicados, Multimedia y
  Archivo.
- Buscador como botón que abre un campo accesible.

### Móvil
- Cabecera compacta con menú, logotipo y búsqueda.
- Menú lateral a pantalla completa con secciones y enlaces legales.
- Botón de suscripción visible sin tapar el contenido.
- Reproductor de radio fijo solo cuando el usuario lo inicia.

---

## 7. Redirecciones desde Blogger

Se crearán 48 redirecciones 301, una por cada URL actual:

```text
/2026/10/la-atencion-de-salud-cambio-en-el.html
  → /es/noticias/la-atencion-de-salud-cambio-en-el-moron

/p/ee-uu-buscaria-contactos-dentro-del.html
  → /es/noticias/ee-uu-contactos-regimen-cubano-acuerdo-politico
```

- El mapa completo se genera durante la importación y se revisa antes de publicar.
- Los enlaces internos del cuerpo también se reescriben.
- Se conserva una tabla `Redirect` y se prueba con una lista de comprobación automatizada.
- El blog de Blogger permanecerá disponible al menos 12 meses, con aviso y enlaces a la
  nueva sede, hasta que el tráfico se estabilice.

Detalle en [09 · Plan de migración](09-plan-migracion.md).
