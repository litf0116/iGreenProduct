package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.Site;
import com.igreen.domain.entity.TemplateStep;
import com.igreen.domain.entity.Ticket;
import com.igreen.domain.entity.TicketComment;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.CommentType;
import com.igreen.domain.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {


    private final TicketMapper ticketMapper;
    private final TicketCommentMapper ticketCommentMapper;
    private final UserMapper userMapper;
    private final SiteMapper siteMapper;
    private final TemplateStepMapper templateStepMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, String currentUserId) {
        User creator = userMapper.selectById(currentUserId);
        if (creator == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        User assignee = userMapper.selectById(request.assignedTo());
        if (assignee == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        String relatedTicketIdsJson = null;
        if (request.relatedTicketIds() != null && !request.relatedTicketIds().isEmpty()) {
            try {
                relatedTicketIdsJson = objectMapper.writeValueAsString(request.relatedTicketIds());
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
        }

        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .site(request.site())
                .priority(request.priority())
                .templateId(request.templateId())
                .assignedTo(request.assignedTo())
                .createdBy(currentUserId)
                .dueDate(request.dueDate())
                .status("OPEN")
                .problemType(request.problemType())
                .relatedTicketIds(relatedTicketIdsJson)
                .build();

        ticketMapper.insert(ticket);
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();

        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getTickets(int page, int size, String type, String status,
            String priority, String assignedTo, String keyword, LocalDateTime createdAfter) {
        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
            if (type != null) {
                wrapper.eq(Ticket::getType, type);
            }
            if (status != null) {
                wrapper.eq(Ticket::getStatus, status);
            }
            if (priority != null) {
                wrapper.eq(Ticket::getPriority, priority);
            }
            if (assignedTo != null) {
                wrapper.eq(Ticket::getAssignedTo, assignedTo);
            }
            if (createdAfter != null) {
                wrapper.ge(Ticket::getCreatedAt, createdAfter);
            }

            List<Ticket> tickets = ticketMapper.selectList(wrapper);

            final String keywordLower = keyword != null ? keyword.toLowerCase() : null;
            List<TicketResponse> ticketResponses = tickets.stream()
                    .filter(ticket -> keywordLower == null ||
                            (ticket.getTitle() != null && ticket.getTitle().toLowerCase().contains(keywordLower)) ||
                            (ticket.getDescription() != null && ticket.getDescription().toLowerCase().contains(keywordLower)))
                    .map(ticket -> {
                        User creator = userMapper.selectById(ticket.getCreatedBy());
                        User assignee = userMapper.selectById(ticket.getAssignedTo());
                        Site site = siteMapper.selectById(ticket.getSite());
                        return toResponse(ticket, creator, assignee, site);
                    })
                    .collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (request.title() != null) {
            ticket.setTitle(request.title());
        }
        if (request.description() != null) {
            ticket.setDescription(request.description());
        }
        if (request.type() != null) {
            ticket.setType(request.type());
        }
        if (request.site() != null) {
            ticket.setSite(request.site());
        }
        if (request.status() != null) {
            ticket.setStatus(request.status());
        }
        if (request.priority() != null) {
            ticket.setPriority(request.priority());
        }
        if (request.assignedTo() != null) {
            ticket.setAssignedTo(request.assignedTo());
        }
        if (request.dueDate() != null) {
            ticket.setDueDate(request.dueDate());
        }
        if (request.completedSteps() != null) {
            try {
                ticket.setCompletedSteps(objectMapper.writeValueAsString(request.completedSteps()));
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
        }
        if (request.stepData() != null) {
            try {
                ticket.setStepData(objectMapper.writeValueAsString(request.stepData().data()));
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
        }
        if (request.departureAt() != null) {
            ticket.setDepartureAt(request.departureAt());
        }
        if (request.departurePhoto() != null) {
            ticket.setDeparturePhoto(request.departurePhoto());
        }
        if (request.arrivalAt() != null) {
            ticket.setArrivalAt(request.arrivalAt());
        }
        if (request.arrivalPhoto() != null) {
            ticket.setArrivalPhoto(request.arrivalPhoto());
        }
        if (request.completionPhoto() != null) {
            ticket.setCompletionPhoto(request.completionPhoto());
        }
        if (request.cause() != null) {
            ticket.setCause(request.cause());
        }
        if (request.solution() != null) {
            ticket.setSolution(request.solution());
        }
        if (request.relatedTicketIds() != null) {
            try {
                ticket.setRelatedTicketIds(objectMapper.writeValueAsString(request.relatedTicketIds()));
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public void deleteTicket(Long id) {
        if (ticketMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }
        ticketMapper.deleteById(id);
    }

    @Transactional
    public TicketResponse acceptTicket(Long id, TicketAcceptRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // OPEN tickets can be accepted by any engineer
        // ASSIGNED tickets can only be accepted by the assigned engineer
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setAssignedTo(userId);
        } else if ("ASSIGNED".equals(ticket.getStatus())) {
            if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
                throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
            }
        } else {
            throw new BusinessException(ErrorCode.TICKET_ALREADY_ACCEPTED);
        }

        ticket.setStatus("ACCEPTED");
        ticket.setAccepted(true);
        ticket.setAcceptedAt(LocalDateTime.now());

        if (request.comment() != null) {
            TicketComment comment = TicketComment.builder()
                    .id(UUID.randomUUID().toString())
                    .comment(request.comment())
                    .type(CommentType.ACCEPT)
                    .ticketId(id)
                    .userId(userId)
                    .build();
            ticketCommentMapper.insert(comment);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketResponse declineTicket(Long id, TicketDeclineRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus("CANCELLED");
        ticket.setAccepted(false);

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .comment(request.reason())
                .type(CommentType.DECLINE)
                .ticketId(id)
                .userId(userId)
                .build();
        ticketCommentMapper.insert(comment);

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketResponse cancelTicket(Long id, TicketCancelRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_CREATOR);
        }

        ticket.setStatus("CANCELLED");

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .comment(request.reason())
                .type(CommentType.CANCEL)
                .ticketId(id)
                .userId(userId)
                .build();
        ticketCommentMapper.insert(comment);

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketResponse departTicket(Long id, String departurePhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // Check if user is the assigned engineer
        if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        // Allow depart from ASSIGNED or ACCEPTED status
        if (!"ASSIGNED".equals(ticket.getStatus()) && !"ACCEPTED".equals(ticket.getStatus())) {
            throw new BusinessException(ErrorCode.TICKET_INVALID_STATUS);
        }

        ticket.setStatus("IN_PROGRESS");
        ticket.setDepartureAt(LocalDateTime.now());
        if (departurePhoto != null) {
            ticket.setDeparturePhoto(departurePhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketResponse arriveTicket(Long id, String arrivalPhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // Check if user is the assigned engineer
        if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setArrivalAt(LocalDateTime.now());
        if (arrivalPhoto != null) {
            ticket.setArrivalPhoto(arrivalPhoto);
        }

        // Initialize stepData from template if ticket has templateId and stepData is null/empty
        if (ticket.getTemplateId() != null && (ticket.getStepData() == null || ticket.getStepData().isEmpty())) {
            initializeStepDataFromTemplate(ticket);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    private void initializeStepDataFromTemplate(Ticket ticket) {
        try {
            // Fetch template steps from database
            LambdaQueryWrapper<TemplateStep> stepWrapper = new LambdaQueryWrapper<>();
            stepWrapper.eq(TemplateStep::getTemplateId, ticket.getTemplateId());
            stepWrapper.orderByAsc(TemplateStep::getSortOrder);
            List<TemplateStep> templateSteps = templateStepMapper.selectList(stepWrapper);

            if (templateSteps != null && !templateSteps.isEmpty()) {
                // Convert template steps to the format expected by frontend
                List<Map<String, Object>> steps = new ArrayList<>();
                for (TemplateStep step : templateSteps) {
                    Map<String, Object> stepMap = new HashMap<>();
                    stepMap.put("id", step.getId());
                    stepMap.put("name", step.getName());
                    stepMap.put("description", step.getDescription() != null ? step.getDescription() : "");
                    stepMap.put("completed", false);
                    stepMap.put("status", "pending");
                    stepMap.put("sortOrder", step.getSortOrder());
                    steps.add(stepMap);
                }

                Map<String, Object> stepDataMap = new HashMap<>();
                stepDataMap.put("steps", steps);

                ticket.setStepData(objectMapper.writeValueAsString(stepDataMap));
                log.info("Initialized stepData for ticket {} from template {}", ticket.getId(), ticket.getTemplateId());
            }
        } catch (JsonProcessingException e) {
            log.error("Error initializing stepData from template for ticket {}", ticket.getId(), e);
        }
    }

    @Transactional
    public TicketResponse submitTicket(Long id, StepData stepData, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        try {
            if (stepData != null && stepData.data() != null) {
                String existingData = ticket.getStepData();
                Map<String, Object> dataMap;
                if (existingData != null && !existingData.isEmpty()) {
                    dataMap = objectMapper.readValue(existingData, Map.class);
                } else {
                    dataMap = new HashMap<>();
                }
                dataMap.putAll(stepData.data());
                ticket.setStepData(objectMapper.writeValueAsString(dataMap));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketResponse completeTicket(Long id, String completionPhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (ticket.getAssignedTo() == null || !userId.equals(ticket.getAssignedTo())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus("COMPLETED");
        if (completionPhoto != null) {
            ticket.setCompletionPhoto(completionPhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketResponse reviewTicket(Long id, String cause, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (cause != null) {
            ticket.setCause(cause);
            ticket.setStatus("OPEN");
        } else {
            ticket.setStatus("COMPLETED");
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        Site site = siteMapper.selectById(ticket.getSite());
        return toResponse(ticket, creator, assignee, site);
    }

    @Transactional
    public TicketCommentResponse addTicketComment(Long ticketId, TicketCommentCreateRequest request, String userId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .comment(request.comment())
                .type(request.type() != null ? request.type() : CommentType.GENERAL)
                .ticketId(ticketId)
                .userId(userId)
                .build();

        ticketCommentMapper.insert(comment);

        User user = userMapper.selectById(userId);
        return new TicketCommentResponse(
                comment.getId(),
                comment.getComment(),
                comment.getType().name(),
                userId,
                user != null ? user.getName() : null,
                ticketId,
                comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null
        );
    }

    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getTicketComments(Long ticketId) {
        return ticketCommentMapper.selectByTicketIdWithUser(ticketId).stream()
                .map(comment -> {
                    User user = userMapper.selectById(comment.getUserId());
                    return new TicketCommentResponse(
                            comment.getId(),
                            comment.getComment(),
                            comment.getType().name(),
                            comment.getUserId(),
                            user != null ? user.getName() : null,
                            ticketId,
                            comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getMyTickets(int page, int size, String status, String userId) {
        PageHelper.startPage(page, size);
        try {
            List<Ticket> tickets = ticketMapper.selectByAssignedTo(userId);
            if (status != null && !status.isEmpty()) {
                tickets = tickets.stream()
                        .filter(t -> status.equalsIgnoreCase(t.getStatus()))
                        .collect(Collectors.toList());
            }

            List<TicketResponse> ticketResponses = tickets.stream()
                    .map(ticket -> {
                        User creator = userMapper.selectById(ticket.getCreatedBy());
                        User assignee = userMapper.selectById(ticket.getAssignedTo());
                        Site site = siteMapper.selectById(ticket.getSite());
                        return toResponse(ticket, creator, assignee, site);
                    })
                    .collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getPendingTickets() {
        // Queue: 只返回 OPEN 状态的工单（未分配，任何工程师可接单）
        List<String> statuses = Arrays.asList("OPEN");
        List<Ticket> tickets = ticketMapper.selectByStatusIn(statuses);

        List<TicketResponse> ticketResponses = tickets.stream()
                .map(ticket -> {
                    User creator = userMapper.selectById(ticket.getCreatedBy());
                    User assignee = userMapper.selectById(ticket.getAssignedTo());
                    Site site = siteMapper.selectById(ticket.getSite());
                    return toResponse(ticket, creator, assignee, site);
                })
                .collect(Collectors.toList());

        return new PageResult<>(ticketResponses, ticketResponses.size(), 0, ticketResponses.size(), false);
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getCompletedTickets(int page, int size) {
        PageHelper.startPage(page, size);
        try {
            List<Ticket> tickets = ticketMapper.selectByStatus("COMPLETED");

            List<TicketResponse> ticketResponses = tickets.stream()
                    .map(ticket -> {
                        User creator = userMapper.selectById(ticket.getCreatedBy());
                        User assignee = userMapper.selectById(ticket.getAssignedTo());
                        Site site = siteMapper.selectById(ticket.getSite());
                        return toResponse(ticket, creator, assignee, site);
                    })
                    .collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional(readOnly = true)
    public TicketStatsResponse getTicketStats(String type) {
        String queryType = "all".equalsIgnoreCase(type) ? null : type;
        List<TicketStatusCount> statusCounts = ticketMapper.countByStatusGroup(queryType);

        long total = 0;
        long open = 0;
        long inProgress = 0;
        long submitted = 0;
        long completed = 0;
        long onHold = 0;

        for (TicketStatusCount count : statusCounts) {
            total += count.getCount();
            switch (count.getStatus()) {
                case "OPEN" -> open += count.getCount();
                case "ASSIGNED", "ACCEPTED", "IN_PROGRESS" -> inProgress += count.getCount();
                case "SUBMITTED" -> submitted += count.getCount();
                case "COMPLETED" -> completed += count.getCount();
                case "ON_HOLD" -> onHold += count.getCount();
            }
        }

        return new TicketStatsResponse(
                (int) total,
                (int) open,
                (int) inProgress,
                (int) submitted,
                (int) completed,
                (int) onHold
        );
    }

    private TicketResponse toResponse(Ticket ticket, User creator, User assignee, Site site) {
        List<String> completedSteps = new ArrayList<>();
        if (ticket.getCompletedSteps() != null && !ticket.getCompletedSteps().isEmpty()) {
            try {
                completedSteps = Arrays.asList(objectMapper.readValue(ticket.getCompletedSteps(), String[].class));
            } catch (JsonProcessingException e) {
                log.error("Error parsing completed steps", e);
            }
        }

        StepData stepData = null;
        if (ticket.getStepData() != null && !ticket.getStepData().isEmpty()) {
            try {
                stepData = new StepData(objectMapper.readValue(ticket.getStepData(), Map.class));
            } catch (JsonProcessingException e) {
                log.error("Error parsing step data", e);
            }
        }

        List<String> relatedTicketIds = new ArrayList<>();
        if (ticket.getRelatedTicketIds() != null && !ticket.getRelatedTicketIds().isEmpty()) {
            try {
                relatedTicketIds = Arrays.asList(objectMapper.readValue(ticket.getRelatedTicketIds(), String[].class));
            } catch (JsonProcessingException e) {
                log.error("Error parsing related ticket ids", e);
            }
        }

        List<TicketCommentResponse> comments = getTicketComments(ticket.getId());

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getType() != null ? ticket.getType().toLowerCase() : null,
                ticket.getStatus() != null ? ticket.getStatus().toLowerCase() : null,
                ticket.getPriority(),
                ticket.getSite(),
                site != null ? site.getName() : null,       // siteName
                site != null ? site.getAddress() : null,    // siteAddress
                ticket.getTemplateId(),
                null,
                ticket.getAssignedTo(),
                assignee != null ? assignee.getName() : null,
                ticket.getCreatedBy(),
                creator != null ? creator.getName() : null,
                ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null,
                ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().toString() : null,
                ticket.getDueDate() != null ? ticket.getDueDate().toString() : null,
                completedSteps,
                stepData,
                ticket.getAccepted(),
                ticket.getAcceptedAt() != null ? ticket.getAcceptedAt().toString() : null,
                ticket.getDepartureAt() != null ? ticket.getDepartureAt().toString() : null,
                ticket.getDeparturePhoto(),
                ticket.getArrivalAt() != null ? ticket.getArrivalAt().toString() : null,
                ticket.getArrivalPhoto(),
                ticket.getCompletionPhoto(),
                ticket.getCause(),
                ticket.getSolution(),
                comments,
                relatedTicketIds,
                ticket.getProblemType()
        );
    }

    @Transactional
    public TicketResponse updateTicketStep(Long ticketId, String stepId, TicketStepUpdateRequest request, String userId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }

        // 解析现有的 stepData
        Map<String, Object> stepDataMap = new HashMap<>();
        if (ticket.getStepData() != null && !ticket.getStepData().isEmpty()) {
            try {
                stepDataMap = objectMapper.readValue(ticket.getStepData(), Map.class);
            } catch (JsonProcessingException e) {
                log.error("Error parsing step data", e);
            }
        }

        // 更新步骤数据
        Map<String, Object> stepData = new HashMap<>();
        if (stepDataMap.containsKey("steps")) {
            Object existingSteps = stepDataMap.get("steps");
            if (existingSteps instanceof List) {
                List<Map<String, Object>> steps = new ArrayList<>();
                for (Object s : (List<?>) existingSteps) {
                    if (s instanceof Map) {
                        Map<String, Object> step = new HashMap<>((Map<String, Object>) s);
                        if (stepId.equals(step.get("id"))) {
                            // 更新当前步骤
                            if (request.getCompleted() != null) {
                                step.put("completed", request.getCompleted());
                            }
                            if (request.getDescription() != null) {
                                step.put("description", request.getDescription());
                            }
                            if (request.getStatus() != null) {
                                step.put("status", request.getStatus());
                            }
                            if (request.getCause() != null) {
                                step.put("cause", request.getCause());
                            }
                            if (request.getPhotoUrl() != null) {
                                step.put("photoUrl", request.getPhotoUrl());
                            }
                            if (request.getPhotoUrls() != null) {
                                step.put("photoUrls", request.getPhotoUrls());
                            }
                            if (request.getBeforePhotoUrl() != null) {
                                step.put("beforePhotoUrl", request.getBeforePhotoUrl());
                            }
                            if (request.getBeforePhotoUrls() != null) {
                                step.put("beforePhotoUrls", request.getBeforePhotoUrls());
                            }
                            if (request.getAfterPhotoUrl() != null) {
                                step.put("afterPhotoUrl", request.getAfterPhotoUrl());
                            }
                            if (request.getAfterPhotoUrls() != null) {
                                step.put("afterPhotoUrls", request.getAfterPhotoUrls());
                            }
                            if (request.getTimestamp() != null) {
                                step.put("timestamp", request.getTimestamp());
                            }
                        }
                        steps.add(step);
                    }
                }
                stepData.put("steps", steps);
            }
        }

        // 保存更新后的 stepData
        try {
            String stepDataJson = objectMapper.writeValueAsString(stepData);
            ticket.setStepData(stepDataJson);
            ticketMapper.updateById(ticket);
        } catch (JsonProcessingException e) {
            log.error("Error saving step data", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        return getTicketById(ticketId);
    }
}
