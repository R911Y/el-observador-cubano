package cu.observadorcubano.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import java.io.File;
import java.util.List;

/**
 * Pantalla de Novedades y actualizaciones.
 *
 * <p>Muestra la versión instalada, la última Release estable real de GitHub,
 * sus notas y el historial. La descarga y verificación las realiza
 * {@link UpdateManager}; la instalación siempre la confirma el usuario en el
 * instalador de Android.</p>
 */
public class UpdateActivity extends AppCompatActivity {

    static final String EXTRA_FROM_NOTIFICATION = "from_notification";

    private UpdateManager updateManager;

    private View appBar;
    private View scroll;
    private TextView installedVersionView;
    private TextView latestVersionView;
    private TextView releaseDateView;
    private ProgressBar checkProgress;
    private TextView notesHeader;
    private TextView notesView;
    private TextView errorView;
    private Button updateButton;
    private TextView playProtectHint;
    private View downloadBox;
    private ProgressBar downloadProgress;
    private TextView downloadStatus;
    private Button laterButton;
    private Button githubButton;
    private View emptyState;
    private TextView emptyTitle;
    private TextView emptyMessage;
    private Button recheckButton;
    private LinearLayout historyList;
    private TextView historyEmpty;

    private ReleaseInfo currentRelease;
    private String installedVersion = "";
    private boolean downloading;
    private boolean installerLaunched;
    private boolean waitingForInstallPermission;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_update);

        updateManager = new UpdateManager(this);
        bindViews();
        configureSystemBars();
        configureInsets();

        installedVersion = readInstalledVersion();
        installedVersionView.setText(installedVersion);
        TextView subtitle = findViewById(R.id.updateSubtitle);
        subtitle.setText(getString(R.string.update_subtitle, installedVersion));

        UpdateNotifier.cancel(this);

        findViewById(R.id.updateBack).setOnClickListener(v -> finish());
        laterButton.setOnClickListener(v -> {
            if (currentRelease != null && updateManager.isAvailable(currentRelease)) {
                updateManager.getStore().dismiss(currentRelease.getVersion());
            }
            finish();
        });
        updateButton.setOnClickListener(v -> onUpdateClicked());
        recheckButton.setOnClickListener(v -> checkNow());
        githubButton.setOnClickListener(v -> openReleasePage());

        ReleaseInfo cached = updateManager.getCachedRelease();
        if (cached != null) {
            render(cached, updateManager.isAvailable(cached), null);
        }
        checkNow();
        loadHistory();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (waitingForInstallPermission) {
            waitingForInstallPermission = false;
            if (ApkInstaller.canRequestInstall(this)) {
                startDownload();
            }
            return;
        }
        if (installerLaunched) {
            installerLaunched = false;
            downloading = false;
            downloadBox.setVisibility(View.GONE);
            updateButton.setEnabled(true);
            showError(getString(R.string.update_install_cancelled));
        }
    }

    @Override
    protected void onDestroy() {
        if (updateManager != null) {
            updateManager.shutdown();
        }
        super.onDestroy();
    }

    private void bindViews() {
        appBar = findViewById(R.id.updateAppBar);
        scroll = findViewById(R.id.updateScroll);
        installedVersionView = findViewById(R.id.installedVersion);
        latestVersionView = findViewById(R.id.latestVersion);
        releaseDateView = findViewById(R.id.releaseDate);
        checkProgress = findViewById(R.id.checkProgress);
        notesHeader = findViewById(R.id.notesHeader);
        notesView = findViewById(R.id.updateNotes);
        errorView = findViewById(R.id.updateError);
        updateButton = findViewById(R.id.btnUpdate);
        playProtectHint = findViewById(R.id.updatePlayProtectHint);
        downloadBox = findViewById(R.id.downloadBox);
        downloadProgress = findViewById(R.id.downloadProgress);
        downloadStatus = findViewById(R.id.downloadStatus);
        laterButton = findViewById(R.id.btnLater);
        githubButton = findViewById(R.id.btnGitHub);
        emptyState = findViewById(R.id.emptyState);
        emptyTitle = findViewById(R.id.emptyTitle);
        emptyMessage = findViewById(R.id.emptyMessage);
        recheckButton = findViewById(R.id.btnRecheck);
        historyList = findViewById(R.id.historyList);
        historyEmpty = findViewById(R.id.historyEmpty);
    }

    private void configureSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        if (Build.VERSION.SDK_INT < 35) {
            getWindow().setNavigationBarColor(Color.WHITE);
        }
        androidx.core.view.WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(true);
        }
    }

    private void configureInsets() {
        View root = findViewById(R.id.updateRoot);
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, windowInsets) -> {
            Insets bars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            appBar.setPadding(bars.left, bars.top, bars.right, 0);
            scroll.setPadding(0, 0, 0, bars.bottom);
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(root);
    }

    private void checkNow() {
        checkProgress.setVisibility(View.VISIBLE);
        recheckButton.setEnabled(false);
        hideError();
        updateManager.check(true, (release, available, error) -> {
            checkProgress.setVisibility(View.GONE);
            recheckButton.setEnabled(true);
            if (release != null) {
                render(release, available, error);
            } else {
                renderWithoutData(error);
            }
        });
    }

    private void render(ReleaseInfo release, boolean available, String error) {
        currentRelease = release;
        latestVersionView.setText(release.getVersion());
        String date = release.getPublishedDate();
        releaseDateView.setText(date.isEmpty() ? getString(R.string.update_version_unknown) : date);

        if (available) {
            notesHeader.setText(getString(R.string.update_notes_title, release.getVersion()));
            notesHeader.setVisibility(View.VISIBLE);
            notesView.setText(
                release.getNotes().isEmpty()
                    ? getString(R.string.update_no_notes)
                    : release.getNotes()
            );
            notesView.setVisibility(View.VISIBLE);
            updateButton.setText(getString(R.string.update_now_version, release.getVersion()));
            updateButton.setEnabled(!downloading);
            updateButton.setVisibility(View.VISIBLE);
            playProtectHint.setVisibility(View.VISIBLE);
            laterButton.setVisibility(View.VISIBLE);
            emptyState.setVisibility(View.GONE);
            githubButton.setVisibility(
                release.getHtmlUrl().isEmpty() ? View.GONE : View.VISIBLE
            );
            if (error != null && !error.isEmpty()) {
                showError(error + "\n" + getString(R.string.update_cached_note));
            } else {
                hideError();
            }
        } else {
            notesHeader.setVisibility(View.GONE);
            notesView.setVisibility(View.GONE);
            updateButton.setVisibility(View.GONE);
            playProtectHint.setVisibility(View.GONE);
            laterButton.setVisibility(View.GONE);
            downloadBox.setVisibility(View.GONE);
            githubButton.setVisibility(
                release.getHtmlUrl().isEmpty() ? View.GONE : View.VISIBLE
            );
            emptyState.setVisibility(View.VISIBLE);
            emptyTitle.setText(R.string.update_up_to_date_title);
            emptyMessage.setText(
                release.isInstallable()
                    ? getString(R.string.update_up_to_date_message, installedVersion)
                    : getString(R.string.update_no_update_message)
            );
            if (error != null && !error.isEmpty()) {
                showError(error);
            } else {
                hideError();
            }
        }
    }

    private void renderWithoutData(String error) {
        notesHeader.setVisibility(View.GONE);
        notesView.setVisibility(View.GONE);
        updateButton.setVisibility(View.GONE);
        playProtectHint.setVisibility(View.GONE);
        laterButton.setVisibility(View.GONE);
        downloadBox.setVisibility(View.GONE);
        emptyState.setVisibility(View.VISIBLE);
        emptyTitle.setText(R.string.update_check_error_title);
        emptyMessage.setText(
            error == null || error.isEmpty()
                ? getString(R.string.update_check_error_message)
                : error
        );
        hideError();
        if (currentRelease == null) {
            latestVersionView.setText(R.string.update_version_unknown);
            releaseDateView.setText(R.string.update_version_unknown);
        }
    }

    private void onUpdateClicked() {
        if (currentRelease == null || downloading) {
            return;
        }
        if (!ApkInstaller.canRequestInstall(this)) {
            waitingForInstallPermission = true;
            new AlertDialog.Builder(this)
                .setTitle(R.string.update_permission_title)
                .setMessage(R.string.update_permission_message)
                .setPositiveButton(
                    R.string.update_permission_open,
                    (dialog, which) -> ApkInstaller.openUnknownSourcesSettings(this)
                )
                .setNegativeButton(R.string.update_permission_cancel, (dialog, which) ->
                    waitingForInstallPermission = false
                )
                .show();
            return;
        }
        startDownload();
    }

    private void startDownload() {
        if (currentRelease == null || downloading) {
            return;
        }
        downloading = true;
        installerLaunched = false;
        updateButton.setEnabled(false);
        hideError();
        downloadBox.setVisibility(View.VISIBLE);
        downloadProgress.setProgress(0);
        downloadStatus.setText(R.string.update_downloading);

        updateManager.download(currentRelease, new UpdateManager.DownloadCallback() {
            @Override
            public void onProgress(int percent) {
                if (percent < 0) {
                    downloadStatus.setText(R.string.update_downloading);
                    return;
                }
                downloadProgress.setProgress(percent);
                downloadStatus.setText(
                    getString(R.string.update_downloading_percent, percent)
                );
            }

            @Override
            public void onVerified(File apk) {
                downloadStatus.setText(R.string.update_verified);
                installerLaunched = true;
                downloading = false;
                if (!ApkInstaller.install(UpdateActivity.this, apk)) {
                    installerLaunched = false;
                    downloadBox.setVisibility(View.GONE);
                    updateButton.setEnabled(true);
                    showError(getString(R.string.update_install_blocked));
                }
            }

            @Override
            public void onError(String message) {
                downloading = false;
                installerLaunched = false;
                downloadBox.setVisibility(View.GONE);
                updateButton.setEnabled(true);
                showError(message);
            }
        });
    }

    private void loadHistory() {
        historyEmpty.setVisibility(View.GONE);
        updateManager.loadHistory(10, (releases, error) -> {
            historyList.removeAllViews();
            if (releases == null || releases.isEmpty()) {
                historyEmpty.setVisibility(View.VISIBLE);
                historyEmpty.setText(
                    error == null || error.isEmpty()
                        ? R.string.update_history_empty
                        : R.string.update_history_error
                );
                return;
            }
            for (ReleaseInfo release : releases) {
                historyList.addView(buildHistoryRow(release));
            }
        });
    }

    private View buildHistoryRow(ReleaseInfo release) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        row.setPadding(dp(12), dp(11), dp(12), dp(11));
        TypedValue background = new TypedValue();
        getTheme().resolveAttribute(
            android.R.attr.selectableItemBackground,
            background,
            true
        );
        row.setBackgroundResource(background.resourceId);
        row.setClickable(true);
        row.setFocusable(true);

        TextView title = new TextView(this);
        title.setText("Versión " + release.getVersion());
        title.setTextColor(getColor(R.color.text_primary));
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14.5f);
        title.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        title.setMaxLines(1);
        title.setEllipsize(android.text.TextUtils.TruncateAt.END);
        row.addView(title);

        TextView meta = new TextView(this);
        String date = release.getPublishedDate();
        meta.setText(date.isEmpty() ? release.getTitle() : date + " · " + release.getTitle());
        meta.setTextColor(getColor(R.color.text_tertiary));
        meta.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12.5f);
        meta.setMaxLines(2);
        meta.setEllipsize(android.text.TextUtils.TruncateAt.END);
        LinearLayout.LayoutParams metaParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        metaParams.topMargin = dp(2);
        row.addView(meta, metaParams);

        if (!release.getHtmlUrl().isEmpty()) {
            row.setOnClickListener(v -> openUrl(release.getHtmlUrl()));
        }
        return row;
    }

    private void openReleasePage() {
        if (currentRelease == null) {
            return;
        }
        openUrl(currentRelease.getHtmlUrl());
    }

    private void openUrl(String url) {
        if (url == null || url.isEmpty()) {
            return;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, R.string.no_app, Toast.LENGTH_SHORT).show();
        }
    }

    private void showError(String message) {
        errorView.setText(message);
        errorView.setVisibility(View.VISIBLE);
    }

    private void hideError() {
        errorView.setVisibility(View.GONE);
    }

    private String readInstalledVersion() {
        try {
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            if (info.versionName != null && !info.versionName.isEmpty()) {
                return info.versionName;
            }
        } catch (android.content.pm.PackageManager.NameNotFoundException ignored) {
            // Se usa la versión compilada.
        }
        return BuildConfig.VERSION_NAME;
    }

    private int dp(int value) {
        return Math.round(
            TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                value,
                getResources().getDisplayMetrics()
            )
        );
    }
}
