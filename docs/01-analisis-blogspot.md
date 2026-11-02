# 01 · Análisis del sitio actual (Blogspot)

**URL:** https://observadorcubano.blogspot.com/
**Plataforma:** Blogger (Google)
**Consultado:** 2 de noviembre de 2026

---

## 1. Ficha técnica

| Elemento | Valor observado |
|---|---|
| Plataforma | Blogger (`meta name="generator" content="blogger"`) |
| Plantilla | Predeterminada «Indie», versión 1.3.3, variante `indie_light` |
| Idioma declarado | `es-419` (español latinoamericano) |
| Dominio | Subdominio `blogspot.com` (sin dominio propio) |
| HTTPS | Sí; `http://` responde `301` a `https://` |
| Tipografías | Google Fonts: **Merriweather** y **Montserrat** |
| `theme-color` | `#eeeeee` |
| Publicidad | Metaetiquetas de AdSense de Blogger (`ca-host-pub-…`) |
| Comentarios | Sistema nativo de Blogger |
| Feed | `feeds/posts/default` (34 entradas) y `feeds/pages/default` (14 páginas) |
| Sitemap | `sitemap.xml`, solo con las 34 entradas |

No hay dominio propio, ni control de servidor, ni acceso a cabeceras, caché o
redirecciones. Cualquier cambio de infraestructura implica salir de Blogger.

---

## 2. Identidad actual

### Lo que debe conservarse
- **Nombre:** EL OBSERVADOR CUBANO.
- **Lema:** «Periodismo desde las comunidades».
- **Posicionamiento:** medio comunitario, independiente, sin fines de lucro, sin
  afiliación política ni partidista.
- **Tono:** informativo, documental, cercano a las comunidades, con distancia explícita
  entre hechos y opinión.
- **Texto de «Nosotros»:** declaración de propósito, independencia editorial y contexto de
  censura. Es un activo editorial y debe revisarse, no reescribirse desde cero.
- **Secciones de portada:** salud, deportes, derechos humanos, economía, sociedad,
  conflictos, entrevistas, internacionales, opinión, ediciones impresas.
- **Canal de WhatsApp** como vía de distribución complementaria.

### Lo que no debe trasladarse
- La plantilla y el aspecto de Blogger.
- La portada de una sola noticia y la barra lateral de enlaces estáticos.
- La dependencia de Google Drive para la edición impresa.
- Los metadatos generados por Blogger (editor «Blogger», autor = nombre del blog).
- Las etiquetas inconsistentes y las faltas de ortografía en nombres de sección
  (`Internacioneles`, `HOMOFÓBIA EN CUBA`).

### Material gráfico
En la página «Nosotros» aparece una imagen corporativa
(`1000668190.png`, alojada en `blogger.googleusercontent.com`). No se ha podido verificar
su autoría, licencia ni si es el logotipo oficial. **Debe confirmarlo el propietario antes
de reutilizarla.** La propuesta visual de la Fase 0 incluye un logotipo tipográfico
provisional y original.

---

## 3. Estructura y navegación

```text
Portada
├── Cabecera: nombre + lema + «¿Quiénes somos?» + «Más…»
├── Una sola entrada por página (paginación con max-results=1)
├── Barra lateral con 17 títulos de sección (listas de enlaces estáticos)
└── Pie: «El Observador Cubano | 2026» + «Con tecnología de Blogger»

Artículo
├── Título, fecha, imagen, cuerpo
├── Enlaces de comentario y de envío por correo
└── «Entradas más populares» (en algunas páginas)

Páginas especiales
├── /p/nosotros_0330024314.html  (institucional)
├── /p/octubre-2026.html         (edición impresa, PDF en Drive)
└── /p/papelografo.html          (sección/edición)
```

### Problemas de navegación
1. **La portada muestra una única noticia.** El enlace de paginación usa
   `max-results=1`, por lo que el resto del contenido queda a un clic y sin jerarquía
   editorial.
2. **No hay menú de categorías real.** El menú lateral son 14 listas de páginas (13 con
   título), enlazadas manualmente a entradas concretas; no son categorías navegables.
3. **El buscador existe pero está poco visible y sin etiqueta accesible.** La plantilla
   incluye un campo de búsqueda, pero no está integrado en la cabecera y la portada no lo
   destaca.
4. **No hay selector de idioma** ni versión en inglés.
5. **No hay página de autor, etiqueta, archivo por fecha ni resultados de búsqueda
   indexables.**
6. **No hay enlace a RSS** visible.
7. El enlace «Más…» no describe su contenido y no es accesible como etiqueta.

---

## 4. Contenido

| Métrica | Valor |
|---|---|
| Entradas publicadas | 34 |
| Páginas | 14 |
| Total de URLs públicas | 48 |
| Palabras totales | 20.205 |
| Media por entrada | 445 palabras |
| Media por página | 364 palabras |
| Imágenes | 50 (1 por elemento; 2 elementos con 2) |
| Rango temporal | 2026-01-21 → 2026-10-29 |
| Entradas con etiqueta | 9 de 34 (26 %) |
| Etiquetas distintas | 5 |

