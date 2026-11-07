import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import {
  Capacitor,
  SystemBars,
  SystemBarsStyle,
  SystemBarType,
  registerPlugin,
} from '@capacitor/core';
import './style.css';

/**
 * Pequeño puente nativo propio. Solo se registra en la pantalla local de
 * información; nunca se expone al sitio remoto de Blogger.
 */
interface ShellPlugin {
  close(): Promise<void>;
  openUpdates(): Promise<void>;
}

const Shell = registerPlugin<ShellPlugin>('Shell');

const DEFAULT_SETTINGS = {
  externalLinkMode: 'system',
  textZoom: 100,
} as const;

type ExternalLinkMode = 'system' | 'inapp';

interface Settings {
  externalLinkMode: ExternalLinkMode;
  textZoom: number;
}

const SETTING_KEYS = {
  externalLinkMode: 'externalLinkMode',
  textZoom: 'textZoom',
} as const;

const $ = <T extends Element>(selector: string): T | null =>
  document.querySelector<T>(selector);

const toast = $('#toast') as HTMLDivElement | null;
let toastTimer: number | undefined;

function showToast(message: string): void {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('toast--visible');
  if (toastTimer !== undefined) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 2200);
}

function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.textZoom;
  return Math.min(140, Math.max(80, Math.round(value / 5) * 5));
}

function normalizeMode(value: string | null | undefined): ExternalLinkMode {
  return value === 'inapp' ? 'inapp' : 'system';
}

async function loadSettings(): Promise<Settings> {
  const [mode, zoom] = await Promise.all([
    Preferences.get({ key: SETTING_KEYS.externalLinkMode }),
    Preferences.get({ key: SETTING_KEYS.textZoom }),
  ]);

  return {
    externalLinkMode: normalizeMode(mode.value),
    textZoom: clampZoom(Number(zoom.value ?? DEFAULT_SETTINGS.textZoom)),
  };
}

async function saveSetting(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

function applySettingsToForm(settings: Settings): void {
  document
    .querySelectorAll<HTMLInputElement>('input[name="externalLinkMode"]')
    .forEach((input) => {
      input.checked = input.value === settings.externalLinkMode;
    });

  const range = $('#text-zoom') as HTMLInputElement | null;
  if (range) range.value = String(settings.textZoom);
  updateZoomPreview(settings.textZoom);
}

function updateZoomPreview(zoom: number): void {
  const output = $('#text-zoom-value') as HTMLOutputElement | null;
  if (output) output.textContent = `${zoom} %`;

  const preview = $('#text-preview') as HTMLParagraphElement | null;
  if (preview) preview.style.fontSize = `${(16 * zoom) / 100}px`;
}

async function initAbout(): Promise<void> {
  const versionBadge = $('#version-badge');
  const buildNumber = $('#build-number');
  const packageName = $('#package-name');
  const platformName = $('#platform-name');

  try {
    const info = await App.getInfo();
    if (versionBadge) versionBadge.textContent = `Versión ${info.version}`;
    if (buildNumber) buildNumber.textContent = info.build || '—';
    if (packageName) packageName.textContent = info.id || 'cu.observadorcubano.app';
  } catch {
    if (versionBadge) versionBadge.textContent = 'Versión 1.1.0';
    if (packageName) packageName.textContent = 'cu.observadorcubano.app';
  }

  if (platformName) {
    const labels: Record<string, string> = {
      android: 'Android',
      ios: 'iOS',
      web: 'Web',
    };
    platformName.textContent = labels[Capacitor.getPlatform()] ?? Capacitor.getPlatform();
  }
}

async function openExternal(url: string): Promise<void> {
  try {
    await Browser.open({ url, presentationStyle: 'popover' });
  } catch {
    window.open(url, '_system');
  }
}

function bindEvents(): void {
  $('#btn-close')?.addEventListener('click', () => {
    void Shell.close().catch(() => window.history.back());
  });

  document
    .querySelectorAll<HTMLInputElement>('input[name="externalLinkMode"]')
    .forEach((input) => {
      input.addEventListener('change', () => {
        if (!input.checked) return;
        void saveSetting(SETTING_KEYS.externalLinkMode, input.value).then(() => {
          showToast('Preferencia guardada');
        });
      });
    });

  const range = $('#text-zoom') as HTMLInputElement | null;
  range?.addEventListener('input', () => {
    const zoom = clampZoom(Number(range.value));
    updateZoomPreview(zoom);
  });
  range?.addEventListener('change', () => {
    const zoom = clampZoom(Number(range.value));
    void saveSetting(SETTING_KEYS.textZoom, String(zoom)).then(() => {
      showToast('Tamaño del texto guardado');
    });
  });

  $('#btn-reset')?.addEventListener('click', () => {
    void Promise.all([
      saveSetting(SETTING_KEYS.externalLinkMode, DEFAULT_SETTINGS.externalLinkMode),
      saveSetting(SETTING_KEYS.textZoom, String(DEFAULT_SETTINGS.textZoom)),
    ]).then(() => {
      applySettingsToForm({ ...DEFAULT_SETTINGS });
      showToast('Configuración restablecida');
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-url]').forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.dataset.url;
      if (url) void openExternal(url);
    });
  });

  $('#btn-check-updates')?.addEventListener('click', () => {
    void Shell.openUpdates().catch(() => {
      showToast('Abre la app de Android para comprobar actualizaciones');
    });
  });

  $('#btn-history')?.addEventListener('click', () => {
    void Shell.openUpdates().catch(() => {
      showToast('Abre la app de Android para ver el historial');
    });
  });
}

void (async () => {
  bindEvents();
  const settings = await loadSettings();
  applySettingsToForm(settings);
  await initAbout();
  applySystemBarStyles();
})();

/**
 * La cabecera de esta pantalla es azul y el borde inferior es blanco: se
 * mantienen los iconos claros arriba y oscuros abajo. Se aplica después de
 * que Capacitor inicialice sus barras para que no lo sobrescriba.
 */
function applySystemBarStyles(): void {
  if (!Capacitor.isNativePlatform()) return;

  void SystemBars.setStyle({
    style: SystemBarsStyle.Dark,
    bar: SystemBarType.StatusBar,
  }).catch(() => {
    // Si la plataforma no expone la API, el estilo nativo ya está aplicado.
  });

  void SystemBars.setStyle({
    style: SystemBarsStyle.Light,
    bar: SystemBarType.NavigationBar,
  }).catch(() => {
    // Igual que arriba: no es un fallo funcional de la pantalla.
  });
}
