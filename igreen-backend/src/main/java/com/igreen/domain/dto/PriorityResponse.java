package com.igreen.domain.dto;

public record PriorityResponse(
    String value,
    String name,
    String description
) {
    public PriorityResponse(String value, String name, String description) {
        this.value = value;
        this.name = name;
        this.description = description;
    }
}
