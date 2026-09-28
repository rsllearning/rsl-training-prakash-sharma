package com.rsl.leavemanagement.repository;

import com.rsl.leavemanagement.model.LeaveRequest;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe in-memory implementation of {@link LeaveRepository} backed by a
 * {@link ConcurrentHashMap}. Data is lost when the application stops.
 */
@Repository
public class InMemoryLeaveRepository implements LeaveRepository {

    private final Map<Long, LeaveRequest> store = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    @Override
    public List<LeaveRequest> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(LeaveRequest::getId))
                .toList();
    }

    @Override
    public Optional<LeaveRequest> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<LeaveRequest> findByEmployeeId(String employeeId) {
        return store.values().stream()
                .filter(leave -> leave.getEmployeeId().equalsIgnoreCase(employeeId))
                .sorted(Comparator.comparing(LeaveRequest::getId))
                .toList();
    }

    @Override
    public LeaveRequest save(LeaveRequest leaveRequest) {
        if (leaveRequest.getId() == null) {
            leaveRequest.setId(idSequence.incrementAndGet());
        }
        store.put(leaveRequest.getId(), leaveRequest);
        return leaveRequest;
    }

    @Override
    public boolean existsById(Long id) {
        return id != null && store.containsKey(id);
    }

    @Override
    public void deleteById(Long id) {
        if (id != null) {
            store.remove(id);
        }
    }

    @Override
    public void deleteAll() {
        store.clear();
        idSequence.set(0);
    }
}
