package com.igreen.domain.repository;

import com.igreen.domain.entity.TicketComment;
import com.igreen.domain.enums.CommentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    @Query("SELECT tc FROM TicketComment tc LEFT JOIN FETCH tc.user WHERE tc.ticketId = :ticketId ORDER BY tc.createdAt ASC")
    List<TicketComment> findByTicketIdWithUser(@Param("ticketId") String ticketId);

    List<TicketComment> findByUserId(String userId);

    List<TicketComment> findByTicketIdAndType(String ticketId, CommentType type);
}
