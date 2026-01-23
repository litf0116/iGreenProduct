package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum Priority {
    P1,
    P2,
    P3,
    P4;

    @JsonValue
    public String getValue() {
        return name();
    }

    @JsonCreator
    public static Priority fromValue(String value) {
        if (value == null) {
            return P3;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return P3;
        }
    }
}
