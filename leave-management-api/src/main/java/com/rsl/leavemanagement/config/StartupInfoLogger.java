package com.rsl.leavemanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Logs a one-line summary once the application is ready to serve requests.
 * Demonstrates reading single values with {@code @Value}.
 */
@Component
public class StartupInfoLogger {

    private static final Logger log = LoggerFactory.getLogger(StartupInfoLogger.class);

    private final String applicationName;
    private final Environment environment;
    private final LeaveProperties leaveProperties;

    public StartupInfoLogger(@Value("${spring.application.name}") String applicationName,
                             Environment environment,
                             LeaveProperties leaveProperties) {
        this.applicationName = applicationName;
        this.environment = environment;
        this.leaveProperties = leaveProperties;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupInfo() {
        String[] active = environment.getActiveProfiles();
        String profiles = active.length == 0 ? Arrays.toString(environment.getDefaultProfiles())
                : Arrays.toString(active);
        log.info("{} is up on port {} | profiles={} | maxDaysPerRequest={} | allowBackdatedRequests={}",
                applicationName,
                environment.getProperty("local.server.port", environment.getProperty("server.port", "8080")),
                profiles,
                leaveProperties.maxDaysPerRequest(),
                leaveProperties.allowBackdatedRequests());
    }
}
