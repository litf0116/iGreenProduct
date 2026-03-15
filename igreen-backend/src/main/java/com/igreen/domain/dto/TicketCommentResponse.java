package com.igreen.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentResponse {
    private String id;
    private String comment;
    private String type;
    private String userId;
    private String userName;
    private Long ticketId;
    private String createdAt;
}
