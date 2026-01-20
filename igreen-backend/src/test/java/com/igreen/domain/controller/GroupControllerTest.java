package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.GroupCreateRequest;
import com.igreen.domain.dto.GroupUpdateRequest;
import com.igreen.domain.entity.Group;
import com.igreen.domain.enums.GroupStatus;
import com.igreen.domain.service.GroupService;
import com.igreen.domain.vo.GroupConverter;
import com.igreen.domain.vo.GroupVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GroupService groupService;

    @MockBean
    private GroupConverter groupConverter;

    private Group testGroup;
    private GroupVO testGroupVO;

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

        testGroupVO = GroupVO.builder()
                .id("group-1")
                .name("测试分组")
                .description("测试分组描述")
                .tags(Arrays.asList("技术", "运维"))
                .status(GroupStatus.ACTIVE)
                .memberCount(5)
                .build();
    }

    @Nested
    @DisplayName("获取分组接口测试")
    class GetGroupsTests {

        @Test
        @DisplayName("获取所有分组成功")
        @WithMockUser(roles = "ENGINEER")
        void getAllGroups_Success() throws Exception {
            List<Group> groups = Arrays.asList(testGroup);
            when(groupConverter.toVOList(any())).thenReturn(Arrays.asList(testGroupVO));

            mockMvc.perform(get("/api/groups"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].id").value("group-1"))
                    .andExpect(jsonPath("$.data[0].name").value("测试分组"))
                    .andExpect(jsonPath("$.data[0].tags").isArray());

            verify(groupService).getAllGroups();
            verify(groupConverter).toVOList(any());
        }

        @Test
        @DisplayName("获取所有分组返回空列表")
        @WithMockUser(roles = "ENGINEER")
        void getAllGroups_EmptyList() throws Exception {
            when(groupService.getAllGroups()).thenReturn(Arrays.asList());
            when(groupConverter.toVOList(any())).thenReturn(Arrays.asList());

            mockMvc.perform(get("/api/groups"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data").isEmpty());

            verify(groupService).getAllGroups();
        }

        @Test
        @DisplayName("获取单个分组成功")
        @WithMockUser(roles = "ENGINEER")
        void getGroupById_Success() throws Exception {
            when(groupService.getGroupById("group-1")).thenReturn(testGroup);
            when(groupConverter.toVO(any())).thenReturn(testGroupVO);

            mockMvc.perform(get("/api/groups/group-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("group-1"))
                    .andExpect(jsonPath("$.data.name").value("测试分组"))
                    .andExpect(jsonPath("$.data.tags").isArray());

            verify(groupService).getGroupById("group-1");
        }

        @Test
        @DisplayName("获取不存在的分组应返回错误")
        @WithMockUser(roles = "ENGINEER")
        void getGroupById_NotFound() throws Exception {
            when(groupService.getGroupById("nonexistent"))
                    .thenThrow(new BusinessException(ErrorCode.GROUP_NOT_FOUND));

            mockMvc.perform(get("/api/groups/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.GROUP_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("获取分组成员成功")
        @WithMockUser(roles = "ENGINEER")
        void getGroupMembers_Success() throws Exception {
            when(groupService.getGroupMembers("group-1")).thenReturn(Arrays.asList());

            mockMvc.perform(get("/api/groups/group-1/members"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray());

            verify(groupService).getGroupMembers("group-1");
        }
    }

    @Nested
    @DisplayName("创建分组接口测试")
    class CreateGroupTests {

        @Test
        @DisplayName("管理员创建分组成功")
        @WithMockUser(roles = "ADMIN")
        void createGroup_Success() throws Exception {
            GroupCreateRequest request = new GroupCreateRequest(
                    "新分组",
                    "新分组描述",
                    new String[]{"开发", "测试"},
                    GroupStatus.ACTIVE
            );
            Group createdGroup = Group.builder()
                    .id("group-new")
                    .name("新分组")
                    .description("新分组描述")
                    .tags("开发,测试")
                    .status(GroupStatus.ACTIVE)
                    .memberCount(0)
                    .build();
            GroupVO createdVO = GroupVO.builder()
                    .id("group-new")
                    .name("新分组")
                    .description("新分组描述")
                    .tags(Arrays.asList("开发", "测试"))
                    .status(GroupStatus.ACTIVE)
                    .memberCount(0)
                    .build();

            when(groupService.createGroup(any())).thenReturn(createdGroup);
            when(groupConverter.toVO(any())).thenReturn(createdVO);

            mockMvc.perform(post("/api/groups")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("group-new"))
                    .andExpect(jsonPath("$.data.name").value("新分组"))
                    .andExpect(jsonPath("$.data.tags").isArray());

            verify(groupService).createGroup(any());
        }

        @Test
        @DisplayName("非管理员创建分组应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void createGroup_Forbidden() throws Exception {
            GroupCreateRequest request = new GroupCreateRequest(
                    "新分组",
                    "描述",
                    null,
                    GroupStatus.ACTIVE
            );

            mockMvc.perform(post("/api/groups")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(groupService, never()).createGroup(any());
        }

        @Test
        @DisplayName("创建分组名称为空应验证失败")
        @WithMockUser(roles = "ADMIN")
        void createGroup_NameBlank() throws Exception {
            String invalidRequest = "{\"name\": \"\", \"description\": \"描述\"}";

            mockMvc.perform(post("/api/groups")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("更新分组接口测试")
    class UpdateGroupTests {

        @Test
        @DisplayName("管理员更新分组成功")
        @WithMockUser(roles = "ADMIN")
        void updateGroup_Success() throws Exception {
            GroupUpdateRequest request = new GroupUpdateRequest(
                    "更新后分组",
                    "更新后描述",
                    new String[]{"新标签1", "新标签2"},
                    GroupStatus.INACTIVE
            );
            Group updatedGroup = Group.builder()
                    .id("group-1")
                    .name("更新后分组")
                    .description("更新后描述")
                    .tags("新标签1,新标签2")
                    .status(GroupStatus.INACTIVE)
                    .memberCount(5)
                    .build();
            GroupVO updatedVO = GroupVO.builder()
                    .id("group-1")
                    .name("更新后分组")
                    .description("更新后描述")
                    .tags(Arrays.asList("新标签1", "新标签2"))
                    .status(GroupStatus.INACTIVE)
                    .memberCount(5)
                    .build();

            when(groupService.updateGroup(eq("group-1"), any())).thenReturn(updatedGroup);
            when(groupConverter.toVO(any())).thenReturn(updatedVO);

            mockMvc.perform(put("/api/groups/group-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("group-1"))
                    .andExpect(jsonPath("$.data.name").value("更新后分组"))
                    .andExpect(jsonPath("$.data.tags").isArray());

            verify(groupService).updateGroup(eq("group-1"), any());
        }

        @Test
        @DisplayName("非管理员更新分组应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void updateGroup_Forbidden() throws Exception {
            GroupUpdateRequest request = new GroupUpdateRequest(
                    "新名称",
                    "描述",
                    null,
                    GroupStatus.ACTIVE
            );

            mockMvc.perform(put("/api/groups/group-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(groupService, never()).updateGroup(any(), any());
        }

        @Test
        @DisplayName("更新不存在的分组应返回错误")
        @WithMockUser(roles = "ADMIN")
        void updateGroup_NotFound() throws Exception {
            GroupUpdateRequest request = new GroupUpdateRequest(
                    "新名称",
                    "描述",
                    new String[]{"标签"},
                    GroupStatus.ACTIVE
            );

            when(groupService.updateGroup(eq("nonexistent"), any()))
                    .thenThrow(new BusinessException(ErrorCode.GROUP_NOT_FOUND));

            mockMvc.perform(put("/api/groups/nonexistent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.GROUP_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("删除分组接口测试")
    class DeleteGroupTests {

        @Test
        @DisplayName("管理员删除分组成功")
        @WithMockUser(roles = "ADMIN")
        void deleteGroup_Success() throws Exception {
            doNothing().when(groupService).deleteGroup("group-1");

            mockMvc.perform(delete("/api/groups/group-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(groupService).deleteGroup("group-1");
        }

        @Test
        @DisplayName("非管理员删除分组应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void deleteGroup_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/groups/group-1"))
                    .andExpect(status().isForbidden());

            verify(groupService, never()).deleteGroup(any());
        }

        @Test
        @DisplayName("删除不存在的分组应返回错误")
        @WithMockUser(roles = "ADMIN")
        void deleteGroup_NotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.GROUP_NOT_FOUND))
                    .when(groupService).deleteGroup("nonexistent");

            mockMvc.perform(delete("/api/groups/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.GROUP_NOT_FOUND.getCode()));
        }
    }
}
