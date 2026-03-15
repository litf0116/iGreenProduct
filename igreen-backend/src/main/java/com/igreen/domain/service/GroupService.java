package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.context.CountryContext;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.GroupCreateRequest;
import com.igreen.domain.dto.GroupUpdateRequest;
import com.igreen.domain.entity.Group;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.GroupStatus;
import com.igreen.domain.mapper.GroupMapper;
import com.igreen.domain.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final GroupMapper groupMapper;
    private final UserMapper userMapper;

    @Transactional
    public Group createGroup(GroupCreateRequest request) {
        String country = CountryContext.get();
        
        if (groupMapper.countByName(request.getName()) > 0) {
            throw new BusinessException(ErrorCode.GROUP_EXISTS);
        }

        Group group = Group.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : GroupStatus.ACTIVE)
                .country(country)
                .memberCount(0)
                .build();

        // 设置 tags 数组
        if (request.getTags() != null && request.getTags().length > 0) {
            group.setTagsArray(request.getTags());
        }

        groupMapper.insert(group);
        return group;
    }

    @Transactional(readOnly = true)
    public Group getGroupById(String id) {
        Group group = groupMapper.selectById(id);
        if (group == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }
        group.setMemberCount(userMapper.countByGroupId(id));
        return group;
    }

    @Transactional(readOnly = true)
    public List<Group> getAllGroups() {
        String country = CountryContext.get();
        LambdaQueryWrapper<Group> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Group::getCountry, country);
        List<Group> groups = groupMapper.selectList(wrapper);
        for (Group group : groups) {
            Integer memberCount = userMapper.countByGroupId(group.getId());
            group.setMemberCount(memberCount != null ? memberCount : 0);
        }
        return groups;
    }

    @Transactional(readOnly = true)
    public List<Group> searchGroups(String keyword) {
        String country = CountryContext.get();
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllGroups();
        }
        String searchKeyword = keyword.trim();

        LambdaQueryWrapper<Group> wrapper = new LambdaQueryWrapper<Group>();
        wrapper.eq(Group::getCountry, country);
        wrapper.and(w -> w.like(Group::getName, searchKeyword)
                           .or()
                           .like(Group::getDescription, searchKeyword));

        List<Group> groups = groupMapper.selectList(wrapper);

        for (Group group : groups) {
            Integer memberCount = userMapper.countByGroupId(group.getId());
            group.setMemberCount(memberCount != null ? memberCount : 0);
        }
        return groups;
    }

    @Transactional
    public Group updateGroup(String id, GroupUpdateRequest request) {
        Group existingGroup = groupMapper.selectById(id);
        if (existingGroup == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        if (request.getName() != null && !request.getName().equals(existingGroup.getName())) {
            if (groupMapper.countByName(request.getName()) > 0) {
                throw new BusinessException(ErrorCode.GROUP_EXISTS);
            }
            existingGroup.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existingGroup.setDescription(request.getDescription());
        }
        // 更新 tags 数组
        if (request.getTags() != null) {
            existingGroup.setTagsArray(request.getTags());
        }
        if (request.getStatus() != null) {
            existingGroup.setStatus(request.getStatus());
        }

        groupMapper.updateById(existingGroup);
        return getGroupById(id);
    }

    @Transactional
    public void deleteGroup(String id) {
        if (groupMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }
        groupMapper.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Object getGroupMembers(String groupId) {
        List<User> users = userMapper.selectByGroupId(groupId);
        return users.stream()
                .map(u -> new Object() {
                    public String id = u.getId();
                    public String name = u.getName();
                    public String username = u.getUsername();
                })
                .toList();
    }
}
