# 07 · Propuesta visual y sistema de diseño

**Concepto:** «El cuaderno del observador».

Un periódico de comunidad con herramientas de precisión: papel cálido, tinta carbón,
reglas finas y un rojo editorial que marca lo importante sin gritar. La jerarquía manda;
la interfaz desaparece. Nada de degradados, cristales, ilustraciones infantiles ni
animaciones decorativas.

La identidad es **original**. No se copian logotipos, retículas, tipografías propietarias
ni fotografías de otros medios.

---

## 1. Logotipo provisional

### Concepto
- **Wordmark tipográfico:** `EL OBSERVADOR` en serif editorial de peso medio, con
  `CUBANO` debajo en versalitas espaciadas. El lema «Periodismo desde las comunidades» se
  coloca en una línea inferior, en sans de 12 px, solo en la cabecera.
- **Marca corta:** monograma `OC` dentro de un cuadrado de esquinas rectas, con una regla
  roja vertical que evoca el margen de un cuaderno.
- **Versiones:** principal horizontal, apilada para móvil, monograma para redes y
  favicon, versión monocroma para impresión.
- **Área de respeto:** igual a la altura de la letra «O» del wordmark.
- **Tamaño mínimo:** 120 px de ancho en pantalla; 25 mm en impresión.

El archivo [`assets/logo-provisional.svg`](assets/logo-provisional.svg) contiene una
versión de trabajo. Es un boceto para validación, no un logotipo final: debe revisarse,
trazarse a curvas y probarse en tamaños pequeños antes de producirlo.

### Lo que no se hará
- Ojos, lupas, huellas o siluetas de la isla como recurso obvio.
- Efectos 3D, sombras difusas o degradados.
- Tipografías de moda con licencia restrictiva.

---

## 2. Paleta

La paleta solicitada se mantiene. Se añaden variantes **validadas con contraste real** para
que el sistema cumpla WCAG 2.2 AA desde el inicio.

### Tokens base

| Token | Hex | Uso |
|---|---|---|
| `--carbón` | `#171A1D` | Texto principal, fondos oscuros |
| `--blanco` | `#FFFFFF` | Fondo principal |
| `--piedra` | `#E8E8E5` | Fondos secundarios, separadores |
| `--rojo` | `#A62932` | Acento editorial, enlaces en claro, reglas |
| `--gris` | `#697078` | Texto secundario grande, bordes, iconos |

### Contraste medido

| Combinación | Ratio | Veredicto |
|---|---:|---|
| `#171A1D` sobre `#FFFFFF` | 17,47:1 | AAA |
| `#171A1D` sobre `#E8E8E5` | 14,23:1 | AAA |
| `#A62932` sobre `#FFFFFF` | 7,04:1 | AAA |
| `#A62932` sobre `#E8E8E5` | 5,73:1 | AA |
| `#697078` sobre `#FFFFFF` | 5,01:1 | AA (texto normal) |
| `#697078` sobre `#E8E8E5` | **4,08:1** | **No apto para texto normal** |
| `#FFFFFF` sobre `#A62932` | 7,04:1 | AAA |
| `#697078` sobre `#171A1D` | **3,49:1** | **No apto para texto normal** |
| `#A62932` sobre `#171A1D` | **2,48:1** | **Solo decorativo** |

Conclusión: el gris `#697078` no puede usarse para párrafos ni metadatos pequeños. Se
sustituye por variantes más oscuras o más claras según el fondo.

### Tokens corregidos

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--texto-secundario-claro` | `#5F666D` | Metadatos sobre blanco/piedra | 5,82:1 / 4,74:1 |
| `--texto-secundario-oscuro` | `#A7AEB6` | Metadatos sobre carbón | 7,80:1 |
| `--superficie-oscura` | `#1F2428` | Tarjetas en modo oscuro | — |
| `--rojo-oscuro` | `#E0656F` | Enlaces y acentos en oscuro | 4,67:1 sobre `#1F2428` |
| `--rojo-oscuro-texto` | `#F08A92` | Texto pequeño en oscuro | 6,53:1 sobre `#1F2428` |

