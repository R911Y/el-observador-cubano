package cu.observadorcubano.app;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

/** Utilidades SHA-256 sin dependencias de Android (probables con JUnit). */
public final class Sha256 {

    private static final char[] HEX = "0123456789abcdef".toCharArray();

    private Sha256() {
        // Clase de utilidades.
    }

    public static String hash(byte[] data) {
        if (data == null) {
            return null;
        }
        try {
            return toHex(MessageDigest.getInstance("SHA-256").digest(data));
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }

    public static String hash(InputStream input) throws IOException {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[32 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) {
                digest.update(buffer, 0, read);
            }
            return toHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IOException("SHA-256 no disponible", e);
        }
    }

    public static String hashText(String text) {
        return text == null ? null : hash(text.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Compara dos huellas en hexadecimal ignorando mayúsculas. Solo acepta
     * exactamente 64 caracteres hexadecimales para evitar comparaciones
     * ambiguas o con prefijos.
     */
    public static boolean matches(String expected, String actual) {
        String left = normalize(expected);
        String right = normalize(actual);
        return left != null && left.equals(right);
    }

    /** Extrae la primera huella SHA-256 de un archivo .sha256 estándar. */
    public static String extractFromChecksumFile(String content) {
        if (content == null) {
            return null;
        }
        String[] tokens = content.trim().split("[\\s*]+");
        for (String token : tokens) {
            String normalized = normalize(token);
            if (normalized != null) {
                return normalized;
            }
        }
        return null;
    }

    public static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().toLowerCase(Locale.ROOT);
        if (trimmed.length() != 64) {
            return null;
        }
        for (int i = 0; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            boolean hex = (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f');
            if (!hex) {
                return null;
            }
        }
        return trimmed;
    }

    private static String toHex(byte[] bytes) {
        char[] out = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int value = bytes[i] & 0xFF;
            out[i * 2] = HEX[value >>> 4];
            out[i * 2 + 1] = HEX[value & 0x0F];
        }
        return new String(out);
    }
}
