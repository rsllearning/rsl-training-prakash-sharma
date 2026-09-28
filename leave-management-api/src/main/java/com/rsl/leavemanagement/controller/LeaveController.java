package com.rsl.leavemanagement.controller;

import com.rsl.leavemanagement.dto.LeaveCreateRequest;
import com.rsl.leavemanagement.dto.LeaveResponse;
import com.rsl.leavemanagement.dto.LeaveUpdateRequest;
import com.rsl.leavemanagement.model.LeaveStatus;
import com.rsl.leavemanagement.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * REST endpoints for leave requests. The controller only handles HTTP concerns
 * and delegates all business logic to {@link LeaveService}.
 */
@RestController
@RequestMapping("/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    /** GET /leaves — optional filters: ?employeeId=EMP001&status=PENDING */
    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getAllLeaves(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) LeaveStatus status) {
        return ResponseEntity.ok(leaveService.getAllLeaves(employeeId, status));
    }

    /** GET /leaves/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<LeaveResponse> getLeaveById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getLeaveById(id));
    }

    /** POST /leaves — returns 201 Created with a Location header. */
    @PostMapping
    public ResponseEntity<LeaveResponse> createLeave(@Valid @RequestBody LeaveCreateRequest request) {
        LeaveResponse created = leaveService.createLeave(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    /** PUT /leaves/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<LeaveResponse> updateLeave(@PathVariable Long id,
                                                     @Valid @RequestBody LeaveUpdateRequest request) {
        return ResponseEntity.ok(leaveService.updateLeave(id, request));
    }

    /** DELETE /leaves/{id} — returns 204 No Content. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeave(@PathVariable Long id) {
        leaveService.deleteLeave(id);
        return ResponseEntity.noContent().build();
    }
}
