package cu.observadorcubano.app;

/**
 * Reglas puras de frecuencia y avisos del actualizador.
 *
 * <p>Separarlas de Android permite probar los casos de caché, reintentos y
 * "Más tarde" sin dispositivo.</p>
 */
public final class UpdatePolicy {

    /** Comprobación normal: cada 6 horas como máximo. */
    public static final long CHECK_INTERVAL_MS = 6L * 60L * 60L * 1000L;

    /** Tras un error se reintenta antes, sin martillear la API. */
    public static final long ERROR_RETRY_MS = 15L * 60L * 1000L;

    private UpdatePolicy() {
        // Clase de utilidades.
    }

    public static boolean shouldCheck(long nowMs, long lastAttemptMs, boolean lastAttemptFailed) {
        return shouldCheck(nowMs, lastAttemptMs, lastAttemptFailed, false);
    }

    public static boolean shouldCheck(
        long nowMs,
        long lastAttemptMs,
        boolean lastAttemptFailed,
        boolean force
    ) {
        if (force) {
            return true;
        }
        if (lastAttemptMs <= 0L) {
            return true;
        }
        if (lastAttemptMs > nowMs) {
            // El reloj cambió hacia atrás: no bloquear la comprobación.
            return true;
        }
        long interval = lastAttemptFailed ? ERROR_RETRY_MS : CHECK_INTERVAL_MS;
        return nowMs - lastAttemptMs >= interval;
    }

    /**
     * Una notificación por versión publicada. Si el usuario pulsó "Más tarde"
     * para esa versión, no se vuelve a avisar automáticamente.
     */
    public static boolean shouldNotify(
        String latestVersion,
        String notifiedVersion,
        String dismissedVersion
    ) {
        if (latestVersion == null || latestVersion.trim().isEmpty()) {
            return false;
        }
        if (latestVersion.equals(dismissedVersion)) {
            return false;
        }
        return !latestVersion.equals(notifiedVersion);
    }
}
