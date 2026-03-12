package com.igreen.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.igreen.common.typehandler.GroupStatusTypeHandler;
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

    @JsonIgnore
    private String tags;

    @TableField(typeHandler = GroupStatusTypeHandler.class)
    private GroupStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    @TableField(exist = false)
    private List<User> users = new ArrayList<>();
    @Builder.Default
    @TableField(exist = false)
    private Integer memberCount = 0;

    @JsonProperty("tags")
    public String[] getTagsArray() {
        if (tags == null || tags.isEmpty()) {
            return new String[0];
        }
        return tags.split(",");
    }

    public void setTagsArray(String[] tagsArray) {
        if (tagsArray == null || tagsArray.length == 0) {
            this.tags = null;
        } else {
            this.tags = String.join(",", tagsArray);
        }
    }
}
