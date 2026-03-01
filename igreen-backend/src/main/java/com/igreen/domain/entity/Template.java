package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@TableName("templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class Template {

    private String id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("step_config")
    private String stepConfig;

    @TableField(exist = false)
    private List<TemplateStep> steps = new ArrayList<>();

    @JsonIgnore
    private transient boolean stepsCached = false;

    private static final ObjectMapper objectMapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private List<TemplateStep> deserializeSteps() {
        if (stepConfig == null || stepConfig.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            List<TemplateStep> parsed = objectMapper.readValue(stepConfig, new TypeReference<List<TemplateStep>>() {
            });
            return parsed != null ? parsed : new ArrayList<>();
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize stepConfig for template {}: {}", id, e.getMessage());
            return new ArrayList<>();
        }
    }

    private String serializeSteps() {
        if (steps == null || steps.isEmpty()) {
            return "[]";
        }

        try {
            return objectMapper.writeValueAsString(steps);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize steps for template {}: {}", id, e.getMessage());
            return "[]";
        }
    }

    public void setSteps(List<TemplateStep> steps) {
        this.steps = steps != null ? steps : new ArrayList<>();
        this.stepConfig = serializeSteps();
        this.stepsCached = true;
    }

    public List<TemplateStep> getSteps() {
        if (!stepsCached) {
            this.steps = deserializeSteps();
            this.stepsCached = true;
        }
        return steps;
    }

    public void syncStepsFromConfig() {
        this.stepsCached = false;
        getSteps();
    }

    public void syncConfigFromSteps() {
        setSteps(this.steps);
    }
}
