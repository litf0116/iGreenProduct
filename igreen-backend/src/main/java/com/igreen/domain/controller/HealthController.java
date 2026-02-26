package com.igreen.domain.controller;

import com.igreen.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "健康检查", description = "系统健康检查接口")
@RestController
@RequestMapping("/")
public class HealthController {

    @Operation(summary = "健康检查")
    @GetMapping("/health")
    public ResponseEntity<Result<Map<String, String>>> healthCheck() {
        return ResponseEntity.ok(Result.success(Map.of(
            "status", "healthy",
            "version", "1.0.0"
        )));
    }
}
