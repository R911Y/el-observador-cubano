package cu.observadorcubano.app;

/**
 * Verificación previa a la instalación de un APK descargado.
 *
 * <p>Reúne todas las comprobaciones en una función pura para poder cubrir con
 * pruebas cada rechazo: tamaño, SHA-256, paquete, versión y firma.</p>
 */
public final class UpdateVerifier {

    public static final long MAX_APK_BYTES = 200L * 1024L * 1024L;

    public enum Decision {
        OK,
        EMPTY_FILE,
        TOO_LARGE,
        MISSING_CHECKSUM,
        CHECKSUM_MISMATCH,
        WRONG_PACKAGE,
        DOWNGRADE,
        VERSION_MISMATCH,
        SIGNATURE_MISMATCH
    }

    private UpdateVerifier() {
        // Clase de utilidades.
    }

    public static Decision verify(
        long fileSize,
        String expectedSha256,
        String actualSha256,
        String installedPackage,
        String candidatePackage,
        long installedVersionCode,
        long candidateVersionCode,
        String installedVersionName,
        String candidateVersionName,
        String expectedVersionName,
        boolean signatureMatches
    ) {
        if (fileSize <= 0L) {
            return Decision.EMPTY_FILE;
        }
        if (fileSize > MAX_APK_BYTES) {
            return Decision.TOO_LARGE;
        }
        if (Sha256.normalize(expectedSha256) == null) {
            return Decision.MISSING_CHECKSUM;
        }
        if (!Sha256.matches(expectedSha256, actualSha256)) {
            return Decision.CHECKSUM_MISMATCH;
        }
        if (installedPackage == null || candidatePackage == null
            || !installedPackage.equals(candidatePackage)) {
            return Decision.WRONG_PACKAGE;
        }
        if (candidateVersionCode <= installedVersionCode) {
            return Decision.DOWNGRADE;
        }
        String expected = SemVer.normalizeTag(expectedVersionName);
        String candidate = SemVer.normalizeTag(candidateVersionName);
        if (expected == null || candidate == null || !expected.equals(candidate)) {
            return Decision.VERSION_MISMATCH;
        }
        if (!SemVer.isNewerStable(installedVersionName, candidateVersionName)) {
            return Decision.DOWNGRADE;
        }
        if (!signatureMatches) {
            return Decision.SIGNATURE_MISMATCH;
        }
        return Decision.OK;
    }
}
