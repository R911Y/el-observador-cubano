package cu.observadorcubano.app;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Coordina la comprobación, descarga y verificación de actualizaciones.
 *
 * <p>Las consultas son anónimas y se limitan con {@link UpdatePolicy}. La
 * descarga nunca se instala por sí sola: entrega el APK verificado a la
 * pantalla de Novedades, que abre el instalador del sistema con el usuario.</p>
 */
final class UpdateManager {

    interface CheckCallback {
        void onResult(ReleaseInfo release, boolean available, String error);
    }

    interface DownloadCallback {
        void onProgress(int percent);

        void onVerified(File apk);

        void onError(String message);
    }

    interface HistoryCallback {
        void onHistory(java.util.List<ReleaseInfo> releases, String error);
    }

    private final Activity activity;
    private final UpdateStore store;
    private final UpdateClient client;
    private final ExecutorService executor;
    private final Handler mainHandler;
    private volatile boolean destroyed;

    UpdateManager(Activity activity) {
        this.activity = activity;
        this.store = new UpdateStore(activity);
        this.client = new UpdateClient(BuildConfig.GITHUB_OWNER, BuildConfig.GITHUB_REPO);
        this.executor = Executors.newSingleThreadExecutor();
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    boolean isConfigured() {
        String owner = BuildConfig.GITHUB_OWNER == null ? "" : BuildConfig.GITHUB_OWNER.trim();
        String repo = BuildConfig.GITHUB_REPO == null ? "" : BuildConfig.GITHUB_REPO.trim();
        return !owner.isEmpty()
            && !repo.isEmpty()
            && !"PENDIENTE".equalsIgnoreCase(owner)
            && !"PENDIENTE".equalsIgnoreCase(repo);
    }

    UpdateStore getStore() {
        return store;
    }

    /** Última Release guardada, útil para mostrar algo mientras se consulta. */
    ReleaseInfo getCachedRelease() {
        String json = store.getLatestJson();
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return ReleaseInfo.fromJson(
                new JSONObject(json),
                BuildConfig.GITHUB_OWNER,
                BuildConfig.GITHUB_REPO
            );
        } catch (JSONException e) {
            return null;
        }
    }

    boolean isAvailable(ReleaseInfo release) {
        return release != null
            && release.isInstallable()
            && SemVer.isNewerStable(BuildConfig.VERSION_NAME, release.getVersion());
    }

    /**
     * Comprueba la última Release. Si la caché sigue vigente responde al
     * instante con el último resultado conocido.
     */
    void check(boolean force, CheckCallback callback) {
        if (!isConfigured()) {
            deliver(callback, null, false,
                activity.getString(R.string.update_error_not_configured));
            return;
        }

        long now = System.currentTimeMillis();
        if (!UpdatePolicy.shouldCheck(now, store.getLastAttempt(), store.lastAttemptFailed(), force)) {
            ReleaseInfo cached = getCachedRelease();
            deliver(callback, cached, isAvailable(cached), null);
            return;
        }

        executor.execute(() -> {
            try {
                UpdateClient.Latest latest = client.fetchLatest();
                store.setLastAttempt(System.currentTimeMillis());
                store.setLastAttemptFailed(false);
                store.setLatestJson(latest.rawJson);
                store.setLatestVersion(latest.release.getVersion());
                deliver(callback, latest.release, isAvailable(latest.release), null);
            } catch (IOException e) {
                store.setLastAttempt(System.currentTimeMillis());
                store.setLastAttemptFailed(true);
                ReleaseInfo cached = getCachedRelease();
                deliver(
                    callback,
                    cached,
                    isAvailable(cached),
                    friendlyError(e)
                );
            }
        });
    }