### Modo claro

```css
:root {
  --bg: #ffffff;
  --bg-subtle: #e8e8e5;
  --text: #171a1d;
  --text-muted: #5f666d;
  --border: #d5d5d1;
  --accent: #a62932;
  --accent-contrast: #ffffff;
}
```

### Modo oscuro

```css
[data-theme="dark"] {
  --bg: #171a1d;
  --bg-subtle: #1f2428;
  --text: #f3f3f1;
  --text-muted: #a7aeb6;
  --border: #333a40;
  --accent: #e0656f;
  --accent-contrast: #171a1d;
}
```

El tema se elige con `prefers-color-scheme` y un selector manual persistido en
`localStorage`. Un script mínimo en `<head>` evita el destello de tema incorrecto.

---

## 3. Tipografía

| Rol | Familia | Licencia | Motivo |
|---|---|---|---|
| Titulares y cuerpo editorial | **Newsreader** (variable) | SIL OFL | Serif contemporánea, buena lectura en pantalla, diacríticos completos |
| Interfaz, metadatos, formularios | **Inter** (variable) | SIL OFL | Legibilidad en tamaños pequeños, cifras claras |
| Citas y destacados | Newsreader *italic* | SIL OFL | Voz editorial diferenciada |

- Se autohospedan con `next/font`, subset `latin` + `latin-ext`, `display: swap`, sin
  peticiones a Google en tiempo de ejecución.
- Se cargan como máximo **dos familias** y **tres pesos**.
- Medida de lectura: **62–68 caracteres** por línea.
- Interlineado del cuerpo: `1.65`; titulares: `1.05–1.15`.

### Escala (fluida)

| Token | Tamaño | Uso |
|---|---|---|
| `display` | `clamp(2.5rem, 6vw, 4.5rem)` | Titular principal |
| `h1` | `clamp(2rem, 4vw, 3rem)` | Título de artículo |
| `h2` | `clamp(1.5rem, 3vw, 2rem)` | Secciones |
| `h3` | `1.25rem` | Subsecciones |
| `body` | `1.0625rem` (17 px) | Cuerpo |
| `small` | `0.875rem` | Metadatos |
| `caption` | `0.75rem` | Créditos, pies |

Los tamaños mínimos en móvil no bajan de 16 px para evitar el zoom automático de iOS.

---

## 4. Retícula y espaciado

- Contenedor máximo: **1280 px**; texto de artículo: **720 px**.
- Retícula de **12 columnas**, canal de 24 px (16 px en móvil).
- Escala de espaciado en múltiplos de 4: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- Radios: `2px` en imágenes y tarjetas, `4px` en botones. Sin píldoras ni sombras grandes.
- Separadores: línea de 1 px `--border`; la línea roja de 2 px marca sección destacada.
- Sin `position: sticky` en elementos que tapen contenido; solo la cabecera compacta en
  móvil, con altura máxima de 56 px.

---

## 5. Componentes

### Editoriales
- `Header` (fecha, lema, buscador, idioma, menú).
- `BreakingBar` (última hora, una sola, descartable).
- `LeadStory`, `StoryCard`, `StoryRow`, `StoryList`.
- `SectionHeader` con filete rojo y enlace «Ver todo».
- `ArticleBody` (párrafos, `h2`, `h3`, listas, citas, tablas, imágenes, audio).
- `PullQuote`, `FactBox`, `Timeline`, `SourceList`.
- `AuthorCard`, `Byline`, `PublishedDate`, `UpdatedDate`.
- `Breadcrumbs`, `Pagination`, `TagList`.
- `CorrectionNotice` (visible y con fecha).
- `RelatedStories` (máximo 3).

### Multimedia
- `AudioPlayer` (sin autoplay, teclado, duración, velocidad, descarga).
- `RadioEpisodeCard`, `ProgramHeader`.
- `PdfViewer` con enlace de descarga y tamaño.
- `ImageFigure` (pie, crédito, licencia, `alt` obligatorio).

