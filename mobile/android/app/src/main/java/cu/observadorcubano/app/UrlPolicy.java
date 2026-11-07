package cu.observadorcubano.app;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Política central de navegación.
 *
 * Solo se permite el sitio oficial dentro del WebView. El resto de enlaces
 * HTTPS se abren en un navegador; los esquemas de aplicación se limitan a
 * correo, teléfono, SMS y WhatsApp. Cualquier otro esquema se bloquea.
 *
 * La clase no depende de android.net.Uri para poder probarse con JUnit puro.
 */
public final class UrlPolicy {

    public enum Action {
        INTERNAL,
        EXTERNAL_WEB,
        EXTERNAL_APP,
        BLOCK
    }

    private static final String INTERNAL_HOST = "observadorcubano.blogspot.com";
    private static final String INTERNAL_WWW_HOST = "www.observadorcubano.blogspot.com";

    private static final Set<String> APP_SCHEMES = new HashSet<>(
        Arrays.asList("mailto", "tel", "sms", "whatsapp")
    );

    private UrlPolicy() {
        // Clase de utilidades.
    }

    public static Action classify(String rawUrl) {
        URI uri = parse(rawUrl);
        if (uri == null) {
            return Action.BLOCK;
        }

        String scheme = scheme(uri);
        if (scheme == null) {
            return Action.BLOCK;
        }

        if ("http".equals(scheme) || "https".equals(scheme)) {
            if (!isHttpSafe(uri, scheme)) {
                return Action.BLOCK;
            }
            return isInternalHost(host(uri)) ? Action.INTERNAL : Action.EXTERNAL_WEB;
        }

        if (APP_SCHEMES.contains(scheme)) {
            return Action.EXTERNAL_APP;
        }

        return Action.BLOCK;
    }

    public static boolean isInternal(String rawUrl) {
        URI uri = parse(rawUrl);
        if (uri == null) {
            return false;
        }
        return "https".equals(scheme(uri))
            && isHttpSafe(uri, "https")
            && isInternalHost(host(uri));
    }

    /**
     * Devuelve una versión HTTPS equivalente y canónica, o null si la URL no
     * es segura. Los enlaces HTTP se elevan a HTTPS antes de abrirse.
     */
    public static String normalize(String rawUrl) {
        URI uri = parse(rawUrl);
        if (uri == null) {
            return null;
        }

        String scheme = scheme(uri);
        if (!"http".equals(scheme) && !"https".equals(scheme)) {
            return null;
        }
        if (!isHttpSafe(uri, scheme)) {
            return null;
        }

        if ("https".equals(scheme)) {
            if (uri.getPort() == 443) {
                return rebuild(uri, "https", -1);
            }
            return uri.toString();
        }

        return rebuild(uri, "https", -1);
    }

    private static boolean isHttpSafe(URI uri, String scheme) {
        String host = host(uri);
        if (host == null || host.isEmpty()) {
            return false;
        }
        if (uri.getRawUserInfo() != null) {
            return false;
        }

        int port = uri.getPort();
        if ("https".equals(scheme)) {
            return port == -1 || port == 443;
        }
        if ("http".equals(scheme)) {
            return port == -1 || port == 80;
        }
        return false;
    }

    private static boolean isInternalHost(String host) {
        if (host == null) {
            return false;
        }
        return INTERNAL_HOST.equals(host) || INTERNAL_WWW_HOST.equals(host);
    }

    private static String host(URI uri) {
        String host = uri.getHost();
        if (host == null) {
            return null;
        }
        host = host.toLowerCase(Locale.ROOT);
        while (host.endsWith(".")) {
            host = host.substring(0, host.length() - 1);
        }
        return host;
    }

    private static String scheme(URI uri) {
        String scheme = uri.getScheme();
        return scheme == null ? null : scheme.toLowerCase(Locale.ROOT);
    }

    private static URI parse(String rawUrl) {
        if (rawUrl == null) {
            return null;
        }
        String trimmed = rawUrl.trim();
        if (trimmed.isEmpty() || trimmed.length() > 8192) {
            return null;
        }
        try {
            return new URI(trimmed);
        } catch (URISyntaxException e) {
            return null;
        }
    }

    private static String rebuild(URI uri, String scheme, int port) {
        try {
            return new URI(
                scheme,
                uri.getRawUserInfo(),
                uri.getHost(),
                port,
                uri.getRawPath(),
                uri.getRawQuery(),
                uri.getRawFragment()
            ).toString();
        } catch (URISyntaxException e) {
            return null;
        }
    }
}
