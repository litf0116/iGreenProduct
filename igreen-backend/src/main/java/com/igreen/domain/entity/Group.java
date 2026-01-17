package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.GroupStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@TableName("`groups`")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    private String id;
    private String name;
    private String description;
    private String tags;
    private GroupStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    @TableField(exist = false)
    private List<User> users = new ArrayList<>();
    @Builder.Default
    @TableField(exist = false)
    private Integer memberCount = 0;
}
