package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.CommentType;
import lombok.*;

import java.time.LocalDateTime;

@TableName("ticket_comments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

    private String id;
    private String comment;
    private CommentType type;
    private Long ticketId;
    private String userId;
    private LocalDateTime createdAt;
    @Builder.Default
    private Ticket ticket = null;
    @Builder.Default
    private User user = null;
}
