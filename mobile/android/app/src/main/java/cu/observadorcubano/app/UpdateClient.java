package cu.observadorcubano.app;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Cliente anónimo de la API pública de GitHub Releases.
 *
 * <p>No envía tokens ni credenciales. Limita tamaños, tiempos de espera y
 * hosts de descarga para reducir el impacto de una respuesta manipulada.</p>
 */
final class UpdateClient {

    interface ProgressListener {
        /** Porcentaje 0-100, o -1 si GitHub no informa del tamaño. */
        void onProgress(int percent);
    }

    static final class Latest {
        final String rawJson;
        final ReleaseInfo release;

        Latest(String rawJson, ReleaseInfo release) {
            this.rawJson = rawJson;
            this.release = release;
        }
    }

    private static final int CONNECT_TIMEOUT_MS = 10000;
    private static final int READ_TIMEOUT_MS = 30000;
    private static final int MAX_API_BYTES = 2 * 1024 * 1024;
    private static final int MAX_CHECKSUM_BYTES = 8192;
    private static final String USER_AGENT =
        "ElObservadorCubano/" + BuildConfig.VERSION_NAME + " (Android; update-check)";

    private final String owner;
    private final String repo;

    UpdateClient(String owner, String repo) {
        this.owner = owner == null ? "" : owner.trim();
        this.repo = repo == null ? "" : repo.trim();
    }

    Latest fetchLatest() throws IOException {
        String url = "https://api.github.com/repos/" + owner + "/" + repo + "/releases/latest";
        String json = getText(url, MAX_API_BYTES);
        try {
            JSONObject object = new JSONObject(json);
            String raw = object.toString();
            ReleaseInfo release = ReleaseInfo.fromJson(object, owner, repo);
            if (release == null) {
                throw new IOException("La última publicación no es una versión estable válida.");
            }
            return new Latest(raw, release);
        } catch (JSONException e) {
            throw new IOException("GitHub devolvió una respuesta que no se pudo interpretar.", e);
        }
    }

    List<ReleaseInfo> fetchHistory(int limit) throws IOException {
        int safeLimit = Math.max(1, Math.min(20, limit));
        String url = "https://api.github.com/repos/" + owner + "/" + repo
            + "/releases?per_page=" + safeLimit;
        String json = getText(url, MAX_API_BYTES);
        List<ReleaseInfo> releases = new ArrayList<>();
        try {
            JSONArray array = new JSONArray(json);
            for (int i = 0; i < array.length() && releases.size() < safeLimit; i++) {
                JSONObject object = array.optJSONObject(i);
                ReleaseInfo release = ReleaseInfo.fromJson(object, owner, repo);
                if (release != null) {
                    releases.add(release);
                }
            }
        } catch (JSONException e) {
            throw new IOException("No se pudo interpretar el historial de versiones.", e);
        }
        return releases;
    }

    String fetchChecksum(String checksumUrl) throws IOException {
        return getText(checksumUrl, MAX_CHECKSUM_BYTES);
    }

    /**
     * Descarga el APK a un archivo temporal. Devuelve el tamaño en bytes.
     */
    long downloadApk(String assetUrl, File destination, ProgressListener listener)
        throws IOException {
        if (!ReleaseInfo.isReleaseAssetUrl(assetUrl, owner, repo)) {
            throw new IOException("La URL del APK no pertenece al repositorio oficial.");
        }
        File parent = destination.getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) {
            throw new IOException("No se pudo preparar la carpeta de descargas.");
        }
        if (destination.exists() && !destination.delete()) {
            throw new IOException("No se pudo limpiar la descarga anterior.");
        }

        HttpURLConnection connection = open(assetUrl, "application/octet-stream");
        try {
            int code = connection.getResponseCode();
            if (code < 200 || code >= 300) {
                throw new IOException("La descarga del APK respondió " + code + ".");
            }
            if (!isAllowedDownloadHost(connection.getURL())) {
                throw new IOException("La descarga fue redirigida a un servidor no permitido.");
            }

            long total = connection.getContentLengthLong();
            if (total > UpdateVerifier.MAX_APK_BYTES) {
                throw new IOException("El APK publicado supera el tamaño máximo permitido.");
            }

            long written = 0L;
            int lastPercent = -2;
            byte[] buffer = new byte[64 * 1024];
            try (
                InputStream input = new BufferedInputStream(connection.getInputStream());
                FileOutputStream output = new FileOutputStream(destination)
            ) {
                int read;
                while ((read = input.read(buffer)) != -1) {
                    written += read;
                    if (written > UpdateVerifier.MAX_APK_BYTES) {
                        throw new IOException("El APK supera el tamaño máximo permitido.");
                    }
                    output.write(buffer, 0, read);
                    int percent = total > 0
                        ? (int) Math.min(100L, (written * 100L) / total)
                        : -1;
                    if (listener != null && percent != lastPercent) {
                        lastPercent = percent;
                        listener.onProgress(percent);
                    }
                }
                output.flush();
            }

            if (written <= 0L) {
                throw new IOException("El APK descargado está vacío.");
            }
            if (listener != null && lastPercent != 100) {
                listener.onProgress(100);
            }
            return written;
        } catch (IOException e) {
            if (destination.exists()) {
                // Nunca se conserva una descarga incompleta.
                destination.delete();
            }
            throw e;
        } finally {
            connection.disconnect();
        }
    }

    private String getText(String url, int maxBytes) throws IOException {
        HttpURLConnection connection = open(url, "application/vnd.github+json");
        try {
            int code = connection.getResponseCode();
            if (code == 404) {
                throw new IOException("Todavía no hay versiones publicadas en el repositorio.");
            }
            if (code == 403 || code == 429) {
                throw new IOException("GitHub limitó temporalmente las consultas. Inténtalo más tarde.");
            }
            if (code < 200 || code >= 300) {
                throw new IOException("GitHub respondió con el código " + code + ".");
            }
            try (InputStream input = new BufferedInputStream(connection.getInputStream())) {
                return readLimited(input, maxBytes);
            }
        } finally {
            connection.disconnect();
        }
    }

    private HttpURLConnection open(String url, String accept) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
        connection.setReadTimeout(READ_TIMEOUT_MS);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("Accept", accept);
        connection.setRequestProperty("User-Agent", USER_AGENT);
        connection.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
        connection.setUseCaches(false);
        return connection;
    }

    private static String readLimited(InputStream input, int maxBytes) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[16 * 1024];
        int total = 0;
        int read;
        while ((read = input.read(buffer)) != -1) {
            total += read;
            if (total > maxBytes) {
                throw new IOException("La respuesta de GitHub es demasiado grande.");
            }
            output.write(buffer, 0, read);
        }
        return output.toString(StandardCharsets.UTF_8.name());
    }

    private static boolean isAllowedDownloadHost(URL url) {
        if (url == null || !"https".equalsIgnoreCase(url.getProtocol())) {
            return false;
        }
        String host = url.getHost() == null
            ? ""
            : url.getHost().toLowerCase(Locale.ROOT);
        return "github.com".equals(host)
            || "www.github.com".equals(host)
            || "objects.githubusercontent.com".equals(host)
            || "github-releases.githubusercontent.com".equals(host)
            || "release-assets.githubusercontent.com".equals(host);
    }
}
