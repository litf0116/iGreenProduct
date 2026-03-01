package com.igreen.domain.mapper;

import com.igreen.domain.entity.Ticket;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface TicketMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<Ticket> {

    Optional<Ticket> selectByIdWithDetails(@Param("id") Long id);

    List<Ticket> selectByStatus(@Param("status") String status);

    /**
     * @param acceptedUserId
     * @return
     */
    List<Ticket> selectByAcceptedUserId(@Param("acceptedUserId") String acceptedUserId);

    List<Ticket> selectByCreatedBy(@Param("createdBy") String createdBy);

    List<Ticket> selectByTemplateId(@Param("templateId") String templateId);

    List<Ticket> selectByStatusAndAcceptedUserId(@Param("status") String status, @Param("acceptedUserId") String acceptedUserId);

    List<Ticket> selectByTypeAndPriority(@Param("type") String type, @Param("priority") String priority);

    List<Ticket> selectOverdueTickets(@Param("date") LocalDateTime date, @Param("excludedStatuses") List<String> excludedStatuses);

    List<Ticket> selectByStatusIn(@Param("statuses") List<String> statuses, @Param("groupId") String groupId);

    long countByAssignedToAndStatus(@Param("userId") String userId, @Param("status") String status);

    int countByFilters(@Param("type") String type, @Param("status") String status, @Param("priority") String priority, @Param("assignedTo") String assignedTo, @Param("createdAfter") LocalDateTime createdAfter);

    List<TicketStatusCount> countByStatusGroup(@Param("type") String type);
}
