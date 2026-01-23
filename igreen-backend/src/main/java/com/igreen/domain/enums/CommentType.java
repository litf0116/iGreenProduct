package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum CommentType {
    GENERAL,
    COMMENT,
    ACCEPT,
    DECLINE,
    CANCEL,
    SYSTEM;

    @JsonValue
    public String getValue() {
        return name();
    }

    @JsonCreator
    public static CommentType fromValue(String value) {
        if (value == null) {
            return GENERAL;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return GENERAL;
        }
    }
}
