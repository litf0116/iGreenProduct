package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum FieldType {
    TEXT,
    NUMBER,
    DATE,
    LOCATION,
    PHOTO,
    SIGNATURE;

    @JsonValue
    public String getValue() {
        return name();
    }

    @JsonCreator
    public static FieldType fromValue(String value) {
        if (value == null) {
            return TEXT;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return TEXT;
        }
    }
}
