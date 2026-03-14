package com.igreen.domain.controller;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.TemplateData;
import com.igreen.domain.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "工单管理", description = "工单全生命周期接口")
@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final JwtUtils jwtUtils;

    @Operation(summary = "获取工单列表")
    @GetMapping
    public ResponseEntity<Result<PageResult<TicketResponse>>> getTickets(
            HttpServletRequest httpRequest,
            @RequestParam @Min(1) int page, 
            @RequestParam @Min(1) @Max(100) int size, 
            @RequestParam(required = false) String type, 
            @RequestParam(required = false) String status, 
            @RequestParam(required = false) String priority, 
            @RequestParam(required = false) String assignedTo, 
            @RequestParam(required = false) String keyword, 
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAfter) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.getTickets(page, size, type, status, priority, assignedTo, keyword, createdAfter, userId)));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<TicketResponse>> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(Result.success(ticketService.getTicketById(id)));
    }

    @Operation(summary = "创建工单")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> createTicket(HttpServletRequest httpRequest, @Valid @RequestBody TicketCreateRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.createTicket(request, userId)));
    }

    @Operation(summary = "更新工单")
    @PostMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ENGINEER')")
    public ResponseEntity<Result<TicketResponse>> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(Result.success(ticketService.updateTicket(id, request)));
    }

    @Operation(summary = "删除工单")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(Result.successResult());
    }

    @Operation(summary = "接受工单")
    @PostMapping("/{id}/accept")
    public ResponseEntity<Result<TicketResponse>> acceptTicket(HttpServletRequest httpRequest, @PathVariable Long id, @Valid @RequestBody TicketAcceptRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.acceptTicket(id, request, userId)));
    }

    @Operation(summary = "拒绝工单")
    @PostMapping("/{id}/decline")
    public ResponseEntity<Result<TicketResponse>> declineTicket(HttpServletRequest httpRequest, @PathVariable Long id, @Valid @RequestBody TicketDeclineRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.declineTicket(id, request, userId)));
    }

    @Operation(summary = "取消工单")
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> cancelTicket(HttpServletRequest httpRequest, @PathVariable Long id, @Valid @RequestBody TicketCancelRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.cancelTicket(id, request, userId)));
    }

    @Operation(summary = "工程师出发")
    @PostMapping("/{id}/depart")
    public ResponseEntity<Result<TicketResponse>> departTicket(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody(required = false) String departurePhoto) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.departTicket(id, departurePhoto, userId)));
    }

    @Operation(summary = "工程师到达")
    @PostMapping("/{id}/arrive")
    public ResponseEntity<Result<TicketResponse>> arriveTicket(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody(required = false) String arrivalPhoto) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.arriveTicket(id, arrivalPhoto, userId)));
    }

    @Operation(summary = "提交工单")
    @PostMapping("/{id}/submit")
    public ResponseEntity<Result<TicketResponse>> submitTicket(HttpServletRequest httpRequest, @PathVariable Long id, @Valid @RequestBody StepData stepData) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.submitTicket(id, stepData, userId)));
    }

    @Operation(summary = "完成工单")
    @PostMapping("/{id}/complete")
    public ResponseEntity<Result<TicketResponse>> completeTicket(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody(required = false) String completionPhoto) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.completeTicket(id, completionPhoto, userId)));
    }

    @Operation(summary = "提交工单审核（工程师使用）")
    @PostMapping("/{id}/submit-for-review")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ENGINEER')")
    public ResponseEntity<Result<TicketResponse>> submitTicketForReview(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody(required = false) TemplateData templateData) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.submitTicketForReview(id, userId, templateData)));
    }

    @Operation(summary = "审核工单（管理员使用）")
    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> reviewTicket(HttpServletRequest httpRequest, @PathVariable Long id, @RequestBody(required = false) String cause) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.reviewTicket(id, cause, userId)));
    }

    @Operation(summary = "获取工单评论")
    @GetMapping("/{id}/comments")
    public ResponseEntity<Result<PageResult<TicketCommentResponse>>> getTicketComments(@PathVariable Long id) {
        List<TicketCommentResponse> comments = ticketService.getTicketComments(id);
        PageResult<TicketCommentResponse> pageResult = new PageResult<>(comments, comments.size(), 0, comments.size(), false);
        return ResponseEntity.ok(Result.success(pageResult));
    }

    @Operation(summary = "添加工单评论")
    @PostMapping("/{id}/comments")
    public ResponseEntity<Result<TicketCommentResponse>> addTicketComment(HttpServletRequest httpRequest, @PathVariable Long id, @Valid @RequestBody TicketCommentCreateRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.addTicketComment(id, request, userId)));
    }

    @Operation(summary = "更新工单步骤")
    @PutMapping("/{ticketId}/steps/{stepId}")
    public ResponseEntity<Result<TicketResponse>> updateTicketStep(HttpServletRequest httpRequest, @PathVariable Long ticketId, @PathVariable String stepId, @Valid @RequestBody TicketStepUpdateRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.updateTicketStep(ticketId, stepId, request, userId)));
    }

    @Operation(summary = "获取我的工单")
    @GetMapping("/my")
    public ResponseEntity<Result<PageResult<TicketResponse>>> getMyTickets(HttpServletRequest httpRequest, @RequestParam @Min(1) int page, @RequestParam @Min(1) @Max(100) int size, @RequestParam(required = false) String status) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.getMyTickets(page, size, status, userId)));
    }

    @Operation(summary = "获取待办工单")
    @GetMapping("/pending")
    public ResponseEntity<Result<PageResult<TicketResponse>>> getPendingTickets(HttpServletRequest httpRequest) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.getPendingTickets(userId)));
    }

    @Operation(summary = "获取已完成工单")
    @GetMapping("/completed")
    public ResponseEntity<Result<PageResult<TicketResponse>>> getCompletedTickets(@RequestParam @Min(1) int page, @RequestParam @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(Result.success(ticketService.getCompletedTickets(page, size)));
    }

    @Operation(summary = "获取工单统计")
    @GetMapping("/stats")
    public ResponseEntity<Result<TicketStatsResponse>> getTicketStats(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(Result.success(ticketService.getTicketStats(type)));
    }

    private String getCurrentUserId(HttpServletRequest httpRequest) {
        String bearerToken = httpRequest.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            return jwtUtils.extractUserId(token);
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
}
