package com.rsl.leavemanagement.controller;

import com.rsl.leavemanagement.dto.LeaveCreateRequest;
import com.rsl.leavemanagement.dto.LeaveResponse;
import com.rsl.leavemanagement.dto.LeaveUpdateRequest;
import com.rsl.leavemanagement.exception.InvalidLeaveRequestException;
import com.rsl.leavemanagement.exception.LeaveConflictException;
import com.rsl.leavemanagement.exception.LeaveNotFoundException;
import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.model.LeaveType;
import com.rsl.leavemanagement.service.LeaveService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for {@link LeaveController} using MockMvc. Only the MVC slice
 * (controller + {@code GlobalExceptionHandler} + Jackson + validation) is loaded;
 * the service is mocked.
 */
@WebMvcTest(LeaveController.class)
class LeaveControllerTest {

    private static final LocalDate START = LocalDate.of(2026, 10, 5);
    private static final LocalDate END = LocalDate.of(2026, 10, 7);

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeaveService leaveService;

    private static LeaveResponse response(long id, LeaveStatus status) {
        LocalDateTime now = LocalDateTime.of(2026, 10, 1, 10, 0);
        return new LeaveResponse(id, "EMP001", LeaveType.CASUAL, START, END, 3,
                "Family function", status, now, now);
    }

    private static final String VALID_CREATE_JSON = """
            {
              "employeeId": "EMP001",
              "leaveType": "CASUAL",
              "startDate": "2026-10-05",
              "endDate": "2026-10-07",
              "reason": "Family function"
            }
            """;

    private static final String VALID_UPDATE_JSON = """
            {
              "employeeId": "EMP001",
              "leaveType": "CASUAL",
              "startDate": "2026-10-05",
              "endDate": "2026-10-07",
              "reason": "Family function",
              "status": "APPROVED"
            }
            """;

    // ------------------------------------------------------------ GET /leaves

