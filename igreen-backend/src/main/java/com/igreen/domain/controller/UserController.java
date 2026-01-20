package com.igreen.domain.controller;

import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.UserCountryRequest;
import com.igreen.domain.dto.UserCreateRequest;
import com.igreen.domain.dto.UserResponse;
import com.igreen.domain.dto.UserUpdateRequest;
import com.igreen.domain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "用户管理", description = "用户CRUD接口")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取所有用户")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<PageResult<UserResponse>>> getAllUsers(
            @RequestParam @Min(0) @Max(100) int page,
            @RequestParam @Min(1) @Max(100) int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(Result.success(userService.getAllUsers(page, size, keyword)));
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<UserResponse>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(userService.getUserById(id)));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(Result.success(userService.createUser(request)));
    }

    @Operation(summary = "更新用户")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(Result.success(userService.updateUser(id, request)));
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Result.successResult());
    }

    @Operation(summary = "获取所有工程师")
    @GetMapping("/engineers")
    public ResponseEntity<Result<List<UserResponse>>> getEngineers() {
        return ResponseEntity.ok(Result.success(userService.getEngineers()));
    }

    @Operation(summary = "设置用户登录国家范围")
    @PatchMapping("/{id}/countries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<UserResponse>> updateUserCountries(
            @PathVariable String id,
            @Valid @RequestBody UserCountryRequest request) {
        return ResponseEntity.ok(Result.success(userService.updateUserCountry(id, request.country())));
    }
}
