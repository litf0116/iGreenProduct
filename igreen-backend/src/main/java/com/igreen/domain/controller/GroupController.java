package com.igreen.domain.controller;

import com.igreen.common.result.Result;
import com.igreen.domain.dto.GroupCreateRequest;
import com.igreen.domain.dto.GroupUpdateRequest;
import com.igreen.domain.entity.Group;
import com.igreen.domain.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "分组管理", description = "工程师分组接口")
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @Operation(summary = "获取所有分组")
    @GetMapping
    public ResponseEntity<Result<List<Group>>> getAllGroups() {
        return ResponseEntity.ok(Result.success(groupService.getAllGroups()));
    }

    @Operation(summary = "获取分组详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Group>> getGroupById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(groupService.getGroupById(id)));
    }

    @Operation(summary = "创建分组")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Group>> createGroup(@Valid @RequestBody GroupCreateRequest request) {
        return ResponseEntity.ok(Result.success(groupService.createGroup(request)));
    }

    @Operation(summary = "更新分组")
    @PostMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Group>> updateGroup(
            @PathVariable String id,
            @Valid @RequestBody GroupUpdateRequest request) {
        return ResponseEntity.ok(Result.success(groupService.updateGroup(id, request)));
    }

    @Operation(summary = "删除分组")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteGroup(@PathVariable String id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(Result.successResult());
    }

    @Operation(summary = "获取分组下的工程师")
    @GetMapping("/{id}/members")
    public ResponseEntity<Result<Object>> getGroupMembers(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(groupService.getGroupMembers(id)));
    }
}
