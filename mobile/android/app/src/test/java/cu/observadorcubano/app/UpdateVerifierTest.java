package cu.observadorcubano.app;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class UpdateVerifierTest {

    private static final String PACKAGE = "cu.observadorcubano.app";
    private static final String SHA = Sha256.hashText("apk");

    @Test
    public void acceptsValidUpgrade() {
        assertEquals(
            UpdateVerifier.Decision.OK,
            UpdateVerifier.verify(
                2048L, SHA, SHA,
                PACKAGE, PACKAGE,
                1L, 2L,
                "1.0.0", "1.1.0", "1.1.0",
                true
            )
        );
    }

    @Test
    public void rejectsEmptyOversizedOrUncheckedFiles() {
        assertEquals(
            UpdateVerifier.Decision.EMPTY_FILE,
            verify(0L, SHA, SHA, 1L, 2L, "1.0.0", "1.1.0", true)
        );
        assertEquals(
            UpdateVerifier.Decision.TOO_LARGE,
            verify(UpdateVerifier.MAX_APK_BYTES + 1L, SHA, SHA, 1L, 2L, "1.0.0", "1.1.0", true)
        );
        assertEquals(
            UpdateVerifier.Decision.MISSING_CHECKSUM,
            verify(2048L, null, SHA, 1L, 2L, "1.0.0", "1.1.0", true)
        );
    }

    @Test
    public void rejectsChecksumMismatch() {
        assertEquals(
            UpdateVerifier.Decision.CHECKSUM_MISMATCH,
            verify(2048L, SHA, Sha256.hashText("otro"), 1L, 2L, "1.0.0", "1.1.0", true)
        );
    }

    @Test
    public void rejectsWrongPackageAndDowngrades() {
        assertEquals(
            UpdateVerifier.Decision.WRONG_PACKAGE,
            UpdateVerifier.verify(
                2048L, SHA, SHA,
                PACKAGE, "cu.otra.app",
                1L, 2L,
                "1.0.0", "1.1.0", "1.1.0",
                true
            )
        );
        assertEquals(
            UpdateVerifier.Decision.DOWNGRADE,
            verify(2048L, SHA, SHA, 2L, 2L, "1.1.0", "1.1.0", true)
        );
        assertEquals(
            UpdateVerifier.Decision.DOWNGRADE,
            verify(2048L, SHA, SHA, 2L, 3L, "1.1.0", "1.0.0", true)
        );
    }

    @Test
    public void rejectsVersionMismatchBetweenApkAndRelease() {
        assertEquals(
            UpdateVerifier.Decision.VERSION_MISMATCH,
            UpdateVerifier.verify(
                2048L, SHA, SHA,
                PACKAGE, PACKAGE,
                1L, 2L,
                "1.0.0", "1.1.0", "1.2.0",
                true
            )
        );
    }

    @Test
    public void rejectsSignatureMismatch() {
        assertEquals(
            UpdateVerifier.Decision.SIGNATURE_MISMATCH,
            verify(2048L, SHA, SHA, 1L, 2L, "1.0.0", "1.1.0", false)
        );
    }

    private static UpdateVerifier.Decision verify(
        long size,
        String expectedSha,
        String actualSha,
        long installedCode,
        long candidateCode,
        String installedName,
        String candidateName,
        boolean signatureMatches
    ) {
        return UpdateVerifier.verify(
            size, expectedSha, actualSha,
            PACKAGE, PACKAGE,
            installedCode, candidateCode,
            installedName, candidateName, candidateName,
            signatureMatches
        );
    }
}
