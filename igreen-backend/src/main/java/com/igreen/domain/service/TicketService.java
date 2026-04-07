package com.igreen.domain.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.context.CountryContext;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.*;
import com.igreen.domain.enums.CommentType;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.mapper.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
    private final TicketAttachmentMapper ticketAttachmentMapper;
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
        Group group = groupMapper.selectById(request.getAssignedTo());
        if (group == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        // 验证 siteId（如果提供）
        Site site = siteMapper.selectById(request.getSiteId());

        if (!TicketType.PROBLEM.name().equals(request.getType().toUpperCase())) {
            if (site == null) {
                throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
            }
        }

        // Problem ticket: 如果未提供 siteId，从 relatedTicketIds 中推断
        if (TicketType.PROBLEM.name().equals(request.getType().toUpperCase()) 
            && request.getSiteId() == null 
            && request.getRelatedTicketIds() != null 
            && !request.getRelatedTicketIds().isEmpty()) {
            
            // 从第一个 related ticket 提取 siteId
            String firstRelatedTicketId = request.getRelatedTicketIds().get(0);
            try {
                Long ticketId = Long.parseLong(firstRelatedTicketId);
                Ticket relatedTicket = ticketMapper.selectById(ticketId);
                if (relatedTicket != null && relatedTicket.getSiteId() != null) {
                    // 使用 related ticket 的 siteId
                    request.setSiteId(relatedTicket.getSiteId());
                    site = siteMapper.selectById(relatedTicket.getSiteId());
                    log.info("Auto-filled siteId {} for problem ticket from related ticket {}", 
                        relatedTicket.getSiteId(), firstRelatedTicketId);
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid related ticket ID format: {}", firstRelatedTicketId);
            }
        }

        String relatedTicketIdsJson = null;
        if (request.getRelatedTicketIds() != null && !request.getRelatedTicketIds().isEmpty()) {
            relatedTicketIdsJson = String.join(",", request.getRelatedTicketIds());
        }

        String country = CountryContext.get();

        Ticket ticket = Ticket.builder().title(request.getTitle()).description(request.getDescription()).type(request.getType()).siteId(request.getSiteId()).priority(request.getPriority()).templateId(request.getTemplateId()).assignedTo(request.getAssignedTo()).createdBy(currentUserId).dueDate(request.getDueDate()).status(TicketStatus.OPEN).country(country).problemType(request.getProblemType()).relatedTicketIds(relatedTicketIdsJson).build();

        ticketMapper.insert(ticket);

        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<TicketAttachment> attachments = request.getAttachmentIds().stream().map(fileId -> TicketAttachment.builder().id(UUID.randomUUID().toString()).ticketId(ticket.getId()).fileId(fileId).createdAt(LocalDateTime.now()).build()).toList();
            ticketAttachmentMapper.insertBatch(attachments);
        }

        // Initialize templateData from template if ticket has templateId
        if (ticket.getTemplateId() != null) {
            initializeTemplateDataFromTemplate(ticket);
            ticketMapper.updateById(ticket);
        }

        return toResponse(ticket, creator, group, site);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketMapper.selectById(id);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }

        User creator = userMapper.selectById(ticket.getCreatedBy());
        Group assignGroup = groupMapper.selectById(ticket.getAssignedTo());
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getTickets(int page, int size, String type, String status, String priority, String assignedTo, String keyword, LocalDateTime createdAfter, LocalDateTime createdBefore, String currentUserId) {
        String country = CountryContext.get();
        
        User currentUser = userMapper.selectById(currentUserId);
        UserRole currentUserRole = currentUser != null ? currentUser.getRole() : null;
        
        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
            
            if (country != null && !country.isBlank()) {
                wrapper.eq(Ticket::getCountry, country);
            }
            
            if (currentUserRole == UserRole.ENGINEER) {
                String groupId = currentUser.getGroupId();
                wrapper.and(w -> w
                    .eq(Ticket::getAcceptedUserId, currentUserId)
                    .or()
                    .eq(Ticket::getAssignedTo, groupId)
                );
            }
            
            if (type != null) {
                wrapper.eq(Ticket::getType, type);
            }
            if (status != null && !status.isBlank()) {
                // Support comma-separated status values for IN query
                if (status.contains(",")) {
                    List<String> statusList = Arrays.asList(status.split(","));
                    wrapper.in(Ticket::getStatus, statusList);
                } else {
                    wrapper.eq(Ticket::getStatus, status);
                }
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
            if (createdBefore != null) {
                wrapper.le(Ticket::getCreatedAt, createdBefore);
            }
            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = keyword.trim().toLowerCase();
                wrapper.and(w -> w
                    .like(Ticket::getTitle, keywordLower)
                    .or()
                    .like(Ticket::getDescription, keywordLower)
                    .or()
                    .apply("CAST(id AS CHAR) LIKE {0}", "%" + keywordLower + "%")
                );
            }

            List<Ticket> tickets = ticketMapper.selectList(wrapper);

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
    public void exportTickets(String type, String status, String priority, String assignedTo, String keyword, LocalDateTime createdAfter, LocalDateTime createdBefore, String currentUserId, HttpServletResponse response) {
        String country = CountryContext.get();
        
        User currentUser = userMapper.selectById(currentUserId);
        UserRole currentUserRole = currentUser != null ? currentUser.getRole() : null;
        
        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        
        if (country != null && !country.isBlank()) {
            wrapper.eq(Ticket::getCountry, country);
        }
        
        if (currentUserRole == UserRole.ENGINEER) {
            String groupId = currentUser.getGroupId();
            wrapper.and(w -> w
                .eq(Ticket::getAcceptedUserId, currentUserId)
                .or()
                .eq(Ticket::getAssignedTo, groupId)
            );
        }
        
        if (type != null) {
            wrapper.eq(Ticket::getType, type);
        }
        if (status != null && !status.isBlank()) {
            // Support comma-separated status values for IN query
            if (status.contains(",")) {
                List<String> statusList = Arrays.asList(status.split(","));
                wrapper.in(Ticket::getStatus, statusList);
            } else {
                wrapper.eq(Ticket::getStatus, status);
            }
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
        if (createdBefore != null) {
            wrapper.le(Ticket::getCreatedAt, createdBefore);
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            String keywordLower = keyword.trim().toLowerCase();
            wrapper.and(w -> w
                .like(Ticket::getTitle, keywordLower)
                .or()
                .like(Ticket::getDescription, keywordLower)
                .or()
                .apply("CAST(id AS CHAR) LIKE {0}", "%" + keywordLower + "%")
            );
        }

        wrapper.orderByDesc(Ticket::getCreatedAt);

        List<Ticket> tickets = ticketMapper.selectList(wrapper);

        List<TicketExcelDTO> excelDTOs = tickets.stream().map(ticket -> {
            User creator = userMapper.selectById(ticket.getCreatedBy());
            Group assignGroup = groupMapper.selectById(ticket.getAssignedTo());
            Site site = siteMapper.selectById(ticket.getSiteId());
            User acceptedUser = ticket.getAcceptedUserId() != null ? userMapper.selectById(ticket.getAcceptedUserId()) : null;
            
            TicketExcelDTO dto = new TicketExcelDTO();
            dto.setId(String.valueOf(ticket.getId()));
            dto.setTitle(ticket.getTitle());
            dto.setType(ticket.getType());
            dto.setStatus(ticket.getStatus() != null ? ticket.getStatus().getValue() : null);
            dto.setPriority(ticket.getPriority());
            dto.setSiteName(site != null ? site.getName() : null);
            dto.setSiteAddress(site != null ? site.getAddress() : null);
            dto.setAssignedToName(assignGroup != null ? assignGroup.getName() : null);
            dto.setAcceptedUserName(acceptedUser != null ? acceptedUser.getName() : null);
            dto.setCreatedByName(creator != null ? creator.getName() : null);
            dto.setCreatedAt(ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(DATE_TIME_FORMATTER) : null);
            dto.setDueDate(ticket.getDueDate() != null ? ticket.getDueDate().format(DATE_TIME_FORMATTER) : null);
            dto.setCompletedAt(ticket.getUpdatedAt() != null && ticket.getStatus() == TicketStatus.COMPLETED 
                ? ticket.getUpdatedAt().format(DATE_TIME_FORMATTER) : null);
            return dto;
        }).collect(Collectors.toList());

        String fileName = "tickets_export_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";

        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-Disposition",
                "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));

            EasyExcel.write(response.getOutputStream(), TicketExcelDTO.class)
                .sheet("Tickets")
                .doWrite(excelDTOs);

        } catch (IOException e) {
            log.error("导出工单数据失败", e);
            throw new BusinessException("导出失败: " + e.getMessage());
        }
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (request.getTitle() != null) {
            ticket.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            ticket.setType(request.getType());
        }
        if (request.getSiteId() != null) {
            ticket.setSiteId(request.getSiteId());
        }
        if (request.getStatus() != null) {
            ticket.setStatus(TicketStatus.fromValue(request.getStatus()));
        }
        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }
        if (request.getAssignedTo() != null) {
            ticket.setAssignedTo(request.getAssignedTo());
        }
        if (request.getDueDate() != null) {
            ticket.setDueDate(request.getDueDate());
        }
        if (request.getTemplateData() != null) {
            try {
                ticket.setTemplateData(objectMapper.writeValueAsString(request.getTemplateData()));
            } catch (JsonProcessingException e) {
                log.error("Error serializing template data", e);
            }
        }
        if (request.getDepartureAt() != null) {
            ticket.setDepartureAt(request.getDepartureAt());
        }
        if (request.getDeparturePhoto() != null) {
            ticket.setDeparturePhoto(request.getDeparturePhoto());
        }
        if (request.getArrivalAt() != null) {
            ticket.setArrivalAt(request.getArrivalAt());
        }
        if (request.getArrivalPhoto() != null) {
            ticket.setArrivalPhoto(request.getArrivalPhoto());
        }
        if (request.getCompletionPhoto() != null) {
            ticket.setCompletionPhoto(request.getCompletionPhoto());
        }
        if (request.getCause() != null) {
            ticket.setCause(request.getCause());
        }
        if (request.getSolution() != null) {
            ticket.setSolution(request.getSolution());
        }
        if (request.getRelatedTicketIds() != null && !request.getRelatedTicketIds().isEmpty()) {
            ticket.setRelatedTicketIds(String.join(",", request.getRelatedTicketIds()));
        }
        if (request.getProblemType() != null) {
            ticket.setProblemType(request.getProblemType());
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
        if (ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.ASSIGNED) {
            // 设置抢单用户ID，assignedTo保持不变（仍为组ID）
            ticket.setAcceptedUserId(userId);
        } else {
            throw new BusinessException(ErrorCode.TICKET_ALREADY_ACCEPTED);
        }

        ticket.setStatus(TicketStatus.ACCEPTED);
        ticket.setAccepted(true);
        ticket.setAcceptedAt(LocalDateTime.now());

        if (request.getComment() != null) {
            TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.getComment()).type(CommentType.ACCEPT).ticketId(id).userId(userId).build();
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

        ticket.setStatus(TicketStatus.CANCELLED);
        ticket.setAccepted(false);

        TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.getComment()).type(CommentType.DECLINE).ticketId(id).userId(userId).build();
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

        ticket.setStatus(TicketStatus.CANCELLED);

        TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.getReason()).type(CommentType.CANCEL).ticketId(id).userId(userId).build();
        ticketCommentMapper.insert(comment);

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    @Transactional
    public TicketResponse reassignTicket(Long id, TicketReassignRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        String newGroupId = request.getNewGroupId();
        
        Group newGroup = groupMapper.selectById(newGroupId);
        if (newGroup == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        Group oldGroup = ticket.getAssignGroup();
        String oldGroupName = oldGroup != null ? oldGroup.getName() : "Unknown";

        ticket.setAssignedTo(newGroupId);
        ticket.setAcceptedUserId(null);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setAccepted(false);
        ticket.setAcceptedAt(null);

        String commentText = String.format("Ticket reassigned from group '%s' to group '%s'", oldGroupName, newGroup.getName());
        if (request.getReason() != null && !request.getReason().isBlank()) {
            commentText += ". Reason: " + request.getReason();
        }

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .comment(commentText)
                .type(CommentType.REASSIGN)
                .ticketId(id)
                .userId(userId)
                .build();
        ticketCommentMapper.insert(comment);

        ticketMapper.updateById(ticket);

        ticket.setAssignGroup(newGroup);
        User creator = ticket.getCreator();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, newGroup, site);
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
        if (ticket.getStatus() != TicketStatus.DEPARTED && ticket.getStatus() != TicketStatus.ACCEPTED) {
            throw new BusinessException(ErrorCode.TICKET_INVALID_STATUS);
        }

        ticket.setStatus(TicketStatus.DEPARTED);
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
        if (ticket.getStatus() != TicketStatus.DEPARTED) {
            throw new BusinessException(ErrorCode.TICKET_INVALID_STATUS);
        }

        ticket.setStatus(TicketStatus.ARRIVED);
        ticket.setArrivalAt(LocalDateTime.now());
        if (arrivalPhoto != null) {
            ticket.setArrivalPhoto(arrivalPhoto);
        }

        // Initialize templateData from template if ticket has templateId and templateData is null/empty
        if (ticket.getTemplateId() != null && (ticket.getTemplateData() == null || ticket.getTemplateData().isEmpty())) {
            initializeTemplateDataFromTemplate(ticket);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    /**
     * 从模板初始化 templateData
     * <p>
     * templateData 结构 = 模板快照 + 用户填写值
     *
     * @param ticket 工单实体
     */
    private void initializeTemplateDataFromTemplate(Ticket ticket) {
        try {
            Template template = templateService.getTemplateById(ticket.getTemplateId());
            List<TemplateStep> templateSteps = template.getSteps();

            if (templateSteps != null && !templateSteps.isEmpty()) {
                // 构建 templateData 结构
                List<TemplateStepData> templateDataSteps = new ArrayList<>();

                for (TemplateStep step : templateSteps) {
                    // 构建字段列表
                    List<TemplateFieldData> fieldDatas = new ArrayList<>();

                    if (step.getFields() != null && !step.getFields().isEmpty()) {
                        for (TemplateField field : step.getFields()) {
                            TemplateFieldData fieldData = new TemplateFieldData();
                            BeanUtils.copyProperties(field, fieldData);
                            fieldData.setValue(""); // 初始值为空
                            fieldDatas.add(fieldData);
                        }
                    }

                    // 构建 step
                    TemplateStepData stepData = new TemplateStepData();
                    stepData.setId(step.getId());
                    stepData.setName(step.getName());
                    stepData.setStatus("pending");
                    stepData.setCompleted(false);
                    stepData.setTimestamp(null);
                    stepData.setFields(fieldDatas);

                    templateDataSteps.add(stepData);
                }

                // 设置 templateData
                TemplateData templateData = new TemplateData();
                templateData.setId(template.getId());
                templateData.setName(template.getName());
                templateData.setType(ticket.getType());
                templateData.setSteps(templateDataSteps);

                ticket.setTemplateData(objectMapper.writeValueAsString(templateData));

                log.info("Initialized templateData for ticket {} from template {}", ticket.getId(), ticket.getTemplateId());
            }
        } catch (JsonProcessingException e) {
            log.error("Error initializing templateData from template for ticket {}", ticket.getId(), e);
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
                String existingData = ticket.getTemplateData();
                TemplateData dataMap;
                if (existingData != null && !existingData.isEmpty()) {
                    dataMap = objectMapper.readValue(existingData, new TypeReference<TemplateData>() {
                    });
                } else {
                    dataMap = new TemplateData();
                }

                dataMap.getSteps().forEach(templateStepData -> {
                    if (templateStepData.getId().equals(stepData.getData().getId())) {
                        BeanUtils.copyProperties(stepData.getData(), templateStepData);
                    }
                });
                ticket.setTemplateData(objectMapper.writeValueAsString(dataMap));
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

        ticket.setStatus(TicketStatus.COMPLETED);
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
    public TicketResponse submitTicketForReview(Long id, String userId, TemplateData templateData) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // 检查工单状态是否为 ARRIVED（工程师已到达现场）
        if (ticket.getStatus() != TicketStatus.ARRIVED) {
            throw new BusinessException("工单状态不正确，无法提交审核");
        }

        // 保存 templateData 到工单
        if (templateData != null) {
            try {
                String templateDataJson = objectMapper.writeValueAsString(templateData);
                ticket.setTemplateData(templateDataJson);
            } catch (JsonProcessingException e) {
                throw new BusinessException("保存模板数据失败: " + e.getMessage());
            }
        }

        // 将工单状态设置为 REVIEW（待审核）
        ticket.setStatus(TicketStatus.REVIEW);
        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        Group assignGroup = ticket.getAssignGroup();
        Site site = siteMapper.selectById(ticket.getSiteId());
        return toResponse(ticket, creator, assignGroup, site);
    }

    public TicketResponse submitTicketForReview(Long id, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id).orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        // 检查工单状态是否为 ARRIVED（工程师已到达现场）
        if (ticket.getStatus() != TicketStatus.ARRIVED) {
            throw new BusinessException("工单状态不正确，无法提交审核");
        }

        // 将工单状态设置为 REVIEW（待审核）
        ticket.setStatus(TicketStatus.REVIEW);
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
            ticket.setStatus(TicketStatus.ARRIVED);
            
            // 添加拒绝评论，记录拒绝原因
            TicketComment rejectComment = TicketComment.builder()
                    .id(UUID.randomUUID().toString())
                    .comment(cause)
                    .type(CommentType.REJECT)
                    .ticketId(id)
                    .userId(userId)
                    .build();
            ticketCommentMapper.insert(rejectComment);
        } else {
            // 无原因 → 管理员审核通过，工单完成
            ticket.setStatus(TicketStatus.COMPLETED);
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

        TicketComment comment = TicketComment.builder().id(UUID.randomUUID().toString()).comment(request.getComment()).type(request.getType() != null ? request.getType() : CommentType.GENERAL).ticketId(ticketId).userId(userId).build();

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
        String country = CountryContext.get();
        
        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Ticket::getAcceptedUserId, userId).eq(Ticket::getCountry, country);
            
            if (status != null && !status.isEmpty()) {
                wrapper.eq(Ticket::getStatus, TicketStatus.fromValue(status));
            }
            
            List<Ticket> tickets = ticketMapper.selectList(wrapper);

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
        String country = CountryContext.get();
        
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Ticket::getStatus, TicketStatus.OPEN)
               .eq(Ticket::getAssignedTo, user.getGroupId())
               .eq(Ticket::getCountry, country);
        
        List<Ticket> tickets = ticketMapper.selectList(wrapper);

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
        String country = CountryContext.get();
        
        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Ticket::getStatus, TicketStatus.COMPLETED)
                   .eq(Ticket::getCountry, country);
            
            List<Ticket> tickets = ticketMapper.selectList(wrapper);

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
        String country = CountryContext.get();
        String queryType = "all".equalsIgnoreCase(type) ? null : type;
        List<TicketStatusCount> statusCounts = ticketMapper.countByStatusGroup(queryType, country, null);

        long total = 0;
        long open = 0;
        long accepted = 0;
        long inProgress = 0;
        long submitted = 0;
        long onHold = 0;
        long completed = 0;
        long cancelled = 0;
        for (TicketStatusCount count : statusCounts) {
            total += count.getCount();
            switch (count.getStatus()) {
                case "OPEN" -> open += count.getCount();
                case "ASSIGNED" -> accepted += count.getCount();
                case "ACCEPTED", "DEPARTED", "ARRIVED" -> inProgress += count.getCount();
                case "REVIEW" -> submitted += count.getCount();
                case "ON_HOLD" -> onHold += count.getCount();
                case "COMPLETED" -> completed += count.getCount();
                case "CANCELLED" -> cancelled += count.getCount();
            }
        }
        return new TicketStatsResponse((int) total, (int) open, (int) inProgress, (int) submitted, (int) onHold, (int) completed, (int) cancelled);
    }

    @Transactional(readOnly = true)
    public TicketStatsResponse getMyTicketStats(String userId) {
        String country = CountryContext.get();
        List<TicketStatusCount> statusCounts = ticketMapper.countByStatusGroup(null, country, userId);

        long total = 0;
        long open = 0;
        long inProgress = 0;
        long submitted = 0;
        long onHold = 0;
        long completed = 0;
        long cancelled = 0;
        for (TicketStatusCount count : statusCounts) {
            total += count.getCount();
            switch (count.getStatus()) {
                case "OPEN" -> open += count.getCount();
                case "ASSIGNED", "ACCEPTED", "DEPARTED", "ARRIVED" -> inProgress += count.getCount();
                case "REVIEW" -> submitted += count.getCount();
                case "ON_HOLD" -> onHold += count.getCount();
                case "COMPLETED" -> completed += count.getCount();
                case "CANCELLED" -> cancelled += count.getCount();
            }
        }
        return new TicketStatsResponse((int) total, (int) open, (int) inProgress, (int) submitted, (int) onHold, (int) completed, (int) cancelled);
    }

    private TicketResponse toResponse(Ticket ticket, User creator, Group assignGroup, Site site) {
        // Fetch accepted user if ticket has acceptedUserId
        User acceptedUser = null;
        if (ticket.getAcceptedUserId() != null) {
            acceptedUser = userMapper.selectById(ticket.getAcceptedUserId());
        }

        List<String> relatedTicketIds = new ArrayList<>();
        if (StringUtils.isNotBlank(ticket.getRelatedTicketIds())) {
            relatedTicketIds = List.of(ticket.getRelatedTicketIds().split(","));
        }

        // Parse templateData
        Map<String, Object> templateData = new HashMap<>();
        List<String> completedSteps = new ArrayList<>();
        int completedStepsCount = 0;
        int totalStepsCount = 0;
        int progressPercentage = 0;
        boolean loadedFromTemplate = false;
        
        if (ticket.getTemplateData() != null && !ticket.getTemplateData().isEmpty()) {
            try {
                TemplateData data = objectMapper.readValue(ticket.getTemplateData(), new TypeReference<TemplateData>() {
                });
                templateData = objectMapper.convertValue(data, Map.class);
                
                // 提取已完成的步骤 ID（completed=true 的步骤）
                if (data.getSteps() != null && !data.getSteps().isEmpty()) {
                    totalStepsCount = data.getSteps().size();
                    completedSteps = data.getSteps().stream()
                        .filter(step -> step.getCompleted() != null && step.getCompleted())
                        .map(TemplateStepData::getId)
                        .collect(Collectors.toList());
                    completedStepsCount = completedSteps.size();
                    progressPercentage = totalStepsCount > 0 ? (completedStepsCount * 100 / totalStepsCount) : 0;
                    loadedFromTemplate = true;
                }
            } catch (JsonProcessingException e) {
                log.error("Error parsing template data", e);
            }
        }
        
        if (!loadedFromTemplate && ticket.getTemplateId() != null) {
            try {
                Template template = templateService.getTemplateById(ticket.getTemplateId());
                if (template != null && template.getSteps() != null) {
                    totalStepsCount = template.getSteps().size();
                    progressPercentage = 0;
                }
            } catch (Exception e) {
                log.error("Error loading template for ticket {}: {}", ticket.getId(), e.getMessage());
            }
        }
        List<TicketCommentResponse> comments = getTicketComments(ticket.getId());

        List<String> attachmentIds = ticketAttachmentMapper.selectByTicketId(ticket.getId()).stream().map(TicketAttachment::getFileId).collect(Collectors.toList());

        return new TicketResponse(ticket.getId(), ticket.getTitle(), ticket.getDescription(), ticket.getType() != null ? ticket.getType().toLowerCase() : null, ticket.getStatus() != null ? ticket.getStatus().getValue() : null, ticket.getPriority(), site != null ? site.getId() : null, site != null ? site.getName() : null, site != null ? site.getAddress() : null, ticket.getTemplateId(), null, ticket.getAssignedTo(), assignGroup != null ? assignGroup.getName() : null, ticket.getCreatedBy(), creator != null ? creator.getName() : null, ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(DATE_TIME_FORMATTER) : null, ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().format(DATE_TIME_FORMATTER) : null, ticket.getDueDate() != null ? ticket.getDueDate().format(DATE_TIME_FORMATTER) : null, completedSteps, templateData, completedStepsCount, totalStepsCount, progressPercentage, ticket.getAccepted(), ticket.getAcceptedAt() != null ? ticket.getAcceptedAt().format(DATE_TIME_FORMATTER) : null, ticket.getAcceptedUserId(), acceptedUser != null ? acceptedUser.getName() : null, ticket.getDepartureAt() != null ? ticket.getDepartureAt().format(DATE_TIME_FORMATTER) : null, ticket.getDeparturePhoto(), ticket.getArrivalAt() != null ? ticket.getArrivalAt().format(DATE_TIME_FORMATTER) : null, ticket.getArrivalPhoto(), ticket.getCompletionPhoto(), ticket.getCause(), ticket.getSolution(), comments, relatedTicketIds, ticket.getProblemType(), ticket.getCountry(), attachmentIds);
    }

    @Transactional
    public TicketResponse updateTicketStep(Long ticketId, String stepId, TicketStepUpdateRequest request, String userId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }

        TemplateStepData newStepData = request.getTemplateStepData();
        // 解析现有的 templateData
        TemplateData templateData = new TemplateData();

        if (ticket.getTemplateData() != null && !ticket.getTemplateData().isEmpty()) {
            try {
                templateData = objectMapper.readValue(ticket.getTemplateData(), new TypeReference<TemplateData>() {
                });
            } catch (JsonProcessingException e) {
                log.error("Error parsing step data", e);
            }
        }

        templateData.getSteps().stream().filter(stepData -> stepData.getId().equals(stepId)).forEach(stepValue -> {
            stepValue.setFields(newStepData.getFields());
            stepValue.setCompleted(newStepData.getCompleted());
            stepValue.setStatus(newStepData.getStatus());
            stepValue.setTimestamp(newStepData.getTimestamp());
        });

        // 保存更新后的 templateData
        try {
            String templateDataJson = objectMapper.writeValueAsString(templateData);
            ticket.setTemplateData(templateDataJson);
            ticketMapper.updateById(ticket);
        } catch (JsonProcessingException e) {
            log.error("Error saving step data", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }

        return getTicketById(ticketId);
    }
}
