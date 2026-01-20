package com.igreen.domain.vo;

import com.igreen.domain.entity.Group;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Group 实体与 GroupVO 之间的转换
 */
@Component
public class GroupConverter {

    /**
     * 将 Group 实体转换为 GroupVO
     */
    public GroupVO toVO(Group group) {
        if (group == null) {
            return null;
        }

        return GroupVO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .tags(parseTags(group.getTags()))
                .status(group.getStatus())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .memberCount(group.getMemberCount())
                .build();
    }

    /**
     * 将 Group 实体列表转换为 GroupVO 列表
     */
    public List<GroupVO> toVOList(List<Group> groups) {
        return groups.stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    /**
     * 解析逗号分隔的标签字符串为列表
     */
    private List<String> parseTags(String tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return Arrays.asList(tags.split(","));
    }
}
