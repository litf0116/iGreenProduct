package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.SiteCreateRequest;
import com.igreen.domain.dto.SiteStats;
import com.igreen.domain.dto.SiteUpdateRequest;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.service.SiteService;
import com.github.pagehelper.PageInfo;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SiteService siteService;

    private Site testSite;
    private PageResult<Site> testPageResult;
    private SiteStats testSiteStats;

    @BeforeEach
    void setUp() {
        testSite = Site.builder()
                .id("site-1")
                .name("测试站点")
                .address("测试地址")
                .level("VIP")
                .status(SiteStatus.ONLINE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        List<Site> sites = Arrays.asList(testSite);
        PageInfo<Site> pageInfo = new PageInfo<>(sites);
        testPageResult = PageResult.of(pageInfo);

        testSiteStats = new SiteStats(10L, 8L, 2L, 3L);
    }

    @Nested
    @DisplayName("站点列表查询测试")
    class GetSitesTests {

        @Test
        @DisplayName("获取站点列表成功")
        @WithMockUser(roles = "ENGINEER")
        void getAllSites_Success() throws Exception {
            when(siteService.getAllSites(1, 10, null, null, null)).thenReturn(testPageResult);

            mockMvc.perform(get("/api/sites")
                            .param("page", "1")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records[0].id").value("site-1"))
                    .andExpect(jsonPath("$.data.records[0].name").value("测试站点"));

            verify(siteService).getAllSites(1, 10, null, null, null);
        }

        @Test
        @DisplayName("获取站点列表带筛选条件")
        @WithMockUser(roles = "ENGINEER")
        void getAllSites_WithFilters() throws Exception {
            when(siteService.getAllSites(1, 10, "测试", "VIP", "ONLINE")).thenReturn(testPageResult);

            mockMvc.perform(get("/api/sites")
                            .param("page", "1")
                            .param("size", "10")
                            .param("keyword", "测试")
                            .param("level", "VIP")
                            .param("status", "ONLINE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(siteService).getAllSites(1, 10, "测试", "VIP", "ONLINE");
        }

        @Test
        @DisplayName("获取站点列表返回空结果")
        @WithMockUser(roles = "ENGINEER")
        void getAllSites_EmptyList() throws Exception {
            PageInfo<Site> emptyPageInfo = new PageInfo<>(List.of());
            PageResult<Site> emptyResult = PageResult.of(emptyPageInfo);
            when(siteService.getAllSites(1, 10, null, null, null)).thenReturn(emptyResult);

            mockMvc.perform(get("/api/sites")
                            .param("page", "1")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records").isEmpty());
        }

        @Test
        @DisplayName("未登录用户获取站点应返回403")
        void getAllSites_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/sites")
                            .param("page", "1")
                            .param("size", "10"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("站点列表默认分页参数")
        @WithMockUser(roles = "ENGINEER")
        void getAllSites_DefaultPagination() throws Exception {
            when(siteService.getAllSites(1, 10, null, null, null)).thenReturn(testPageResult);

            mockMvc.perform(get("/api/sites"))
                    .andExpect(status().isOk());

            verify(siteService).getAllSites(1, 10, null, null, null);
        }
    }

    @Nested
    @DisplayName("站点统计测试")
    class SiteStatsTests {

        @Test
        @DisplayName("获取站点统计成功")
        @WithMockUser(roles = "ENGINEER")
        void getSiteStats_Success() throws Exception {
            when(siteService.getSiteStats()).thenReturn(testSiteStats);

            mockMvc.perform(get("/api/sites/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.totalSites").value(10))
                    .andExpect(jsonPath("$.data.onlineSites").value(8))
                    .andExpect(jsonPath("$.data.offlineSites").value(2))
                    .andExpect(jsonPath("$.data.vipSites").value(3));

            verify(siteService).getSiteStats();
        }
    }

    @Nested
    @DisplayName("站点详情查询测试")
    class GetSiteDetailTests {

        @Test
        @DisplayName("获取站点详情成功")
        @WithMockUser(roles = "ENGINEER")
        void getSiteById_Success() throws Exception {
            when(siteService.getSiteById("site-1")).thenReturn(testSite);

            mockMvc.perform(get("/api/sites/site-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("site-1"))
                    .andExpect(jsonPath("$.data.name").value("测试站点"));

            verify(siteService).getSiteById("site-1");
        }

        @Test
        @DisplayName("获取不存在的站点应返回错误")
        @WithMockUser(roles = "ENGINEER")
        void getSiteById_NotFound() throws Exception {
            when(siteService.getSiteById("nonexistent"))
                    .thenThrow(new BusinessException(ErrorCode.SITE_NOT_FOUND));

            mockMvc.perform(get("/api/sites/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SITE_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("创建站点测试")
    class CreateSiteTests {

        @Test
        @DisplayName("管理员创建站点成功")
        @WithMockUser(roles = "ADMIN")
        void createSite_Success() throws Exception {
            SiteCreateRequest request = new SiteCreateRequest(
                    "新站点",
                    "新地址",
                    "normal",
                    SiteStatus.ONLINE
            );

            Site createdSite = Site.builder()
                    .id("new-site-id")
                    .name("新站点")
                    .address("新地址")
                    .level("normal")
                    .status(SiteStatus.ONLINE)
                    .createdAt(LocalDateTime.now())
                    .build();

            when(siteService.createSite(any())).thenReturn(createdSite);

            mockMvc.perform(post("/api/sites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("new-site-id"))
                    .andExpect(jsonPath("$.data.name").value("新站点"));

            verify(siteService).createSite(any());
        }

        @Test
        @DisplayName("Manager创建站点成功")
        @WithMockUser(roles = "MANAGER")
        void createSite_Manager_Success() throws Exception {
            SiteCreateRequest request = new SiteCreateRequest(
                    "新站点", "新地址", "normal", SiteStatus.ONLINE);

            Site createdSite = Site.builder()
                    .id("new-site-id")
                    .name("新站点")
                    .address("新地址")
                    .build();

            when(siteService.createSite(any())).thenReturn(createdSite);

            mockMvc.perform(post("/api/sites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(siteService).createSite(any());
        }

        @Test
        @DisplayName("普通用户创建站点应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void createSite_Forbidden() throws Exception {
            SiteCreateRequest request = new SiteCreateRequest(
                    "新站点", "新地址", "normal", SiteStatus.ONLINE);

            mockMvc.perform(post("/api/sites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(siteService, never()).createSite(any());
        }

        @Test
        @DisplayName("创建站点名称为空应验证失败")
        @WithMockUser(roles = "ADMIN")
        void createSite_ValidationFailed() throws Exception {
            String invalidRequest = "{\"name\": \"\", \"address\": \"test\"}";

            mockMvc.perform(post("/api/sites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("创建站点名称已存在应返回错误")
        @WithMockUser(roles = "ADMIN")
        void createSite_NameExists() throws Exception {
            SiteCreateRequest request = new SiteCreateRequest(
                    "已存在的站点", "地址", "normal", SiteStatus.ONLINE);

            when(siteService.createSite(any()))
                    .thenThrow(new BusinessException(ErrorCode.SITE_EXISTS));

            mockMvc.perform(post("/api/sites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SITE_EXISTS.getCode()));
        }
    }

    @Nested
    @DisplayName("更新站点测试")
    class UpdateSiteTests {

        @Test
        @DisplayName("管理员更新站点成功")
        @WithMockUser(roles = "ADMIN")
        void updateSite_Success() throws Exception {
            SiteUpdateRequest request = new SiteUpdateRequest(
                    "更新后站点",
                    "更新后地址",
                    "normal",
                    SiteStatus.OFFLINE
            );

            Site updatedSite = Site.builder()
                    .id("site-1")
                    .name("更新后站点")
                    .address("更新后地址")
                    .level("normal")
                    .status(SiteStatus.OFFLINE)
                    .build();

            when(siteService.updateSite(eq("site-1"), any())).thenReturn(updatedSite);

            mockMvc.perform(post("/api/sites/site-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.name").value("更新后站点"));

            verify(siteService).updateSite(eq("site-1"), any());
        }

        @Test
        @DisplayName("Manager更新站点成功")
        @WithMockUser(roles = "MANAGER")
        void updateSite_Manager_Success() throws Exception {
            SiteUpdateRequest request = new SiteUpdateRequest(
                    "更新后站点", "更新后地址", null, null);

            Site updatedSite = Site.builder()
                    .id("site-1")
                    .name("更新后站点")
                    .address("更新后地址")
                    .build();

            when(siteService.updateSite(eq("site-1"), any())).thenReturn(updatedSite);

            mockMvc.perform(post("/api/sites/site-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(siteService).updateSite(eq("site-1"), any());
        }

        @Test
        @DisplayName("普通用户更新站点应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void updateSite_Forbidden() throws Exception {
            SiteUpdateRequest request = new SiteUpdateRequest(
                    "更新后站点", "更新后地址", null, null);

            mockMvc.perform(post("/api/sites/site-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(siteService, never()).updateSite(any(), any());
        }

        @Test
        @DisplayName("更新不存在的站点应返回错误")
        @WithMockUser(roles = "ADMIN")
        void updateSite_NotFound() throws Exception {
            SiteUpdateRequest request = new SiteUpdateRequest(
                    "更新后站点", "更新后地址", null, null);

            when(siteService.updateSite(eq("nonexistent"), any()))
                    .thenThrow(new BusinessException(ErrorCode.SITE_NOT_FOUND));

            mockMvc.perform(post("/api/sites/nonexistent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SITE_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("删除站点测试")
    class DeleteSiteTests {

        @Test
        @DisplayName("管理员删除站点成功")
        @WithMockUser(roles = "ADMIN")
        void deleteSite_Success() throws Exception {
            doNothing().when(siteService).deleteSite("site-1");

            mockMvc.perform(delete("/api/sites/site-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(siteService).deleteSite("site-1");
        }

        @Test
        @DisplayName("Manager删除站点应被拒绝")
        @WithMockUser(roles = "MANAGER")
        void deleteSite_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/sites/site-1"))
                    .andExpect(status().isForbidden());

            verify(siteService, never()).deleteSite(any());
        }

        @Test
        @DisplayName("普通用户删除站点应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void deleteSite_Forbidden_ForEngineer() throws Exception {
            mockMvc.perform(delete("/api/sites/site-1"))
                    .andExpect(status().isForbidden());

            verify(siteService, never()).deleteSite(any());
        }

        @Test
        @DisplayName("删除不存在的站点应返回错误")
        @WithMockUser(roles = "ADMIN")
        void deleteSite_NotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.SITE_NOT_FOUND))
                    .when(siteService).deleteSite("nonexistent");

            mockMvc.perform(delete("/api/sites/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.SITE_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("站点分页参数验证测试")
    class PaginationValidationTests {

        @Test
        @DisplayName("获取站点列表使用有效分页参数")
        @WithMockUser(roles = "ENGINEER")
        void getAllSites_ValidPagination() throws Exception {
            when(siteService.getAllSites(2, 20, null, null, null)).thenReturn(testPageResult);

            mockMvc.perform(get("/api/sites")
                            .param("page", "2")
                            .param("size", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(siteService).getAllSites(2, 20, null, null, null);
        }
    }
}
