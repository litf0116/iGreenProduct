package com.igreen.domain.enums;

public enum TicketStatus {
    OPEN("open"),
    ASSIGNED("assigned"),
    ACCEPTED("accepted"),
    IN_PROGRESS("inProgress"),
    COMPLETED("completed"),
    ON_HOLD("onHold"),
    CANCELLED("cancelled");

    private final String value;

    TicketStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TicketStatus fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        for (TicketStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
