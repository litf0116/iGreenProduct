package com.igreen.domain.controller;

import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.GroupCreateRequest;
import com.igreen.domain.dto.GroupUpdateRequest;
import com.igreen.domain.entity.Group;
import com.igreen.domain.service.GroupService;
import com.igreen.domain.vo.GroupConverter;
import com.igreen.domain.vo.GroupVO;
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
    private final GroupConverter groupConverter;

    @Operation(summary = "获取所有分组")
    @GetMapping
    public ResponseEntity<Result<PageResult<GroupVO>>> getAllGroups(
            @RequestParam(required = false) String keyword) {
        System.out.println("[DEBUG getAllGroups] Received keyword: " + keyword);
        List<Group> groups;
        if (keyword != null && !keyword.trim().isEmpty()) {
            groups = groupService.searchGroups(keyword);
        } else {
            groups = groupService.getAllGroups();
        }
        System.out.println("[DEBUG getAllGroups] Returning groups count: " + groups.size());
        List<GroupVO> voList = groupConverter.toVOList(groups);
        PageResult<GroupVO> pageResult = new PageResult<>(voList, voList.size(), 0, voList.size(), false);
        return ResponseEntity.ok(Result.success(pageResult));
    }

    @Operation(summary = "获取分组详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<GroupVO>> getGroupById(@PathVariable String id) {
        Group group = groupService.getGroupById(id);
        GroupVO vo = groupConverter.toVO(group);
        return ResponseEntity.ok(Result.success(vo));
    }

    @Operation(summary = "创建分组")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<GroupVO>> createGroup(@Valid @RequestBody GroupCreateRequest request) {
        Group group = groupService.createGroup(request);
        GroupVO vo = groupConverter.toVO(group);
        return ResponseEntity.ok(Result.success(vo));
    }

    @Operation(summary = "更新分组")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<GroupVO>> updateGroup(
            @PathVariable String id,
            @Valid @RequestBody GroupUpdateRequest request) {
        Group group = groupService.updateGroup(id, request);
        GroupVO vo = groupConverter.toVO(group);
        return ResponseEntity.ok(Result.success(vo));
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
