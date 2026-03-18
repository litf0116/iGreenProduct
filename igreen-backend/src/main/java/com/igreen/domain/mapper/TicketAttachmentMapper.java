package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.TicketAttachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TicketAttachmentMapper extends BaseMapper<TicketAttachment> {

    List<TicketAttachment> selectByTicketId(@Param("ticketId") Long ticketId);

    void insertBatch(@Param("attachments") List<TicketAttachment> attachments);

    void deleteByTicketId(@Param("ticketId") Long ticketId);
}
