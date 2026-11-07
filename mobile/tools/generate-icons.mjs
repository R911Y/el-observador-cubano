/**
 * Genera TODOS los recursos gráficos de El Observador Cubano a partir de los
 * dos originales oficiales, sin rediseñar el logotipo:
 *
 *   assets/logo-official.jpg    1024x1024  logotipo cuadrado (wordmark blanco)
 *   assets/splash-official.jpg   941x1672  fondo oficial de la pantalla de carga
 *
 * Uso: node tools/generate-icons.mjs
 *
 * El wordmark se extrae del JPG conservando su forma, proporciones y color
 * (blanco), con transparencia en los bordes. La splash se escala sin deformar
 * y se extiende por reflexión solo en el fondo sobrante de otras relaciones de
 * aspecto; el logotipo nunca se recorta ni se estira.
 */
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const resRoot = path.join(root, 'android', 'app', 'src', 'main', 'res');
const publicDir = path.join(root, 'public');
const outDir = path.join(root, 'assets-generated');

const LOGO = path.join(root, 'assets', 'logo-official.jpg');
const SPLASH = path.join(root, 'assets', 'splash-official.jpg');

// Azul de fondo medido en el original (prácticamente idéntico a #0567EE).
const LOGO_BLUE = '#0667ee';
const BRAND_BLUE = '#0567ee';

const densities = [
  ['mdpi', 1],
  ['hdpi', 1.5],
  ['xhdpi', 2],
  ['xxhdpi', 3],
  ['xxxhdpi', 4],
];

const round = (v) => Math.max(1, Math.round(v));

async function ensure(file) {
  await mkdir(path.dirname(file), { recursive: true });
}

/** Extrae el wordmark blanco del logotipo conservando el antialias. */
async function extractWordmark(src) {
  const { data, info } = await sharp(src)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  // Luminancia del fondo azul y del blanco puro.
  const bgLum = 92;
  const whiteLum = 255;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const lum =
        0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      let alpha = (lum - bgLum) / (whiteLum - bgLum);
      if (alpha < 0.06) alpha = 0;
      if (alpha > 1) alpha = 1;
      const o = (y * width + x) * 4;
      rgba[o] = 255;
      rgba[o + 1] = 255;
      rgba[o + 2] = 255;
      rgba[o + 3] = Math.round(alpha * 255);
      if (alpha > 0.12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 6;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = Math.min(height - 1, maxY + pad);
  const crop = {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };

  const buffer = await sharp(rgba, {
    raw: { width, height, channels: 4 },
  })
    .extract(crop)
    .png()
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width, height: meta.height, rgb: null };
}

/** Lienzo transparente con el wordmark centrado a un ancho dado. */
async function wordmarkCanvas(wordmark, canvasW, canvasH, targetW) {
  const targetH = round((targetW * wordmark.height) / wordmark.width);
  const scaled = await sharp(wordmark.buffer)
    .resize(targetW, targetH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: scaled,
        left: round((canvasW - targetW) / 2),
        top: round((canvasH - targetH) / 2),
      },
    ])
    .png()
    .toBuffer();
}

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
}

/**
 * Extiende una imagen por reflexión en el eje indicado hasta cubrir el lienzo,
 * sin deformar el contenido original. Se usa solo para el fondo sobrante de
 * relaciones de aspecto distintas a la del original.
 */
