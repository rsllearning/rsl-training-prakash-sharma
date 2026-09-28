package com.rsl.leavemanagement.service;

import com.rsl.leavemanagement.config.LeaveProperties;
import com.rsl.leavemanagement.dto.LeaveCreateRequest;
import com.rsl.leavemanagement.dto.LeaveResponse;
import com.rsl.leavemanagement.dto.LeaveUpdateRequest;
import com.rsl.leavemanagement.exception.InvalidLeaveRequestException;
import com.rsl.leavemanagement.exception.LeaveConflictException;
import com.rsl.leavemanagement.exception.LeaveNotFoundException;
import com.rsl.leavemanagement.model.LeaveRequest;
import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.model.LeaveType;
import com.rsl.leavemanagement.repository.LeaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link LeaveService}. The repository is mocked with Mockito and
 * the clock is fixed so date rules are deterministic.
 */
@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 1);
    private static final Clock FIXED_CLOCK =
            Clock.fixed(TODAY.atStartOfDay(ZoneOffset.UTC).toInstant(), ZoneId.of("UTC"));

    @Mock
    private LeaveRepository leaveRepository;

    private LeaveService leaveService;

    @BeforeEach
    void setUp() {
        leaveService = new LeaveService(leaveRepository, new LeaveProperties(10, false), FIXED_CLOCK);
    }

    private static LeaveRequest leave(Long id, String employeeId, LocalDate start, LocalDate end, LeaveStatus status) {
        LeaveRequest leave = new LeaveRequest(id, employeeId, LeaveType.CASUAL, start, end, "Personal work", status);
        leave.setCreatedAt(LocalDateTime.now(FIXED_CLOCK));
        leave.setUpdatedAt(LocalDateTime.now(FIXED_CLOCK));
        return leave;
    }

    private static LeaveCreateRequest createRequest(LocalDate start, LocalDate end) {
        return new LeaveCreateRequest("EMP001", LeaveType.SICK, start, end, "Medical appointment");
    }

    private static LeaveUpdateRequest updateRequest(LocalDate start, LocalDate end, LeaveStatus status) {
        return new LeaveUpdateRequest("EMP001", LeaveType.EARNED, start, end, "Updated reason", status);
    }

    @Nested
    @DisplayName("getAllLeaves")
    class GetAll {

        @Test
        void returnsAllLeavesMappedToResponses() {
            when(leaveRepository.findAll()).thenReturn(List.of(
                    leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING),
                    leave(2L, "EMP002", TODAY.plusDays(3), TODAY.plusDays(3), LeaveStatus.APPROVED)));

            List<LeaveResponse> result = leaveService.getAllLeaves();

            assertThat(result).extracting(LeaveResponse::id).containsExactly(1L, 2L);
            assertThat(result.get(0).numberOfDays()).isEqualTo(2);
            assertThat(result.get(1).numberOfDays()).isEqualTo(1);
        }

        @Test
        void returnsEmptyListWhenNoLeavesExist() {
            when(leaveRepository.findAll()).thenReturn(List.of());

            assertThat(leaveService.getAllLeaves()).isEmpty();
        }

        @Test
        void filtersByEmployeeAndStatus() {
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of(
                    leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING),
                    leave(3L, "EMP001", TODAY.plusDays(5), TODAY.plusDays(6), LeaveStatus.APPROVED)));

            List<LeaveResponse> result = leaveService.getAllLeaves(" EMP001 ", LeaveStatus.APPROVED);

            assertThat(result).extracting(LeaveResponse::id).containsExactly(3L);
            verify(leaveRepository, never()).findAll();
        }
    }

    @Nested
    @DisplayName("getLeaveById")
    class GetById {

        @Test
        void returnsLeaveWhenIdExists() {
            when(leaveRepository.findById(1L)).thenReturn(Optional.of(
                    leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING)));

            LeaveResponse response = leaveService.getLeaveById(1L);

            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.employeeId()).isEqualTo("EMP001");
            assertThat(response.status()).isEqualTo(LeaveStatus.PENDING);
        }

        @Test
        void throwsNotFoundWhenIdDoesNotExist() {
            when(leaveRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> leaveService.getLeaveById(99L))
                    .isInstanceOf(LeaveNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    @Nested
    @DisplayName("createLeave")
    class Create {

        @Test
        void createsPendingLeaveWithTimestamps() {
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of());
            when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> {
                LeaveRequest toSave = invocation.getArgument(0);
                toSave.setId(1L);
                return toSave;
            });

            LeaveResponse response = leaveService.createLeave(createRequest(TODAY.plusDays(2), TODAY.plusDays(4)));

            ArgumentCaptor<LeaveRequest> captor = ArgumentCaptor.forClass(LeaveRequest.class);
            verify(leaveRepository).save(captor.capture());
            LeaveRequest saved = captor.getValue();
            assertThat(saved.getStatus()).isEqualTo(LeaveStatus.PENDING);
            assertThat(saved.getCreatedAt()).isEqualTo(LocalDateTime.now(FIXED_CLOCK));
            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.leaveType()).isEqualTo(LeaveType.SICK);
            assertThat(response.numberOfDays()).isEqualTo(3);
        }

        @Test
        void allowsLeaveStartingToday() {
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of());
            when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            LeaveResponse response = leaveService.createLeave(createRequest(TODAY, TODAY));

            assertThat(response.startDate()).isEqualTo(TODAY);
        }

        @Test
        void rejectsEndDateBeforeStartDate() {
            assertThatThrownBy(() -> leaveService.createLeave(createRequest(TODAY.plusDays(5), TODAY.plusDays(4))))
                    .isInstanceOf(InvalidLeaveRequestException.class)
                    .hasMessageContaining("endDate");
            verify(leaveRepository, never()).save(any());
        }

        @Test
        void rejectsLeaveLongerThanConfiguredMaximum() {
            // max-days-per-request is 10 in this test; this range is 11 days.
            assertThatThrownBy(() -> leaveService.createLeave(createRequest(TODAY.plusDays(1), TODAY.plusDays(11))))
                    .isInstanceOf(InvalidLeaveRequestException.class)
                    .hasMessageContaining("exceeds the maximum of 10 days");
            verify(leaveRepository, never()).save(any());
        }

        @Test
        void rejectsBackdatedLeaveWhenNotAllowed() {
            assertThatThrownBy(() -> leaveService.createLeave(createRequest(TODAY.minusDays(1), TODAY)))
                    .isInstanceOf(InvalidLeaveRequestException.class)
                    .hasMessageContaining("past");
        }

        @Test
        void allowsBackdatedLeaveWhenEnabledInConfiguration() {
            LeaveService lenientService =
                    new LeaveService(leaveRepository, new LeaveProperties(10, true), FIXED_CLOCK);
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of());
            when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            LeaveResponse response = lenientService.createLeave(createRequest(TODAY.minusDays(2), TODAY.minusDays(1)));

            assertThat(response.startDate()).isEqualTo(TODAY.minusDays(2));
        }

        @Test
        void rejectsLeaveOverlappingAnActiveLeaveOfSameEmployee() {
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of(
                    leave(7L, "EMP001", TODAY.plusDays(3), TODAY.plusDays(5), LeaveStatus.APPROVED)));

            assertThatThrownBy(() -> leaveService.createLeave(createRequest(TODAY.plusDays(5), TODAY.plusDays(6))))
                    .isInstanceOf(LeaveConflictException.class)
                    .hasMessageContaining("id=7");
            verify(leaveRepository, never()).save(any());
        }

        @Test
        void ignoresOverlapWithRejectedOrCancelledLeave() {
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of(
                    leave(7L, "EMP001", TODAY.plusDays(3), TODAY.plusDays(5), LeaveStatus.REJECTED),
                    leave(8L, "EMP001", TODAY.plusDays(3), TODAY.plusDays(5), LeaveStatus.CANCELLED)));
            when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            LeaveResponse response = leaveService.createLeave(createRequest(TODAY.plusDays(3), TODAY.plusDays(5)));

            assertThat(response.status()).isEqualTo(LeaveStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("updateLeave")
    class Update {

        @Test
        void updatesAllFieldsOfPendingLeave() {
            LeaveRequest existing = leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING);
            when(leaveRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of(existing));
            when(leaveRepository.save(existing)).thenReturn(existing);

            LeaveResponse response = leaveService.updateLeave(1L,
                    updateRequest(TODAY.plusDays(2), TODAY.plusDays(4), LeaveStatus.APPROVED));

            assertThat(response.leaveType()).isEqualTo(LeaveType.EARNED);
            assertThat(response.startDate()).isEqualTo(TODAY.plusDays(2));
            assertThat(response.endDate()).isEqualTo(TODAY.plusDays(4));
            assertThat(response.reason()).isEqualTo("Updated reason");
            assertThat(response.status()).isEqualTo(LeaveStatus.APPROVED);
        }

        @Test
        void throwsNotFoundWhenUpdatingMissingLeave() {
            when(leaveRepository.findById(42L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> leaveService.updateLeave(42L,
                    updateRequest(TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING)))
                    .isInstanceOf(LeaveNotFoundException.class);
            verify(leaveRepository, never()).save(any());
        }

        @Test
        void rejectsUpdateOfFinalizedLeave() {
            LeaveRequest approved = leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.APPROVED);
            when(leaveRepository.findById(1L)).thenReturn(Optional.of(approved));

            assertThatThrownBy(() -> leaveService.updateLeave(1L,
                    updateRequest(TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.CANCELLED)))
                    .isInstanceOf(LeaveConflictException.class)
                    .hasMessageContaining("APPROVED");
            verify(leaveRepository, never()).save(any());
        }

        @Test
        void rejectsUpdateOverlappingAnotherLeaveButNotItself() {
            LeaveRequest self = leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING);
            LeaveRequest other = leave(2L, "EMP001", TODAY.plusDays(10), TODAY.plusDays(12), LeaveStatus.PENDING);
            when(leaveRepository.findById(1L)).thenReturn(Optional.of(self));
            when(leaveRepository.findByEmployeeId("EMP001")).thenReturn(List.of(self, other));

            assertThatThrownBy(() -> leaveService.updateLeave(1L,
                    updateRequest(TODAY.plusDays(2), TODAY.plusDays(10), LeaveStatus.PENDING)))
                    .isInstanceOf(LeaveConflictException.class)
                    .hasMessageContaining("id=2");
        }

        @Test
        void doesNotMutateStoredLeaveWhenValidationFails() {
            LeaveRequest existing = leave(1L, "EMP001", TODAY.plusDays(1), TODAY.plusDays(2), LeaveStatus.PENDING);
            when(leaveRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> leaveService.updateLeave(1L,
                    updateRequest(TODAY.plusDays(1), TODAY.plusDays(30), LeaveStatus.PENDING)))
                    .isInstanceOf(InvalidLeaveRequestException.class);
            assertThat(existing.getEndDate()).isEqualTo(TODAY.plusDays(2));
            assertThat(existing.getLeaveType()).isEqualTo(LeaveType.CASUAL);
        }
    }

    @Nested
    @DisplayName("deleteLeave")
    class Delete {

        @Test
        void deletesExistingLeave() {
            when(leaveRepository.existsById(1L)).thenReturn(true);

            leaveService.deleteLeave(1L);

            verify(leaveRepository).deleteById(1L);
        }

        @Test
        void throwsNotFoundWhenDeletingMissingLeave() {
            when(leaveRepository.existsById(5L)).thenReturn(false);

            assertThatThrownBy(() -> leaveService.deleteLeave(5L))
                    .isInstanceOf(LeaveNotFoundException.class);
            verify(leaveRepository, never()).deleteById(any());
        }
    }
}
