package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.entity.Group;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.GroupStatus;
import com.igreen.domain.repository.GroupRepository;
import com.igreen.domain.repository.UserRepository;
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

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional
    public Group createGroup(Group group) {
        if (groupRepository.existsByName(group.getName())) {
            throw new BusinessException(ErrorCode.GROUP_EXISTS);
        }

        group.setId(UUID.randomUUID().toString());
        if (group.getStatus() == null) {
            group.setStatus(GroupStatus.ACTIVE);
        }

        return groupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public Group getGroupById(String id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Transactional
    public Group updateGroup(String id, Group group) {
        Group existingGroup = groupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        if (group.getName() != null && !group.getName().equals(existingGroup.getName())) {
            if (groupRepository.existsByName(group.getName())) {
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

        return groupRepository.save(existingGroup);
    }

    @Transactional
    public void deleteGroup(String id) {
        if (!groupRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }
        groupRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Object getGroupMembers(String groupId) {
        List<User> users = userRepository.findByGroupId(groupId);
        return users.stream()
                .map(u -> new Object() {
                    public String id = u.getId();
                    public String name = u.getName();
                    public String username = u.getUsername();
                })
                .toList();
    }
}
