package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum TicketStatus {
    OPEN,
    ASSIGNED,
    ACCEPTED,
    DEPARTED,
    ARRIVED,
    REVIEW,
    COMPLETED,
    CANCELLED,
    
    // 已废弃状态 - 保留用于数据库兼容，不用于新业务
    @Deprecated
    SUBMITTED,
    @Deprecated
    ON_HOLD,
    @Deprecated
    DECLINED;

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
