package com.igreen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum FieldType {
    TEXT,
    NUMBER,
    DATE,
    LOCATION,
    PHOTO,          // 单张照片（向后兼容）
    PHOTOS,         // 多张照片（新增）
    SIGNATURE,      // 签名
    INSPECTION;     // 三态选择（pass/fail/na）

    @JsonValue
    public String getValue() {
        return name().toLowerCase();
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
