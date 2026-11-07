package cu.observadorcubano.app;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Release estable leída de la API pública de GitHub.
 *
 * <p>Solo se aceptan activos alojados en GitHub y versiones estables. Las
 * notas se convierten a texto plano: nunca se interpreta HTML ni JavaScript
 * del cuerpo de la Release.</p>
 */
public final class ReleaseInfo {

    private static final int MAX_NOTES_CHARS = 12000;

    private final String tagName;
    private final String version;
    private final String title;
    private final String notes;
    private final String publishedAt;
    private final String htmlUrl;
    private final String apkUrl;
    private final String apkName;
    private final long apkSize;
    private final String checksumUrl;

    private ReleaseInfo(
        String tagName,
        String version,
        String title,
        String notes,
        String publishedAt,
        String htmlUrl,
        String apkUrl,
        String apkName,
        long apkSize,
        String checksumUrl
    ) {
        this.tagName = tagName;
        this.version = version;
        this.title = title;
        this.notes = notes;
        this.publishedAt = publishedAt;
        this.htmlUrl = htmlUrl;
        this.apkUrl = apkUrl;
        this.apkName = apkName;
        this.apkSize = apkSize;
        this.checksumUrl = checksumUrl;
    }

    /**
     * Convierte una Release de la API en un objeto seguro. Devuelve null para
     * borradores, preestrenos o etiquetas que no son MAJOR.MINOR.PATCH.
     */
    public static ReleaseInfo fromJson(JSONObject json, String owner, String repo) {
        if (json == null || json.optBoolean("draft") || json.optBoolean("prerelease")) {
            return null;
        }

        String tag = json.optString("tag_name", "").trim();
        SemVer semVer = SemVer.parseStable(tag);
        if (semVer == null) {
            return null;
        }

        String htmlUrl = json.optString("html_url", "");
        if (!isGitHubPage(htmlUrl, owner, repo)) {
            htmlUrl = "";
        }

        String apkUrl = null;
        String apkName = null;
        long apkSize = 0L;
        String checksumUrl = null;

        JSONArray assets = json.optJSONArray("assets");
        if (assets != null) {
            for (int i = 0; i < assets.length(); i++) {
                JSONObject asset = assets.optJSONObject(i);
                if (asset == null) {
                    continue;
                }
                String name = asset.optString("name", "").trim();
                String url = asset.optString("browser_download_url", "").trim();
                if (apkUrl == null && name.toLowerCase(Locale.ROOT).endsWith(".apk")
                    && isReleaseAssetUrl(url, owner, repo)) {
                    apkUrl = url;
                    apkName = safeAssetName(name);
                    apkSize = asset.optLong("size", 0L);
                }
            }
            if (apkName != null) {
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.optJSONObject(i);
                    if (asset == null) {
                        continue;
                    }
                    String name = asset.optString("name", "").trim();
                    String url = asset.optString("browser_download_url", "").trim();
                    if (isChecksumName(name, apkName) && isReleaseAssetUrl(url, owner, repo)) {
                        checksumUrl = url;
                        break;
                    }
                }
            }
        }

        String name = json.optString("name", "").trim();
        if (name.isEmpty()) {
            name = "Versión " + semVer;
        }

