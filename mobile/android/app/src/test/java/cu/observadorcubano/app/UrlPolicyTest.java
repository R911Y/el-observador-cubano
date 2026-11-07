package cu.observadorcubano.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class UrlPolicyTest {

    @Test
    public void officialSiteIsInternal() {
        assertEquals(
            UrlPolicy.Action.INTERNAL,
            UrlPolicy.classify("https://observadorcubano.blogspot.com/")
        );
        assertEquals(
            UrlPolicy.Action.INTERNAL,
            UrlPolicy.classify("https://www.observadorcubano.blogspot.com/2026/01/nota.html")
        );
    }

    @Test
    public void officialSiteAcceptsUppercaseSchemeAndHost() {
        assertEquals(
            UrlPolicy.Action.INTERNAL,
            UrlPolicy.classify("HTTPS://OBSERVADORCUBANO.BLOGSPOT.COM/")
        );
    }

    @Test
    public void httpIsUpgradedToHttps() {
        assertEquals(
            "https://observadorcubano.blogspot.com/nota.html",
            UrlPolicy.normalize("http://observadorcubano.blogspot.com/nota.html")
        );
        assertEquals(
            "https://example.com/ruta?q=1",
            UrlPolicy.normalize("http://example.com/ruta?q=1")
        );
    }

    @Test
    public void defaultPortsAreRemoved() {
        assertEquals(
            "https://example.com/ruta",
            UrlPolicy.normalize("https://example.com:443/ruta")
        );
        assertEquals(
            "https://example.com/ruta",
            UrlPolicy.normalize("http://example.com:80/ruta")
        );
    }

    @Test
    public void lookalikeHostsAreExternal() {
        assertEquals(
            UrlPolicy.Action.EXTERNAL_WEB,
            UrlPolicy.classify("https://observadorcubano.blogspot.com.evil.example/")
        );
        assertEquals(
            UrlPolicy.Action.EXTERNAL_WEB,
            UrlPolicy.classify("https://evil.example/observadorcubano.blogspot.com")
        );
        assertFalse(UrlPolicy.isInternal("https://observadorcubano.blogspot.com.evil.example/"));
    }

    @Test
    public void userInfoIsBlocked() {
        assertEquals(
            UrlPolicy.Action.BLOCK,
            UrlPolicy.classify("https://usuario:clave@observadorcubano.blogspot.com/")
        );
        assertNull(UrlPolicy.normalize("https://usuario:clave@observadorcubano.blogspot.com/"));
    }

    @Test
    public void nonStandardPortsAreBlocked() {
        assertEquals(
            UrlPolicy.Action.BLOCK,
            UrlPolicy.classify("https://observadorcubano.blogspot.com:8443/")
        );
        assertEquals(
            UrlPolicy.Action.BLOCK,
            UrlPolicy.classify("http://example.com:8080/")
        );
    }

    @Test
    public void dangerousSchemesAreBlocked() {
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("javascript:alert(1)"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("file:///etc/passwd"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("content://com.example/secret"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("intent://scan/#Intent;scheme=zxing;end"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("data:text/html,<h1>hola</h1>"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("blob:https://observadorcubano.blogspot.com/uuid"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("ftp://example.com/archivo"));
    }

    @Test
    public void allowedApplicationSchemesAreExternal() {
        assertEquals(UrlPolicy.Action.EXTERNAL_APP, UrlPolicy.classify("mailto:redaccion@example.com"));
        assertEquals(UrlPolicy.Action.EXTERNAL_APP, UrlPolicy.classify("tel:+5355555555"));
        assertEquals(UrlPolicy.Action.EXTERNAL_APP, UrlPolicy.classify("sms:+5355555555"));
        assertEquals(UrlPolicy.Action.EXTERNAL_APP, UrlPolicy.classify("whatsapp://send?text=hola"));
    }

    @Test
    public void externalHttpsIsExternalWeb() {
        assertEquals(
            UrlPolicy.Action.EXTERNAL_WEB,
            UrlPolicy.classify("https://t.me/share/url?url=https%3A%2F%2Fobservadorcubano.blogspot.com")
        );
    }

    @Test
    public void nullAndMalformedInputsAreBlocked() {
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify(null));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify(""));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("   "));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("https://"));
        assertEquals(UrlPolicy.Action.BLOCK, UrlPolicy.classify("no es una url"));
        assertNull(UrlPolicy.normalize(null));
    }

    @Test
    public void internalCheckRequiresHttps() {
        assertTrue(UrlPolicy.isInternal("https://observadorcubano.blogspot.com/"));
        assertFalse(UrlPolicy.isInternal("http://observadorcubano.blogspot.com/"));
    }
}
