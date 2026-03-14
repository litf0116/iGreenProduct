package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.igreen.common.typehandler.SiteStatusTypeHandler;
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
    private String code;
    private String name;
    private String address;
    private String level;
    @TableField(typeHandler = SiteStatusTypeHandler.class)
    private SiteStatus status;
    private String country;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
