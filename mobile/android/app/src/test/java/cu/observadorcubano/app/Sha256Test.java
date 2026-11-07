package cu.observadorcubano.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class Sha256Test {

    @Test
    public void hashesKnownVector() {
        assertEquals(
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            Sha256.hashText("abc")
        );
        assertEquals(
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            Sha256.hashText("")
        );
    }

    @Test
    public void comparesIgnoringCaseButNotPrefixes() {
        String hash = Sha256.hashText("apk");
        assertTrue(Sha256.matches(hash, hash.toUpperCase()));
        assertFalse(Sha256.matches(hash.substring(0, 32), hash));
        assertFalse(Sha256.matches(hash + "00", hash));
        assertFalse(Sha256.matches(null, hash));
        assertFalse(Sha256.matches(hash, null));
        assertFalse(Sha256.matches("zz" + hash.substring(2), hash));
    }

    @Test
    public void extractsHashFromStandardChecksumFile() {
        String hash = Sha256.hashText("contenido");
        assertEquals(hash, Sha256.extractFromChecksumFile(hash + "  app.apk\n"));
        assertEquals(hash, Sha256.extractFromChecksumFile("  " + hash.toUpperCase() + " *app.apk"));
        assertNull(Sha256.extractFromChecksumFile("no contiene una huella"));
        assertNull(Sha256.extractFromChecksumFile(null));
    }
}
