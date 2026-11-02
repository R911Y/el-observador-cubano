# 03 · Inventario de contenidos

**Fuente:** feed Atom/JSON público de Blogger (entradas y páginas), consultado el 2 de
noviembre de 2026.
**Cobertura:** 48 elementos públicos (34 entradas + 14 páginas). No incluye borradores,
programados ni comentarios.

- Tabla completa legible: [`data/inventario-contenidos.md`](data/inventario-contenidos.md)
- Datos para importación: [`data/inventario-contenidos.csv`](data/inventario-contenidos.csv)

---

## 1. Cifras globales

| Métrica | Valor |
|---|---:|
| Elementos | 48 |
| Entradas | 34 |
| Páginas | 14 |
| Palabras | 20.205 |
| Imágenes referenciadas | 50 |
| PDF referenciados | 5 enlaces a Google Drive |
| Audios referenciados | 0 |
| Etiquetas distintas | 5 |
| Autores visibles en el feed | 1 |
| Firmas visibles en el cuerpo | 4 |
| Rango | 2026-01-21 → 2026-10-29 |

No hay contenido anterior a 2026 en el feed. Si el propietario tiene entradas más antiguas
en borradores o en otro blog, debe aportarlas.

---

## 2. Las 14 páginas: reclasificación propuesta

| # | Página actual | Tipo real propuesto |
|---|---|---|
| 1 | `Nosotros` | Página institucional |
| 2 | `OCTUBRE 2026` | Edición impresa (PDF) |
| 3 | `PAPELÓGRAFO` | Edición impresa / sección especial |
| 4 | `EE. UU. buscaría contactos dentro del régimen cubano…` | Noticia internacional |
| 5 | `Cuba entra al horario pico con el sistema eléctrico al límite` | Noticia nacional |
| 6 | `México detiene un envío de petróleo a Cuba…` | Noticia internacional |
| 7 | `Electricidad en Cuba` | Reportaje / explicador |
| 8 | `Listado actualizado de cubanos fallecidos en Ucrania…` | Noticia / base de datos |
| 9 | `Liberan a Ángel Santiesteban-Prats…` | Noticia de derechos humanos |
| 10 | `Contra el espejismo del «socialismo democratizador»` | Opinión |
| 11 | `Crisis de combustible amenaza operaciones aéreas…` | Noticia económica |
| 12 | `Nicaragua elimina el libre visado para cubanos…` | Noticia internacional |
| 13 | `Muere Harald V, rey de Noruega, a los 89 años` | Noticia internacional |
| 14 | `Mal estado del terreno mantiene suspendida la copa inter-barrial…` | Noticia deportiva |

**11 de 14 son noticias.** El importador debe aplicar esta tabla (revisada por el equipo)
y no confiar en el tipo de Blogger.

---

## 3. Entradas con características especiales

| Entrada | Particularidad |
|---|---|
| `Homofobia en Cuba. Luis Edel Hernández: "Nunca fui bien aceptado"` | Entrevista; 1.573 palabras; etiquetas `HOMOFÓBIA EN CUBA`, `VIDAS` |
| `Crónica: 3.800 pesos por 900 mililitros…` | Crónica; firma «Rubén (seudónimo)»; enlace a Drive |
| `Contra el espejismo del «socialismo democratizador»` | Opinión; enlace a `jovencuba.com` |
| `Dictadura y bien` | Opinión |
| `COMUNICADO DEL CONSEJO EJECUTIVO Cuba Crece Contigo` | Comunicado de terceros |
| `Declaración del Consejo Ejecutivo de Cuba Crece Contigo` | Comunicado de terceros |
| `Cuba Crece Contigo firma Acuerdo Marco…` | Comunicado / noticia institucional |
| `Listado actualizado de cubanos fallecidos en Ucrania…` | Enlace a Airtable con nombres; datos sensibles de terceros |
| `Seguridad del Estado detiene a Henry Constantin…` | Enlace a Facebook; posible información sensible |
| `Liberan a Ángel Santiesteban-Prats…` | Enlace a Facebook; caso de derechos humanos |
| `LA HABANA: HALLAN UN BEBÉ SIN VIDA…` | Titular en mayúsculas; requiere normalización |
| `#AsltimoMinuto El dictador designado…` | Titular con hashtag y errata; requiere reescritura editorial |

---

## 4. Calidad editorial observable

- **Titulares en mayúsculas** y con hashtags en varios casos.
- **Erratas** en etiquetas y secciones (`HOMOFÓBIA`, `Internacioneles`, `#AsltimoMinuto`).
- **Firmas incompletas** o ausentes en la mayoría de los textos.
- **Extractos** no normalizados: el feed usa el inicio del cuerpo, no un campo de resumen.
- **Fechas** correctas en el feed, pero algunas entradas parecen haberse creado como
  páginas y luego publicado como noticias.
- **Imágenes** sin pie, crédito ni licencia.
- **Enlaces externos** sin contexto de salida ni aviso de terceros.

El CMS debe incorporar campos obligatorios (extracto, autor, categoría, crédito de imagen)
y validaciones que impidan publicar sin ellos.

---

## 5. Activos digitales

| Activo | Estado | Acción |
|---|---|---|
| 50 imágenes en `blogger.googleusercontent.com` | Accesibles | Descargar, verificar derechos, eliminar EXIF, rehostear en R2 |
| PDF de `OCTUBRE 2026` en Google Drive | Accesible mediante enlace | Descargar con autorización, validar, calcular checksum, rehostear |
| PDF de `PAPELÓGRAFO` en Google Drive | Accesible mediante enlace | Igual que el anterior |
| Logotipo/imagen de «Nosotros» | No verificada | Confirmar autoría y licencia |
| Audio de radio | **No existe en el feed** | Solicitar archivos al propietario |
| Lista de correo | **No existe** | Se creará desde cero con doble confirmación |
| Comentarios de Blogger | Existentes en la plataforma | Decidir si se migran; no son imprescindibles |

---

## 6. Lo que falta para un inventario completo

1. XML de exportación de Blogger (incluye IDs, borradores y metadatos internos).
2. Listado de imágenes originales en alta resolución y sus derechos.
3. PDF de todas las ediciones impresas.
4. Archivos de audio y portadas de radio.
5. Biografías y datos públicos de autores.
6. Confirmación de qué contenido de WhatsApp se quiere incorporar.
7. Política sobre el listado de fallecidos en Ucrania y otros datos personales de terceros.

Sin estos elementos, el inventario cubre el 100 % de lo publicado en el feed, pero no
necesariamente el 100 % de los activos del medio.
