package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum TicketType {
    PLANNED,
    PREVENTIVE,
    CORRECTIVE,
    PROBLEM;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static TicketType fromValue(String value) {
        if (value == null) {
            return PLANNED;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return PLANNED;
        }
    }
}
