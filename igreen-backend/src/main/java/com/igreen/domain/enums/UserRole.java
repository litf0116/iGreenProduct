package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum UserRole {
    ADMIN,
    MANAGER,
    ENGINEER;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static UserRole fromValue(String value) {
        if (value == null) {
            return ENGINEER;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return ENGINEER;
        }
    }
}
