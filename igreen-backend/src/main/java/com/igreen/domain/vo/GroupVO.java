package com.igreen.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分组视图对象 - 专门用于前端展示
 * 前端直接使用此对象的 tags 字段（List 类型）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupVO {

    private String id;
    private String name;
    private String description;
    private List<String> tags;
    private String status;  // 小写字符串: "active", "inactive"
    private String country; // 租户：国家
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer memberCount;
}
