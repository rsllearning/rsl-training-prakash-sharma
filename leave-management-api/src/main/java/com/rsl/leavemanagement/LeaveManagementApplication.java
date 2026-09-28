package com.rsl.leavemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point of the Leave Management API.
 *
 * <p>{@code @ConfigurationPropertiesScan} registers every {@code @ConfigurationProperties}
 * class found under this package (see {@code config.LeaveProperties}).</p>
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class LeaveManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeaveManagementApplication.class, args);
    }
}
