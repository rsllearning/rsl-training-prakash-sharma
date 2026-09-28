package com.rsl.leavemanagement.dto;

import java.time.LocalDate;

/**
 * Implemented by request DTOs that carry a start/end date pair so that the
 * {@link ValidDateRange} constraint can validate them.
 */
public interface DateRange {

    LocalDate startDate();

    LocalDate endDate();
}
