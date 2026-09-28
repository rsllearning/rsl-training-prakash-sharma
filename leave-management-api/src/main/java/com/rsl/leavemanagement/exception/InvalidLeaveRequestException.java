package com.rsl.leavemanagement.exception;

/**
 * Thrown when a request is well-formed but breaks a business rule
 * (for example, it exceeds the maximum allowed days). Mapped to HTTP 400.
 */
public class InvalidLeaveRequestException extends RuntimeException {

    public InvalidLeaveRequestException(String message) {
        super(message);
    }
}
