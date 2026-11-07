package cu.observadorcubano.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.os.Build;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

/**
 * Comprobaciones del APK descargado usando PackageManager: paquete, versión y
 * certificado de firma. La firma debe coincidir con la instalada; de lo
 * contrario Android rechazaría la actualización y la app no debe intentarlo.
 */
final class ApkVerifier {

    private ApkVerifier() {
        // Clase de utilidades.
    }

    static UpdateVerifier.Decision verify(
        Context context,
        File apkFile,
        ReleaseInfo release,
        String expectedSha256,
        String actualSha256,
        long fileSize
    ) {
        PackageManager pm = context.getPackageManager();
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
            ? PackageManager.GET_SIGNING_CERTIFICATES
            : PackageManager.GET_SIGNATURES;

        PackageInfo candidate = pm.getPackageArchiveInfo(apkFile.getAbsolutePath(), flags);
        if (candidate == null) {
            return UpdateVerifier.Decision.WRONG_PACKAGE;
        }

        try {
            PackageInfo installed = pm.getPackageInfo(context.getPackageName(), flags);
            long installedCode = versionCode(installed);
            long candidateCode = versionCode(candidate);
            String installedName = installed.versionName == null ? "" : installed.versionName;
            String candidateName = candidate.versionName == null ? "" : candidate.versionName;

            return UpdateVerifier.verify(
                fileSize,
                expectedSha256,
                actualSha256,
                installed.packageName,
                candidate.packageName,
                installedCode,
                candidateCode,
                installedName,
                candidateName,
                release.getVersion(),
                signaturesMatch(installed, candidate)
            );
        } catch (PackageManager.NameNotFoundException e) {
            return UpdateVerifier.Decision.WRONG_PACKAGE;
        }
    }

    static boolean signaturesMatch(PackageInfo installed, PackageInfo candidate) {
        Set<String> installedSigners = signerHashes(installed);
        Set<String> candidateSigners = signerHashes(candidate);
        return !installedSigners.isEmpty() && installedSigners.equals(candidateSigners);
    }

    private static long versionCode(PackageInfo info) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            return info.getLongVersionCode();
        }
        return info.versionCode;
    }

    private static Set<String> signerHashes(PackageInfo info) {
        Set<String> hashes = new HashSet<>();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            SigningInfo signingInfo = info.signingInfo;
            if (signingInfo != null) {
                Signature[] signers = signingInfo.getApkContentsSigners();
                if (signers != null) {
                    for (Signature signature : signers) {
                        String hash = Sha256.hash(signature.toByteArray());
                        if (hash != null) {
                            hashes.add(hash);
                        }
                    }
                }
            }
        }
        // En algunas versiones de Android signingInfo llega vacío al leer un
        // APK con getPackageArchiveInfo; se usa el certificado V1 como respaldo.
        if (hashes.isEmpty() && info.signatures != null) {
            for (Signature signature : info.signatures) {
                String hash = Sha256.hash(signature.toByteArray());
                if (hash != null) {
                    hashes.add(hash);
                }
            }
        }
        return hashes;
    }
}
