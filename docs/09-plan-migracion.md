# 09 · Plan de migración desde Blogger

**Objetivo:** trasladar el contenido publicado sin pérdidas no documentadas, conservar el
archivo y no romper enlaces existentes.

**Principios:**
1. **No destructivo:** el blog original no se modifica ni se borra.
2. **Idempotente:** volver a ejecutar la importación no duplica artículos.
3. **Reanudable:** una interrupción no obliga a empezar de cero.
4. **Previsualizable:** primero un informe de simulación; después, la escritura.
5. **Trazable:** cada elemento importado guarda su origen y su checksum.
6. **Reversible:** se puede deshacer un lote sin tocar el contenido existente.

---

## 1. Entradas necesarias

| Entrada | Quién la aporta | Uso |
|---|---|---|
| XML de exportación de Blogger | Propietario | Fuente canónica: entradas, páginas, fechas, IDs, autores internos |
| Acceso de lectura al blog | Propietario | Verificación visual y de imágenes |
| Imágenes originales (si existen) | Propietario | Calidad y derechos |
| PDF de ediciones impresas | Propietario | Hemeroteca |
| Audio de radio | Propietario | Módulo de radio |
| Lista de autores y seudónimos | Editorial | Modelo de autoría |
| Decisión de categorías | Editorial | Taxonomía definitiva |
| Selección de contenido de WhatsApp | Editorial | Republicación puntual |

Sin el XML se puede importar desde el feed público, pero se perderían IDs internos,
borradores y algunos metadatos. **No se recomienda** como vía principal.

---

## 2. Fases de la migración

### Fase M0 — Preparación
- Solicitar y custodiar el XML (copia cifrada, acceso restringido).
- Congelar cambios editoriales en Blogger durante la ventana de importación final.
- Crear el mapa de categorías y autores.
- Descargar una copia de todas las imágenes y PDF accesibles.

### Fase M1 — Simulación (*dry run*)
- Parsear el XML sin escribir en la base de datos.
- Generar informe por elemento: título, fecha, tipo detectado, tipo propuesto, etiquetas,
  imágenes, enlaces, palabras, posibles duplicados y problemas.
- Revisión editorial del informe.

### Fase M2 — Importación de estructura
- Crear categorías, etiquetas y autores.
- Crear páginas institucionales y legales como borradores.
- No publicar nada todavía.

### Fase M3 — Importación de contenido
- Crear artículos y traducciones en estado `DRAFT`.
- Asociar autor, categoría, etiquetas y medios.
- Guardar la revisión inicial con el HTML original como referencia.
- Calcular checksum por elemento.

### Fase M4 — Medios
- Descargar imágenes, verificar que responden, calcular checksum y eliminar EXIF.
- Rehostear en R2 y generar variantes.
- Redactar `alt` y pie cuando falten (revisión humana).
- Registrar crédito y licencia; si se desconoce, marcar para revisión y no publicar hasta
  resolverlo.

### Fase M5 — Edición y control de calidad
- Revisar titulares, extractos y firmas.
- Reclasificar las 11 páginas que son noticias.
- Corregir erratas y normalizar etiquetas.
- Revisar enlaces externos y datos personales de terceros.
- Verificar que no se publique contenido sin derechos.

### Fase M6 — Redirecciones y SEO
- Crear las 48 redirecciones 301.
- Generar sitemap, RSS y `hreflang`.
- Comprobar `canonical` y datos estructurados.
- Verificar que ninguna URL antigua devuelve 404.

### Fase M7 — Publicación
- Publicar por lotes pequeños (primero 5 artículos, luego el resto).
- Comprobar portada, secciones, búsqueda y artículos.
- Monitorizar errores 404/500 y Core Web Vitals.

### Fase M8 — Cierre
- Mantener Blogger como respaldo al menos 12 meses.
- Añadir aviso en Blogger con enlace a la nueva sede.
- Archivar el XML y los informes de importación.
- Documentar incidencias y lecciones aprendidas.

---

## 3. Mapeo de campos

