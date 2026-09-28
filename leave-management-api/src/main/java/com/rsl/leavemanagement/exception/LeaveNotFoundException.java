package com.rsl.leavemanagement.exception;

/**
 * Thrown when no leave request exists for the given id. Mapped to HTTP 404.
 */
public class LeaveNotFoundException extends RuntimeException {

    private final Long leaveId;

    public LeaveNotFoundException(Long leaveId) {
        super("Leave request not found with id: " + leaveId);
        this.leaveId = leaveId;
    }

    public Long getLeaveId() {
        return leaveId;
    }
}
