package cu.observadorcubano.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class SemVerTest {

    @Test
    public void parsesStableTagsWithOptionalV() {
        assertEquals("1.2.3", SemVer.parseStable("1.2.3").toString());
        assertEquals("1.2.3", SemVer.parseStable("v1.2.3").toString());
        assertEquals("10.0.12", SemVer.parseStable("V10.0.12").toString());
    }

    @Test
    public void rejectsIncompleteOrPrereleaseTags() {
        assertNull(SemVer.parseStable("1.2"));
        assertNull(SemVer.parseStable("1.2.3.4"));
        assertNull(SemVer.parseStable("v1.2.3-beta.1"));
        assertNull(SemVer.parseStable("v1.2.3-rc1"));
        assertNull(SemVer.parseStable("v1.2.3+build"));
        assertNull(SemVer.parseStable("versión 1.2.3"));
        assertNull(SemVer.parseStable(null));
    }

    @Test
    public void comparesByMajorMinorPatch() {
        assertTrue(SemVer.parseStable("2.0.0").compareTo(SemVer.parseStable("1.9.9")) > 0);
        assertTrue(SemVer.parseStable("1.10.0").compareTo(SemVer.parseStable("1.9.0")) > 0);
        assertTrue(SemVer.parseStable("1.0.10").compareTo(SemVer.parseStable("1.0.9")) > 0);
        assertEquals(0, SemVer.parseStable("1.0.0").compareTo(SemVer.parseStable("v1.0.0")));
    }

    @Test
    public void onlyOffersStrictlyNewerStableVersions() {
        assertTrue(SemVer.isNewerStable("1.0.0", "1.1.0"));
        assertTrue(SemVer.isNewerStable("1.0.0", "v1.0.1"));
        assertTrue(SemVer.isNewerStable("1.0.0", "2.0.0"));
        assertFalse(SemVer.isNewerStable("1.1.0", "1.1.0"));
        assertFalse(SemVer.isNewerStable("1.1.0", "1.0.9"));
        assertFalse(SemVer.isNewerStable("1.1.0", "1.2.0-beta.1"));
        assertFalse(SemVer.isNewerStable("beta", "1.2.0"));
        assertFalse(SemVer.isNewerStable("1.1.0", null));
    }

    @Test
    public void stableCheckRejectsPrereleases() {
        assertTrue(SemVer.isStable("v1.2.3"));
        assertFalse(SemVer.isStable("v1.2.3-rc.1"));
        assertFalse(SemVer.isStable("1.2"));
    }
}
