package com.igreen.domain.enums;

public enum CommentType {
    GENERAL("general"),
    COMMENT("comment"),
    ACCEPT("accept"),
    DECLINE("decline"),
    CANCEL("cancel"),
    SYSTEM("system");

    private final String value;

    CommentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static CommentType fromValue(String value) {
        for (CommentType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown comment type: " + value);
    }
}
