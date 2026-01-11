package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@TableName("users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private String id;
    private String name;
    private String username;
    private String email;
    private String hashedPassword;
    private UserRole role;
    private UserStatus status;
    private String groupId;
    private String country;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    @TableField(exist = false)
    private Group group = null;
    @Builder.Default
    @TableField(exist = false)
    private List<Ticket> createdTickets = new ArrayList<>();
    @Builder.Default
    @TableField(exist = false)
    private List<Ticket> assignedTickets = new ArrayList<>();
    @Builder.Default
    @TableField(exist = false)
    private List<TicketComment> comments = new ArrayList<>();
}
