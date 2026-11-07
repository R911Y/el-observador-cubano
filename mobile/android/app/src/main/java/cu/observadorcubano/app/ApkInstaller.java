package cu.observadorcubano.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import java.io.File;

/**
 * Abre el instalador de Android con autorización explícita del usuario.
 *
 * <p>Nunca instala en silencio ni intenta eludir la pantalla del sistema. Si
 * la app no puede instalar paquetes, se abre el ajuste correspondiente y se
 * reintenta solo después de que el usuario lo autorice.</p>
 */
final class ApkInstaller {

    private ApkInstaller() {
        // Clase de utilidades.
    }

    static boolean canRequestInstall(Activity activity) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return true;
        }
        PackageManager pm = activity.getPackageManager();
        return pm.canRequestPackageInstalls();
    }

    static void openUnknownSourcesSettings(Activity activity) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
            Uri.parse("package:" + activity.getPackageName())
        );
        try {
            activity.startActivity(intent);
        } catch (Exception ignored) {
            Intent fallback = new Intent(Settings.ACTION_SECURITY_SETTINGS);
            try {
                activity.startActivity(fallback);
            } catch (Exception ignoredAgain) {
                // Sin ajuste disponible; la interfaz muestra el error.
            }
        }
    }

    static boolean install(Activity activity, File apkFile) {
        if (!canRequestInstall(activity)) {
            return false;
        }
        Uri uri = FileProvider.getUriForFile(
            activity,
            BuildConfig.APPLICATION_ID + ".fileprovider",
            apkFile
        );
        Intent intent = new Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            activity.startActivity(intent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
