package com.igreen.domain.enums;

public enum UserRole {
    ADMIN("admin"),
    MANAGER("manager"),
    ENGINEER("engineer");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        for (UserRole role : values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}
