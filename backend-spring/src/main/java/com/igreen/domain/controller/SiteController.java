package com.igreen.domain.controller;

import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.SiteCreateRequest;
import com.igreen.domain.dto.SiteUpdateRequest;
import com.igreen.domain.entity.Site;
import com.igreen.domain.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "站点管理", description = "客户站点接口")
@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @Operation(summary = "获取所有站点")
    @GetMapping
    public ResponseEntity<Result<PageResult<Site>>> getAllSites(
            @RequestParam(defaultValue = "1") @Min(1) @Max(100) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(Result.success(siteService.getAllSites(page, size, keyword, level, status)));
    }

    @Operation(summary = "站点统计")
    @GetMapping("/stats")
    public ResponseEntity<Result<SiteStats>> getSiteStats() {
        return ResponseEntity.ok(Result.success(siteService.getSiteStats()));
    }

    @Operation(summary = "获取站点详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Site>> getSiteById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(siteService.getSiteById(id)));
    }

    @Operation(summary = "创建站点")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<Site>> createSite(@Valid @RequestBody SiteCreateRequest request) {
        return ResponseEntity.ok(Result.success(siteService.createSite(request)));
    }

    @Operation(summary = "更新站点")
    @PostMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<Site>> updateSite(
            @PathVariable String id,
            @Valid @RequestBody SiteUpdateRequest request) {
        return ResponseEntity.ok(Result.success(siteService.updateSite(id, request)));
    }

    @Operation(summary = "删除站点")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteSite(@PathVariable String id) {
        siteService.deleteSite(id);
        return ResponseEntity.ok(Result.successResult());
    }
}
