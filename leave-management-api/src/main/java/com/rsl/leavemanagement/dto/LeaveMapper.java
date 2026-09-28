package com.rsl.leavemanagement.dto;

import com.rsl.leavemanagement.model.LeaveRequest;
import com.rsl.leavemanagement.model.LeaveStatus;

import java.time.temporal.ChronoUnit;

/**
 * Converts between request/response DTOs and the {@link LeaveRequest} model.
 */
public final class LeaveMapper {

    private LeaveMapper() {
    }

    public static LeaveRequest toModel(LeaveCreateRequest request) {
        return new LeaveRequest(
                null,
                request.employeeId().trim(),
                request.leaveType(),
                request.startDate(),
                request.endDate(),
                request.reason().trim(),
                LeaveStatus.PENDING);
    }

    public static void applyUpdate(LeaveRequest target, LeaveUpdateRequest request) {
        target.setEmployeeId(request.employeeId().trim());
        target.setLeaveType(request.leaveType());
        target.setStartDate(request.startDate());
        target.setEndDate(request.endDate());
        target.setReason(request.reason().trim());
        target.setStatus(request.status());
    }

    public static LeaveResponse toResponse(LeaveRequest leave) {
        return new LeaveResponse(
                leave.getId(),
                leave.getEmployeeId(),
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1,
                leave.getReason(),
                leave.getStatus(),
                leave.getCreatedAt(),
                leave.getUpdatedAt());
    }
}
