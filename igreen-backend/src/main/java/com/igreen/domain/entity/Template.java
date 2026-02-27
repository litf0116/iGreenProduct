package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@TableName("templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    private static final ObjectMapper objectMapper = new ObjectMapper();

    // 在实体加载后，自动将 stepConfig JSON 字符串反序列化为 steps 对象
    @PostConstruct
    public void initSteps() {
        if (stepConfig != null && !stepConfig.trim().isEmpty()) {
            try {
                this.steps = objectMapper.readValue(stepConfig, new TypeReference<List<TemplateStep>>() {
                });
            } catch (Exception e) {
                // 如果反序列化失败，保持空的 steps 列表
                this.steps = new ArrayList<>();
            }
        }
    }

    // 在设置 steps 时，自动序列化为 JSON 字符串并保存到 stepConfig
    public void setSteps(List<TemplateStep> steps) {
        this.steps = steps != null ? steps : new ArrayList<>();
        try {
            this.stepConfig = objectMapper.writeValueAsString(this.steps);
        } catch (Exception e) {
            this.stepConfig = "[]";
        }
    }

    public List<TemplateStep> getSteps() {
        // 每次都从 stepConfig 反序列化，确保数据是最新的
        if (stepConfig != null && !stepConfig.trim().isEmpty()) {
            try {
                this.steps = objectMapper.readValue(stepConfig, new TypeReference<List<TemplateStep>>() {});
            } catch (Exception e) {
                // 如果反序列化失败，保持空的 steps 列表
                this.steps = new ArrayList<>();
            }
        } else {
            this.steps = new ArrayList<>();
        }
        return steps;
    }

    // 提供手动同步方法，用于在 stepConfig 被直接修改后同步到 steps
    public void syncStepsFromConfig() {
        initSteps();
    }

    // 提供手动同步方法，用于在 steps 被修改后同步到 stepConfig
    public void syncConfigFromSteps() {
        setSteps(this.steps);
    }
}