### Distribución mensual

| Mes | Entradas |
|---|---|
| 2026-01 | 8 |
| 2026-02 | 7 |
| 2026-03 | 1 |
| 2026-04 | 1 |
| 2026-05 | 3 |
| 2026-06 | 3 |
| 2026-07 | 5 |
| 2026-08 | 5 |
| 2026-09 | 0 |
| 2026-10 | 1 |

La producción es irregular. Septiembre no tiene publicaciones y marzo/abril son meses
casi vacíos. El nuevo CMS debe facilitar la programación y el trabajo en borrador, pero
no puede resolver por sí solo la capacidad editorial.

### Tipos de contenido detectados

| Tipo real | Cantidad | Observación |
|---|---:|---|
| Noticia | ~29 | Incluye 11 que hoy son «páginas» |
| Opinión | 2 | «Contra el espejismo…» y «Dictadura y bien» |
| Comunicado | 3 | Cuba Crece Contigo |
| Entrevista | 1 | Luis Edel Hernández |
| Crónica | 1 | Los 3.800 pesos del aceite |
| Institucional | 1 | «Nosotros» |
| Edición impresa | 2 | `OCTUBRE 2026` y `PAPELÓGRAFO` |

**Hallazgo crítico:** 11 de las 14 «páginas» son noticias. El importador no puede confiar
en el tipo de Blogger; debe reclasificar con una tabla de decisión revisada por el equipo.

### Etiquetas actuales

| Etiqueta | Usos |
|---|---:|
| `CUBA` | 8 |
| `ESTADOS UNIDOS` | 3 |
| `OPOSITORES CUBANOS` | 3 |
| `VIDAS` | 1 |
| `HOMOFÓBIA EN CUBA` | 1 |

La barra lateral muestra 13 títulos de sección (`Papelógrafo`, `Internacioneles`, `IMPRESO`,
`Artículo de opinión`, `DEPORTES`, `SALUD`, `Derechos Humanos`, `Economía`, `Especiales`,
`Sociedad`, `Opositores Cubanos`, `Conflictos`, `Entrevistas`), pero solo 5 existen como
etiquetas. **La taxonomía debe rediseñarse antes de migrar**, o se importará el mismo
desorden.

### Autoría

- El feed atribuye las 34 entradas a **«El Observador CUBANO»**.
- Solo 4 textos llevan firma en el cuerpo: `Emialuz`, `Rubén (seudónimo)`, `Zami`,
  `Zeiber`. Otros usan «Redacción» o ninguna firma.
- No hay biografías, fotos ni identificadores de autor.

El sistema debe soportar:
- autores reales y seudónimos;
- firma visible opcional;
- ocultación de correo y datos privados;
- autores que son colaboradores externos sin cuenta de acceso.

### Enlaces externos

| Dominio | Apariciones | Uso |
|---|---:|---|
| `blogger.googleusercontent.com` | 48 | Imágenes |
| `drive.google.com` | 5 | PDF y documentos |
| `facebook.com` | 4 | Publicaciones de Facebook |
| `cubanet.org` | 2 | Fuentes citadas |
| `x.com` | 2 | Publicaciones de X |
| `cubacrececontigo.my.canva.site` | 1 | Enlace institucional |
| `airtable.com` | 1 | Listado nominal de fallecidos |
| `jovencuba.com` | 1 | Fuente citada |

Dos enlaces (Airtable y Facebook) contienen información de terceros. Antes de republicar
hay que revisar finalidad, consentimiento y riesgo para las personas mencionadas.

---

## 5. SEO técnico

| Comprobación | Resultado | Impacto |
|---|---|---|
| `canonical` | Presente pero **sin `href`** | Alto: no consolida URLs |
| `meta description` | Ausente | Alto |
| `og:description` | Vacío en portada | Medio |
| `og:type` | Ausente | Medio |
| `hreflang` | 0 | Alto para el proyecto bilingüe |
| `JSON-LD` | 1 `BlogPosting` | Parcial |
| Editor declarado | **Blogger** | Alto: atribución incorrecta |
| Autor declarado | Nombre del blog | Alto |
| `BreadcrumbList` | Ausente | Medio |
| Sitemap | Solo 34 entradas; **las 14 páginas no están** | Alto |
| RSS | Existe el feed de Blogger, sin enlace visible | Bajo |
| URLs | `.html` y slugs automáticos, algunas con `_21` o fechas | Medio |
| `robots.txt` | Generado por Blogger, sin control | Bajo |
| Redirecciones | No controlables desde Blogger | Alto para la migración |

Ejemplo real de datos estructurados en un artículo:

```json
{
  "@type": "BlogPosting",
  "publisher": { "@type": "Organization", "name": "Blogger" },
  "author": { "@type": "Person", "name": "El Observador CUBANO" }
}
```

