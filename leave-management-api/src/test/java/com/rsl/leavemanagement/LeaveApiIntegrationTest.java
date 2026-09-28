package com.rsl.leavemanagement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rsl.leavemanagement.repository.LeaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end test through all layers (controller → service → in-memory repository)
 * using the real Spring context and MockMvc.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LeaveApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LeaveRepository leaveRepository;

    private final LocalDate start = LocalDate.now().plusDays(10);
    private final LocalDate end = start.plusDays(2);

    @BeforeEach
    void clearRepository() {
        leaveRepository.deleteAll();
    }

    private String createJson(String employeeId, LocalDate from, LocalDate to) {
        return """
                {"employeeId":"%s","leaveType":"EARNED","startDate":"%s","endDate":"%s","reason":"Annual vacation"}
                """.formatted(employeeId, from, to);
    }

    private String updateJson(String status) {
        return """
                {"employeeId":"EMP100","leaveType":"EARNED","startDate":"%s","endDate":"%s",
                 "reason":"Annual vacation (approved)","status":"%s"}
                """.formatted(start, end, status);
    }

    @Test
    void fullCrudLifecycle() throws Exception {
        // CREATE
        String body = mockMvc.perform(post("/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson("EMP100", start, end)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.numberOfDays").value(3))
                .andReturn().getResponse().getContentAsString();
        JsonNode created = objectMapper.readTree(body);
        long id = created.get("id").asLong();

        // READ ALL / READ ONE
        mockMvc.perform(get("/leaves"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        mockMvc.perform(get("/leaves/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("EMP100"));

        // OVERLAP is rejected
        mockMvc.perform(post("/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson("EMP100", end, end.plusDays(1))))
                .andExpect(status().isConflict());

        // UPDATE (approve)
        mockMvc.perform(put("/leaves/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson("APPROVED")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.reason").value("Annual vacation (approved)"));

        // Finalized leave can't be modified again
        mockMvc.perform(put("/leaves/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson("CANCELLED")))
                .andExpect(status().isConflict());

        // DELETE
        mockMvc.perform(delete("/leaves/{id}", id))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/leaves/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void backdatedLeaveIsRejectedInTestProfile() throws Exception {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        mockMvc.perform(post("/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson("EMP200", yesterday, yesterday)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("startDate cannot be in the past"));
    }

    @Test
    void leaveExceedingMaxDaysIsRejected() throws Exception {
        mockMvc.perform(post("/leaves")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson("EMP300", start, start.plusDays(30))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Leave duration of 31 days exceeds the maximum of 30 days per request"));
    }
}
