package com.rsl.leavemanagement;

import com.rsl.leavemanagement.config.LeaveProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the full application context starts with the {@code test} profile
 * and that profile-specific beans/properties are applied.
 */
@SpringBootTest
@ActiveProfiles("test")
class LeaveManagementApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private LeaveProperties leaveProperties;

    @Test
    void contextLoads() {
        assertThat(context).isNotNull();
    }

    @Test
    void testProfilePropertiesAreBound() {
        assertThat(leaveProperties.maxDaysPerRequest()).isEqualTo(30);
        assertThat(leaveProperties.allowBackdatedRequests()).isFalse();
    }

    @Test
    void devOnlySeederIsNotLoadedInTestProfile() {
        assertThat(context.containsBean("seedLeaveRequests")).isFalse();
    }
}