        return new ReleaseInfo(
            tag,
            semVer.toString(),
            name,
            cleanNotes(json.optString("body", "")),
            json.optString("published_at", ""),
            htmlUrl,
            apkUrl,
            apkName,
            apkSize,
            checksumUrl
        );
    }

    public boolean hasApk() {
        return apkUrl != null && apkName != null;
    }

    public boolean hasChecksum() {
        return checksumUrl != null;
    }

    /** Un APK solo puede ofrecerse si tiene archivo y SHA-256 publicado. */
    public boolean isInstallable() {
        return hasApk() && hasChecksum();
    }

    public String getTagName() {
        return tagName;
    }

    public String getVersion() {
        return version;
    }

    public String getTitle() {
        return title;
    }

    public String getNotes() {
        return notes;
    }

    public String getPublishedAt() {
        return publishedAt;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public String getApkUrl() {
        return apkUrl;
    }

    public String getApkName() {
        return apkName;
    }

    public long getApkSize() {
        return apkSize;
    }

    public String getChecksumUrl() {
        return checksumUrl;
    }

    /** Fecha legible en español; si no se puede interpretar devuelve "". */
    public String getPublishedDate() {
        return formatGitHubDate(publishedAt);
    }

    public static String formatGitHubDate(String iso) {
        if (iso == null || iso.trim().isEmpty()) {
            return "";
        }
        String[] patterns = {
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        };
        for (String pattern : patterns) {
            try {
                SimpleDateFormat parser = new SimpleDateFormat(pattern, Locale.US);
                parser.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date date = parser.parse(iso.trim());
                if (date != null) {
                    SimpleDateFormat output = new SimpleDateFormat(
                        "d 'de' MMMM 'de' yyyy",
                        new Locale("es", "ES")
                    );
                    output.setTimeZone(TimeZone.getDefault());
                    return output.format(date);
                }
            } catch (ParseException ignored) {
                // Se prueba el siguiente formato.
            }
        }
        return "";
    }

    /**
     * Texto plano legible a partir del Markdown de la Release. No se ejecuta
     * HTML: el cuerpo se muestra en un TextView sin interpretación.
     */
    static String cleanNotes(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return "";
        }
        String text = raw.replace("\r\n", "\n").replace('\r', '\n');
        text = text.replaceAll("(?s)<!--.*?-->", "");
        text = text.replaceAll("!\\[[^\\]]*\\]\\([^)]*\\)", "");
        text = text.replaceAll("\\[([^\\]]+)\\]\\([^)]*\\)", "$1");
        text = text.replaceAll("<[^>]{1,500}>", "");
        text = text.replaceAll("(?m)^\\s{0,3}#{1,6}\\s*", "");
        text = text.replace("**", "").replace("__", "").replace("`", "");
        text = text.replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&#39;", "'");
        text = text.replaceAll("(?m)[ \\t]+$", "");
        text = text.replaceAll("\\n{3,}", "\n\n").trim();
        if (text.length() > MAX_NOTES_CHARS) {
            text = text.substring(0, MAX_NOTES_CHARS).trim() + "…";
        }
        return text;
    }

    private static boolean isChecksumName(String name, String apkName) {
        String lower = name.toLowerCase(Locale.ROOT);
        return lower.equals((apkName + ".sha256").toLowerCase(Locale.ROOT))
            || lower.endsWith(".apk.sha256");
    }

    private static String safeAssetName(String name) {
        String cleaned = name.replaceAll("[^A-Za-z0-9._-]", "_");
        if (cleaned.length() > 120) {
            cleaned = cleaned.substring(cleaned.length() - 120);
        }
        return cleaned.toLowerCase(Locale.ROOT).endsWith(".apk")
            ? cleaned
            : cleaned + ".apk";
    }

    static boolean isGitHubPage(String url, String owner, String repo) {
        URI uri = parseHttps(url);
        if (uri == null) {
            return false;
        }
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        if (!"github.com".equals(host) && !"www.github.com".equals(host)) {
            return false;
        }
        String expected = "/" + owner + "/" + repo + "/releases";
        return uri.getPath() != null && uri.getPath().startsWith(expected);
    }

    static boolean isReleaseAssetUrl(String url, String owner, String repo) {
        URI uri = parseHttps(url);
        if (uri == null) {
            return false;
        }
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        if (!"github.com".equals(host) && !"www.github.com".equals(host)) {
            return false;
        }
        String path = uri.getPath();
        String expected = "/" + owner + "/" + repo + "/releases/download/";
        return path != null && path.startsWith(expected) && path.length() > expected.length();
    }

    private static URI parseHttps(String url) {
        if (url == null || url.trim().isEmpty() || url.length() > 2048) {
            return null;
        }
        try {
            URI uri = new URI(url.trim());
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                || uri.getRawUserInfo() != null) {
                return null;
            }
            int port = uri.getPort();
            if (port != -1 && port != 443) {
                return null;
            }
            return uri;
        } catch (URISyntaxException e) {
            return null;
        }
    }
}
