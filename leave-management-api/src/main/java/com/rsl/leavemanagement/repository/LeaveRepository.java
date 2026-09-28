package com.rsl.leavemanagement.repository;

import com.rsl.leavemanagement.model.LeaveRequest;

import java.util.List;
import java.util.Optional;

/**
 * Persistence abstraction for leave requests. The service layer depends only on
 * this interface, so the in-memory implementation can later be replaced by a
 * Spring Data JPA repository without touching business logic.
 */
public interface LeaveRepository {

    List<LeaveRequest> findAll();

    Optional<LeaveRequest> findById(Long id);

    List<LeaveRequest> findByEmployeeId(String employeeId);

    /**
     * Inserts the leave request when its id is {@code null} (a new id is generated),
     * otherwise replaces the stored request having the same id.
     */
    LeaveRequest save(LeaveRequest leaveRequest);

    boolean existsById(Long id);

    void deleteById(Long id);

    void deleteAll();
}
