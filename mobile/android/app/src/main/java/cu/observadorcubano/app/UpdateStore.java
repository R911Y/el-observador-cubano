package cu.observadorcubano.app;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Estado persistente del actualizador. No guarda tokens: las consultas son
 * anónimas a la API pública de GitHub.
 */
final class UpdateStore {

    private static final String PREFS_NAME = "eoc_updates";
    private static final String KEY_LAST_ATTEMPT = "last_attempt";
    private static final String KEY_LAST_ATTEMPT_FAILED = "last_attempt_failed";
    private static final String KEY_LATEST_JSON = "latest_json";
    private static final String KEY_LATEST_VERSION = "latest_version";
    private static final String KEY_NOTIFIED_VERSION = "notified_version";
    private static final String KEY_DISMISSED_VERSION = "dismissed_version";

    private final SharedPreferences prefs;

    UpdateStore(Context context) {
        this.prefs = context.getApplicationContext()
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    long getLastAttempt() {
        return prefs.getLong(KEY_LAST_ATTEMPT, 0L);
    }

    void setLastAttempt(long value) {
        prefs.edit().putLong(KEY_LAST_ATTEMPT, value).apply();
    }

    boolean lastAttemptFailed() {
        return prefs.getBoolean(KEY_LAST_ATTEMPT_FAILED, false);
    }

    void setLastAttemptFailed(boolean failed) {
        prefs.edit().putBoolean(KEY_LAST_ATTEMPT_FAILED, failed).apply();
    }

    String getLatestJson() {
        return prefs.getString(KEY_LATEST_JSON, null);
    }

    void setLatestJson(String json) {
        if (json == null) {
            prefs.edit().remove(KEY_LATEST_JSON).apply();
        } else {
            prefs.edit().putString(KEY_LATEST_JSON, json).apply();
        }
    }

    String getLatestVersion() {
        return prefs.getString(KEY_LATEST_VERSION, null);
    }

    void setLatestVersion(String version) {
        if (version == null) {
            prefs.edit().remove(KEY_LATEST_VERSION).apply();
        } else {
            prefs.edit().putString(KEY_LATEST_VERSION, version).apply();
        }
    }

    String getNotifiedVersion() {
        return prefs.getString(KEY_NOTIFIED_VERSION, null);
    }

    void setNotifiedVersion(String version) {
        prefs.edit().putString(KEY_NOTIFIED_VERSION, version).apply();
    }

    String getDismissedVersion() {
        return prefs.getString(KEY_DISMISSED_VERSION, null);
    }

    void dismiss(String version) {
        if (version == null) {
            return;
        }
        prefs.edit().putString(KEY_DISMISSED_VERSION, version).apply();
    }

    boolean isDismissed(String version) {
        return version != null && version.equals(getDismissedVersion());
    }
}