    @Test
    void getAllLeavesReturnsList() throws Exception {
        when(leaveService.getAllLeaves(isNull(), isNull()))
                .thenReturn(List.of(response(1, LeaveStatus.PENDING), response(2, LeaveStatus.APPROVED)));

        mockMvc.perform(get("/leaves"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].startDate").value("2026-10-05"))
                .andExpect(jsonPath("$[1].status").value("APPROVED"));
    }

    @Test
    void getAllLeavesReturnsEmptyArrayWhenNone() throws Exception {
        when(leaveService.getAllLeaves(isNull(), isNull())).thenReturn(List.of());

        mockMvc.perform(get("/leaves"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getAllLeavesPassesFiltersToService() throws Exception {
        when(leaveService.getAllLeaves("EMP001", LeaveStatus.PENDING))
                .thenReturn(List.of(response(1, LeaveStatus.PENDING)));

        mockMvc.perform(get("/leaves").param("employeeId", "EMP001").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getAllLeavesWithInvalidStatusFilterReturns400() throws Exception {
        mockMvc.perform(get("/leaves").param("status", "UNKNOWN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Allowed values")));
    }

    // ------------------------------------------------------- GET /leaves/{id}

    @Test
    void getLeaveByIdReturnsLeave() throws Exception {
        when(leaveService.getLeaveById(1L)).thenReturn(response(1, LeaveStatus.PENDING));

        mockMvc.perform(get("/leaves/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.employeeId").value("EMP001"))
                .andExpect(jsonPath("$.leaveType").value("CASUAL"))
                .andExpect(jsonPath("$.numberOfDays").value(3))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getLeaveByIdReturns404WhenMissing() throws Exception {
        when(leaveService.getLeaveById(99L)).thenThrow(new LeaveNotFoundException(99L));

        mockMvc.perform(get("/leaves/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Leave request not found with id: 99"))
                .andExpect(jsonPath("$.path").value("/leaves/99"));
    }

    @Test
    void getLeaveByIdReturns400ForNonNumericId() throws Exception {
        mockMvc.perform(get("/leaves/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("'abc'")));
    }

    // ---------------------------------------------------------- POST /leaves

    @Test
    void createLeaveReturns201WithLocationHeader() throws Exception {
        when(leaveService.createLeave(any(LeaveCreateRequest.class))).thenReturn(response(1, LeaveStatus.PENDING));

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(VALID_CREATE_JSON))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/leaves/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createLeaveWithMissingFieldsReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors", hasSize(5)))
                .andExpect(jsonPath("$.errors[*].field", hasItem("employeeId")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("leaveType")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("startDate")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("endDate")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("reason")));

        verify(leaveService, never()).createLeave(any());
    }

    @Test
    void createLeaveWithEndDateBeforeStartDateReturns400() throws Exception {
        String json = """
                {"employeeId":"EMP001","leaveType":"SICK","startDate":"2026-10-07",
                 "endDate":"2026-10-05","reason":"Medical appointment"}
                """;

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("endDate"))
                .andExpect(jsonPath("$.errors[0].message").value("endDate must be on or after startDate"));
    }

    @Test
    void createLeaveWithInvalidEmployeeIdAndShortReasonReturns400() throws Exception {
        String json = """
                {"employeeId":"E@","leaveType":"SICK","startDate":"2026-10-05",
                 "endDate":"2026-10-05","reason":"ill"}
                """;

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors", hasSize(2)))
                .andExpect(jsonPath("$.errors[*].field", hasItem("employeeId")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("reason")));
    }

    @Test
    void createLeaveWithUnknownLeaveTypeReturns400() throws Exception {
        String json = VALID_CREATE_JSON.replace("\"CASUAL\"", "\"VACATION\"");

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("leaveType")))
                .andExpect(jsonPath("$.message", containsString("Allowed values")));
    }

    @Test
    void createLeaveWithBadDateFormatReturns400() throws Exception {
        String json = VALID_CREATE_JSON.replace("\"2026-10-05\"", "\"05/10/2026\"");

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("startDate")))
                .andExpect(jsonPath("$.message", containsString("yyyy-MM-dd")));
    }

    @Test
    void createLeaveWithMalformedJsonReturns400() throws Exception {
        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content("{ not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request"));
    }

    @Test
    void createLeaveReturns400WhenBusinessRuleFails() throws Exception {
        when(leaveService.createLeave(any(LeaveCreateRequest.class)))
                .thenThrow(new InvalidLeaveRequestException("startDate cannot be in the past"));

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(VALID_CREATE_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("startDate cannot be in the past"));
    }

    @Test
    void createLeaveReturns409WhenOverlapping() throws Exception {
        when(leaveService.createLeave(any(LeaveCreateRequest.class)))
                .thenThrow(new LeaveConflictException("Employee EMP001 already has an overlapping leave request"));

        mockMvc.perform(post("/leaves").contentType(MediaType.APPLICATION_JSON).content(VALID_CREATE_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void createLeaveWithWrongContentTypeReturns415() throws Exception {
        mockMvc.perform(post("/leaves").contentType(MediaType.TEXT_PLAIN).content("hello"))
                .andExpect(status().isUnsupportedMediaType());
    }

    // ------------------------------------------------------- PUT /leaves/{id}

    @Test
    void updateLeaveReturns200() throws Exception {
        when(leaveService.updateLeave(eq(1L), any(LeaveUpdateRequest.class)))
                .thenReturn(response(1, LeaveStatus.APPROVED));

        mockMvc.perform(put("/leaves/1").contentType(MediaType.APPLICATION_JSON).content(VALID_UPDATE_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void updateLeaveWithoutStatusReturns400() throws Exception {
        mockMvc.perform(put("/leaves/1").contentType(MediaType.APPLICATION_JSON).content(VALID_CREATE_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("status"));

        verify(leaveService, never()).updateLeave(any(), any());
    }

    @Test
    void updateLeaveReturns404WhenMissing() throws Exception {
        when(leaveService.updateLeave(eq(99L), any(LeaveUpdateRequest.class)))
                .thenThrow(new LeaveNotFoundException(99L));

        mockMvc.perform(put("/leaves/99").contentType(MediaType.APPLICATION_JSON).content(VALID_UPDATE_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateLeaveReturns409WhenLeaveIsFinal() throws Exception {
        when(leaveService.updateLeave(eq(1L), any(LeaveUpdateRequest.class)))
                .thenThrow(new LeaveConflictException("Leave request 1 is already APPROVED and can no longer be modified"));

        mockMvc.perform(put("/leaves/1").contentType(MediaType.APPLICATION_JSON).content(VALID_UPDATE_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already APPROVED")));
    }

    // ---------------------------------------------------- DELETE /leaves/{id}

    @Test
    void deleteLeaveReturns204() throws Exception {
        mockMvc.perform(delete("/leaves/1"))
                .andExpect(status().isNoContent());

        verify(leaveService).deleteLeave(1L);
    }

    @Test
    void deleteLeaveReturns404WhenMissing() throws Exception {
        doThrow(new LeaveNotFoundException(99L)).when(leaveService).deleteLeave(99L);

        mockMvc.perform(delete("/leaves/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Leave request not found with id: 99"));
    }

    // ----------------------------------------------------------------- misc

    @Test
    void unsupportedMethodReturns405() throws Exception {
        mockMvc.perform(patch("/leaves/1"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405));
    }

    @Test
    void unexpectedErrorReturns500WithoutLeakingDetails() throws Exception {
        when(leaveService.getLeaveById(1L)).thenThrow(new IllegalStateException("boom"));

        mockMvc.perform(get("/leaves/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"));
    }
}
