package com.rsl.leavemanagement.service;

import com.rsl.leavemanagement.config.LeaveProperties;
import com.rsl.leavemanagement.dto.LeaveCreateRequest;
import com.rsl.leavemanagement.dto.LeaveMapper;
import com.rsl.leavemanagement.dto.LeaveResponse;
import com.rsl.leavemanagement.dto.LeaveUpdateRequest;
import com.rsl.leavemanagement.exception.InvalidLeaveRequestException;
import com.rsl.leavemanagement.exception.LeaveConflictException;
import com.rsl.leavemanagement.exception.LeaveNotFoundException;
import com.rsl.leavemanagement.model.LeaveRequest;
import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.repository.LeaveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

/**
 * Business logic for leave requests.
 *
 * <p>Business rules enforced here (beyond Bean Validation on the DTOs):</p>
 * <ul>
 *   <li>endDate must not be before startDate;</li>
 *   <li>a leave may span at most {@code app.leave.max-days-per-request} days;</li>
 *   <li>a new leave may not start in the past unless {@code app.leave.allow-backdated-requests} is true;</li>
 *   <li>an employee cannot have two active (PENDING/APPROVED) leaves with overlapping dates;</li>
 *   <li>a leave that is APPROVED, REJECTED or CANCELLED is final and cannot be updated.</li>
 * </ul>
 */
@Service
public class LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveService.class);

    private final LeaveRepository leaveRepository;
    private final LeaveProperties leaveProperties;
    private final Clock clock;

    // Constructor-based dependency injection (no @Autowired needed with a single constructor).
    public LeaveService(LeaveRepository leaveRepository, LeaveProperties leaveProperties, Clock clock) {
        this.leaveRepository = leaveRepository;
        this.leaveProperties = leaveProperties;
        this.clock = clock;
    }

    /**
     * Returns all leave requests, optionally filtered by employee and/or status.
     */
    public List<LeaveResponse> getAllLeaves(String employeeId, LeaveStatus status) {
        List<LeaveRequest> leaves = (employeeId == null || employeeId.isBlank())
                ? leaveRepository.findAll()
                : leaveRepository.findByEmployeeId(employeeId.trim());
        return leaves.stream()
                .filter(leave -> status == null || leave.getStatus() == status)
                .map(LeaveMapper::toResponse)
                .toList();
    }

    public List<LeaveResponse> getAllLeaves() {
        return getAllLeaves(null, null);
    }

    public LeaveResponse getLeaveById(Long id) {
        return LeaveMapper.toResponse(findExisting(id));
    }

    public LeaveResponse createLeave(LeaveCreateRequest request) {
        LeaveRequest leave = LeaveMapper.toModel(request);

        validateDates(leave.getStartDate(), leave.getEndDate());
        if (!leaveProperties.allowBackdatedRequests() && leave.getStartDate().isBefore(today())) {
            throw new InvalidLeaveRequestException("startDate cannot be in the past");
        }
        ensureNoOverlap(leave.getEmployeeId(), leave.getStartDate(), leave.getEndDate(), null);

        LocalDateTime now = LocalDateTime.now(clock);
        leave.setCreatedAt(now);
        leave.setUpdatedAt(now);

        LeaveRequest saved = leaveRepository.save(leave);
        log.info("Created leave request id={} for employee={}", saved.getId(), saved.getEmployeeId());
        return LeaveMapper.toResponse(saved);
    }

    public LeaveResponse updateLeave(Long id, LeaveUpdateRequest request) {
        LeaveRequest existing = findExisting(id);

        if (existing.getStatus().isFinal()) {
            throw new LeaveConflictException("Leave request " + id + " is already " + existing.getStatus()
                    + " and can no longer be modified");
        }
        validateDates(request.startDate(), request.endDate());
        if (isActive(request.status())) {
            ensureNoOverlap(request.employeeId().trim(), request.startDate(), request.endDate(), id);
        }

        // All checks passed: only now mutate the stored object.
        LeaveMapper.applyUpdate(existing, request);
        existing.setUpdatedAt(LocalDateTime.now(clock));

        LeaveRequest saved = leaveRepository.save(existing);
        log.info("Updated leave request id={} (status={})", saved.getId(), saved.getStatus());
        return LeaveMapper.toResponse(saved);
    }

    public void deleteLeave(Long id) {
        if (!leaveRepository.existsById(id)) {
            throw new LeaveNotFoundException(id);
        }
        leaveRepository.deleteById(id);
        log.info("Deleted leave request id={}", id);
    }

    // ---------------------------------------------------------------- helpers

    private LeaveRequest findExisting(Long id) {
        return leaveRepository.findById(id).orElseThrow(() -> new LeaveNotFoundException(id));
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new InvalidLeaveRequestException("endDate must be on or after startDate");
        }
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days > leaveProperties.maxDaysPerRequest()) {
            throw new InvalidLeaveRequestException("Leave duration of " + days + " days exceeds the maximum of "
                    + leaveProperties.maxDaysPerRequest() + " days per request");
        }
    }

    private void ensureNoOverlap(String employeeId, LocalDate startDate, LocalDate endDate, Long excludeId) {
        leaveRepository.findByEmployeeId(employeeId).stream()
                .filter(other -> !Objects.equals(other.getId(), excludeId))
                .filter(other -> isActive(other.getStatus()))
                .filter(other -> !other.getStartDate().isAfter(endDate) && !other.getEndDate().isBefore(startDate))
                .findFirst()
                .ifPresent(other -> {
                    throw new LeaveConflictException("Employee " + employeeId
                            + " already has an overlapping leave request (id=" + other.getId() + ", "
                            + other.getStartDate() + " to " + other.getEndDate() + ")");
                });
    }

    private static boolean isActive(LeaveStatus status) {
        return status == LeaveStatus.PENDING || status == LeaveStatus.APPROVED;
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
