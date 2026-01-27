package com.igreen.domain.controller;

import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.*;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.service.ConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "配置管理", description = "SLA配置、问题类型、站点级别配置管理接口")
@RestController
@RequestMapping("/api/configs")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    @Operation(summary = "获取所有SLA配置")
    @GetMapping("/sla-configs")
    public ResponseEntity<Result<PageResult<SLAConfigResponse>>> getSLAConfigs() {
        List<SLAConfigResponse> configs = configService.getAllSLAConfigs();
        PageResult<SLAConfigResponse> pageResult = new PageResult<>(configs, configs.size(), 0, configs.size(), false);
        return ResponseEntity.ok(Result.success(pageResult));
    }

    @Operation(summary = "获取SLA配置")
    @GetMapping("/sla-configs/{id}")
    public ResponseEntity<Result<SLAConfigResponse>> getSLAConfig(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(configService.getSLAConfigById(id)));
    }

    @Operation(summary = "创建或更新SLA配置")
    @PostMapping("/sla-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<SLAConfigResponse>> createOrUpdateSLAConfig(
            @Valid @RequestBody SLAConfigRequest request) {
        return ResponseEntity.ok(Result.success(configService.createOrUpdateSLAConfig(request)));
    }

    @Operation(summary = "删除SLA配置")
    @DeleteMapping("/sla-configs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteSLAConfig(@PathVariable String id) {
        configService.deleteSLAConfig(id);
        return ResponseEntity.ok(Result.successResult());
    }

    @Operation(summary = "获取所有问题类型")
    @GetMapping("/problem-types")
    public ResponseEntity<Result<PageResult<ProblemTypeResponse>>> getProblemTypes() {
        List<ProblemTypeResponse> types = configService.getAllProblemTypes();
        PageResult<ProblemTypeResponse> pageResult = new PageResult<>(types, types.size(), 0, types.size(), false);
        return ResponseEntity.ok(Result.success(pageResult));
    }

    @Operation(summary = "创建问题类型")
    @PostMapping("/problem-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<ProblemTypeResponse>> createProblemType(
            @Valid @RequestBody ProblemTypeRequest request) {
        return ResponseEntity.ok(Result.success(configService.createProblemType(request)));
    }

    @Operation(summary = "更新问题类型")
    @PostMapping("/problem-types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<ProblemTypeResponse>> updateProblemType(
            @PathVariable String id,
            @Valid @RequestBody ProblemTypeUpdateRequest request) {
        return ResponseEntity.ok(Result.success(configService.updateProblemType(id, request)));
    }

    @Operation(summary = "删除问题类型")
    @DeleteMapping("/problem-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteProblemType(@PathVariable String id) {
        configService.deleteProblemType(id);
        return ResponseEntity.ok(Result.successResult());
    }

    @Operation(summary = "获取所有站点级别配置")
    @GetMapping("/site-level-configs")
    public ResponseEntity<Result<PageResult<SiteLevelConfigResponse>>> getSiteLevelConfigs() {
        List<SiteLevelConfigResponse> configs = configService.getAllSiteLevelConfigs();
        PageResult<SiteLevelConfigResponse> pageResult = new PageResult<>(configs, configs.size(), 0, configs.size(), false);
        return ResponseEntity.ok(Result.success(pageResult));
    }

    @Operation(summary = "创建站点级别配置")
    @PostMapping("/site-level-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<SiteLevelConfigResponse>> createSiteLevelConfig(
            @Valid @RequestBody SiteLevelConfigRequest request) {
        return ResponseEntity.ok(Result.success(configService.createSiteLevelConfig(request)));
    }

    @Operation(summary = "更新站点级别配置")
    @PostMapping("/site-level-configs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<SiteLevelConfigResponse>> updateSiteLevelConfig(
            @PathVariable String id,
            @Valid @RequestBody SiteLevelConfigUpdateRequest request) {
        return ResponseEntity.ok(Result.success(configService.updateSiteLevelConfig(id, request)));
    }

    @Operation(summary = "删除站点级别配置")
    @DeleteMapping("/site-level-configs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteSiteLevelConfig(@PathVariable String id) {
        configService.deleteSiteLevelConfig(id);
        return ResponseEntity.ok(Result.successResult());
    }
}
