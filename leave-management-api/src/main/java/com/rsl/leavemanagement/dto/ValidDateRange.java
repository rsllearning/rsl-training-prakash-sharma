package com.rsl.leavemanagement.dto;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Class-level Bean Validation constraint ensuring {@code endDate} is not before
 * {@code startDate}. Null dates are ignored here; {@code @NotNull} on the fields
 * reports those separately.
 */
@Documented
@Constraint(validatedBy = DateRangeValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDateRange {

    String message() default "endDate must be on or after startDate";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
