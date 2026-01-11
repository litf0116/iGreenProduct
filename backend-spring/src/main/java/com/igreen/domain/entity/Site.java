package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.domain.enums.SiteStatus;
import lombok.*;

import java.time.LocalDateTime;

@TableName("sites")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Site {

    private String id;
    private String name;
    private String address;
    private String level;
    private SiteStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