async function extendWithMirror(input, targetW, targetH, axis) {
  const meta = await sharp(input).metadata();
  const canvas = {
    create: {
      width: targetW,
      height: targetH,
      channels: 3,
      background: { r: 6, g: 63, b: 180 },
    },
  };

  if (axis === 'vertical') {
    const pad = targetH - meta.height;
    const topPad = Math.floor(pad / 2);
    const bottomPad = pad - topPad;
    const topSrc = await sharp(input)
      .extract({
        left: 0,
        top: 0,
        width: meta.width,
        height: Math.min(topPad, meta.height),
      })
      .flip()
      .toBuffer();
    const bottomSrc = await sharp(input)
      .extract({
        left: 0,
        top: Math.max(0, meta.height - bottomPad),
        width: meta.width,
        height: Math.min(bottomPad, meta.height),
      })
      .flip()
      .toBuffer();
    return sharp({ create: canvas.create })
      .composite([
        { input: topSrc, left: 0, top: 0 },
        { input, left: 0, top: topPad },
        { input: bottomSrc, left: 0, top: topPad + meta.height },
      ])
      .png()
      .toBuffer();
  }

  const pad = targetW - meta.width;
  const leftPad = Math.floor(pad / 2);
  const rightPad = pad - leftPad;
  const leftSrc = await sharp(input)
    .extract({
      left: 0,
      top: 0,
      width: Math.min(leftPad, meta.width),
      height: meta.height,
    })
    .flop()
    .toBuffer();
  const rightSrc = await sharp(input)
    .extract({
      left: Math.max(0, meta.width - rightPad),
      top: 0,
      width: Math.min(rightPad, meta.width),
      height: meta.height,
    })
    .flop()
    .toBuffer();
  return sharp({ create: canvas.create })
    .composite([
      { input: leftSrc, left: 0, top: 0 },
      { input, left: leftPad, top: 0 },
      { input: rightSrc, left: leftPad + meta.width, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function buildPortraitSplash(width) {
  const targetH = round((width * 20) / 9);
  const imageH = round((width * 1672) / 941);
  const resized = await sharp(SPLASH)
    .resize(width, imageH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  return extendWithMirror(resized, width, targetH, 'vertical');
}

async function buildLandscapeSplash(height) {
  // Relación 3:2: al mostrarse con centerCrop cubre tanto teléfonos
  // apaisados (20:9) como tablets (4:3) sin recortar el wordmark.
  const targetW = round(height * 1.5);
  const imageH = round((targetW * 1672) / 941);
  const full = await sharp(SPLASH)
    .resize(targetW, imageH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  // Centro del wordmark en el original: 48,1 % de la altura.
  const logoCenter = 0.481 * imageH;
  const cropTop = Math.round(
    Math.min(Math.max(0, logoCenter - height / 2), imageH - height)
  );
  return sharp(full)
    .extract({ left: 0, top: cropTop, width: targetW, height })
    .png()
    .toBuffer();
}

async function main() {
  if (!existsSync(LOGO) || !existsSync(SPLASH)) {
    throw new Error(
      `Faltan los originales: ${LOGO} / ${SPLASH}`
    );
  }
  await mkdir(outDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  const logoMeta = await sharp(LOGO).metadata();
  const splashMeta = await sharp(SPLASH).metadata();
  console.log(`Logo oficial: ${logoMeta.width}x${logoMeta.height}`);
  console.log(`Splash oficial: ${splashMeta.width}x${splashMeta.height}`);

  const wordmark = await extractWordmark(LOGO);
  console.log(
    `Wordmark extraído: ${wordmark.width}x${wordmark.height} (aspecto ${(
      wordmark.width / wordmark.height
    ).toFixed(3)})`
  );
  await writeFile(path.join(outDir, 'wordmark.png'), wordmark.buffer);

  for (const [name, factor] of densities) {
    const mipmap = path.join(resRoot, `mipmap-${name}`);
    const drawable = path.join(resRoot, `drawable-${name}`);
    const land = path.join(resRoot, `drawable-land-${name}`);
    await mkdir(mipmap, { recursive: true });
    await mkdir(drawable, { recursive: true });
    await mkdir(land, { recursive: true });

    // 1. Iconos heredados: la imagen oficial completa, sin recortes.
    const legacy = round(48 * factor);
    const square = await sharp(LOGO)
      .resize(legacy, legacy, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(path.join(mipmap, 'ic_launcher.png'), square);
    await writeFile(
      path.join(mipmap, 'ic_launcher_round.png'),
      await sharp(square)
        .composite([{ input: circleMask(legacy), blend: 'dest-in' }])
        .png({ compressionLevel: 9 })
        .toBuffer()
    );

    // 2. Icono adaptativo: fondo azul oficial + logotipo al 75 % del lienzo
    //    (el wordmark queda dentro de la zona segura de la máscara).
    const adaptiveCanvas = round(108 * factor);
    const adaptiveLogo = round(adaptiveCanvas * 0.75);
    await writeFile(
      path.join(mipmap, 'ic_launcher_foreground.png'),
      await sharp({
        create: {
          width: adaptiveCanvas,
          height: adaptiveCanvas,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          {
            input: await sharp(LOGO)
              .resize(adaptiveLogo, adaptiveLogo, { kernel: 'lanczos3' })
              .png()
              .toBuffer(),
            left: round((adaptiveCanvas - adaptiveLogo) / 2),
            top: round((adaptiveCanvas - adaptiveLogo) / 2),
          },
        ])
        .png({ compressionLevel: 9 })
        .toBuffer()
    );
    const monoWidth = round(adaptiveCanvas * 0.75 * (wordmark.width / logoMeta.width));
    await writeFile(
      path.join(mipmap, 'ic_launcher_monochrome.png'),
      await wordmarkCanvas(wordmark, adaptiveCanvas, adaptiveCanvas, monoWidth)
    );

    // 3. Wordmark para la cabecera nativa (48 dp de alto).
    const headerH = round(48 * factor);
    const headerW = round((headerH * wordmark.width) / wordmark.height);
    await writeFile(
      path.join(drawable, 'logo_wordmark.png'),
      await sharp(wordmark.buffer)
        .resize(headerW, headerH, { kernel: 'lanczos3' })
        .png({ compressionLevel: 9 })
        .toBuffer()
    );

    // 4. Wordmark para la splash del sistema (192 dp de lienzo).
    const iconCanvas = round(192 * factor);
    const iconW = round(iconCanvas * (168 / 192));
    await writeFile(
      path.join(drawable, 'ic_splash_wordmark.png'),
      await wordmarkCanvas(wordmark, iconCanvas, iconCanvas, iconW)
    );

    // 5. Fondo de la splash (retrato 9:20 y apaisado 20:9), sin recortes.
    const portraitW = round(360 * factor);
    await writeFile(
      path.join(drawable, 'splash_bg.webp'),
      await sharp(await buildPortraitSplash(portraitW))
        .webp({ quality: 90, effort: 6, smartSubsample: true })
        .toBuffer()
    );

    const landH = round(360 * factor);
    await writeFile(
      path.join(land, 'splash_bg.webp'),
      await sharp(await buildLandscapeSplash(landH))
        .webp({ quality: 90, effort: 6, smartSubsample: true })
        .toBuffer()
    );

    console.log(`  ${name}: iconos ${legacy}px, wordmark ${headerW}x${headerH}px`);
  }

  // 6. Assets de la pantalla Info (web).
  await sharp(LOGO)
    .resize(512, 512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo.png'));

  const webWordmarkH = 288;
  const webWordmarkW = round((webWordmarkH * wordmark.width) / wordmark.height);
  await sharp(wordmark.buffer)
    .resize(webWordmarkW, webWordmarkH, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-wordmark.png'));

  // 7. Copias de referencia y previsualizaciones para revisión.
  await copyFile(LOGO, path.join(outDir, 'logo-official.jpg'));
  await copyFile(SPLASH, path.join(outDir, 'splash-official.jpg'));
  await sharp(LOGO)
    .resize(512, 512, { kernel: 'lanczos3' })
    .png()
    .toFile(path.join(outDir, 'logo-512.png'));
  await sharp(await buildPortraitSplash(720))
    .resize(360, 800, { kernel: 'lanczos3' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'preview-splash-360x800.jpg'));
  await sharp(await buildLandscapeSplash(360))
    .resize(720, 480, { kernel: 'lanczos3' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'preview-splash-landscape.jpg'));
  await sharp({
    create: {
      width: 640,
      height: 320,
      channels: 4,
      background: { r: 6, g: 63, b: 180, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(wordmark.buffer)
          .resize(600, round((600 * wordmark.height) / wordmark.width), {
            kernel: 'lanczos3',
          })
          .png()
          .toBuffer(),
        left: 20,
        top: 20,
      },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'preview-wordmark.jpg'));

  // Previsualización del icono adaptativo (máscara circular y cuadrada).
  const previewCanvas = 512;
  const previewLogo = Math.round(previewCanvas * 0.75);
  const previewForeground = await sharp({
    create: {
      width: previewCanvas,
      height: previewCanvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(LOGO)
          .resize(previewLogo, previewLogo, { kernel: 'lanczos3' })
          .png()
          .toBuffer(),
        left: Math.round((previewCanvas - previewLogo) / 2),
        top: Math.round((previewCanvas - previewLogo) / 2),
      },
    ])
    .png()
    .toBuffer();
  const previewBase = await sharp({
    create: {
      width: previewCanvas,
      height: previewCanvas,
      channels: 4,
      background: LOGO_BLUE,
    },
  })
    .composite([{ input: previewForeground, left: 0, top: 0 }])
    .png()
    .toBuffer();
  await sharp(previewBase)
    .composite([{ input: circleMask(previewCanvas), blend: 'dest-in' }])
    .png()
    .toFile(path.join(outDir, 'preview-icon-round.png'));
  await sharp(previewBase)
    .png()
    .toFile(path.join(outDir, 'preview-icon-square.png'));

  console.log('Recursos generados en', resRoot);
  console.log('Assets web en', publicDir);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
