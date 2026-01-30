package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum GroupStatus {
    ACTIVE,
    INACTIVE;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static GroupStatus fromValue(String value) {
        if (value == null) {
            return ACTIVE;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return ACTIVE; // 默认值
        }
    }
}
