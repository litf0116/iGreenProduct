package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.*;
import com.igreen.domain.enums.CommentType;
import com.igreen.domain.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final TicketMapper ticketMapper;
    private final TicketCommentMapper ticketCommentMapper;
    private final UserMapper userMapper;
    private final GroupMapper groupMapper;
    private final SiteMapper siteMapper;
    private final TemplateService templateService;
    private final StatusMappingService statusMappingService;
    private final ObjectMapper objectMapper;

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, String currentUserId) {
        User creator = userMapper.selectById(currentUserId);
        if (creator == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 验证 assignedTo 是用户组ID
        Group group = groupMapper.selectById(request.assignedTo());
        if (group == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        // 验证 siteId（如果提供）
        Site site = siteMapper.selectById(request.siteId());
        if (site == null) {
            throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
        }


        String relatedTicketIdsJson = null;
        if (request.relatedTicketIds() != null && !request.relatedTicketIds().isEmpty()) {
            relatedTicketIdsJson = String.join(",", request.relatedTicketIds());
        }

        Ticket ticket = Ticket.builder().title(request.title()).description(request.description()).type(request.type()).siteId(request.siteId()).priority(request.priority()).templateId(request.templateId()).assignedTo(request.assignedTo()).createdBy(currentUserId).dueDate(request.dueDate()).status("OPEN").problemType(request.problemType()).relatedTicketIds(relatedTicketIdsJson).build();

        ticketMapper.insert(ticket);

        // Initialize stepData from template if ticket has templateId
        if (ticket.getTemplateId() != null) {
            initializeStepDataFromTemplate(ticket);
            // 更新工单以包含 stepData
            ticketMapper.updateById(ticket);
        }

        return toResponse(ticket, creator, group, site);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();

        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getTickets(int page, int size, String type, String status, String priority, String assignedTo, String keyword, LocalDateTime createdAfter) {
        PageHelper.startPage(page, size);
        final String keywordLower = keyword != null ? keyword.toLowerCase() : null;
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

            List<TicketResponse> ticketResponses = tickets.stream().filter(ticket -> keywordLower == null || (ticket.getTitle() != null && ticket.getTitle().toLowerCase().contains(keywordLower)) || (ticket.getDescription() != null && ticket.getDescription().toLowerCase().contains(keywordLower))).map(ticket -> {
                User creator = userMapper.selectById(ticket.getCreatedBy());
                Group assignGroup = groupMapper.selectById(ticket.getAssignedTo());
                Site site = siteMapper.selectById(ticket.getSiteId());
                return toResponse(ticket, creator, assignGroup, site);
            }).collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (request.title() != null) {
            ticket.setTitle(request.title());
        }
        if (request.description() != null) {
            ticket.setDescription(request.description());
        }
        if (request.type() != null) {
            ticket.setType(request.type());
        }
        if (request.siteId() != null) {
            ticket.setSiteId(request.siteId());
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
        if (request.stepValues() != null) {
            try {
                ticket.setStepData(objectMapper.writeValueAsString(request.stepValues()));
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
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
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
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // OPEN/ASSIGNED 状态：用户组成员可抢单
        // 抢单后：assignedTo(组ID)不变，设置acceptedUserId
        if ("OPEN".equals(ticket.getStatus()) || "ASSIGNED".equals(ticket.getStatus())) {
            // 设置抢单用户ID，assignedTo保持不变（仍为组ID）
            ticket.setAcceptedUserId(userId);
        } else {
            throw new BusinessException(ErrorCode.TICKET_ALREADY_ACCEPTED);
        }

        ticket.setStatus("ACCEPTED");
        ticket.setAccepted(true);
        ticket.setAcceptedAt(LocalDateTime.now());

        if (request.comment() != null) {
            TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.comment()).type(CommentType.ACCEPT).ticketId(id).userId(userId).build();
            ticketCommentMapper.insert(comment);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse declineTicket(Long id, TicketDeclineRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // 验证权限：优先使用 acceptedUserId
        if (ticket.getAcceptedUserId() == null || !userId.equals(ticket.getAcceptedUserId())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus("CANCELLED");
        ticket.setAccepted(false);

        TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.comment()).type(CommentType.DECLINE).ticketId(id).userId(userId).build();
        ticketCommentMapper.insert(comment);

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse cancelTicket(Long id, TicketCancelRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_CREATOR);
        }

        ticket.setStatus("CANCELLED");

        TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.reason()).type(CommentType.CANCEL).ticketId(id).userId(userId).build();
        ticketCommentMapper.insert(comment);

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse departTicket(Long id, String departurePhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // Check if user is the assigned engineer
        // 验证权限：优先使用 acceptedUserId
        if (ticket.getAcceptedUserId() == null || !userId.equals(ticket.getAcceptedUserId())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        // Allow depart from ASSIGNED or ACCEPTED status
        if (!"ASSIGNED".equals(ticket.getStatus()) && !"ACCEPTED".equals(ticket.getStatus())) {
            throw new BusinessException(ErrorCode.TICKET_INVALID_STATUS);
        }

        ticket.setStatus("DEPARTED");
        ticket.setDepartureAt(LocalDateTime.now());
        if (departurePhoto != null) {
            ticket.setDeparturePhoto(departurePhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse arriveTicket(Long id, String arrivalPhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // Check if user is the assigned engineer
        // 验证权限：优先使用 acceptedUserId
        if (ticket.getAcceptedUserId() == null || !userId.equals(ticket.getAcceptedUserId())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        // Allow arrive from DEPARTED status
        if (!"DEPARTED".equals(ticket.getStatus())) {
            throw new BusinessException(ErrorCode.TICKET_INVALID_STATUS);
        }

        ticket.setStatus("ARRIVED");
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
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    private void initializeStepDataFromTemplate(Ticket ticket) {
        try {
            // 从 templateService 获取模板数据
            Template template = templateService.getTemplateById(ticket.getTemplateId());
            List<TemplateStep> templateSteps = template.getSteps();

            if (templateSteps != null && !templateSteps.isEmpty()) {
                // Convert template steps to the format expected by frontend
                List<TemplateStepValue> steps = new ArrayList<>();
                for (int i = 0; i < templateSteps.size(); i++) {
                    TemplateStep step = templateSteps.get(i);
                    TemplateStepValue templateStepValue = new TemplateStepValue();
                    BeanUtils.copyProperties(step, templateStepValue);
                    templateStepValue.setId(ticket.getId() + "_" + step.getId());
                    templateStepValue.setStatus("pending");
                    templateStepValue.setCompleted(false);

                    // 添加动态字段支持：将模板字段转换为步骤字段
                    if (step.getFields() != null && !step.getFields().isEmpty()) {
                        List<TemplateFieldValue> fieldValues = new ArrayList<>();
                        for (TemplateField field : step.getFields()) {
                            TemplateFieldValue fieldValue = new TemplateFieldValue();
                            BeanUtils.copyProperties(field, fieldValue);
                            fieldValue.setValue("");
                            fieldValues.add(fieldValue);
                        }
                        templateStepValue.setFieldValues(fieldValues);
                    }

                    steps.add(templateStepValue);
                }

                ticket.setStepData(objectMapper.writeValueAsString(steps));
                log.info("Initialized stepData for ticket {} from template {}", ticket.getId(), ticket.getTemplateId());
            }
        } catch (JsonProcessingException e) {
            log.error("Error initializing stepData from template for ticket {}", ticket.getId(), e);
        }
    }

    @Transactional
    public TicketResponse submitTicket(Long id, StepData stepData, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // 验证权限：优先使用 acceptedUserId
        if (ticket.getAcceptedUserId() == null || !userId.equals(ticket.getAcceptedUserId())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        try {
            if (stepData != null && stepData.getData() != null) {
                String existingData = ticket.getStepData();
                Map<String, Object> dataMap;
                if (existingData != null && !existingData.isEmpty()) {
                    dataMap = objectMapper.readValue(existingData, Map.class);
                } else {
                    dataMap = new HashMap<>();
                }
                dataMap.putAll(stepData.getData());
                ticket.setStepData(objectMapper.writeValueAsString(dataMap));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse completeTicket(Long id, String completionPhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // 验证权限：优先使用 acceptedUserId
        if (ticket.getAcceptedUserId() == null || !userId.equals(ticket.getAcceptedUserId())) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus("COMPLETED");
        if (completionPhoto != null) {
            ticket.setCompletionPhoto(completionPhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse submitTicketForReview(Long id, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // 检查工单状态是否为 ARRIVED（工程师已到达现场）
        if (!"ARRIVED".equals(ticket.getStatus())) {
            throw new BusinessException("工单状态不正确，无法提交审核");
        }

        // 将工单状态设置为 REVIEW（待审核）
        ticket.setStatus("REVIEW");
        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse reviewTicket(Long id, String cause, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (cause != null && !cause.trim().isEmpty()) {
            // 有原因 → 管理员拒绝，退回给工程师，状态回退到 ARRIVED
            ticket.setCause(cause);
            ticket.setStatus("ARRIVED");
        } else {
            // 无原因 → 管理员审核通过，工单完成
            ticket.setStatus("COMPLETED");
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketCommentResponse addTicketComment(Long ticketId, TicketCommentCreateRequest request, String userId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }

        TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.comment()).type(request.type() != null ? request.type() : CommentType.GENERAL).ticketId(ticketId).userId(userId).build();

        ticketCommentMapper.insert(comment);

        User user = userMapper.selectById(userId);
        return new TicketCommentResponse(comment.getId(), comment.getComment(), comment.getType().name(), userId, user != null ? user.getName() : null, ticketId, comment.getCreatedAt() != null ? comment.getCreatedAt().format(DATE_TIME_FORMATTER) : null);
    }

    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getTicketComments(Long ticketId) {
        return ticketCommentMapper.selectByTicketIdWithUser(ticketId).stream().map(comment -> {
            User user = userMapper.selectById(comment.getUserId());
            return new TicketCommentResponse(comment.getId(), comment.getComment(), comment.getType().name(), comment.getUserId(), user != null ? user.getName() : null, ticketId, comment.getCreatedAt() != null ? comment.getCreatedAt().format(DATE_TIME_FORMATTER) : null);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getMyTickets(int page, int size, String status, String userId) {
        PageHelper.startPage(page, size);
        try {
            List<Ticket> tickets = ticketMapper.selectByAcceptedUserId(userId);
            if (status != null && !status.isEmpty()) {
                tickets = tickets.stream().filter(t -> status.equalsIgnoreCase(t.getStatus())).collect(Collectors.toList());
            }

            List<TicketResponse> ticketResponses = tickets.stream().map(ticket -> {
                User creator = userMapper.selectById(ticket.getCreatedBy());
                Group assignGroup = groupMapper.selectById(ticket.getAssignedTo());
                Site site = siteMapper.selectById(ticket.getSiteId());
                return toResponse(ticket, creator, assignGroup, site);
            }).collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getPendingTickets(String userId) {
        // 获取当前工程师的 ID

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        Group group = groupMapper.selectById(user.getGroupId());
        if (group != null) {
            throw new BusinessException("用户租不存在");
        }

        // Queue: 只返回 OPEN 状态的工单（未分配，任何工程师可接单）
        List<String> statuses = Arrays.asList("OPEN");
        List<Ticket> tickets = ticketMapper.selectByStatusIn(statuses, user.getGroupId());

        List<TicketResponse> ticketResponses = tickets.stream().map(ticket -> {
            User creator = userMapper.selectById(ticket.getCreatedBy());
            Group assignGroup = groupMapper.selectById(ticket.getAssignedTo());
            Site site = siteMapper.selectById(ticket.getSiteId());
            return toResponse(ticket, creator, assignGroup, site);
        }).collect(Collectors.toList());

        return new PageResult<>(ticketResponses, ticketResponses.size(), 0, ticketResponses.size(), false);
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getCompletedTickets(int page, int size) {
        PageHelper.startPage(page, size);
        try {
            List<Ticket> tickets = ticketMapper.selectByStatus("COMPLETED");

            List<TicketResponse> ticketResponses = tickets.stream().map(ticket -> {
                User creator = userMapper.selectById(ticket.getCreatedBy());
                Group assignGroup = groupMapper.selectById(ticket.getAssignedTo());
                Site site = siteMapper.selectById(ticket.getSiteId());
                return toResponse(ticket, creator, assignGroup, site);
            }).collect(Collectors.toList());

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
        long accepted = 0;
        long inProcess = 0;
        long submitted = 0;
        long onHold = 0;
        long closed = 0;
        for (TicketStatusCount count : statusCounts) {
            total += count.getCount();
            switch (count.getStatus()) {
                case "OPEN" -> open += count.getCount();
                case "ASSIGNED" -> accepted += count.getCount();
                case "ACCEPTED", "DEPARTED", "ARRIVED" -> inProcess += count.getCount();
                case "REVIEW" -> submitted += count.getCount();
                case "ON_HOLD" -> onHold += count.getCount();
                case "COMPLETED", "CANCELLED" -> closed += count.getCount();
            }
        }
        return new TicketStatsResponse((int) total, (int) open, (int) inProcess, (int) submitted, (int) onHold, (int) closed);
    }

    private TicketResponse toResponse(Ticket ticket, User creator, Group assignGroup, Site site) {
        // Fetch accepted user if ticket has acceptedUserId
        User acceptedUser = null;
        if (ticket.getAcceptedUserId() != null) {
            acceptedUser = userMapper.selectById(ticket.getAcceptedUserId());
        }

        List<String> completedSteps = new ArrayList<>();
        if (ticket.getCompletedSteps() != null && !ticket.getCompletedSteps().isEmpty()) {
            try {
                completedSteps = Arrays.asList(objectMapper.readValue(ticket.getCompletedSteps(), String[].class));
            } catch (JsonProcessingException e) {
                log.error("Error parsing completed steps", e);
            }
        }

        List<TemplateStepValue> stepValues = new ArrayList<>();
        if (ticket.getStepData() != null && !ticket.getStepData().isEmpty()) {
            try {
                stepValues = objectMapper.readValue(ticket.getStepData(), new TypeReference<ArrayList<TemplateStepValue>>() {
                });
            } catch (JsonProcessingException e) {
                log.error("Error parsing step data", e);
            }
        }

        List<String> relatedTicketIds = new ArrayList<>();
        if (StringUtils.isNotBlank(ticket.getRelatedTicketIds())) {
            relatedTicketIds = List.of(ticket.getRelatedTicketIds().split(","));
        }


        List<TicketCommentResponse> comments = getTicketComments(ticket.getId());

        return new TicketResponse(ticket.getId(), ticket.getTitle(), ticket.getDescription(), ticket.getType() != null ? ticket.getType().toLowerCase() : null, ticket.getStatus() != null ? ticket.getStatus().toLowerCase() : null, ticket.getPriority(), site != null ? site.getId() : null,   // siteId
                                  site != null ? site.getName() : null,       // siteName
                                  site != null ? site.getAddress() : null,    // siteAddress
                                  ticket.getTemplateId(), null, ticket.getAssignedTo(), assignGroup != null ? assignGroup.getName() : null, ticket.getCreatedBy(), creator != null ? creator.getName() : null, ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(DATE_TIME_FORMATTER) : null, ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().format(DATE_TIME_FORMATTER) : null, ticket.getDueDate() != null ? ticket.getDueDate().format(DATE_TIME_FORMATTER) : null, completedSteps, stepValues, ticket.getAccepted(), ticket.getAcceptedAt() != null ? ticket.getAcceptedAt().format(DATE_TIME_FORMATTER) : null, ticket.getAcceptedUserId(), acceptedUser != null ? acceptedUser.getName() : null, ticket.getDepartureAt() != null ? ticket.getDepartureAt().format(DATE_TIME_FORMATTER) : null, ticket.getDeparturePhoto(), ticket.getArrivalAt() != null ? ticket.getArrivalAt().format(DATE_TIME_FORMATTER) : null, ticket.getArrivalPhoto(), ticket.getCompletionPhoto(), ticket.getCause(), ticket.getSolution(), comments, relatedTicketIds, ticket.getProblemType());
    }

    @Transactional
    public TicketResponse updateTicketStep(Long ticketId, String stepId, TicketStepUpdateRequest request, String userId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }

        // 解析现有的 stepData
        List<TemplateStepValue> stepValues = new ArrayList<>();
        if (ticket.getStepData() != null && !ticket.getStepData().isEmpty()) {
            try {
                stepValues = objectMapper.readValue(ticket.getStepData(), new TypeReference<List<TemplateStepValue>>() {
                });
            } catch (JsonProcessingException e) {
                log.error("Error parsing step data", e);
            }
        }

        stepValues.stream().filter(stepValue -> stepValue.getId().equals(stepId)).forEach(stepValue -> {
            stepValue.setFieldValues(request.getFieldValues());
            stepValue.setCompleted(request.getCompleted());
            stepValue.setStatus(request.getStatus());
            stepValue.setTimestamp(request.getTimestamp());
        });

        // 保存更新后的 stepData
        try {
            String stepDataJson = objectMapper.writeValueAsString(stepValues);
            ticket.setStepData(stepDataJson);
            ticketMapper.updateById(ticket);
        } catch (JsonProcessingException e) {
            log.error("Error saving step data", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        return getTicketById(ticketId);
    }
}