| Blogger | Modelo nuevo | Regla |
|---|---|---|
| `entry.id` | `ImportItem.sourceId` | Clave de idempotencia |
| `title` | `ArticleTranslation.title` | Limpiar mayúsculas y hashtags |
| `published` | `Article.publishedAt` | Conservar fecha y zona horaria |
| `updated` | `Article.updatedAt` | Conservar como referencia |
| `author.name` | `Article.authorId` | Mapear a autor real o «Redacción» |
| `category.term` | `Tag` / `Category` | Requiere decisión editorial |
| `content` | `ArticleTranslation.bodyJson/bodyHtml` | Convertir HTML a JSON TipTap |
| `link.alternate` | `Redirect.fromPath` | 301 a la nueva URL |
| `media:thumbnail` | `MediaAsset` | Descargar y rehostear |
| `app:control` (draft) | `Article.status = DRAFT` | No publicar automáticamente |
| Página (`/p/…`) | `Page` o `Article` | Según tabla de reclasificación |

### Conversión de HTML
- Se permite un subconjunto: párrafos, encabezados, negrita, cursiva, enlaces, listas,
  citas, imágenes y tablas simples.
- Se eliminan estilos en línea, `div` vacíos, `span` sin semántica y atributos de Blogger.
- Las imágenes se sustituyen por referencias a `MediaAsset`.
- Los enlaces internos a `observadorcubano.blogspot.com` se reescriben al nuevo dominio.
- Los enlaces externos se conservan, con revisión de destino.

---

## 4. Reclasificación y taxonomía

Antes de importar, el equipo debe aprobar:

1. **Categorías principales** (máximo 8–10 en el menú): Nacional, Internacional,
   Comunidades, Sociedad, Economía, Política, Cultura, Opinión, Reportajes, Entrevistas,
   Comunicados.
2. **Etiquetas** libres, normalizadas y sin duplicados por acentos o mayúsculas.
3. **Tipos editoriales:** noticia, reportaje, entrevista, opinión, comunicado, crónica.
4. **Autoría:** autores reales, seudónimos y «Redacción».

Propuesta de normalización de las 5 etiquetas actuales:

| Etiqueta actual | Destino |
|---|---|
| `CUBA` | Categoría `Nacional` (y etiqueta `Cuba` solo si aporta) |
| `ESTADOS UNIDOS` | Categoría `Internacional` + etiqueta `Estados Unidos` |
| `OPOSITORES CUBANOS` | Etiqueta `Opositores cubanos` (`Derechos humanos` como categoría) |
| `VIDAS` | Etiqueta `Vidas` (reportajes de personas) |
| `HOMOFÓBIA EN CUBA` | Etiqueta `Homofobia` + categoría `Sociedad` |

La decisión final es editorial; el importador solo aplica la tabla aprobada.

---

## 5. Imágenes

1. Descargar las 50 imágenes referenciadas, conservando la URL original.
2. Verificar que el archivo descargado es una imagen válida y que su checksum no está
   duplicado.
3. Eliminar EXIF/GPS/XMP y miniaturas incrustadas.
4. Registrar dimensiones, peso y formato.
5. Generar variantes AVIF/WebP y una copia JPEG de respaldo.
6. Subir a R2 con clave estable (`articles/<id>/<hash>.<ext>`).
7. Redactar `alt` y pie; si no se puede determinar, dejar constancia y no publicar la
   imagen como principal.
8. Registrar crédito y licencia; si se desconoce, marcarla como «pendiente de derechos».

Las imágenes cuyo original no esté disponible se sustituyen por una versión de la CDN de
Blogger solo si la resolución es suficiente y el derecho de uso está claro. En caso
contrario, se retira la imagen y se documenta.

---

## 6. Ediciones impresas

- Descargar el PDF desde Google Drive con autorización del propietario.
- Verificar que abre, que no está dañado y que su contenido corresponde al número.
- Calcular checksum, número de páginas y tamaño.
- Rechazar PDF con JavaScript, formularios, archivos adjuntos o cifrado no autorizado.
- Ejecutar análisis antivirus antes de publicar.
- Subir a R2 y crear el registro `PrintEdition`.
- Conservar el archivo original en una copia cifrada independiente.
- No enlazar a Google Drive en la nueva web.

---

## 7. Enlaces externos y datos de terceros

Revisión obligatoria de:

