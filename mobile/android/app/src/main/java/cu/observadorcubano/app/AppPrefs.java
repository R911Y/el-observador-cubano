package cu.observadorcubano.app;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Preferencias compartidas con la pantalla web de configuración.
 *
 * Capacitor Preferences guarda los valores en el archivo "CapacitorStorage"
 * sin prefijos adicionales, por lo que la interfaz nativa puede leerlos.
 */
final class AppPrefs {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_LINK_MODE = "externalLinkMode";
    private static final String KEY_TEXT_ZOOM = "textZoom";

    private static final String MODE_SYSTEM = "system";
    private static final String MODE_INAPP = "inapp";
    private static final int MIN_ZOOM = 80;
    private static final int MAX_ZOOM = 140;
    private static final int DEFAULT_ZOOM = 100;

    private AppPrefs() {
        // Clase de utilidades.
    }

    static String getExternalLinkMode(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String value = prefs.getString(KEY_LINK_MODE, MODE_SYSTEM);
        return MODE_INAPP.equals(value) ? MODE_INAPP : MODE_SYSTEM;
    }

    static boolean opensLinksInApp(Context context) {
        return MODE_INAPP.equals(getExternalLinkMode(context));
    }

    static int getTextZoom(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String value = prefs.getString(KEY_TEXT_ZOOM, String.valueOf(DEFAULT_ZOOM));
        try {
            int zoom = Integer.parseInt(value);
            return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
        } catch (NumberFormatException e) {
            return DEFAULT_ZOOM;
        }
    }
}
