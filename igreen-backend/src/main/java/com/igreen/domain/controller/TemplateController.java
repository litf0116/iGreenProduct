package com.igreen.domain.controller;

import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.CreateTemplateRequest;
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
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @Operation(summary = "获取所有模板")
    @GetMapping
    public ResponseEntity<Result<PageResult<Template>>> getAllTemplates() {
        List<Template> templates = templateService.getAllTemplates();
        PageResult<Template> pageResult = new PageResult<>(templates, templates.size(), 0, templates.size(), false);
        return ResponseEntity.ok(Result.success(pageResult));
    }

    @Operation(summary = "获取模板详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Template>> getTemplateById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(templateService.getTemplateById(id)));
    }

    @Operation(summary = "创建模板")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<Template>> createTemplate(@Valid @RequestBody CreateTemplateRequest request) {
        return ResponseEntity.ok(Result.success(templateService.createTemplate(request)));
    }
    @Operation(summary = "更新模板")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<Template>> updateTemplate(
            @PathVariable String id,
            @Valid @RequestBody CreateTemplateRequest request) {
        return ResponseEntity.ok(Result.success(templateService.updateTemplate(id, request)));
    }

    @Operation(summary = "删除模板")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<Void>> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(Result.success(null));
    }
}
