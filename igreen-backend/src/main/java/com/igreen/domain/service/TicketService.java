package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.StepData;
import com.igreen.domain.dto.TicketAcceptRequest;
import com.igreen.domain.dto.TicketCancelRequest;
import com.igreen.domain.dto.TicketCommentCreateRequest;
import com.igreen.domain.dto.TicketCommentResponse;
import com.igreen.domain.dto.TicketCreateRequest;
import com.igreen.domain.dto.TicketDeclineRequest;
import com.igreen.domain.dto.TicketResponse;
import com.igreen.domain.dto.TicketStatsResponse;
import com.igreen.domain.dto.TicketUpdateRequest;
import com.igreen.domain.entity.Ticket;
import com.igreen.domain.entity.TicketComment;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.CommentType;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;
import com.igreen.domain.mapper.TicketCommentMapper;
import com.igreen.domain.mapper.TicketMapper;
import com.igreen.domain.mapper.TicketStatusCount;
import com.igreen.domain.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {


    private final TicketMapper ticketMapper;
    private final TicketCommentMapper ticketCommentMapper;
    private final UserMapper userMapper;
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

        TicketType ticketType = TicketType.valueOf(request.type());
        Priority ticketPriority = request.priority() != null ? Priority.valueOf(request.priority()) : null;

        String relatedTicketIdsJson = null;
        if (request.relatedTicketIds() != null && !request.relatedTicketIds().isEmpty()) {
            try {
                relatedTicketIdsJson = objectMapper.writeValueAsString(request.relatedTicketIds());
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
        }

        Ticket ticket = Ticket.builder()
                .id(UUID.randomUUID().toString())
                .title(request.title())
                .description(request.description())
                .type(ticketType)
                .site(request.site())
                .priority(ticketPriority)
                .templateId(request.templateId())
                .assignedTo(request.assignedTo())
                .createdBy(currentUserId)
                .dueDate(request.dueDate())
                .status(TicketStatus.OPEN)
                .problemType(request.problemType())
                .relatedTicketIds(relatedTicketIdsJson)
                .build();

        ticketMapper.insert(ticket);
        return toResponse(ticket, creator, assignee);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(String id) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();

        return toResponse(ticket, creator, assignee);
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getTickets(int page, int size, String type, String status,
            String priority, String assignedTo, String keyword, LocalDateTime createdAfter) {
        PageHelper.startPage(page, size);
        try {
            TicketType ticketType = type != null ? TicketType.valueOf(type) : null;
            TicketStatus ticketStatus = status != null ? TicketStatus.valueOf(status) : null;
            Priority ticketPriority = priority != null ? Priority.valueOf(priority) : null;

            LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
            if (ticketType != null) {
                wrapper.eq(Ticket::getType, ticketType);
            }
            if (ticketStatus != null) {
                wrapper.eq(Ticket::getStatus, ticketStatus);
            }
            if (ticketPriority != null) {
                wrapper.eq(Ticket::getPriority, ticketPriority);
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
                        return toResponse(ticket, creator, assignee);
                    })
                    .collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional
    public TicketResponse updateTicket(String id, TicketUpdateRequest request) {
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
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public void deleteTicket(String id) {
        if (ticketMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }
        ticketMapper.deleteById(id);
    }

    @Transactional
    public TicketResponse acceptTicket(String id, TicketAcceptRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BusinessException(ErrorCode.TICKET_ALREADY_ACCEPTED);
        }

        ticket.setStatus(TicketStatus.ACCEPTED);
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
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse declineTicket(String id, TicketDeclineRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus(TicketStatus.CANCELLED);
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
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse cancelTicket(String id, TicketCancelRequest request, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_CREATOR);
        }

        ticket.setStatus(TicketStatus.CANCELLED);

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
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse departTicket(String id, String departurePhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setDepartureAt(LocalDateTime.now());
        if (departurePhoto != null) {
            ticket.setDeparturePhoto(departurePhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse arriveTicket(String id, String arrivalPhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setArrivalAt(LocalDateTime.now());
        if (arrivalPhoto != null) {
            ticket.setArrivalPhoto(arrivalPhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse submitTicket(String id, StepData stepData, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
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
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse completeTicket(String id, String completionPhoto, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus(TicketStatus.COMPLETED);
        if (completionPhoto != null) {
            ticket.setCompletionPhoto(completionPhoto);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketResponse reviewTicket(String id, String cause, String userId) {
        Ticket ticket = ticketMapper.selectByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (cause != null) {
            ticket.setCause(cause);
            ticket.setStatus(TicketStatus.OPEN);
        } else {
            ticket.setStatus(TicketStatus.COMPLETED);
        }

        ticketMapper.updateById(ticket);

        User creator = ticket.getCreator();
        User assignee = ticket.getAssignee();
        return toResponse(ticket, creator, assignee);
    }

    @Transactional
    public TicketCommentResponse addTicketComment(String ticketId, TicketCommentCreateRequest request, String userId) {
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
    public List<TicketCommentResponse> getTicketComments(String ticketId) {
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
            if (status != null) {
                tickets = tickets.stream()
                        .filter(t -> t.getStatus().name().equals(status))
                        .collect(Collectors.toList());
            }

            List<TicketResponse> ticketResponses = tickets.stream()
                    .map(ticket -> {
                        User creator = userMapper.selectById(ticket.getCreatedBy());
                        User assignee = userMapper.selectById(ticket.getAssignedTo());
                        return toResponse(ticket, creator, assignee);
                    })
                    .collect(Collectors.toList());

            PageInfo<Ticket> pageInfo = new PageInfo<>(tickets);
            return PageResult.of(pageInfo, ticketResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getPendingTickets() {
        List<String> statuses = Arrays.asList(TicketStatus.OPEN.name(), TicketStatus.ASSIGNED.name());
        List<Ticket> tickets = ticketMapper.selectByStatusIn(statuses);

        return tickets.stream()
                .map(ticket -> {
                    User creator = userMapper.selectById(ticket.getCreatedBy());
                    User assignee = userMapper.selectById(ticket.getAssignedTo());
                    return toResponse(ticket, creator, assignee);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getCompletedTickets(int page, int size) {
        PageHelper.startPage(page, size);
        try {
            List<Ticket> tickets = ticketMapper.selectByStatus(TicketStatus.COMPLETED.name());

            List<TicketResponse> ticketResponses = tickets.stream()
                    .map(ticket -> {
                        User creator = userMapper.selectById(ticket.getCreatedBy());
                        User assignee = userMapper.selectById(ticket.getAssignedTo());
                        return toResponse(ticket, creator, assignee);
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

    private TicketResponse toResponse(Ticket ticket, User creator, User assignee) {
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
                ticket.getType(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getSite(),
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
}
