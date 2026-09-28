package com.rsl.leavemanagement.dto;

import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.model.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representation of a leave request returned to API clients.
 *
 * @param numberOfDays calendar days covered by the leave, both dates inclusive
 */
public record LeaveResponse(
        Long id,
        String employeeId,
        LeaveType leaveType,
        LocalDate startDate,
        LocalDate endDate,
        long numberOfDays,
        String reason,
        LeaveStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
