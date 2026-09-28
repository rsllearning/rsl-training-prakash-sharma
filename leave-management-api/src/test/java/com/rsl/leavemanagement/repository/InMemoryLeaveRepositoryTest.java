package com.rsl.leavemanagement.repository;

import com.rsl.leavemanagement.model.LeaveRequest;
import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.model.LeaveType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class InMemoryLeaveRepositoryTest {

    private InMemoryLeaveRepository repository;

    @BeforeEach
    void setUp() {
        repository = new InMemoryLeaveRepository();
    }

    private static LeaveRequest newLeave(String employeeId) {
        return new LeaveRequest(null, employeeId, LeaveType.CASUAL,
                LocalDate.of(2026, 10, 5), LocalDate.of(2026, 10, 6), "Personal work", LeaveStatus.PENDING);
    }

    @Test
    void saveAssignsSequentialIds() {
        LeaveRequest first = repository.save(newLeave("EMP001"));
        LeaveRequest second = repository.save(newLeave("EMP002"));

        assertThat(first.getId()).isEqualTo(1L);
        assertThat(second.getId()).isEqualTo(2L);
        assertThat(repository.findAll()).hasSize(2);
    }

    @Test
    void saveWithExistingIdReplacesEntry() {
        LeaveRequest saved = repository.save(newLeave("EMP001"));
        saved.setStatus(LeaveStatus.APPROVED);

        repository.save(saved);

        assertThat(repository.findAll()).hasSize(1);
        assertThat(repository.findById(saved.getId())).get()
                .extracting(LeaveRequest::getStatus).isEqualTo(LeaveStatus.APPROVED);
    }

    @Test
    void findByIdReturnsEmptyForUnknownOrNullId() {
        assertThat(repository.findById(123L)).isEmpty();
        assertThat(repository.findById(null)).isEmpty();
    }

    @Test
    void findByEmployeeIdIsCaseInsensitive() {
        repository.save(newLeave("EMP001"));
        repository.save(newLeave("EMP002"));
        repository.save(newLeave("EMP001"));

        List<LeaveRequest> result = repository.findByEmployeeId("emp001");

        assertThat(result).extracting(LeaveRequest::getId).containsExactly(1L, 3L);
    }

    @Test
    void deleteByIdRemovesEntry() {
        LeaveRequest saved = repository.save(newLeave("EMP001"));

        repository.deleteById(saved.getId());

        assertThat(repository.existsById(saved.getId())).isFalse();
        assertThat(repository.findAll()).isEmpty();
    }

    @Test
    void deleteAllClearsStoreAndResetsIds() {
        repository.save(newLeave("EMP001"));
        repository.deleteAll();

        assertThat(repository.findAll()).isEmpty();
        assertThat(repository.save(newLeave("EMP001")).getId()).isEqualTo(1L);
    }

    @Test
    void concurrentSavesProduceUniqueIds() throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        IntStream.range(0, 500).forEach(i -> pool.submit(() -> repository.save(newLeave("EMP" + (i % 10 + 100)))));
        pool.shutdown();
        assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(repository.findAll()).hasSize(500);
        assertThat(repository.findAll()).extracting(LeaveRequest::getId).doesNotHaveDuplicates();
    }
}
