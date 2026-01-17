package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.GroupCreateRequest;
import com.igreen.domain.dto.GroupUpdateRequest;
import com.igreen.domain.entity.Group;
import com.igreen.domain.enums.GroupStatus;
import com.igreen.domain.mapper.GroupMapper;
import com.igreen.domain.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupMapper groupMapper;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private GroupService groupService;

    private Group testGroup;

    @BeforeEach
    void setUp() {
        testGroup = Group.builder()
                .id("group-1")
                .name("测试分组")
                .description("测试分组描述")
                .tags("技术,运维")
                .status(GroupStatus.ACTIVE)
                .memberCount(5)
                .build();
    }

    @Test
    @DisplayName("创建分组成功")
    void createGroup_Success() {
        GroupCreateRequest request = new GroupCreateRequest(
                "新分组",
                "新分组描述",
                "开发,测试",
                GroupStatus.ACTIVE
        );

        when(groupMapper.countByName("新分组")).thenReturn(0);
        when(groupMapper.insert(any(Group.class))).thenReturn(1);

        Group result = groupService.createGroup(request);

        assertNotNull(result);
        assertEquals("新分组", result.getName());
        assertEquals("开发,测试", result.getTags());
        assertEquals(GroupStatus.ACTIVE, result.getStatus());
        verify(groupMapper).insert(any(Group.class));
    }

    @Test
    @DisplayName("创建分组时名称已存在应抛出异常")
    void createGroup_NameExists() {
        GroupCreateRequest request = new GroupCreateRequest(
                "已存在的分组",
                "描述",
                null,
                GroupStatus.ACTIVE
        );

        when(groupMapper.countByName("已存在的分组")).thenReturn(1);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> groupService.createGroup(request));

        assertEquals(ErrorCode.GROUP_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("根据ID获取分组成功")
    void getGroupById_Success() {
        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.getGroupById("group-1");

        assertNotNull(result);
        assertEquals("group-1", result.getId());
        assertEquals("测试分组", result.getName());
        assertEquals(5, result.getMemberCount());
    }

    @Test
    @DisplayName("根据ID获取分组不存在应抛出异常")
    void getGroupById_NotFound() {
        when(groupMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> groupService.getGroupById("nonexistent"));

        assertEquals(ErrorCode.GROUP_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取所有分组成功")
    void getAllGroups_Success() {
        List<Group> groups = Arrays.asList(testGroup);
        when(groupMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(groups);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        List<Group> result = groupService.getAllGroups();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(5, result.get(0).getMemberCount());
    }

    @Test
    @DisplayName("更新分组成功")
    void updateGroup_Success() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                "更新后分组",
                "更新后描述",
                "更新标签",
                GroupStatus.INACTIVE
        );

        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(groupMapper.countByName("更新后分组")).thenReturn(0);
        when(groupMapper.updateById(any(Group.class))).thenReturn(1);
        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.updateGroup("group-1", request);

        assertNotNull(result);
        verify(groupMapper).updateById(any(Group.class));
    }

    @Test
    @DisplayName("更新分组不存在应抛出异常")
    void updateGroup_NotFound() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                "新名称",
                "描述",
                null,
                null
        );

        when(groupMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> groupService.updateGroup("nonexistent", request));

        assertEquals(ErrorCode.GROUP_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("删除分组成功")
    void deleteGroup_Success() {
        when(groupMapper.selectById("group-1")).thenReturn(testGroup);

        groupService.deleteGroup("group-1");

        verify(groupMapper).deleteById("group-1");
    }

    @Test
    @DisplayName("删除不存在的分组应抛出异常")
    void deleteGroup_NotFound() {
        when(groupMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> groupService.deleteGroup("nonexistent"));

        assertEquals(ErrorCode.GROUP_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取分组成员成功")
    void getGroupMembers_Success() {
        when(userMapper.selectByGroupId("group-1")).thenReturn(Arrays.asList());

        Object result = groupService.getGroupMembers("group-1");

        assertNotNull(result);
        verify(userMapper).selectByGroupId("group-1");
    }

    @Test
    @DisplayName("获取空分组列表")
    void getAllGroups_EmptyList() {
        when(groupMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList());

        List<Group> result = groupService.getAllGroups();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("获取多个分组")
    void getAllGroups_MultipleGroups() {
        Group group2 = Group.builder()
                .id("group-2")
                .name("第二个分组")
                .description("描述2")
                .status(GroupStatus.ACTIVE)
                .memberCount(3)
                .build();

        when(groupMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(testGroup, group2));
        when(userMapper.countByGroupId("group-1")).thenReturn(5);
        when(userMapper.countByGroupId("group-2")).thenReturn(3);

        List<Group> result = groupService.getAllGroups();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(5, result.get(0).getMemberCount());
        assertEquals(3, result.get(1).getMemberCount());
    }

    @Test
    @DisplayName("更新分组时只更新描述")
    void updateGroup_OnlyDescription() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                null,
                "只更新描述",
                null,
                null
        );

        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(groupMapper.updateById(any(Group.class))).thenReturn(1);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.updateGroup("group-1", request);

        assertNotNull(result);
        verify(groupMapper).updateById(any(Group.class));
    }

    @Test
    @DisplayName("更新分组时只更新标签")
    void updateGroup_OnlyTags() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                null,
                null,
                "新标签",
                null
        );

        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(groupMapper.updateById(any(Group.class))).thenReturn(1);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.updateGroup("group-1", request);

        assertNotNull(result);
        verify(groupMapper).updateById(argThat(group ->
            "新标签".equals(group.getTags())
        ));
    }

    @Test
    @DisplayName("更新分组时只更新状态")
    void updateGroup_OnlyStatus() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                null,
                null,
                null,
                GroupStatus.INACTIVE
        );

        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(groupMapper.updateById(any(Group.class))).thenReturn(1);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.updateGroup("group-1", request);

        assertNotNull(result);
        verify(groupMapper).updateById(argThat(group ->
            GroupStatus.INACTIVE.equals(group.getStatus())
        ));
    }

    @Test
    @DisplayName("更新分组时名称相同不检测冲突")
    void updateGroup_SameNameNoConflict() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                "测试分组",
                "新描述",
                null,
                null
        );

        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(groupMapper.updateById(any(Group.class))).thenReturn(1);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.updateGroup("group-1", request);

        assertNotNull(result);
        verify(groupMapper, never()).countByName(anyString());
    }

    @Test
    @DisplayName("创建分组时标签为null")
    void createGroup_NullTags() {
        GroupCreateRequest request = new GroupCreateRequest(
                "新分组",
                "描述",
                null,
                GroupStatus.ACTIVE
        );

        when(groupMapper.countByName("新分组")).thenReturn(0);
        when(groupMapper.insert(any(Group.class))).thenAnswer(invocation -> {
            Group group = invocation.getArgument(0);
            group.setId("group-new");
            return 1;
        });

        Group result = groupService.createGroup(request);

        assertNotNull(result);
        assertEquals("新分组", result.getName());
        assertNull(result.getTags());
        verify(groupMapper).insert(any(Group.class));
    }

    @Test
    @DisplayName("创建分组时状态为null应使用默认值ACTIVE")
    void createGroup_NullStatus() {
        GroupCreateRequest request = new GroupCreateRequest(
                "新分组",
                "描述",
                "标签",
                null
        );

        when(groupMapper.countByName("新分组")).thenReturn(0);
        when(groupMapper.insert(any(Group.class))).thenAnswer(invocation -> {
            Group group = invocation.getArgument(0);
            group.setId("group-new");
            return 1;
        });

        Group result = groupService.createGroup(request);

        assertNotNull(result);
        assertEquals(GroupStatus.ACTIVE, result.getStatus());
    }

    @Test
    @DisplayName("根据ID获取分组时memberCount为null")
    void getGroupById_NullMemberCount() {
        testGroup.setMemberCount(null);
        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(userMapper.countByGroupId("group-1")).thenReturn(null);

        Group result = groupService.getGroupById("group-1");

        assertNotNull(result);
        assertNull(result.getMemberCount());
    }

    @Test
    @DisplayName("获取分组成员返回用户列表")
    void getGroupMembers_WithUsers() {
        com.igreen.domain.entity.User user1 = com.igreen.domain.entity.User.builder()
                .id("user-1")
                .name("用户1")
                .username("user1")
                .build();
        com.igreen.domain.entity.User user2 = com.igreen.domain.entity.User.builder()
                .id("user-2")
                .name("用户2")
                .username("user2")
                .build();

        when(userMapper.selectByGroupId("group-1"))
                .thenReturn(Arrays.asList(user1, user2));

        Object result = groupService.getGroupMembers("group-1");

        assertNotNull(result);
        verify(userMapper).selectByGroupId("group-1");
    }

    @Test
    @DisplayName("删除分组后memberCount不为0不影响删除")
    void deleteGroup_WithMembers() {
        testGroup.setMemberCount(10);
        when(groupMapper.selectById("group-1")).thenReturn(testGroup);

        groupService.deleteGroup("group-1");

        verify(groupMapper).deleteById("group-1");
    }

    @Test
    @DisplayName("创建分组时名称包含特殊字符")
    void createGroup_SpecialCharactersInName() {
        GroupCreateRequest request = new GroupCreateRequest(
                "分组-测试_2024",
                "描述",
                "标签",
                GroupStatus.ACTIVE
        );

        when(groupMapper.countByName("分组-测试_2024")).thenReturn(0);
        when(groupMapper.insert(any(Group.class))).thenAnswer(invocation -> {
            Group group = invocation.getArgument(0);
            group.setId("group-new");
            return 1;
        });

        Group result = groupService.createGroup(request);

        assertNotNull(result);
        assertEquals("分组-测试_2024", result.getName());
    }

    @Test
    @DisplayName("更新分组时所有字段都为null仍会调用updateById")
    void updateGroup_AllNullFields() {
        GroupUpdateRequest request = new GroupUpdateRequest(
                null,
                null,
                null,
                null
        );

        when(groupMapper.selectById("group-1")).thenReturn(testGroup);
        when(groupMapper.updateById(any(Group.class))).thenReturn(1);
        when(userMapper.countByGroupId("group-1")).thenReturn(5);

        Group result = groupService.updateGroup("group-1", request);

        assertNotNull(result);
        verify(groupMapper).updateById(any(Group.class));
    }
}
