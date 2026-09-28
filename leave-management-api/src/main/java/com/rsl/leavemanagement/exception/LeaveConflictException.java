package com.rsl.leavemanagement.exception;

/**
 * Thrown when a request conflicts with the current state of the data: an
 * overlapping leave for the same employee, or an attempt to modify a leave that
 * has already been finalized. Mapped to HTTP 409.
 */
public class LeaveConflictException extends RuntimeException {

    public LeaveConflictException(String message) {
        super(message);
    }
}