### Formularios
- `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `FieldError`.
- `NewsletterForm` (correo + consentimiento explícito + estado de éxito).
- `CommentForm`, `ReportForm`, `ContactForm`.
- Todos con `label` visible, ayuda asociada, error anunciado y foco gestionado.

### Administración
- `AdminShell` (navegación lateral, migas, búsqueda).
- `StatusBadge` por estado editorial.
- `EditorToolbar` accesible.
- `RevisionDiff` (texto y metadatos).
- `MediaPicker`, `TranslationPanel`, `PermissionGate`.
- `DataTable` con ordenación y filtros accesibles.

Cada componente tendrá estados: reposo, hover, foco, activo, deshabilitado, carga, error y
vacío. Se documentarán en una página interna de componentes durante la Fase 1.

---

## 6. Plantillas

### Portada
- Titular principal a 2 columnas de ancho, imagen 16:9.
- Franja de «Últimas» con hora.
- Bloques de sección con 1 principal + 2 secundarias.
- Opinión con retrato pequeño y firma.
- Radio y edición impresa como bloques diferenciados, no como anuncios.
- Suscripción integrada, sin modal emergente.

### Artículo
- Cabecera de sección en rojo, titular grande, extracto en serif.
- Firma con avatar opcional y fecha.
- Imagen principal a sangre solo en escritorio; en móvil, ancho completo con pie.
- Cuerpo centrado, sin barra lateral fija.
- Al final: correcciones, fuentes, etiquetas, autor, compartir, relacionados,
  comentarios y suscripción.

### Sección
- Titular de sección, descripción breve y filtros (etiqueta, año).
- Rejilla de 1 destacado + tarjetas.
- Paginación numerada accesible.

### Radio
- Portada del programa, reproductor y lista de episodios.
- Estado vacío claro si aún no hay audio.

### Edición impresa
- Portada del número, metadatos y botón de descarga.
- Visor con controles táctiles y enlace alternativo.

### Legal
- Texto largo con índice lateral, fecha de última revisión y aviso de borrador.

---

## 7. Fotografía e imágenes

- Estilo documental, luz natural, personas en su contexto.
- Prohibido usar imágenes de archivo sin licencia o sin crédito.
- Proporciones: 16:9 (portada), 4:5 (retrato), 1:1 (redes).
- Compresión: AVIF/WebP, tamaños 400/800/1200/1600/2000 px.
- `alt` obligatorio; si la imagen es decorativa, `alt=""` explícito.
- Eliminación de EXIF antes de publicar.
- No se incrusta texto esencial dentro de la imagen.

---

## 8. Movimiento y sonido

- Transiciones de 150–200 ms, solo en opacidad y color.
- Nada de paralaje, autoplay ni vídeos de fondo.
- `prefers-reduced-motion` desactiva las transiciones.
- El audio solo suena tras una acción explícita del usuario.

---

## 9. Accesibilidad del sistema

- Foco visible de 3 px con doble anillo (color de acento + separador blanco/negro).
- Objetivos táctiles mínimos de 44 × 44 px.
- Contraste mínimo 4,5:1 en texto normal y 3:1 en texto grande.
- Jerarquía de encabezados sin saltos.
- Enlace «Saltar al contenido» como primer elemento enfocable.
- Formularios con `label`, `aria-describedby` y errores anunciados.
- Reproductor con controles nativos accesibles o envoltorio con teclado completo.
- Tablas con encabezados y resumen.
- Enlaces externos con aviso cuando abren en otra pestaña.

---

## 10. Entregables de diseño para la Fase 1

1. Tokens en JSON + variables CSS.
2. Biblioteca de componentes en Storybook.
3. Plantillas de portada, artículo, sección, radio y edición impresa.
4. Logotipo trazado (SVG + PNG) y favicon.
5. Guía de uso de marca (5 páginas).
6. Pruebas de contraste automatizadas.
7. Revisión con lector de pantalla en las plantillas clave.

La propuesta es deliberadamente sobria: el valor está en la jerarquía, la legibilidad y la
fotografía, no en efectos visuales.
