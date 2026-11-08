package cu.observadorcubano.app;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.io.InterruptedIOException;
import java.net.ConnectException;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

import javax.net.ssl.SSLException;

import org.junit.Test;

public class UpdateManagerTest {

    @Test
    public void detectsNetworkFailuresWithoutShowingRawSystemMessages() {
        assertTrue(UpdateManager.isNetworkFailure(new UnknownHostException("api.github.com")));
        assertTrue(UpdateManager.isNetworkFailure(new SocketTimeoutException("timeout")));
        assertTrue(UpdateManager.isNetworkFailure(new ConnectException("refused")));
        assertTrue(UpdateManager.isNetworkFailure(new SocketException("reset")));
        assertTrue(UpdateManager.isNetworkFailure(new SSLException("handshake")));
        assertTrue(UpdateManager.isNetworkFailure(new InterruptedIOException("interrupted")));
    }

    @Test
    public void keepsApplicationMessages() {
        assertFalse(UpdateManager.isNetworkFailure(
            new IOException("La descarga no coincide con el SHA-256 publicado.")
        ));
        assertFalse(UpdateManager.isNetworkFailure(
            new IOException("El APK descargado no corresponde a esta aplicación.")
        ));
        assertFalse(UpdateManager.isNetworkFailure(new IllegalStateException("interno")));
    }
}
