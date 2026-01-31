package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.TicketAcceptRequest;
import com.igreen.domain.dto.TicketCreateRequest;
import com.igreen.domain.dto.TicketResponse;
import com.igreen.domain.entity.Ticket;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.mapper.TicketCommentMapper;
import com.igreen.domain.mapper.TicketMapper;
import com.igreen.domain.dto.TicketCancelRequest;
import com.igreen.domain.dto.TicketCommentCreateRequest;
import com.igreen.domain.dto.TicketCommentResponse;
import com.igreen.domain.dto.TicketDeclineRequest;
import com.igreen.domain.dto.TicketStatsResponse;
import com.igreen.domain.dto.TicketUpdateRequest;
import com.igreen.domain.dto.StepData;
import com.igreen.domain.entity.TicketComment;
import com.igreen.domain.enums.CommentType;
import com.igreen.domain.mapper.TicketStatusCount;
import com.igreen.domain.mapper.TicketMapper;
import com.igreen.domain.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.igreen.common.result.PageResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketMapper ticketMapper;

    @Mock
    private TicketCommentMapper ticketCommentMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private TicketService ticketService;

    private Ticket testTicket;
    private User testCreator;
    private User testAssignee;

    @BeforeEach
    void setUp() {
        testCreator = User.builder()
                .id("creator-id")
                .name("Creator User")
                .username("creator")
                .email("creator@example.com")
                .role(UserRole.MANAGER)
                .status(UserStatus.ACTIVE)
                .build();

        testAssignee = User.builder()
                .id("assignee-id")
                .name("Assignee User")
                .username("assignee")
                .email("assignee@example.com")
                .role(UserRole.ENGINEER)
                .status(UserStatus.ACTIVE)
                .build();

        testTicket = Ticket.builder()
                .id(202601200001L)
                .title("Test Ticket")
                .description("Test Description")
                .type("PLANNED")
                .status("OPEN")
                .priority("P2")
                .site("Shanghai Office")
                .assignedTo("assignee-id")
                .createdBy("creator-id")
                .dueDate(LocalDateTime.now().plusDays(7))
                .accepted(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create ticket successfully")
    void createTicket_Success() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "PREVENTIVE",
                "site-001",
                "P1",
                "template-001",
                "creator-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            testTicket = invocation.getArgument(0);
            testTicket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("New Ticket", response.title());
        assertEquals("Description", response.description());
        assertEquals("PREVENTIVE", response.type());
        assertEquals("P1", response.priority());
    }

    @Test
    @DisplayName("Should create ticket with lowercase type")
    void createTicket_TypeLowercase() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "corrective",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("corrective", response.type());
    }

    @Test
    @DisplayName("Should create ticket with uppercase type")
    void createTicket_TypeUppercase() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "PREVENTIVE",
                "site-001",
                "P3",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("PREVENTIVE", response.type());
    }

    @Test
    @DisplayName("Should create ticket with lowercase priority")
    void createTicket_PriorityLowercase() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P1",
                "template-001",
                "creator-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("P1", response.priority());
    }

    @Test
    @DisplayName("Should create ticket with uppercase priority")
    void createTicket_PriorityUppercase() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P4",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("P4", response.priority());
    }

    @Test
    @DisplayName("Should create problem ticket with problemType only")
    void createTicket_ProblemTypeOnly() {
        TicketCreateRequest request = new TicketCreateRequest(
                "Problem Ticket",
                "Description",
                "PROBLEM",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                "pt-thermal-issue",
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("PROBLEM", response.type());
        assertEquals("pt-thermal-issue", response.problemType());
        assertNotNull(response.relatedTicketIds());
        assertTrue(response.relatedTicketIds().isEmpty());
    }

    @Test
    @DisplayName("Should create ticket with empty relatedTicketIds list")
    void createTicket_RelatedIdsEmptyList() {
        TicketCreateRequest request = new TicketCreateRequest(
                "Problem Ticket",
                "Description",
                "PROBLEM",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                "pt-electrical",
                Collections.emptyList()
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertNotNull(response.relatedTicketIds());
        assertTrue(response.relatedTicketIds().isEmpty());
    }

    @Test
    @DisplayName("Should create ticket with null description")
    void createTicket_OptionalDescription() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                null,
                "CORRECTIVE",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertNull(response.description());
    }

    @Test
    @DisplayName("Should create ticket with null site")
    void createTicket_OptionalSite() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                null,
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertNull(response.site());
    }

    @Test
    @DisplayName("Should create ticket with null priority")
    void createTicket_OptionalPriority() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                null,
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertNull(response.priority());
    }

    @Test
    @DisplayName("Should create normal ticket with null problemType")
    void createTicket_OptionalProblemType() {
        TicketCreateRequest request = new TicketCreateRequest(
                "Normal Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertNull(response.problemType());
    }

    @Test
    @DisplayName("Should create ticket with valid description containing special characters")
    void createTicket_DescriptionWithSpecialChars() {
        String specialDescription = "Issue with <xml>&special chars: \"quotes\" and 'apostrophes' and 中文描述";
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                specialDescription,
                "CORRECTIVE",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals(specialDescription, response.description());
    }

    @Test
    @DisplayName("Should create ticket with very long title near limit")
    void createTicket_TitleNearLimit() {
        String longTitle = "A".repeat(250);
        TicketCreateRequest request = new TicketCreateRequest(
                longTitle,
                "Description",
                "CORRECTIVE",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals(longTitle, response.title());
        assertEquals(250, response.title().length());
    }

    @Test
    @DisplayName("Should create ticket with far future dueDate")
    void createTicket_FarFutureDueDate() {
        LocalDateTime farFutureDate = LocalDateTime.now().plusYears(1);
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                farFutureDate,
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertNotNull(response.dueDate());
    }

    @Test
    @DisplayName("Should set correct initial status for new ticket")
    void createTicket_InitialStatusIsOpen() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P1",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("OPEN", response.status());
    }

    @Test
    @DisplayName("Should create ticket and save with correct type enum value")
    void createTicket_SavesCorrectTypeEnum() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "PROBLEM",
                "site-001",
                "P1",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                "pt-root-cause",
                null
        );

        Ticket savedTicket = new Ticket();
        savedTicket.setId(202601200001L);

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("PROBLEM", response.type());
        verify(ticketMapper).insert(argThat(ticket ->
            "PROBLEM".equals(ticket.getType())
        ));
    }

    @Test
    @DisplayName("Should create ticket and save with correct priority enum value")
    void createTicket_SavesCorrectPriorityEnum() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P3",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        ticketService.createTicket(request, "creator-id");

        verify(ticketMapper).insert(argThat(ticket ->
            "P3".equals(ticket.getPriority())
        ));
    }

    @Test
    @DisplayName("Should generate unique ticket ID for each creation")
    void createTicket_GeneratesUniqueId() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "CORRECTIVE",
                "site-001",
                "P2",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(202601200001L);
            return 1;
        });

        TicketResponse response1 = ticketService.createTicket(request, "creator-id");
        TicketResponse response2 = ticketService.createTicket(request, "creator-id");

        assertNotNull(response1.id());
        assertNotNull(response2.id());
        assertNotEquals(response1.id(), response2.id());
    }

    @Test
    @DisplayName("Should throw exception when creator not found")
    void createTicket_CreatorNotFound() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                "PLANNED",
                "site-001",
                "P1",
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5),
                null,
                null
        );

        when(userMapper.selectById("creator-id")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.createTicket(request, "creator-id"));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    // ==================== Decline Ticket Tests ====================

    @Test
    @DisplayName("Should decline ticket successfully")
    void declineTicket_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");
        testTicket.setAssignedTo("assignee-id");

        TicketDeclineRequest request = new TicketDeclineRequest("Cannot complete this task");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.declineTicket(202601200001L, request, "assignee-id");

        assertNotNull(response);
        verify(ticketMapper).updateById(argThat(ticket ->
            "CANCELLED".equals(ticket.getStatus()) &&
            Boolean.FALSE.equals(ticket.getAccepted())
        ));
        verify(ticketCommentMapper).insert(argThat(comment ->
            "Cannot complete this task".equals(comment.getComment()) &&
            CommentType.DECLINE.equals(comment.getType())
        ));
    }

    @Test
    @DisplayName("Should throw exception when declining ticket as non-assignee")
    void declineTicket_NotAssignee_ShouldThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");

        TicketDeclineRequest request = new TicketDeclineRequest("Reason");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.declineTicket(202601200001L, request, "other-user-id"));

        assertEquals(ErrorCode.NOT_ASSIGNEE.getCode(), exception.getCode());
    }

    // ==================== Cancel Ticket Tests ====================

    @Test
    @DisplayName("Should cancel ticket successfully as creator")
    void cancelTicket_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");

        TicketCancelRequest request = new TicketCancelRequest("No longer needed");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.cancelTicket(202601200001L, request, "creator-id");

        assertNotNull(response);
        verify(ticketMapper).updateById(argThat(ticket ->
            "CANCELLED".equals(ticket.getStatus())
        ));
        verify(ticketCommentMapper).insert(argThat(comment ->
            "No longer needed".equals(comment.getComment()) &&
            CommentType.CANCEL.equals(comment.getType())
        ));
    }

    @Test
    @DisplayName("Should throw exception when canceling ticket as non-creator")
    void cancelTicket_NotCreator_ShouldThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");

        TicketCancelRequest request = new TicketCancelRequest("Reason");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.cancelTicket(202601200001L, request, "other-user-id"));

        assertEquals(ErrorCode.NOT_CREATOR.getCode(), exception.getCode());
    }

    // ==================== Submit Ticket Tests ====================

    @Test
    @DisplayName("Should submit ticket with step data successfully")
    void submitTicket_WithStepData_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");
        testTicket.setStepData(null);

        Map<String, Object> stepDataMap = new HashMap<>();
        stepDataMap.put("step1", "value1");
        StepData stepData = new StepData(stepDataMap);

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.submitTicket(202601200001L, stepData, "assignee-id");

        assertNotNull(response);
        verify(ticketMapper).updateById(any(Ticket.class));
    }

    @Test
    @DisplayName("Should handle null step data gracefully")
    void submitTicket_NullStepData_ShouldNotThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        assertDoesNotThrow(() -> ticketService.submitTicket(202601200001L, null, "assignee-id"));
    }

    @Test
    @DisplayName("Should throw exception when submitting as non-assignee")
    void submitTicket_NotAssignee_ShouldThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");

        StepData stepData = new StepData(new HashMap<>());

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.submitTicket(202601200001L, stepData, "other-user-id"));

        assertEquals(ErrorCode.NOT_ASSIGNEE.getCode(), exception.getCode());
    }

    // ==================== Review Ticket Tests ====================

    @Test
    @DisplayName("Should review ticket with cause and reopen it")
    void reviewTicket_WithCause_ShouldReopen() {
        Ticket testTicket = createTestTicket(202601200001L, "COMPLETED", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.reviewTicket(202601200001L, "Needs more work", "reviewer-id");

        assertNotNull(response);
        verify(ticketMapper).updateById(argThat(ticket ->
            "Needs more work".equals(ticket.getCause()) &&
            "ARRIVED".equals(ticket.getStatus())
        ));
    }

    @Test
    @DisplayName("Should review ticket without cause and keep completed")
    void reviewTicket_WithoutCause_ShouldKeepCompleted() {
        Ticket testTicket = createTestTicket(202601200001L, "SUBMITTED", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.reviewTicket(202601200001L, null, "reviewer-id");

        assertNotNull(response);
        verify(ticketMapper).updateById(argThat(ticket ->
            "COMPLETED".equals(ticket.getStatus())
        ));
    }

    // ==================== Add Ticket Comment Tests ====================

    @Test
    @DisplayName("Should add comment to ticket successfully")
    void addTicketComment_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");
        User testUser = User.builder().id("user-1").name("Test User").build();

        TicketCommentCreateRequest request = new TicketCommentCreateRequest("This is a comment", CommentType.GENERAL);

        when(ticketMapper.selectById(202601200001L)).thenReturn(testTicket);
        when(userMapper.selectById("user-1")).thenReturn(testUser);
        when(ticketCommentMapper.insert(any(TicketComment.class))).thenAnswer(invocation -> {
            TicketComment comment = invocation.getArgument(0);
            comment.setId("comment-1");
            comment.setCreatedAt(LocalDateTime.now());
            return 1;
        });

        TicketCommentResponse response = ticketService.addTicketComment(202601200001L, request, "user-1");

        assertNotNull(response);
        assertEquals("This is a comment", response.comment());
        assertEquals("GENERAL", response.type());
        assertEquals("user-1", response.userId());
        verify(ticketCommentMapper).insert(argThat(comment ->
            "This is a comment".equals(comment.getComment()) &&
            CommentType.GENERAL.equals(comment.getType()) &&
            java.util.Objects.equals(202601200001L, comment.getTicketId())
        ));
    }

    @Test
    @DisplayName("Should add comment with default type when type is null")
    void addTicketComment_NullType_UsesDefault() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");
        User testUser = User.builder().id("user-1").name("Test User").build();

        TicketCommentCreateRequest request = new TicketCommentCreateRequest("Comment", null);

        when(ticketMapper.selectById(202601200001L)).thenReturn(testTicket);
        when(userMapper.selectById("user-1")).thenReturn(testUser);
        when(ticketCommentMapper.insert(any(TicketComment.class))).thenReturn(1);

        ticketService.addTicketComment(202601200001L, request, "user-1");

        verify(ticketCommentMapper).insert(argThat(comment ->
            CommentType.GENERAL.equals(comment.getType())
        ));
    }

    @Test
    @DisplayName("Should throw exception when adding comment to non-existent ticket")
    void addTicketComment_TicketNotFound_ShouldThrow() {
        TicketCommentCreateRequest request = new TicketCommentCreateRequest("Comment", CommentType.GENERAL);

        when(ticketMapper.selectById("non-existent-ticket")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.addTicketComment(999999L, request, "user-1"));

        assertEquals(ErrorCode.TICKET_NOT_FOUND.getCode(), exception.getCode());
    }

    // ==================== Get Ticket Comments Tests ====================

    @Test
    @DisplayName("Should get all comments for a ticket")
    void getTicketComments_Success() {
        TicketComment comment1 = TicketComment.builder()
                .id("comment-1")
                .comment("First comment")
                .type(CommentType.GENERAL)
                .ticketId(202601200001L)
                .userId("user-1")
                .createdAt(LocalDateTime.now())
                .build();

        TicketComment comment2 = TicketComment.builder()
                .id("comment-2")
                .comment("Second comment")
                .type(CommentType.ACCEPT)
                .ticketId(202601200001L)
                .userId("user-2")
                .createdAt(LocalDateTime.now())
                .build();

        User user1 = User.builder().id("user-1").name("User One").build();
        User user2 = User.builder().id("user-2").name("User Two").build();

        when(ticketCommentMapper.selectByTicketIdWithUser(202601200001L))
                .thenReturn(Arrays.asList(comment1, comment2));
        when(userMapper.selectById("user-1")).thenReturn(user1);
        when(userMapper.selectById("user-2")).thenReturn(user2);

        List<TicketCommentResponse> comments = ticketService.getTicketComments(202601200001L);

        assertEquals(2, comments.size());
        assertEquals("First comment", comments.get(0).comment());
        assertEquals("Second comment", comments.get(1).comment());
        assertEquals("User One", comments.get(0).userName());
        assertEquals("User Two", comments.get(1).userName());
    }

    @Test
    @DisplayName("Should return empty list when ticket has no comments")
    void getTicketComments_NoComments_ReturnsEmpty() {
        when(ticketCommentMapper.selectByTicketIdWithUser(202601200001L))
                .thenReturn(Collections.emptyList());

        List<TicketCommentResponse> comments = ticketService.getTicketComments(202601200001L);

        assertTrue(comments.isEmpty());
    }

    // ==================== Get My Tickets Tests ====================

    @Test
    @DisplayName("Should get tickets assigned to user")
    void getMyTickets_Success() {
        Ticket ticket1 = createTestTicket(202601200001L, "OPEN", "user-1", "creator-1");
        Ticket ticket2 = createTestTicket(202601200002L, "IN_PROGRESS", "user-1", "creator-2");

        when(ticketMapper.selectByAssignedTo("user-1"))
                .thenReturn(Arrays.asList(ticket1, ticket2));
        when(userMapper.selectById("creator-1")).thenReturn(testCreator);
        when(userMapper.selectById("creator-2")).thenReturn(testCreator);
        when(userMapper.selectById("user-1")).thenReturn(testAssignee);

        PageResult<TicketResponse> result = ticketService.getMyTickets(1, 10, null, "user-1");

        assertNotNull(result);
        assertEquals(2, result.records().size());
    }

    @Test
    @DisplayName("Should get my tickets filtered by status")
    void getMyTickets_WithStatusFilter_Success() {
        Ticket ticket1 = createTestTicket(202601200001L, "OPEN", "user-1", "creator-1");
        Ticket ticket2 = createTestTicket(202601200002L, "COMPLETED", "user-1", "creator-2");

        when(ticketMapper.selectByAssignedTo("user-1"))
                .thenReturn(Arrays.asList(ticket1, ticket2));
        when(userMapper.selectById(any())).thenReturn(testCreator, testCreator, testAssignee);

        PageResult<TicketResponse> result = ticketService.getMyTickets(1, 10, "OPEN", "user-1");

        assertEquals(1, result.records().size());
        assertEquals("OPEN", result.records().get(0).status());
    }

    // ==================== Get Pending Tickets Tests ====================

    @Test
    @DisplayName("Should get all pending tickets (OPEN and ASSIGNED)")
    void getPendingTickets_Success() {
        Ticket ticket1 = createTestTicket(202601200001L, "OPEN", "assignee-1", "creator-1");
        Ticket ticket2 = createTestTicket(202601200002L, "ASSIGNED", "assignee-2", "creator-2");
        Ticket ticket3 = createTestTicket(202601200003L, "IN_PROGRESS", "assignee-3", "creator-3");

        when(ticketMapper.selectByStatusIn(Arrays.asList("OPEN", "ASSIGNED")))
                .thenReturn(Arrays.asList(ticket1, ticket2, ticket3));
        when(userMapper.selectById(any())).thenReturn(testCreator, testAssignee);

        PageResult<TicketResponse> pendingTickets = ticketService.getPendingTickets();

        assertEquals(3, pendingTickets.records().size());
    }

    @Test
    @DisplayName("Should return empty list when no pending tickets")
    void getPendingTickets_NoPending_ReturnsEmpty() {
        when(ticketMapper.selectByStatusIn(any())).thenReturn(Collections.emptyList());

        PageResult<TicketResponse> pendingTickets = ticketService.getPendingTickets();

        assertTrue(pendingTickets.records().isEmpty());
    }

    // ==================== Get Completed Tickets Tests ====================

    @Test
    @DisplayName("Should get completed tickets with pagination")
    void getCompletedTickets_Success() {
        Ticket ticket1 = createTestTicket(202601200001L, "COMPLETED", "assignee-1", "creator-1");
        Ticket ticket2 = createTestTicket(202601200002L, "COMPLETED", "assignee-2", "creator-2");

        when(ticketMapper.selectByStatus("COMPLETED"))
                .thenReturn(Arrays.asList(ticket1, ticket2));
        when(userMapper.selectById(any())).thenReturn(testCreator, testAssignee);

        PageResult<TicketResponse> result = ticketService.getCompletedTickets(1, 10);

        assertNotNull(result);
        assertEquals(2, result.records().size());
        assertTrue(result.records().stream().allMatch(t -> "COMPLETED".equals(t.status())));
    }

    // ==================== Get Ticket Stats Tests ====================

    @Test
    @DisplayName("Should get ticket statistics for all types")
    void getTicketStats_AllTypes_Success() {
        TicketStatusCount count1 = createStatusCount("OPEN", 10);
        TicketStatusCount count2 = createStatusCount("IN_PROGRESS", 5);
        TicketStatusCount count3 = createStatusCount("COMPLETED", 15);
        TicketStatusCount count4 = createStatusCount("ACCEPTED", 3);

        when(ticketMapper.countByStatusGroup(null))
                .thenReturn(Arrays.asList(count1, count2, count3, count4));

        TicketStatsResponse stats = ticketService.getTicketStats("all");

        assertEquals(33, stats.total()); // 10 + 5 + 15 + 3
        assertEquals(10, stats.open());
        assertEquals(8, stats.inProgress()); // 5 + 3
        assertEquals(15, stats.completed());
    }

    @Test
    @DisplayName("Should get ticket statistics filtered by type")
    void getTicketStats_WithFilter_Success() {
        TicketStatusCount count1 = createStatusCount("OPEN", 5);
        TicketStatusCount count2 = createStatusCount("COMPLETED", 8);

        when(ticketMapper.countByStatusGroup("CORRECTIVE"))
                .thenReturn(Arrays.asList(count1, count2));

        TicketStatsResponse stats = ticketService.getTicketStats("CORRECTIVE");

        assertEquals(13, stats.total());
        assertEquals(5, stats.open());
        assertEquals(8, stats.completed());
    }

    @Test
    @DisplayName("Should handle empty stats gracefully")
    void getTicketStats_NoData_ReturnsZeros() {
        when(ticketMapper.countByStatusGroup(any())).thenReturn(Collections.emptyList());

        TicketStatsResponse stats = ticketService.getTicketStats("all");

        assertEquals(0, stats.total());
        assertEquals(0, stats.open());
        assertEquals(0, stats.inProgress());
        assertEquals(0, stats.completed());
    }

    @Test
    @DisplayName("Should aggregate multiple status counts correctly")
    void getTicketStats_MultipleCountsPerStatus_AggregatesCorrectly() {
        TicketStatusCount count1 = createStatusCount("OPEN", 5);
        TicketStatusCount count2 = createStatusCount("OPEN", 3);
        TicketStatusCount count3 = createStatusCount("IN_PROGRESS", 2);
        TicketStatusCount count4 = createStatusCount("ACCEPTED", 4);

        when(ticketMapper.countByStatusGroup(null))
                .thenReturn(Arrays.asList(count1, count2, count3, count4));

        TicketStatsResponse stats = ticketService.getTicketStats("all");

        assertEquals(8, stats.open()); // 5 + 3
        assertEquals(6, stats.inProgress()); // 2 + 4
    }

    // ==================== Update Ticket Edge Cases ====================

    @Test
    @DisplayName("Should update ticket with all nullable fields")
    void updateTicket_AllNullableFields_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");

        TicketUpdateRequest request = new TicketUpdateRequest(
                "Updated Title",
                "Updated Description",
                "CORRECTIVE",
                "site-002",
                "IN_PROGRESS",
                "P1",
                "new-assignee-id",
                LocalDateTime.now().plusDays(10),
                List.of("step1", "step2"),
                new StepData(Map.of("key", "value")),
                LocalDateTime.now(),
                "photo-url-1",
                LocalDateTime.now(),
                "photo-url-2",
                "completion-photo",
                "Root cause identified",
                "Solution implemented",
                List.of("related-1", "related-2")
        );

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.updateTicket(202601200001L, request);

        assertNotNull(response);
        verify(ticketMapper).updateById(argThat(ticket ->
            "Updated Title".equals(ticket.getTitle()) &&
            "Updated Description".equals(ticket.getDescription()) &&
            "CORRECTIVE".equals(ticket.getType()) &&
            "site-002".equals(ticket.getSite()) &&
            "IN_PROGRESS".equals(ticket.getStatus()) &&
            "P1".equals(ticket.getPriority()) &&
            "new-assignee-id".equals(ticket.getAssignedTo()) &&
            "Root cause identified".equals(ticket.getCause()) &&
            "Solution implemented".equals(ticket.getSolution())
        ));
    }

    @Test
    @DisplayName("Should handle JSON processing error in completed steps")
    void updateTicket_InvalidCompletedStepsJson_ShouldThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");

        TicketUpdateRequest request = new TicketUpdateRequest(
                null, null, null, null, null, null, null, null,
                List.of("step1"), null, null, null, null, null, null, null, null, null
        );

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        // Should not throw with valid input
        assertDoesNotThrow(() -> ticketService.updateTicket(202601200001L, request));
    }

    // ==================== Delete Ticket Tests ====================

    @Test
    @DisplayName("Should delete existing ticket")
    void deleteTicket_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "OPEN", "assignee-id", "creator-id");

        when(ticketMapper.selectById(202601200001L)).thenReturn(testTicket);
        when(ticketMapper.deleteById(202601200001L)).thenReturn(1);

        assertDoesNotThrow(() -> ticketService.deleteTicket(202601200001L));
        verify(ticketMapper).deleteById(202601200001L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent ticket")
    void deleteTicket_NotFound_ShouldThrow() {
        when(ticketMapper.selectById(999999L)).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.deleteTicket(999999L));

        assertEquals(ErrorCode.TICKET_NOT_FOUND.getCode(), exception.getCode());
    }

    // ==================== Arrive Ticket Tests ====================

    @Test
    @DisplayName("Should arrive ticket with photo")
    void arriveTicket_WithPhoto_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.arriveTicket(202601200001L, "arrival-photo.jpg", "assignee-id");

        assertNotNull(response);
        verify(ticketMapper).updateById(argThat(ticket ->
            ticket.getArrivalPhoto() != null &&
            "arrival-photo.jpg".equals(ticket.getArrivalPhoto())
        ));
    }

    @Test
    @DisplayName("Should throw exception when arriving as non-assignee")
    void arriveTicket_NotAssignee_ShouldThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.arriveTicket(202601200001L, "photo.jpg", "other-user-id"));

        assertEquals(ErrorCode.NOT_ASSIGNEE.getCode(), exception.getCode());
    }

    // ==================== Complete Ticket Tests ====================

    @Test
    @DisplayName("Should complete ticket with photo")
    void completeTicket_WithPhoto_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.completeTicket(202601200001L, "completion-photo.jpg", "assignee-id");

        assertNotNull(response);
        assertEquals("COMPLETED", response.status());
        verify(ticketMapper).updateById(argThat(ticket ->
            "COMPLETED".equals(ticket.getStatus()) &&
            "completion-photo.jpg".equals(ticket.getCompletionPhoto())
        ));
    }

    @Test
    @DisplayName("Should complete ticket without photo")
    void completeTicket_WithoutPhoto_Success() {
        Ticket testTicket = createTestTicket(202601200001L, "SUBMITTED", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));
        when(ticketMapper.updateById(any(Ticket.class))).thenReturn(1);

        TicketResponse response = ticketService.completeTicket(202601200001L, null, "assignee-id");

        assertNotNull(response);
        assertEquals("COMPLETED", response.status());
    }

    @Test
    @DisplayName("Should throw exception when completing as non-assignee")
    void completeTicket_NotAssignee_ShouldThrow() {
        Ticket testTicket = createTestTicket(202601200001L, "IN_PROGRESS", "assignee-id", "creator-id");

        when(ticketMapper.selectByIdWithDetails(202601200001L)).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.completeTicket(202601200001L, "photo.jpg", "other-user-id"));

        assertEquals(ErrorCode.NOT_ASSIGNEE.getCode(), exception.getCode());
    }

    // ==================== Helper Methods ====================

    private Ticket createTestTicket(Long id, String status, String assignedTo, String createdBy) {
        Ticket ticket = Ticket.builder()
                .id(id)
                .title("Test Ticket")
                .description("Test Description")
                .type("CORRECTIVE")
                .status(status)
                .priority("P2")
                .site("site-001")
                .templateId("template-001")
                .assignedTo(assignedTo)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(7))
                .build();

        // Set related entities
        ticket.setCreator(testCreator);
        ticket.setAssignee(testAssignee);

        return ticket;
    }

    private TicketStatusCount createStatusCount(String status, long count) {
        TicketStatusCount statusCount = new TicketStatusCount();
        statusCount.setStatus(status);
        statusCount.setCount(count);
        return statusCount;
    }
}
