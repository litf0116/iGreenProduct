package com.igreen.domain.enums;

public enum TicketType {
    PLANNED("planned"),
    PREVENTIVE("preventive"),
    CORRECTIVE("corrective"),
    PROBLEM("problem");

    private final String value;

    TicketType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TicketType fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Type cannot be null");
        }
        for (TicketType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown type: " + value);
    }
}
