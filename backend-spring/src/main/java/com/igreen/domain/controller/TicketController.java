package com.igreen.domain.controller;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.common.result.Result;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.*;
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
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final JwtUtils jwtUtils;

    @Operation(summary = "获取工单列表")
    @GetMapping
    public ResponseEntity<Result<PageResult<TicketResponse>>> getTickets(
            @RequestParam @Min(0) @Max(100) int page,
            @RequestParam @Min(1) @Max(100) int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdAfter) {
        return ResponseEntity.ok(Result.success(ticketService.getTickets(page, size, type, status, priority, assignedTo, keyword, createdAfter)));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<TicketResponse>> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(ticketService.getTicketById(id)));
    }

    @Operation(summary = "创建工单")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> createTicket(
            HttpServletRequest httpRequest,
            @Valid @RequestBody TicketCreateRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.createTicket(request, userId)));
    }

    @Operation(summary = "更新工单")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(Result.success(ticketService.updateTicket(id, request)));
    }

    @Operation(summary = "删除工单")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<Void>> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(Result.successResult());
    }

    @Operation(summary = "接受工单")
    @PostMapping("/{id}/accept")
    public ResponseEntity<Result<TicketResponse>> acceptTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @Valid @RequestBody TicketAcceptRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.acceptTicket(id, request, userId)));
    }

    @Operation(summary = "拒绝工单")
    @PostMapping("/{id}/decline")
    public ResponseEntity<Result<TicketResponse>> declineTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @Valid @RequestBody TicketDeclineRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.declineTicket(id, request, userId)));
    }

    @Operation(summary = "取消工单")
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> cancelTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @Valid @RequestBody TicketCancelRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.cancelTicket(id, request, userId)));
    }

    @Operation(summary = "工程师出发")
    @PostMapping("/{id}/depart")
    public ResponseEntity<Result<TicketResponse>> departTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @RequestBody(required = false) String departurePhoto) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.departTicket(id, departurePhoto, userId)));
    }

    @Operation(summary = "工程师到达")
    @PostMapping("/{id}/arrive")
    public ResponseEntity<Result<TicketResponse>> arriveTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @RequestBody(required = false) String arrivalPhoto) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.arriveTicket(id, arrivalPhoto, userId)));
    }

    @Operation(summary = "提交工单")
    @PostMapping("/{id}/submit")
    public ResponseEntity<Result<TicketResponse>> submitTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @Valid @RequestBody StepData stepData) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.submitTicket(id, stepData, userId)));
    }

    @Operation(summary = "完成工单")
    @PostMapping("/{id}/complete")
    public ResponseEntity<Result<TicketResponse>> completeTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @RequestBody(required = false) String completionPhoto) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.completeTicket(id, completionPhoto, userId)));
    }

    @Operation(summary = "审核工单")
    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Result<TicketResponse>> reviewTicket(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @RequestBody(required = false) String cause) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.reviewTicket(id, cause, userId)));
    }

    @Operation(summary = "获取工单评论")
    @GetMapping("/{id}/comments")
    public ResponseEntity<Result<List<TicketCommentResponse>>> getTicketComments(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(ticketService.getTicketComments(id)));
    }

    @Operation(summary = "添加工单评论")
    @PostMapping("/{id}/comments")
    public ResponseEntity<Result<TicketCommentResponse>> addTicketComment(
            HttpServletRequest httpRequest,
            @PathVariable String id,
            @Valid @RequestBody TicketCommentCreateRequest request) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.addTicketComment(id, request, userId)));
    }

    @Operation(summary = "获取我的工单")
    @GetMapping("/my")
    public ResponseEntity<Result<PageResult<TicketResponse>>> getMyTickets(
            HttpServletRequest httpRequest,
            @RequestParam @Min(0) @Max(100) int page,
            @RequestParam @Min(1) @Max(100) int size,
            @RequestParam(required = false) String status) {
        String userId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(Result.success(ticketService.getMyTickets(page, size, status, userId)));
    }

    @Operation(summary = "获取待办工单")
    @GetMapping("/pending")
    public ResponseEntity<Result<List<TicketResponse>>> getPendingTickets() {
        return ResponseEntity.ok(Result.success(ticketService.getPendingTickets()));
    }

    @Operation(summary = "获取已完成工单")
    @GetMapping("/completed")
    public ResponseEntity<Result<PageResult<TicketResponse>>> getCompletedTickets(
            @RequestParam @Min(0) @Max(100) int page,
            @RequestParam @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(Result.success(ticketService.getCompletedTickets(page, size)));
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
