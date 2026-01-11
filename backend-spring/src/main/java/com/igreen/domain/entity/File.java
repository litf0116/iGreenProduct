package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

@TableName("files")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class File {

    private String id;
    private String name;
    private String url;
    private String type;
    private Integer size;
    private String fieldType;
    private LocalDateTime createdAt;
}
