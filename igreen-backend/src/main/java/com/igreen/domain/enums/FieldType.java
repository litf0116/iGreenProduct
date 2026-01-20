package com.igreen.domain.enums;

public enum FieldType {
    TEXT("text"),
    NUMBER("number"),
    DATE("date"),
    LOCATION("location"),
    PHOTO("photo"),
    SIGNATURE("signature");

    private final String value;

    FieldType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static FieldType fromValue(String value) {
        for (FieldType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown field type: " + value);
    }
}
