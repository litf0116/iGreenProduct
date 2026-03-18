package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

@TableName("ticket_attachments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {

    private String id;
    private Long ticketId;
    private String fileId;
    private LocalDateTime createdAt;
}
