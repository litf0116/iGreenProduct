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
import com.igreen.domain.repository.TicketCommentRepository;
import com.igreen.domain.repository.TicketRepository;
import com.igreen.domain.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCommentRepository ticketCommentRepository;

    @Mock
    private UserRepository userRepository;

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
                .type(TicketType.PLANNED)
                .status(TicketStatus.OPEN)
                .priority(Priority.P2)
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
                TicketType.PLANNED,
                "site-001",
                Priority.P1,
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5)
        );

        when(userRepository.findById("creator-id")).thenReturn(Optional.of(testCreator));
        when(userRepository.findById("assignee-id")).thenReturn(Optional.of(testAssignee));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId("new-ticket-id");
            return ticket;
        });

        TicketResponse response = ticketService.createTicket(request, "creator-id");

        assertNotNull(response);
        assertEquals("New Ticket", response.title());
        assertEquals("PLANNED", response.type());
        assertEquals("P1", response.priority());
        assertEquals("OPEN", response.status());
    }

    @Test
    @DisplayName("Should throw exception when creator not found")
    void createTicket_CreatorNotFound() {
        TicketCreateRequest request = new TicketCreateRequest(
                "New Ticket",
                "Description",
                TicketType.PLANNED,
                "site-001",
                Priority.P1,
                "template-001",
                "assignee-id",
                LocalDateTime.now().plusDays(5)
        );

        when(userRepository.findById("creator-id")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.createTicket(request, "creator-id"));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should get ticket by ID successfully")
    void getTicketById_Success() {
        testTicket.setCreator(testCreator);
        testTicket.setAssignee(testAssignee);
        when(ticketRepository.findByIdWithDetails("ticket-id")).thenReturn(Optional.of(testTicket));
        when(ticketCommentRepository.findByTicketIdWithUser("ticket-id")).thenReturn(java.util.Collections.emptyList());

        TicketResponse response = ticketService.getTicketById("ticket-id");

        assertNotNull(response);
        assertEquals("ticket-id", response.id());
        assertEquals("Test Ticket", response.title());
        assertEquals("OPEN", response.status());
    }

    @Test
    @DisplayName("Should throw exception when ticket not found")
    void getTicketById_NotFound() {
        when(ticketRepository.findByIdWithDetails("nonexistent")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.getTicketById("nonexistent"));

        assertEquals(ErrorCode.TICKET_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should accept ticket successfully")
    void acceptTicket_Success() {
        TicketAcceptRequest request = new TicketAcceptRequest("I will handle this ticket");
        testTicket.setCreator(testCreator);
        testTicket.setAssignee(testAssignee);

        when(ticketRepository.findByIdWithDetails("ticket-id")).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
        when(ticketCommentRepository.save(any())).thenReturn(null);
        when(ticketCommentRepository.findByTicketIdWithUser("ticket-id")).thenReturn(java.util.Collections.emptyList());

        TicketResponse response = ticketService.acceptTicket("ticket-id", request, "assignee-id");

        assertNotNull(response);
        assertTrue(testTicket.getAccepted());
        assertEquals(TicketStatus.ACCEPTED, testTicket.getStatus());
    }

    @Test
    @DisplayName("Should throw exception when non-assignee tries to accept")
    void acceptTicket_NotAssignee() {
        TicketAcceptRequest request = new TicketAcceptRequest("I will handle this ticket");

        when(ticketRepository.findByIdWithDetails("ticket-id")).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.acceptTicket("ticket-id", request, "other-user-id"));

        assertEquals(ErrorCode.NOT_ASSIGNEE.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should throw exception when ticket already accepted")
    void acceptTicket_AlreadyAccepted() {
        testTicket.setStatus(TicketStatus.ACCEPTED);
        testTicket.setAccepted(true);
        TicketAcceptRequest request = new TicketAcceptRequest("I will handle this ticket");

        when(ticketRepository.findByIdWithDetails("ticket-id")).thenReturn(Optional.of(testTicket));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.acceptTicket("ticket-id", request, "assignee-id"));

        assertEquals(ErrorCode.TICKET_ALREADY_ACCEPTED.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("Should delete ticket successfully")
    void deleteTicket_Success() {
        when(ticketRepository.existsById("ticket-id")).thenReturn(true);
        doNothing().when(ticketRepository).deleteById("ticket-id");

        assertDoesNotThrow(() -> ticketService.deleteTicket("ticket-id"));
        verify(ticketRepository).deleteById("ticket-id");
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent ticket")
    void deleteTicket_NotFound() {
        when(ticketRepository.existsById("nonexistent")).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> ticketService.deleteTicket("nonexistent"));

        assertEquals(ErrorCode.TICKET_NOT_FOUND.getCode(), exception.getCode());
    }
}
