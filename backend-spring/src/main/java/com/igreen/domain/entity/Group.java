package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.GroupStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@TableName("groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    private String id;
    private String name;
    private String description;
    private GroupStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    private List<User> users = new ArrayList<>();
}
