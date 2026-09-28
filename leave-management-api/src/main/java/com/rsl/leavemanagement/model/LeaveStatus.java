package com.rsl.leavemanagement.model;

/**
 * Lifecycle status of a leave request.
 *
 * <p>A request starts as {@link #PENDING}. Once it is {@link #APPROVED},
 * {@link #REJECTED} or {@link #CANCELLED} it is considered final and can no
 * longer be modified.</p>
 */
public enum LeaveStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED;

    public boolean isFinal() {
        return this != PENDING;
    }
}
