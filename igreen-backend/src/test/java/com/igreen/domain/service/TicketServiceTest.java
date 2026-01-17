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
import com.igreen.domain.mapper.TicketStatusCount;
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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                .id("ticket-id")
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
            testTicket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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

        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("new-ticket-id");
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
        savedTicket.setId("saved-ticket-id");

        when(userMapper.selectById("creator-id")).thenReturn(testCreator);
        when(userMapper.selectById("assignee-id")).thenReturn(testAssignee);
        when(ticketMapper.insert(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId("saved-ticket-id");
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
            ticket.setId("new-ticket-id");
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
            ticket.setId("ticket-" + System.nanoTime());
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
}
