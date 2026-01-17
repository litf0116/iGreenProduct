package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.Result;
import com.igreen.domain.dto.*;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.service.ConfigService;
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

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ConfigControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ConfigService configService;

    private SLAConfigResponse testSLAConfig;
    private ProblemTypeResponse testProblemType;
    private SiteLevelConfigResponse testSiteLevelConfig;

    @BeforeEach
    void setUp() {
        testSLAConfig = new SLAConfigResponse("sla-1", Priority.P1, 60, 4);
        testProblemType = new ProblemTypeResponse("problem-1", "硬件故障", "硬件设备故障");
        testSiteLevelConfig = new SiteLevelConfigResponse("level-1", "VIP", "VIP站点", 3, 2);
    }

    @Nested
    @DisplayName("SLA配置接口测试")
    class SLAConfigTests {

        @Test
        @DisplayName("获取所有SLA配置成功")
        @WithMockUser(roles = "ENGINEER")
        void getAllSLAConfigs_Success() throws Exception {
            List<SLAConfigResponse> configs = Arrays.asList(testSLAConfig);
            when(configService.getAllSLAConfigs()).thenReturn(configs);

            mockMvc.perform(get("/api/configs/sla-configs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].id").value("sla-1"))
                    .andExpect(jsonPath("$.data[0].priority").value("P1"));

            verify(configService).getAllSLAConfigs();
        }

        @Test
        @DisplayName("获取单个SLA配置成功")
        @WithMockUser(roles = "ENGINEER")
        void getSLAConfig_Success() throws Exception {
            when(configService.getSLAConfigById("sla-1")).thenReturn(testSLAConfig);

            mockMvc.perform(get("/api/configs/sla-configs/sla-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("sla-1"));

            verify(configService).getSLAConfigById("sla-1");
        }

        @Test
        @DisplayName("创建SLA配置需要管理员权限")
        @WithMockUser(roles = "ADMIN")
        void createSLAConfig_Success() throws Exception {
            SLAConfigRequest request = new SLAConfigRequest(null, Priority.P2, 120, 8);
            SLAConfigResponse response = new SLAConfigResponse("sla-2", Priority.P2, 120, 8);

            when(configService.createOrUpdateSLAConfig(any())).thenReturn(response);

            mockMvc.perform(post("/api/configs/sla-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("sla-2"))
                    .andExpect(jsonPath("$.data.priority").value("P2"));

            verify(configService).createOrUpdateSLAConfig(any());
        }

        @Test
        @DisplayName("普通用户创建SLA配置应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void createSLAConfig_Forbidden() throws Exception {
            SLAConfigRequest request = new SLAConfigRequest(null, Priority.P2, 120, 8);

            mockMvc.perform(post("/api/configs/sla-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(configService, never()).createOrUpdateSLAConfig(any());
        }

        @Test
        @DisplayName("删除SLA配置需要管理员权限")
        @WithMockUser(roles = "ADMIN")
        void deleteSLAConfig_Success() throws Exception {
            doNothing().when(configService).deleteSLAConfig("sla-1");

            mockMvc.perform(delete("/api/configs/sla-configs/sla-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(configService).deleteSLAConfig("sla-1");
        }

        @Test
        @DisplayName("删除不存在的SLA配置应返回错误")
        @WithMockUser(roles = "ADMIN")
        void deleteSLAConfig_NotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.SLA_CONFIG_NOT_FOUND))
                    .when(configService).deleteSLAConfig("nonexistent");

            mockMvc.perform(delete("/api/configs/sla-configs/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SLA_CONFIG_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("创建SLA配置参数验证失败")
        @WithMockUser(roles = "ADMIN")
        void createSLAConfig_ValidationFailed() throws Exception {
            String invalidRequest = "{\"priority\": null, \"responseTimeMinutes\": 0}";

            mockMvc.perform(post("/api/configs/sla-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("问题类型接口测试")
    class ProblemTypeTests {

        @Test
        @DisplayName("获取所有问题类型成功")
        @WithMockUser(roles = "ENGINEER")
        void getAllProblemTypes_Success() throws Exception {
            List<ProblemTypeResponse> types = Arrays.asList(testProblemType);
            when(configService.getAllProblemTypes()).thenReturn(types);

            mockMvc.perform(get("/api/configs/problem-types"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data[0].id").value("problem-1"))
                    .andExpect(jsonPath("$.data[0].name").value("硬件故障"));

            verify(configService).getAllProblemTypes();
        }

        @Test
        @DisplayName("创建问题类型成功")
        @WithMockUser(roles = "MANAGER")
        void createProblemType_Success() throws Exception {
            ProblemTypeRequest request = new ProblemTypeRequest("网络故障", "网络连接问题");
            ProblemTypeResponse response = new ProblemTypeResponse("problem-2", "网络故障", "网络连接问题");

            when(configService.createProblemType(any())).thenReturn(response);

            mockMvc.perform(post("/api/configs/problem-types")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.name").value("网络故障"));

            verify(configService).createProblemType(any());
        }

        @Test
        @DisplayName("管理员创建问题类型成功")
        @WithMockUser(roles = "ADMIN")
        void createProblemType_Admin_Success() throws Exception {
            ProblemTypeRequest request = new ProblemTypeRequest("软件故障", "软件问题");
            ProblemTypeResponse response = new ProblemTypeResponse("problem-3", "软件故障", "软件问题");

            when(configService.createProblemType(any())).thenReturn(response);

            mockMvc.perform(post("/api/configs/problem-types")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(configService).createProblemType(any());
        }

        @Test
        @DisplayName("普通用户创建问题类型应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void createProblemType_Forbidden() throws Exception {
            ProblemTypeRequest request = new ProblemTypeRequest("网络故障", "网络连接问题");

            mockMvc.perform(post("/api/configs/problem-types")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(configService, never()).createProblemType(any());
        }

        @Test
        @DisplayName("更新问题类型成功")
        @WithMockUser(roles = "MANAGER")
        void updateProblemType_Success() throws Exception {
            ProblemTypeUpdateRequest request = new ProblemTypeUpdateRequest("更新后名称", "更新后描述");
            ProblemTypeResponse response = new ProblemTypeResponse("problem-1", "更新后名称", "更新后描述");

            when(configService.updateProblemType(eq("problem-1"), any())).thenReturn(response);

            mockMvc.perform(post("/api/configs/problem-types/problem-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.name").value("更新后名称"));

            verify(configService).updateProblemType(eq("problem-1"), any());
        }

        @Test
        @DisplayName("删除问题类型需要管理员权限")
        @WithMockUser(roles = "ADMIN")
        void deleteProblemType_Success() throws Exception {
            doNothing().when(configService).deleteProblemType("problem-1");

            mockMvc.perform(delete("/api/configs/problem-types/problem-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(configService).deleteProblemType("problem-1");
        }

        @Test
        @DisplayName("创建问题类型名称为空应验证失败")
        @WithMockUser(roles = "MANAGER")
        void createProblemType_ValidationFailed() throws Exception {
            String invalidRequest = "{\"name\": \"\", \"description\": \"test\"}";

            mockMvc.perform(post("/api/configs/problem-types")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("站点级别配置接口测试")
    class SiteLevelConfigTests {

        @Test
        @DisplayName("获取所有站点级别配置成功")
        @WithMockUser(roles = "ENGINEER")
        void getAllSiteLevelConfigs_Success() throws Exception {
            List<SiteLevelConfigResponse> configs = Arrays.asList(testSiteLevelConfig);
            when(configService.getAllSiteLevelConfigs()).thenReturn(configs);

            mockMvc.perform(get("/api/configs/site-level-configs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data[0].id").value("level-1"))
                    .andExpect(jsonPath("$.data[0].levelName").value("VIP"));

            verify(configService).getAllSiteLevelConfigs();
        }

        @Test
        @DisplayName("创建站点级别配置需要管理员权限")
        @WithMockUser(roles = "ADMIN")
        void createSiteLevelConfig_Success() throws Exception {
            SiteLevelConfigRequest request = new SiteLevelConfigRequest(
                    "普通站点", "普通站点描述", 5, 4);
            SiteLevelConfigResponse response = new SiteLevelConfigResponse(
                    "level-2", "普通站点", "普通站点描述", 5, 4);

            when(configService.createSiteLevelConfig(any())).thenReturn(response);

            mockMvc.perform(post("/api/configs/site-level-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.levelName").value("普通站点"));

            verify(configService).createSiteLevelConfig(any());
        }

        @Test
        @DisplayName("管理员以外角色创建站点级别配置应被拒绝")
        @WithMockUser(roles = "MANAGER")
        void createSiteLevelConfig_Forbidden() throws Exception {
            SiteLevelConfigRequest request = new SiteLevelConfigRequest(
                    "普通站点", "描述", 5, 4);

            mockMvc.perform(post("/api/configs/site-level-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(configService, never()).createSiteLevelConfig(any());
        }

        @Test
        @DisplayName("更新站点级别配置需要管理员权限")
        @WithMockUser(roles = "ADMIN")
        void updateSiteLevelConfig_Success() throws Exception {
            SiteLevelConfigUpdateRequest request = new SiteLevelConfigUpdateRequest(
                    "更新后VIP", "更新后描述", 4, 3);
            SiteLevelConfigResponse response = new SiteLevelConfigResponse(
                    "level-1", "更新后VIP", "更新后描述", 4, 3);

            when(configService.updateSiteLevelConfig(eq("level-1"), any())).thenReturn(response);

            mockMvc.perform(post("/api/configs/site-level-configs/level-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.levelName").value("更新后VIP"));

            verify(configService).updateSiteLevelConfig(eq("level-1"), any());
        }

        @Test
        @DisplayName("删除站点级别配置需要管理员权限")
        @WithMockUser(roles = "ADMIN")
        void deleteSiteLevelConfig_Success() throws Exception {
            doNothing().when(configService).deleteSiteLevelConfig("level-1");

            mockMvc.perform(delete("/api/configs/site-level-configs/level-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(configService).deleteSiteLevelConfig("level-1");
        }

        @Test
        @DisplayName("创建站点级别配置名称为空应验证失败")
        @WithMockUser(roles = "ADMIN")
        void createSiteLevelConfig_ValidationFailed() throws Exception {
            String invalidRequest = "{\"levelName\": \"\", \"description\": \"test\"}";

            mockMvc.perform(post("/api/configs/site-level-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("未授权访问测试")
    class UnauthorizedTests {

        @Test
        @DisplayName("未登录用户访问应返回403")
        void unauthorizedAccess() throws Exception {
            mockMvc.perform(get("/api/configs/sla-configs"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("边界情况和异常测试")
    class BoundaryTests {

        @Test
        @DisplayName("获取不存在的SLA配置应返回错误")
        @WithMockUser(roles = "ENGINEER")
        void getSLAConfig_NotFound() throws Exception {
            when(configService.getSLAConfigById("nonexistent"))
                    .thenThrow(new BusinessException(ErrorCode.SLA_CONFIG_NOT_FOUND));

            mockMvc.perform(get("/api/configs/sla-configs/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SLA_CONFIG_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("获取不存在的问题类型应返回错误")
        @WithMockUser(roles = "ENGINEER")
        void getProblemType_NotFound() throws Exception {
            when(configService.getAllProblemTypes())
                    .thenThrow(new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND));

            mockMvc.perform(get("/api/configs/problem-types"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("更新不存在的站点级别配置应返回错误")
        @WithMockUser(roles = "ADMIN")
        void updateSiteLevelConfig_NotFound() throws Exception {
            SiteLevelConfigUpdateRequest request = new SiteLevelConfigUpdateRequest(
                    "新名称", "新描述", 5, 4);

            when(configService.updateSiteLevelConfig(eq("nonexistent"), any()))
                    .thenThrow(new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND));

            mockMvc.perform(post("/api/configs/site-level-configs/nonexistent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("删除不存在的站点级别配置应返回错误")
        @WithMockUser(roles = "ADMIN")
        void deleteSiteLevelConfig_NotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND))
                    .when(configService).deleteSiteLevelConfig("nonexistent");

            mockMvc.perform(delete("/api/configs/site-level-configs/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("创建SLA配置时响应时间小于1应验证失败")
        @WithMockUser(roles = "ADMIN")
        void createSLAConfig_ResponseTimeInvalid() throws Exception {
            String invalidRequest = "{\"priority\": \"P1\", \"responseTimeMinutes\": 0, \"completionTimeHours\": 4}";

            mockMvc.perform(post("/api/configs/sla-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("创建SLA配置时完成时间小于1应验证失败")
        @WithMockUser(roles = "ADMIN")
        void createSLAConfig_CompletionTimeInvalid() throws Exception {
            String invalidRequest = "{\"priority\": \"P1\", \"responseTimeMinutes\": 60, \"completionTimeHours\": 0}";

            mockMvc.perform(post("/api/configs/sla-configs")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("更新问题类型不存在应返回错误")
        @WithMockUser(roles = "MANAGER")
        void updateProblemType_NotFound() throws Exception {
            ProblemTypeUpdateRequest request = new ProblemTypeUpdateRequest("新名称", "新描述");

            when(configService.updateProblemType(eq("nonexistent"), any()))
                    .thenThrow(new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND));

            mockMvc.perform(post("/api/configs/problem-types/nonexistent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.PROBLEM_TYPE_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("删除问题类型不存在应返回错误")
        @WithMockUser(roles = "ADMIN")
        void deleteProblemType_NotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND))
                    .when(configService).deleteProblemType("nonexistent");

            mockMvc.perform(delete("/api/configs/problem-types/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.PROBLEM_TYPE_NOT_FOUND.getCode()));
        }

        @Test
        @DisplayName("Manager角色更新站点级别配置应被拒绝")
        @WithMockUser(roles = "MANAGER")
        void updateSiteLevelConfig_Forbidden() throws Exception {
            SiteLevelConfigUpdateRequest request = new SiteLevelConfigUpdateRequest(
                    "名称", "描述", 5, 4);

            mockMvc.perform(post("/api/configs/site-level-configs/level-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Engineer角色删除SLA配置应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void deleteSLAConfig_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/configs/sla-configs/sla-1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Engineer角色删除问题类型应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void deleteProblemType_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/configs/problem-types/problem-1"))
                    .andExpect(status().isForbidden());
        }
    }
}
