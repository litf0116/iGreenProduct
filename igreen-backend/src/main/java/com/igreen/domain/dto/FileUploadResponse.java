package com.igreen.domain.dto;

public record FileUploadResponse(
        String id,
        String url,
        String name,
        String type,
        Integer size
) {}
