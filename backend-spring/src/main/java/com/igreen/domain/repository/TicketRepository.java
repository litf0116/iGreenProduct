package com.igreen.domain.repository;

import com.igreen.domain.entity.Ticket;
import com.igreen.domain.enums.TicketStatus;
import com.igreen.domain.enums.TicketType;
import com.igreen.domain.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findByStatus(TicketStatus status);

    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findByAssignedTo(String assignedTo);

    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findByCreatedBy(String createdBy);

    List<Ticket> findByTemplateId(String templateId);

    @EntityGraph(attributePaths = {"creator", "assignee"})
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"creator", "assignee"})
    Page<Ticket> findByAssignedTo(String assignedTo, Pageable pageable);

    @EntityGraph(attributePaths = {"creator", "assignee"})
    Page<Ticket> findAll(Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.status = :status AND t.assignedTo = :assignedTo")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findByStatusAndAssignedTo(@Param("status") TicketStatus status, @Param("assignedTo") String assignedTo);

    @Query("SELECT t FROM Ticket t WHERE t.type = :type AND t.priority = :priority")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findByTypeAndPriority(@Param("type") TicketType type, @Param("priority") Priority priority);

    @Query("SELECT t FROM Ticket t WHERE t.dueDate < :date AND t.status NOT IN ('closed', 'cancelled')")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findOverdueTickets(@Param("date") LocalDateTime date);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.template LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.creator WHERE t.id = :id")
    Optional<Ticket> findByIdWithDetails(@Param("id") String id);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTo = :userId AND t.status = :status")
    long countByAssignedToAndStatus(@Param("userId") String userId, @Param("status") TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.status IN :statuses")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    List<Ticket> findByStatusIn(@Param("statuses") List<TicketStatus> statuses);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.creator LEFT JOIN FETCH t.assignee WHERE t.assignedTo = :userId")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    Page<Ticket> findByAssignedToWithDetails(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.creator LEFT JOIN FETCH t.assignee WHERE t.status = :status")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    Page<Ticket> findByStatusWithDetails(@Param("status") TicketStatus status, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assignedTo IS NULL OR t.assignedTo = :assignedTo) AND " +
           "(:createdAfter IS NULL OR t.createdAt >= :createdAfter)")
    @EntityGraph(attributePaths = {"creator", "assignee"})
    Page<Ticket> findByFilters(
            @Param("type") TicketType type,
            @Param("status") TicketStatus status,
            @Param("priority") Priority priority,
            @Param("assignedTo") String assignedTo,
            @Param("createdAfter") LocalDateTime createdAfter,
            Pageable pageable
    );
}
