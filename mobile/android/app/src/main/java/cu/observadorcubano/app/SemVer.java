package cu.observadorcubano.app;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Versión semántica MAJOR.MINOR.PATCH usada por las etiquetas de GitHub
 * ({@code v1.2.3}) y por {@code versionName}.
 *
 * <p>Solo las versiones estables (sin sufijo {@code -beta}, {@code -rc} ni
 * metadatos) pueden ofrecerse como actualización. La clase no depende del
 * framework de Android para poder probarse con JUnit puro.</p>
 */
public final class SemVer implements Comparable<SemVer> {

    private static final Pattern STABLE = Pattern.compile(
        "^[vV]?(\\d{1,9})\\.(\\d{1,9})\\.(\\d{1,9})$"
    );
    private static final Pattern ANY = Pattern.compile(
        "^[vV]?(\\d{1,9})\\.(\\d{1,9})\\.(\\d{1,9})([-+][0-9A-Za-z.-]{1,64})?$"
    );

    private final int major;
    private final int minor;
    private final int patch;
    private final boolean prerelease;

    private SemVer(int major, int minor, int patch, boolean prerelease) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
        this.prerelease = prerelease;
    }

    /**
     * Interpreta una etiqueta estable. Devuelve {@code null} si el texto no es
     * una versión MAJOR.MINOR.PATCH o si incluye un sufijo de preestreno.
     */
    public static SemVer parseStable(String raw) {
        if (raw == null) {
            return null;
        }
        Matcher matcher = STABLE.matcher(raw.trim());
        if (!matcher.matches()) {
            return null;
        }
        return new SemVer(
            Integer.parseInt(matcher.group(1)),
            Integer.parseInt(matcher.group(2)),
            Integer.parseInt(matcher.group(3)),
            false
        );
    }

    /**
     * Interpreta cualquier versión con sufijo opcional y marca si es
     * preestreno. Se usa para descartar etiquetas no estables.
     */
    public static SemVer parse(String raw) {
        if (raw == null) {
            return null;
        }
        Matcher matcher = ANY.matcher(raw.trim());
        if (!matcher.matches()) {
            return null;
        }
        return new SemVer(
            Integer.parseInt(matcher.group(1)),
            Integer.parseInt(matcher.group(2)),
            Integer.parseInt(matcher.group(3)),
            matcher.group(4) != null
        );
    }

    public static boolean isStable(String raw) {
        SemVer version = parse(raw);
        return version != null && !version.prerelease;
    }

    /**
     * Compara la versión instalada con la publicada. Solo devuelve true si
     * ambas son estables y la publicada es estrictamente mayor.
     */
    public static boolean isNewerStable(String installed, String candidate) {
        SemVer current = parseStable(installed);
        SemVer next = parseStable(candidate);
        return current != null && next != null && next.compareTo(current) > 0;
    }

    public static String normalizeTag(String tag) {
        SemVer version = parseStable(tag);
        return version == null ? null : version.toString();
    }

    public int getMajor() {
        return major;
    }

    public int getMinor() {
        return minor;
    }

    public int getPatch() {
        return patch;
    }

    public boolean isPrerelease() {
        return prerelease;
    }

    @Override
    public int compareTo(SemVer other) {
        int result = Integer.compare(major, other.major);
        if (result != 0) {
            return result;
        }
        result = Integer.compare(minor, other.minor);
        if (result != 0) {
            return result;
        }
        return Integer.compare(patch, other.patch);
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof SemVer)) {
            return false;
        }
        return compareTo((SemVer) obj) == 0;
    }

    @Override
    public int hashCode() {
        return (major * 31 + minor) * 31 + patch;
    }

    @Override
    public String toString() {
        return String.format(Locale.ROOT, "%d.%d.%d", major, minor, patch);
    }
}
