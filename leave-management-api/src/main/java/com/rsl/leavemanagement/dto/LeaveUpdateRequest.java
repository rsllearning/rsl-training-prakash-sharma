package com.rsl.leavemanagement.dto;

import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.model.LeaveType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload for {@code PUT /leaves/{id}}. PUT replaces the whole resource, so every
 * field (including status) is required.
 */
@ValidDateRange
public record LeaveUpdateRequest(

        @NotBlank(message = "employeeId is required")
        @Pattern(regexp = "^[A-Za-z0-9-]{3,20}$",
                message = "employeeId must be 3-20 characters: letters, digits or hyphens")
        String employeeId,

        @NotNull(message = "leaveType is required")
        LeaveType leaveType,

        @NotNull(message = "startDate is required")
        LocalDate startDate,

        @NotNull(message = "endDate is required")
        LocalDate endDate,

        @NotBlank(message = "reason is required")
        @Size(min = 5, max = 500, message = "reason must be between 5 and 500 characters")
        String reason,

        @NotNull(message = "status is required")
        LeaveStatus status

) implements DateRange {
}
