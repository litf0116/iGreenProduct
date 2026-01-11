package com.igreen.domain.service;

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
import com.igreen.domain.dto.TicketUpdateRequest;
import com.igreen.domain.entity.Ticket;
import com.igreen.domain.entity.TicketComment;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.CommentType;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;
import com.igreen.domain.repository.TicketCommentRepository;
import com.igreen.domain.repository.TicketRepository;
import com.igreen.domain.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, String currentUserId) {
        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        User assignee = userRepository.findById(request.assignedTo())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Ticket ticket = Ticket.builder()
                .id(UUID.randomUUID().toString())
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .site(request.site())
                .priority(request.priority())
                .templateId(request.templateId())
                .assignedTo(request.assignedTo())
                .createdBy(currentUserId)
                .dueDate(request.dueDate())
                .status(TicketStatus.OPEN)
                .build();

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket, creator, assignee);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(String id) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getTickets(int page, int size, String type, String status,
            String priority, String assignedTo, String keyword, LocalDateTime createdAfter) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);

        TicketType ticketType = type != null ? TicketType.fromValue(type) : null;
        TicketStatus ticketStatus = status != null ? TicketStatus.valueOf(status) : null;
        Priority ticketPriority = priority != null ? Priority.valueOf(priority) : null;

        Page<Ticket> ticketPage = ticketRepository.findByFilters(
                ticketType, ticketStatus, ticketPriority, assignedTo, createdAfter, pageRequest);

        List<TicketResponse> tickets = ticketPage.getContent().stream()
                .filter(ticket -> keyword == null ||
                        ticket.getTitle().toLowerCase().contains(keyword.toLowerCase()) ||
                        (ticket.getDescription() != null && ticket.getDescription().toLowerCase().contains(keyword.toLowerCase())))
                .map(ticket -> toResponse(ticket, ticket.getCreator(), ticket.getAssignee()))
                .collect(Collectors.toList());

        return PageResult.of(tickets, ticketPage.getTotalElements(), page, size);
    }

    @Transactional
    public TicketResponse updateTicket(String id, TicketUpdateRequest request) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
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

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.TICKET_NOT_FOUND);
        }
        ticketRepository.deleteById(id);
    }

    @Transactional
    public TicketResponse acceptTicket(String id, TicketAcceptRequest request, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
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
            ticketCommentRepository.save(comment);
        }

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse declineTicket(String id, TicketDeclineRequest request, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
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
        ticketCommentRepository.save(comment);

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse cancelTicket(String id, TicketCancelRequest request, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
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
        ticketCommentRepository.save(comment);

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse departTicket(String id, String departurePhoto, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setDepartureAt(LocalDateTime.now());
        if (departurePhoto != null) {
            ticket.setDeparturePhoto(departurePhoto);
        }

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse arriveTicket(String id, String arrivalPhoto, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setArrivalAt(LocalDateTime.now());
        if (arrivalPhoto != null) {
            ticket.setArrivalPhoto(arrivalPhoto);
        }

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse submitTicket(String id, StepData stepData, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        try {
            if (stepData != null && stepData.data() != null) {
                String existingData = ticket.getStepData();
                java.util.Map<String, Object> dataMap;
                if (existingData != null && !existingData.isEmpty()) {
                    dataMap = objectMapper.readValue(existingData, java.util.Map.class);
                } else {
                    dataMap = new java.util.HashMap<>();
                }
                dataMap.putAll(stepData.data());
                ticket.setStepData(objectMapper.writeValueAsString(dataMap));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse completeTicket(String id, String completionPhoto, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getAssignedTo().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_ASSIGNEE);
        }

        ticket.setStatus(TicketStatus.COMPLETED);
        if (completionPhoto != null) {
            ticket.setCompletionPhoto(completionPhoto);
        }

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketResponse reviewTicket(String id, String cause, String userId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (cause != null) {
            ticket.setCause(cause);
            ticket.setStatus(TicketStatus.OPEN);
        } else {
            ticket.setStatus(TicketStatus.COMPLETED);
        }

        ticket = ticketRepository.save(ticket);

        return toResponse(ticket, ticket.getCreator(), ticket.getAssignee());
    }

    @Transactional
    public TicketCommentResponse addTicketComment(String ticketId, TicketCommentCreateRequest request, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .comment(request.comment())
                .type(request.type() != null ? request.type() : CommentType.GENERAL)
                .ticketId(ticketId)
                .userId(userId)
                .build();

        comment = ticketCommentRepository.save(comment);

        User user = userRepository.findById(userId).orElse(null);
        return new TicketCommentResponse(
                comment.getId(),
                comment.getComment(),
                comment.getType().name(),
                userId,
                user != null ? user.getName() : null,
                ticketId,
                comment.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getTicketComments(String ticketId) {
        return ticketCommentRepository.findByTicketIdWithUser(ticketId).stream()
                .map(comment -> new TicketCommentResponse(
                        comment.getId(),
                        comment.getComment(),
                        comment.getType().name(),
                        comment.getUserId(),
                        comment.getUser() != null ? comment.getUser().getName() : null,
                        ticketId,
                        comment.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getMyTickets(int page, int size, String status, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<Ticket> ticketPage = ticketRepository.findByAssignedToWithDetails(userId, pageRequest);

        List<TicketResponse> tickets = ticketPage.getContent().stream()
                .map(ticket -> toResponse(ticket, ticket.getCreator(), ticket.getAssignee()))
                .collect(Collectors.toList());

        return PageResult.of(tickets, ticketPage.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getPendingTickets() {
        return ticketRepository.findByStatusIn(
                        List.of(TicketStatus.OPEN, TicketStatus.ASSIGNED)
                ).stream()
                .map(ticket -> toResponse(ticket, ticket.getCreator(), ticket.getAssignee()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResult<TicketResponse> getCompletedTickets(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<Ticket> ticketPage = ticketRepository.findByStatusWithDetails(TicketStatus.COMPLETED, pageRequest);

        List<TicketResponse> tickets = ticketPage.getContent().stream()
                .map(ticket -> toResponse(ticket, ticket.getCreator(), ticket.getAssignee()))
                .collect(Collectors.toList());

        return PageResult.of(tickets, ticketPage.getTotalElements(), page, size);
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
                stepData = new StepData(objectMapper.readValue(ticket.getStepData(), java.util.Map.class));
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
                ticket.getType().name(),
                ticket.getStatus().name(),
                ticket.getPriority() != null ? ticket.getPriority().name() : null,
                ticket.getSite(),
                ticket.getTemplateId(),
                null,
                ticket.getAssignedTo(),
                assignee != null ? assignee.getName() : null,
                ticket.getCreatedBy(),
                creator != null ? creator.getName() : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getDueDate(),
                completedSteps,
                stepData,
                ticket.getAccepted(),
                ticket.getAcceptedAt(),
                ticket.getDepartureAt(),
                ticket.getDeparturePhoto(),
                ticket.getArrivalAt(),
                ticket.getArrivalPhoto(),
                ticket.getCompletionPhoto(),
                ticket.getCause(),
                ticket.getSolution(),
                comments,
                relatedTicketIds
        );
    }
}