No representa la realidad del medio. El nuevo sitio debe emitir `NewsArticle`,
`Organization` y `Person` con datos verificados.

---

## 6. Rendimiento (línea base)

| Métrica | Portada | Artículo |
|---|---:|---:|
| Peso del HTML (sin comprimir) | 87 KB | 110 KB |
| `<script>` | 5 (4 externos) | — |
| Hojas de estilo | 1 (Google Fonts) | — |
| Imágenes en el HTML inicial | 1 | 4 |
| `srcset` | — | 3 |
| JSON-LD | 0 | 1 |

- Las imágenes del cuerpo se sirven desde `blogger.googleusercontent.com` con sufijos
  `/s1600/` o `/s1600-rw/`, sin formatos modernos ni conjunto de tamaños controlado por el
  medio.
- Las fuentes se cargan desde Google Fonts: una dependencia externa y un coste de conexión
  adicional en redes lentas.
- No se midieron Core Web Vitals en dispositivo real. **No se afirma ningún valor de LCP,
  INP o CLS.** La medición con Lighthouse y WebPageTest se hará en la Fase 1, antes de
  fijar objetivos de mejora.

---

## 7. Accesibilidad (muestra de un artículo)

Comprobaciones automáticas sobre el HTML servido:

| Comprobación | Resultado |
|---|---|
| Imágenes con texto alternativo | 4 imágenes, **0 con `alt` no vacío** |
| Encabezado principal | 1 `h1` correcto |
| Encabezados de sección | 0 `h2` (todo el cuerpo va en párrafos) |
| Enlaces sin texto discernible | 5 (iconos) |
| Campos de formulario | 2 `input`, 0 `label` |
| Enlaces `target="_blank"` sin `rel` | 0 |

No es una auditoría WCAG completa, pero confirma que la accesibilidad no fue un criterio
de diseño. El nuevo sistema debe partir de componentes accesibles y de pruebas con axe en
integración continua.

---

## 8. Seguridad y cabeceras

Respuesta de `https://observadorcubano.blogspot.com/`:

| Cabecera | Valor | Valoración |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Correcta |
| `X-XSS-Protection` | `1; mode=block` | Obsoleta; no aporta protección real |
| `Strict-Transport-Security` | Ausente | Sin HSTS |
| `Content-Security-Policy` | Ausente | Sin CSP |
| `Referrer-Policy` | Ausente | Sin control de referente |
| `Permissions-Policy` | Ausente | Sin restricción de APIs |
| `Cache-Control` | `private, max-age=0` | Sin caché de CDN |
| Servidor | `GSE` (Google) | Gestionado por Blogger |

La plataforma no permite endurecer cabeceras ni auditar el servidor. Es una razón
adicional para salir de Blogger.

---

## 9. Problemas de experiencia de usuario (priorizados)

| Prioridad | Problema | Consecuencia |
|---|---|---|
| P0 | Portada con una sola noticia | El lector no percibe un periódico; se pierde el resto del día |
| P0 | Sin categorías navegables | El contenido queda enterrado |
| P0 | Sin versión en inglés | Limita alcance y cumplimiento del objetivo bilingüe |
| P1 | Buscador poco visible y sin etiqueta accesible | No se puede recuperar el archivo |
| P1 | Sin autoría clara | Menor confianza y peor SEO |
| P1 | PDF en Drive sin visor | Mala experiencia móvil y dependencia externa |
| P1 | Imágenes sin `alt` | Excluye a lectores con lectores de pantalla |
| P2 | Sin archivo histórico | El contenido deja de ser consultable |
| P2 | Sin newsletter | No hay relación directa con el lector |
| P2 | Sin comentarios moderados públicamente | No hay comunidad ni política visible |

---

## 10. Necesidades de migración

1. XML de Blogger para conservar fechas, IDs, autores internos y contenido original.
2. Reclasificación de 11 páginas que son noticias.
3. Definición de categorías definitivas y migración de 5 etiquetas.
4. Reconstrucción del modelo de autores (reales y seudónimos).
5. Rehosteo de 50 imágenes con revisión de derechos y eliminación de EXIF.
6. Descarga y validación de los PDF de ediciones impresas.
7. Mapa de 48 redirecciones 301.
8. Revisión de enlaces externos sensibles (Airtable, Facebook).
9. Conservación del blog actual como respaldo durante 12 meses como mínimo.

Detalle operativo en [09 · Plan de migración](09-plan-migracion.md).

---

## 11. Limitaciones de este análisis

- No se dispone de estadísticas de audiencia ni de datos de Google Analytics/Search
  Console. No se han inventado.
- No se ha accedido al panel de Blogger, por lo que no se conocen borradores, entradas
  programadas ni comentarios pendientes.
- No se ha analizado el perfil de enlaces entrantes (backlinks).
- No se ha realizado una auditoría legal de las imágenes ni de los textos de terceros.
- La comprobación de accesibilidad es una muestra automatizada, no una auditoría manual
  con usuarios.
