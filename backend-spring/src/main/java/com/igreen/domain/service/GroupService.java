package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
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
public class GroupService {


    private final GroupMapper groupMapper;
    private final UserMapper userMapper;

    @Transactional
    public Group createGroup(Group group) {
        if (groupMapper.countByName(group.getName()) > 0) {
            throw new BusinessException(ErrorCode.GROUP_EXISTS);
        }

        group.setId(UUID.randomUUID().toString());
        if (group.getStatus() == null) {
            group.setStatus(GroupStatus.ACTIVE);
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
        return group;
    }

    @Transactional(readOnly = true)
    public List<Group> getAllGroups() {
        return groupMapper.selectList(null);
    }

    @Transactional
    public Group updateGroup(String id, Group group) {
        Group existingGroup = groupMapper.selectById(id);
        if (existingGroup == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        if (group.getName() != null && !group.getName().equals(existingGroup.getName())) {
            if (groupMapper.countByName(group.getName()) > 0) {
                throw new BusinessException(ErrorCode.GROUP_EXISTS);
            }
            existingGroup.setName(group.getName());
        }
        if (group.getDescription() != null) {
            existingGroup.setDescription(group.getDescription());
        }
        if (group.getStatus() != null) {
            existingGroup.setStatus(group.getStatus());
        }

        groupMapper.updateById(existingGroup);
        return existingGroup;
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
