package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum SiteStatus {
    ONLINE,
    OFFLINE,
    UNDER_CONSTRUCTION;

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SiteStatus fromValue(String value) {
        if (value == null) {
            return ONLINE;
        }
        try {
            return valueOf(value.toUpperCase(Locale.ROOT).replace("-", "_"));
        } catch (IllegalArgumentException e) {
            return ONLINE;
        }
    }
}
