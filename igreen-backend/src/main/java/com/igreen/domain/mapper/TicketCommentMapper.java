package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.TicketComment;
import com.igreen.domain.enums.CommentType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TicketCommentMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<TicketComment> {

    List<TicketComment> selectByTicketIdOrderByCreatedAtAsc(@Param("ticketId") String ticketId);

    List<TicketComment> selectByTicketIdWithUser(@Param("ticketId") String ticketId);

    List<TicketComment> selectByUserId(@Param("userId") String userId);

    List<TicketComment> selectByTicketIdAndType(@Param("ticketId") String ticketId, @Param("type") String type);
}
