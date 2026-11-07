package cu.observadorcubano.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;

public class ReleaseInfoTest {

    private static final String OWNER = "acme";
    private static final String REPO = "el-observador-cubano";

    @Test
    public void parsesStableReleaseWithApkAndChecksum() throws Exception {
        ReleaseInfo release = ReleaseInfo.fromJson(fullRelease(), OWNER, REPO);
        assertNotNull(release);
        assertEquals("1.1.0", release.getVersion());
        assertEquals("v1.1.0", release.getTagName());
        assertEquals("El Observador Cubano 1.1.0", release.getTitle());
        assertEquals(
            "https://github.com/acme/el-observador-cubano/releases/download/v1.1.0/app.apk",
            release.getApkUrl()
        );
        assertEquals("app.apk", release.getApkName());
        assertEquals(123456L, release.getApkSize());
        assertTrue(release.hasChecksum());
        assertTrue(release.isInstallable());
    }

    @Test
    public void ignoresDraftsAndPrereleases() throws Exception {
        JSONObject draft = fullRelease().put("draft", true);
        JSONObject prerelease = fullRelease().put("prerelease", true);
        assertNull(ReleaseInfo.fromJson(draft, OWNER, REPO));
        assertNull(ReleaseInfo.fromJson(prerelease, OWNER, REPO));
    }

    @Test
    public void rejectsNonSemverTags() throws Exception {
        JSONObject json = fullRelease().put("tag_name", "version-1.1");
        assertNull(ReleaseInfo.fromJson(json, OWNER, REPO));
    }

    @Test
    public void rejectsApkHostedOutsideOfficialRepository() throws Exception {
        JSONObject json = fullRelease();
        JSONArray assets = json.getJSONArray("assets");
        assets.getJSONObject(0).put(
            "browser_download_url",
            "https://evil.example/acme/el-observador-cubano/releases/download/v1.1.0/app.apk"
        );
        ReleaseInfo release = ReleaseInfo.fromJson(json, OWNER, REPO);
        assertNotNull(release);
        assertFalse(release.hasApk());
        assertFalse(release.isInstallable());
    }

    @Test
    public void releaseWithoutChecksumIsNotInstallable() throws Exception {
        JSONObject json = fullRelease();
        JSONArray assets = json.getJSONArray("assets");
        JSONArray withoutChecksum = new JSONArray();
        withoutChecksum.put(assets.getJSONObject(0));
        json.put("assets", withoutChecksum);
        ReleaseInfo release = ReleaseInfo.fromJson(json, OWNER, REPO);
        assertNotNull(release);
        assertTrue(release.hasApk());
        assertFalse(release.hasChecksum());
        assertFalse(release.isInstallable());
    }

    @Test
    public void cleansMarkdownAndHtmlFromNotes() {
        String notes = ReleaseInfo.cleanNotes(
            "## Cambios\n\n"
                + "- **Nuevo** [enlace](https://example.com)\n"
                + "![imagen](https://example.com/x.png)\n"
                + "<!-- comentario -->\n"
                + "<b>Hola</b> &amp; adiós\n"
                + "\n\n\n"
                + "Fin"
        );
        assertEquals("Cambios\n\n- Nuevo enlace\n\nHola & adiós\n\nFin", notes);
    }

    @Test
    public void emptyNotesStayEmpty() {
        assertEquals("", ReleaseInfo.cleanNotes(null));
        assertEquals("", ReleaseInfo.cleanNotes("   \n  "));
    }

    @Test
    public void formatsGitHubDateInSpanish() {
        String formatted = ReleaseInfo.formatGitHubDate("2026-11-07T15:04:05Z");
        assertTrue(formatted.contains("2026"));
        assertTrue(formatted.contains("noviembre"));
        assertEquals("", ReleaseInfo.formatGitHubDate("fecha inválida"));
    }

    @Test
    public void validatesAssetUrlsStrictly() {
        assertTrue(ReleaseInfo.isReleaseAssetUrl(
            "https://github.com/acme/el-observador-cubano/releases/download/v1.1.0/app.apk",
            OWNER,
            REPO
        ));
        assertFalse(ReleaseInfo.isReleaseAssetUrl(
            "http://github.com/acme/el-observador-cubano/releases/download/v1.1.0/app.apk",
            OWNER,
            REPO
        ));
        assertFalse(ReleaseInfo.isReleaseAssetUrl(
            "https://github.com/other/el-observador-cubano/releases/download/v1.1.0/app.apk",
            OWNER,
            REPO
        ));
        assertFalse(ReleaseInfo.isReleaseAssetUrl(
            "https://github.com/acme/el-observador-cubano/releases/tag/v1.1.0",
            OWNER,
            REPO
        ));
    }

    private static JSONObject fullRelease() throws Exception {
        JSONArray assets = new JSONArray();
        assets.put(new JSONObject()
            .put("name", "app.apk")
            .put("size", 123456L)
            .put("browser_download_url",
                "https://github.com/acme/el-observador-cubano/releases/download/v1.1.0/app.apk"));
        assets.put(new JSONObject()
            .put("name", "app.apk.sha256")
            .put("size", 80L)
            .put("browser_download_url",
                "https://github.com/acme/el-observador-cubano/releases/download/v1.1.0/app.apk.sha256"));

        return new JSONObject()
            .put("tag_name", "v1.1.0")
            .put("name", "El Observador Cubano 1.1.0")
            .put("body", "## Novedades\n\n- Correcciones")
            .put("published_at", "2026-11-07T15:04:05Z")
            .put("html_url", "https://github.com/acme/el-observador-cubano/releases/tag/v1.1.0")
            .put("draft", false)
            .put("prerelease", false)
            .put("assets", assets);
    }
}
