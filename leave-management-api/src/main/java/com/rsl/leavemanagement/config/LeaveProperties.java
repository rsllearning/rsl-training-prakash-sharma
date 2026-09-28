package com.rsl.leavemanagement.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/**
 * Type-safe binding of the {@code app.leave.*} properties from application.yml
 * (and the active profile's file).
 *
 * @param maxDaysPerRequest      maximum calendar days a single leave request may span
 * @param allowBackdatedRequests whether a new leave may start in the past
 */
@Validated
@ConfigurationProperties(prefix = "app.leave")
public record LeaveProperties(

        @DefaultValue("30")
        @Min(1) @Max(365)
        int maxDaysPerRequest,

        @DefaultValue("false")
        boolean allowBackdatedRequests
) {
}
