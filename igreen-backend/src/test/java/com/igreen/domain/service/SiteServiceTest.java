package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.SiteCreateRequest;
import com.igreen.domain.dto.SiteStats;
import com.igreen.domain.dto.SiteUpdateRequest;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.mapper.SiteMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SiteServiceTest {

    @Mock
    private SiteMapper siteMapper;

    @InjectMocks
    private SiteService siteService;

    private Site testSite;

    @BeforeEach
    void setUp() {
        testSite = Site.builder()
                .id("site-1")
                .name("测试站点")
                .address("测试地址")
                .level("VIP")
                .status(SiteStatus.ONLINE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("创建站点成功")
    void createSite_Success() {
        SiteCreateRequest request = new SiteCreateRequest(
                "新站点",
                "新地址",
                "VIP",
                SiteStatus.ONLINE
        );

        when(siteMapper.countByName("新站点")).thenReturn(0);
        when(siteMapper.insert(any(Site.class))).thenReturn(1);

        Site result = siteService.createSite(request);

        assertNotNull(result);
        assertEquals("新站点", result.getName());
        assertEquals("新地址", result.getAddress());
        assertEquals("VIP", result.getLevel());
        assertEquals(SiteStatus.ONLINE, result.getStatus());
        verify(siteMapper).insert(any(Site.class));
    }

    @Test
    @DisplayName("创建站点时名称已存在应抛出异常")
    void createSite_NameExists() {
        SiteCreateRequest request = new SiteCreateRequest(
                "已存在的站点",
                "地址",
                null,
                null
        );

        when(siteMapper.countByName("已存在的站点")).thenReturn(1);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> siteService.createSite(request));

        assertEquals(ErrorCode.SITE_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("根据ID获取站点成功")
    void getSiteById_Success() {
        when(siteMapper.selectById("site-1")).thenReturn(testSite);

        Site result = siteService.getSiteById("site-1");

        assertNotNull(result);
        assertEquals("site-1", result.getId());
        assertEquals("测试站点", result.getName());
    }

    @Test
    @DisplayName("根据ID获取站点不存在应抛出异常")
    void getSiteById_NotFound() {
        when(siteMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> siteService.getSiteById("nonexistent"));

        assertEquals(ErrorCode.SITE_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取站点统计信息")
    void getSiteStats_ReturnsStats() {
        when(siteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(10L);

        SiteStats stats = siteService.getSiteStats();

        assertNotNull(stats);
        assertEquals(10L, stats.totalSites());
    }

    @Test
    @DisplayName("更新站点成功")
    void updateSite_Success() {
        SiteUpdateRequest request = new SiteUpdateRequest(
                "更新后站点",
                "更新后地址",
                "normal",
                SiteStatus.OFFLINE
        );

        when(siteMapper.selectById("site-1")).thenReturn(testSite);
        when(siteMapper.countByName("更新后站点")).thenReturn(0);
        when(siteMapper.updateById(any(Site.class))).thenReturn(1);

        Site result = siteService.updateSite("site-1", request);

        assertNotNull(result);
        assertEquals("更新后站点", result.getName());
        assertEquals("更新后地址", result.getAddress());
        verify(siteMapper).updateById(any(Site.class));
    }

    @Test
    @DisplayName("更新站点不存在应抛出异常")
    void updateSite_NotFound() {
        SiteUpdateRequest request = new SiteUpdateRequest(
                "新名称",
                "地址",
                null,
                null
        );

        when(siteMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> siteService.updateSite("nonexistent", request));

        assertEquals(ErrorCode.SITE_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("删除站点成功")
    void deleteSite_Success() {
        when(siteMapper.selectById("site-1")).thenReturn(testSite);

        siteService.deleteSite("site-1");

        verify(siteMapper).deleteById("site-1");
    }

    @Test
    @DisplayName("删除不存在的站点应抛出异常")
    void deleteSite_NotFound() {
        when(siteMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> siteService.deleteSite("nonexistent"));

        assertEquals(ErrorCode.SITE_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取站点统计信息返回总数")
    void getSiteStats_ReturnsTotal() {
        when(siteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(10L);

        SiteStats stats = siteService.getSiteStats();

        assertNotNull(stats);
        assertEquals(10L, stats.totalSites());
    }

    @Test
    @DisplayName("获取空站点列表")
    void getAllSites_EmptyList() {
        PageResult<Site> emptyResult = new PageResult<>(Collections.emptyList(), 0, 10, 0, false);
        when(siteMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(Collections.emptyList());

        PageResult<Site> result = siteService.getAllSites(0, 10, null, null, null);

        assertNotNull(result);
        assertEquals(0, result.records().size());
    }

    @Test
    @DisplayName("获取多个站点")
    void getAllSites_MultipleSites() {
        Site site2 = Site.builder()
                .id("site-2")
                .name("站点2")
                .address("地址2")
                .status(SiteStatus.ONLINE)
                .build();

        PageResult<Site> pageResult = new PageResult<>(Arrays.asList(testSite, site2), 0, 10, 2, false);
        when(siteMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(Arrays.asList(testSite, site2));

        PageResult<Site> result = siteService.getAllSites(0, 10, null, null, null);

        assertNotNull(result);
        assertEquals(2, result.records().size());
    }

    @Test
    @DisplayName("创建站点时名称为null")
    void createSite_NullName() {
        SiteCreateRequest request = new SiteCreateRequest(
                null,
                "地址",
                "VIP",
                SiteStatus.ONLINE
        );

        when(siteMapper.insert(any(Site.class))).thenAnswer(invocation -> {
            Site site = invocation.getArgument(0);
            site.setId("site-new");
            return 1;
        });

        Site result = siteService.createSite(request);

        assertNotNull(result);
        assertNull(result.getName());
    }

    @Test
    @DisplayName("更新站点时只更新地址")
    void updateSite_OnlyAddress() {
        SiteUpdateRequest request = new SiteUpdateRequest(
                null,
                "新地址",
                null,
                null
        );

        when(siteMapper.selectById("site-1")).thenReturn(testSite);
        when(siteMapper.updateById(any(Site.class))).thenReturn(1);

        Site result = siteService.updateSite("site-1", request);

        assertNotNull(result);
        assertEquals("新地址", result.getAddress());
        verify(siteMapper).updateById(any(Site.class));
    }

    @Test
    @DisplayName("更新站点时名称重复应抛出异常")
    void updateSite_NameExists() {
        SiteUpdateRequest request = new SiteUpdateRequest(
                "已存在名称",
                null,
                null,
                null
        );

        when(siteMapper.selectById("site-1")).thenReturn(testSite);
        when(siteMapper.countByName("已存在名称")).thenReturn(1);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> siteService.updateSite("site-1", request));

        assertEquals(ErrorCode.SITE_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("创建站点时地址为null")
    void createSite_NullAddress() {
        SiteCreateRequest request = new SiteCreateRequest(
                "新站点",
                null,
                "VIP",
                SiteStatus.ONLINE
        );

        when(siteMapper.countByName("新站点")).thenReturn(0);
        when(siteMapper.insert(any(Site.class))).thenAnswer(invocation -> {
            Site site = invocation.getArgument(0);
            site.setId("site-new");
            return 1;
        });

        Site result = siteService.createSite(request);

        assertNotNull(result);
        assertEquals("新站点", result.getName());
        assertNull(result.getAddress());
    }

    @Test
    @DisplayName("更新站点时状态为null不更新")
    void updateSite_NullStatus() {
        SiteUpdateRequest request = new SiteUpdateRequest(
                null,
                null,
                null,
                null
        );

        when(siteMapper.selectById("site-1")).thenReturn(testSite);

        Site result = siteService.updateSite("site-1", request);

        assertNotNull(result);
        assertEquals(SiteStatus.ONLINE, result.getStatus());
    }
}