- **Airtable** con listado nominal de fallecidos: decidir si se mantiene, se convierte en
  contenido propio o se retira; valorar consentimiento y riesgo para las familias.
- **Facebook/X**: enlaces a publicaciones de terceros; pueden desaparecer o cambiar. Se
  conservan como fuente citada, no como prueba única.
- **Canva**: enlace institucional de terceros; sustituir por página propia si es posible.
- **Google Drive**: eliminar como dependencia de publicación.

Regla: no se incrustan contenidos de terceros que rastreen al lector ni se publican datos
personales sin una base clara.

---

## 8. Redirecciones

Se generará una redirección por cada URL antigua (48). Ejemplo de tabla:

```csv
from_path,to_path,status
/2026/10/la-atencion-de-salud-cambio-en-el.html,/es/noticias/atencion-salud-moron-tuero,301
/p/nosotros_0330024314.html,/es/acerca,301
/p/octubre-2026.html,/es/edicion-impresa/1,301
```

Consideraciones sobre Blogger:
- En un subdominio `blogspot.com` **no se pueden configurar redirecciones 301 del
  servidor**. Las opciones reales son:
  1. Mantener el blog y añadir `canonical` hacia la nueva URL y un aviso visible.
  2. Usar el dominio propio en Blogger y, al migrar, mover el dominio a Vercel para poder
     emitir 301 (requiere cambiar DNS y despublicar el blog de ese dominio).
  3. Usar una redirección JavaScript/meta refresh (no es 301 y pierde señales SEO).
- La recomendación es la opción 1 durante la transición y la opción 2 cuando el equipo
  apruebe el cambio de dominio. La decisión debe tomarse antes del lanzamiento.
- Mientras tanto, cada artículo nuevo incluye enlace a la versión nueva cuando exista.

---

## 9. Informe de importación

El informe (CSV + vista en `/admin/importar`) incluirá:

- total leído, importado, omitido y fallido;
- duplicados detectados por ID y por título/fecha;
- elementos sin imagen, sin autor, sin categoría o sin derechos;
- enlaces roto o externos;
- PDF no válidos;
- redirecciones creadas;
- checksum por elemento;
- tiempo por lote y posibilidad de reanudar.

Nada se publica automáticamente: la importación deja todo en `DRAFT` y el equipo aprueba.

---

## 10. Verificación de aceptación

| Comprobación | Criterio |
|---|---|
| Recuento | 34 entradas + 14 páginas contabilizadas, con decisión documentada para cada una |
| Texto | Ningún artículo con menos del 95 % de su texto original (revisión por muestreo y diff) |
| Imágenes | Todas las publicadas responden 200 y tienen `alt` |
| Enlaces internos | 0 enlaces a `blogspot.com` en el contenido publicado |
| Redirecciones | 48/48 rutas antiguas resuelven a 200 o 301 correcto |
| PDF | Al menos la edición disponible descarga y abre correctamente |
| SEO | `canonical`, `hreflang` y JSON-LD válidos en una muestra de 10 artículos |
| Búsqueda | Los títulos migrados se encuentran desde el buscador |
| Autoría | Cada artículo tiene autor o «Redacción» asignado |
| Derechos | Ninguna imagen marcada como «pendiente» se publica |

---

## 11. Reversión

- La importación se ejecuta por lotes identificados (`ImportJob`).
- Cada lote puede despublicarse y eliminarse sin afectar a otros.
- El contenido original permanece en Blogger y en el XML archivado.
- Antes de cada lote se toma una copia de la base de datos.
- Si la verificación falla, se restaura la copia y se corrige el importador.

---

## 12. Calendario propuesto

| Semana | Actividad |
|---|---|
| 1 | Recibir XML y materiales; congelar cambios |
| 1–2 | Simulación e informe; decisiones de taxonomía y autores |
| 2–3 | Importación de estructura y contenido en borrador |
| 3–4 | Medios, PDF y revisión editorial |
| 4 | Redirecciones, SEO y control de calidad |
| 5 | Publicación por lotes y verificación |
| 5–6 | Cierre, respaldo y documentación |

La migración real no debería empezar hasta que la Fase 2 (portal) y la Fase 3 (CMS)
estén estables.