    /**
     * Descarga, calcula el SHA-256, comprueba paquete/versión/firma y solo
     * entonces entrega el archivo. Cualquier fallo borra la descarga.
     */
    void download(ReleaseInfo release, DownloadCallback callback) {
        if (release == null || !release.isInstallable()) {
            deliverError(callback, activity.getString(R.string.update_error_missing_apk));
            return;
        }
        if (!isAvailable(release)) {
            deliverError(callback, activity.getString(R.string.update_error_not_newer));
            return;
        }

        executor.execute(() -> {
            File directory = new File(activity.getCacheDir(), "updates");
            File apk = new File(directory, release.getApkName());
            try {
                cleanDirectory(directory);
                String checksumText = client.fetchChecksum(release.getChecksumUrl());
                String expectedSha = Sha256.extractFromChecksumFile(checksumText);
                if (expectedSha == null) {
                    throw new IOException(activity.getString(R.string.update_error_checksum_file));
                }

                long size = client.downloadApk(
                    release.getApkUrl(),
                    apk,
                    percent -> {
                        if (!destroyed) {
                            mainHandler.post(() -> {
                                if (!destroyed) {
                                    callback.onProgress(percent);
                                }
                            });
                        }
                    }
                );

                String actualSha = hashFile(apk);
                UpdateVerifier.Decision decision = ApkVerifier.verify(
                    activity,
                    apk,
                    release,
                    expectedSha,
                    actualSha,
                    size
                );

                if (decision != UpdateVerifier.Decision.OK) {
                    apk.delete();
                    deliverError(callback, decisionMessage(decision));
                    return;
                }

                if (!destroyed) {
                    mainHandler.post(() -> {
                        if (!destroyed) {
                            callback.onVerified(apk);
                        }
                    });
                }
            } catch (IOException | SecurityException e) {
                apk.delete();
                deliverError(callback, friendlyError(e));
            }
        });
    }

    void shutdown() {
        destroyed = true;
        executor.shutdownNow();
    }

    /** Historial real de Releases estables, más reciente primero. */
    void loadHistory(int limit, HistoryCallback callback) {
        if (!isConfigured()) {
            deliverHistory(callback, java.util.Collections.emptyList(),
                activity.getString(R.string.update_error_not_configured));
            return;
        }
        executor.execute(() -> {
            try {
                deliverHistory(callback, client.fetchHistory(limit), null);
            } catch (IOException e) {
                deliverHistory(callback, java.util.Collections.emptyList(), friendlyError(e));
            }
        });
    }

    private void deliverHistory(HistoryCallback callback, java.util.List<ReleaseInfo> releases, String error) {
        if (destroyed) {
            return;
        }
        mainHandler.post(() -> {
            if (!destroyed) {
                callback.onHistory(releases, error);
            }
        });
    }

    private void deliver(CheckCallback callback, ReleaseInfo release, boolean available, String error) {
        if (destroyed) {
            return;
        }
        mainHandler.post(() -> {
            if (!destroyed) {
                callback.onResult(release, available, error);
            }
        });
    }

    private void deliverError(DownloadCallback callback, String message) {
        if (destroyed) {
            return;
        }
        mainHandler.post(() -> {
            if (!destroyed) {
                callback.onError(message);
            }
        });
    }

    private String decisionMessage(UpdateVerifier.Decision decision) {
        switch (decision) {
            case EMPTY_FILE:
                return activity.getString(R.string.update_error_empty);
            case TOO_LARGE:
                return activity.getString(R.string.update_error_too_large);
            case MISSING_CHECKSUM:
                return activity.getString(R.string.update_error_missing_checksum);
            case CHECKSUM_MISMATCH:
                return activity.getString(R.string.update_error_checksum_mismatch);
            case WRONG_PACKAGE:
                return activity.getString(R.string.update_error_wrong_package);
            case DOWNGRADE:
                return activity.getString(R.string.update_error_downgrade);
            case VERSION_MISMATCH:
                return activity.getString(R.string.update_error_version_mismatch);
            case SIGNATURE_MISMATCH:
                return activity.getString(R.string.update_error_signature);
            case OK:
            default:
                return activity.getString(R.string.update_error_generic);
        }
    }

    private String friendlyError(Exception error) {
        String message = error.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return activity.getString(R.string.update_error_network);
        }
        return message;
    }

    private static String hashFile(File file) throws IOException {
        try (BufferedInputStream input = new BufferedInputStream(new FileInputStream(file))) {
            String hash = Sha256.hash(input);
            if (hash == null) {
                throw new IOException("No se pudo calcular SHA-256.");
            }
            return hash;
        }
    }

    private static void cleanDirectory(File directory) {
        if (!directory.exists()) {
            directory.mkdirs();
            return;
        }
        File[] files = directory.listFiles();
        if (files == null) {
            return;
        }
        for (File file : files) {
            if (file.isFile()) {
                file.delete();
            }
        }
    }
}
