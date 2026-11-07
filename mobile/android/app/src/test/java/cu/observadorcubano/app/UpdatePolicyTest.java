package cu.observadorcubano.app;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class UpdatePolicyTest {

    private static final long NOW = 1_800_000_000_000L;

    @Test
    public void firstCheckAlwaysRuns() {
        assertTrue(UpdatePolicy.shouldCheck(NOW, 0L, false, false));
        assertTrue(UpdatePolicy.shouldCheck(NOW, 0L, true, false));
    }

    @Test
    public void respectsSixHourCache() {
        assertFalse(UpdatePolicy.shouldCheck(NOW, NOW - 60_000L, false, false));
        assertFalse(UpdatePolicy.shouldCheck(
            NOW,
            NOW - UpdatePolicy.CHECK_INTERVAL_MS + 1L,
            false,
            false
        ));
        assertTrue(UpdatePolicy.shouldCheck(
            NOW,
            NOW - UpdatePolicy.CHECK_INTERVAL_MS,
            false,
            false
        ));
    }

    @Test
    public void retriesSoonerAfterFailure() {
        assertFalse(UpdatePolicy.shouldCheck(NOW, NOW - 60_000L, true, false));
        assertTrue(UpdatePolicy.shouldCheck(
            NOW,
            NOW - UpdatePolicy.ERROR_RETRY_MS,
            true,
            false
        ));
    }

    @Test
    public void manualCheckIgnoresCache() {
        assertTrue(UpdatePolicy.shouldCheck(NOW, NOW - 1_000L, false, true));
        assertTrue(UpdatePolicy.shouldCheck(NOW, NOW - 1_000L, true, true));
    }

    @Test
    public void clockGoingBackwardsDoesNotBlockChecks() {
        assertTrue(UpdatePolicy.shouldCheck(NOW, NOW + 60_000L, false, false));
    }

    @Test
    public void notifiesOnlyOncePerVersion() {
        assertTrue(UpdatePolicy.shouldNotify("1.1.0", null, null));
        assertFalse(UpdatePolicy.shouldNotify("1.1.0", "1.1.0", null));
        assertTrue(UpdatePolicy.shouldNotify("1.2.0", "1.1.0", null));
        assertFalse(UpdatePolicy.shouldNotify("1.1.0", "1.0.0", "1.1.0"));
        assertFalse(UpdatePolicy.shouldNotify(null, null, null));
        assertFalse(UpdatePolicy.shouldNotify("", null, null));
    }
}
