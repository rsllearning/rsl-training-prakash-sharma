package com.rsl.leavemanagement.config;

import com.rsl.leavemanagement.model.LeaveRequest;
import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.model.LeaveType;
import com.rsl.leavemanagement.repository.LeaveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Loaded only with the {@code dev} profile: seeds a few sample leave requests so
 * the API returns data immediately after startup.
 */
@Configuration
@Profile("dev")
public class DevDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);

    @Bean
    public CommandLineRunner seedLeaveRequests(LeaveRepository repository, Clock clock) {
        return args -> {
            LocalDate today = LocalDate.now(clock);
            LocalDateTime now = LocalDateTime.now(clock);

            save(repository, now, new LeaveRequest(null, "EMP001", LeaveType.CASUAL,
                    today.plusDays(7), today.plusDays(8), "Family function in hometown", LeaveStatus.PENDING));
            save(repository, now, new LeaveRequest(null, "EMP002", LeaveType.SICK,
                    today.minusDays(3), today.minusDays(2), "Fever and doctor's advice to rest", LeaveStatus.APPROVED));
            save(repository, now, new LeaveRequest(null, "EMP003", LeaveType.EARNED,
                    today.plusDays(30), today.plusDays(39), "Planned vacation with family", LeaveStatus.PENDING));

            log.info("[dev] Seeded {} sample leave requests", repository.findAll().size());
        };
    }

    private static void save(LeaveRepository repository, LocalDateTime now, LeaveRequest leave) {
        leave.setCreatedAt(now);
        leave.setUpdatedAt(now);
        repository.save(leave);
    }
}
