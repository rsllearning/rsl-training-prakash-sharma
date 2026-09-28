package com.rsl.leavemanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Uniform error body returned by {@code GlobalExceptionHandler} for every failure.
 *
 * @param errors field-level validation errors; omitted from JSON when empty
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> errors
) {

    public record FieldError(String field, String message) {
    }
}
