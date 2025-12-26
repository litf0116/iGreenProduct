package com.igreen.domain.controller;

import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.domain.entity.Template;
import com.igreen.domain.entity.TemplateField;
import com.igreen.domain.entity.TemplateStep;
import com.igreen.domain.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "模板管理", description = "工单模板接口")
@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @Operation(summary = "获取所有模板")
    @GetMapping
    public ResponseEntity<Result<List<Template>>> getAllTemplates() {
        return ResponseEntity.ok(Result.success(templateService.getAllTemplates()));
    }

    @Operation(summary = "获取模板详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Template>> getTemplateById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(templateService.getTemplateById(id)));
    }

    @Operation(summary = "创建模板")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Template>> createTemplate(@Valid @RequestBody Template template) {
        return ResponseEntity.ok(Result.success(templateService.createTemplate(template)));
    }

    @Operation(summary = "更新模板")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Template>> updateTemplate(
            @PathVariable String id,
            @Valid @RequestBody Template template) {
        return ResponseEntity.ok(Result.success(templateService.updateTemplate(id, template)));
    }

    @Operation(summary = "删除模板")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(Result.success(null));
    }

    @Operation(summary = "获取模板步骤")
    @GetMapping("/{id}/steps")
    public ResponseEntity<Result<List<TemplateStep>>> getTemplateSteps(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(templateService.getTemplateSteps(id)));
    }

    @Operation(summary = "创建步骤")
    @PostMapping("/{id}/steps")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<TemplateStep>> createStep(
            @PathVariable String id,
            @Valid @RequestBody TemplateStep step) {
        return ResponseEntity.ok(Result.success(templateService.createStep(id, step)));
    }

    @Operation(summary = "更新步骤")
    @PutMapping("/{id}/steps/{stepId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<TemplateStep>> updateStep(
            @PathVariable String id,
            @PathVariable String stepId,
            @Valid @RequestBody TemplateStep step) {
        return ResponseEntity.ok(Result.success(templateService.updateStep(stepId, step)));
    }

    @Operation(summary = "删除步骤")
    @DeleteMapping("/{id}/steps/{stepId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteStep(
            @PathVariable String id,
            @PathVariable String stepId) {
        templateService.deleteStep(stepId);
        return ResponseEntity.ok(Result.success(null));
    }

    @Operation(summary = "获取步骤字段")
    @GetMapping("/{id}/steps/{stepId}/fields")
    public ResponseEntity<Result<List<TemplateField>>> getStepFields(@PathVariable String stepId) {
        return ResponseEntity.ok(Result.success(templateService.getStepFields(stepId)));
    }

    @Operation(summary = "创建字段")
    @PostMapping("/{id}/steps/{stepId}/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<TemplateField>> createField(
            @PathVariable String stepId,
            @Valid @RequestBody TemplateField field) {
        return ResponseEntity.ok(Result.success(templateService.createField(stepId, field)));
    }

    @Operation(summary = "更新字段")
    @PutMapping("/{id}/steps/{stepId}/fields/{fieldId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<TemplateField>> updateField(
            @PathVariable String fieldId,
            @Valid @RequestBody TemplateField field) {
        return ResponseEntity.ok(Result.success(templateService.updateField(fieldId, field)));
    }

    @Operation(summary = "删除字段")
    @DeleteMapping("/{id}/steps/{stepId}/fields/{fieldId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteField(@PathVariable String fieldId) {
        templateService.deleteField(fieldId);
        return ResponseEntity.ok(Result.success(null));
    }
}
