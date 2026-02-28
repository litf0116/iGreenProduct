package com.igreen.domain.dto;

import lombok.Data;

import java.util.Map;

@Data
@Deprecated
public final class StepData {
    private final Map<String, Object> data;

    public StepData(
            Map<String, Object> data
    ) {
        this.data = data;
    }

}
