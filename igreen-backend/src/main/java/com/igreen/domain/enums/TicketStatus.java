package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum TicketStatus {
    OPEN,
    ASSIGNED,
    ACCEPTED,
    IN_PROGRESS,
    DEPARTED,
    ARRIVED,
    REVIEW,
    COMPLETED,
    ON_HOLD,
    CANCELLED;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static TicketStatus fromValue(String value) {
        if (value == null) {
            return OPEN;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT).replace("-", "_"));
        } catch (IllegalArgumentException e) {
            return OPEN;
        }
    }
}
