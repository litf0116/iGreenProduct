package com.igreen.domain.enums;

public enum Priority {
    P1("P1"),
    P2("P2"),
    P3("P3"),
    P4("P4");

    private final String value;

    Priority(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Priority fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Priority cannot be null");
        }
        for (Priority priority : values()) {
            if (priority.value.equalsIgnoreCase(value)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Unknown priority: " + value);
    }
}
