package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.ProblemType;
import com.igreen.domain.entity.SLAConfig;
import com.igreen.domain.entity.SiteLevelConfig;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.mapper.ProblemTypeMapper;
import com.igreen.domain.mapper.SLAConfigMapper;
import com.igreen.domain.mapper.SiteLevelConfigMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfigServiceTest {

    @Mock
    private SLAConfigMapper slaConfigMapper;

    @Mock
    private ProblemTypeMapper problemTypeMapper;

    @Mock
    private SiteLevelConfigMapper siteLevelConfigMapper;

    @InjectMocks
    private ConfigService configService;

    private SLAConfig testSLAConfig;
    private ProblemType testProblemType;
    private SiteLevelConfig testSiteLevelConfig;

    @BeforeEach
    void setUp() {
        testSLAConfig = new SLAConfig();
        testSLAConfig.setId("sla-1");
        testSLAConfig.setPriority(Priority.P1);
        testSLAConfig.setResponseTimeMinutes(60);
        testSLAConfig.setCompletionTimeHours(4);

        testProblemType = ProblemType.builder()
                .id("problem-1")
                .name("硬件故障")
                .description("硬件设备故障")
                .build();

        testSiteLevelConfig = SiteLevelConfig.builder()
                .id("level-1")
                .levelName("VIP")
                .description("VIP站点")
                .maxConcurrentTickets(3)
                .escalationTimeHours(2)
                .build();
    }

    @Test
    @DisplayName("获取所有SLA配置成功")
    void getAllSLAConfigs_Success() {
        when(slaConfigMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(testSLAConfig));

        List<SLAConfigResponse> result = configService.getAllSLAConfigs();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("sla-1", result.get(0).id());
        assertEquals(Priority.P1, result.get(0).priority());
    }

    @Test
    @DisplayName("根据ID获取SLA配置成功")
    void getSLAConfigById_Success() {
        when(slaConfigMapper.selectById("sla-1")).thenReturn(testSLAConfig);

        SLAConfigResponse result = configService.getSLAConfigById("sla-1");

        assertNotNull(result);
        assertEquals("sla-1", result.id());
        assertEquals(Priority.P1, result.priority());
    }

    @Test
    @DisplayName("根据ID获取SLA配置不存在应抛出异常")
    void getSLAConfigById_NotFound() {
        when(slaConfigMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> configService.getSLAConfigById("nonexistent"));

        assertEquals(ErrorCode.SLA_CONFIG_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("创建SLA配置成功")
    void createOrUpdateSLAConfig_Create() {
        SLAConfigRequest request = new SLAConfigRequest(
                null,
                Priority.P2,
                2,
                8
        );

        when(slaConfigMapper.selectByPriority(Priority.P2.name())).thenReturn(java.util.Optional.empty());
        when(slaConfigMapper.selectById(anyString())).thenReturn(null);
        when(slaConfigMapper.insert(any(SLAConfig.class))).thenReturn(1);

        SLAConfigResponse result = configService.createOrUpdateSLAConfig(request);

        assertNotNull(result);
        verify(slaConfigMapper).insert(any(SLAConfig.class));
    }

    @Test
    @DisplayName("删除SLA配置成功")
    void deleteSLAConfig_Success() {
        when(slaConfigMapper.selectById("sla-1")).thenReturn(testSLAConfig);

        configService.deleteSLAConfig("sla-1");

        verify(slaConfigMapper).deleteById("sla-1");
    }

    @Test
    @DisplayName("删除不存在的SLA配置应抛出异常")
    void deleteSLAConfig_NotFound() {
        when(slaConfigMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> configService.deleteSLAConfig("nonexistent"));

        assertEquals(ErrorCode.SLA_CONFIG_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取所有问题类型成功")
    void getAllProblemTypes_Success() {
        when(problemTypeMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(testProblemType));

        List<ProblemTypeResponse> result = configService.getAllProblemTypes();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("problem-1", result.get(0).id());
        assertEquals("硬件故障", result.get(0).name());
    }

    @Test
    @DisplayName("创建问题类型成功")
    void createProblemType_Success() {
        ProblemTypeRequest request = new ProblemTypeRequest(
                "网络故障",
                "网络设备故障"
        );

        when(problemTypeMapper.selectByName("网络故障")).thenReturn(java.util.Optional.empty());
        when(problemTypeMapper.insert(any(ProblemType.class))).thenReturn(1);

        ProblemTypeResponse result = configService.createProblemType(request);

        assertNotNull(result);
        assertEquals("网络故障", result.name());
        verify(problemTypeMapper).insert(any(ProblemType.class));
    }

    @Test
    @DisplayName("创建已存在的问题类型应抛出异常")
    void createProblemType_NameExists() {
        ProblemTypeRequest request = new ProblemTypeRequest(
                "硬件故障",
                "描述"
        );

        when(problemTypeMapper.selectByName("硬件故障")).thenReturn(java.util.Optional.of(testProblemType));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> configService.createProblemType(request));

        assertEquals(ErrorCode.PROBLEM_TYPE_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("更新问题类型成功")
    void updateProblemType_Success() {
        ProblemTypeUpdateRequest request = new ProblemTypeUpdateRequest(
                "更新后的名称",
                "更新后的描述"
        );

        when(problemTypeMapper.selectById("problem-1")).thenReturn(testProblemType);
        when(problemTypeMapper.countByNameAndIdNot("更新后的名称", "problem-1")).thenReturn(0);
        when(problemTypeMapper.updateById(any(ProblemType.class))).thenReturn(1);

        ProblemTypeResponse result = configService.updateProblemType("problem-1", request);

        assertNotNull(result);
        assertEquals("更新后的名称", result.name());
        verify(problemTypeMapper).updateById(any(ProblemType.class));
    }

    @Test
    @DisplayName("删除问题类型成功")
    void deleteProblemType_Success() {
        when(problemTypeMapper.selectById("problem-1")).thenReturn(testProblemType);

        configService.deleteProblemType("problem-1");

        verify(problemTypeMapper).deleteById("problem-1");
    }

    @Test
    @DisplayName("获取所有站点级别配置成功")
    void getAllSiteLevelConfigs_Success() {
        when(siteLevelConfigMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(testSiteLevelConfig));

        List<SiteLevelConfigResponse> result = configService.getAllSiteLevelConfigs();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("level-1", result.get(0).id());
        assertEquals("VIP", result.get(0).levelName());
    }

    @Test
    @DisplayName("创建站点级别配置成功")
    void createSiteLevelConfig_Success() {
        SiteLevelConfigRequest request = new SiteLevelConfigRequest(
                "普通站点",
                "普通站点描述",
                5,
                4
        );

        when(siteLevelConfigMapper.countByLevelName("普通站点")).thenReturn(0);
        when(siteLevelConfigMapper.insert(any(SiteLevelConfig.class))).thenReturn(1);

        SiteLevelConfigResponse result = configService.createSiteLevelConfig(request);

        assertNotNull(result);
        assertEquals("普通站点", result.levelName());
        verify(siteLevelConfigMapper).insert(any(SiteLevelConfig.class));
    }

    @Test
    @DisplayName("更新站点级别配置成功")
    void updateSiteLevelConfig_Success() {
        SiteLevelConfigUpdateRequest request = new SiteLevelConfigUpdateRequest(
                "更新后VIP",
                "更新后描述",
                3,
                2
        );

        when(siteLevelConfigMapper.selectById("level-1")).thenReturn(testSiteLevelConfig);
        when(siteLevelConfigMapper.countByLevelNameAndIdNot("更新后VIP", "level-1")).thenReturn(0);
        when(siteLevelConfigMapper.updateById(any(SiteLevelConfig.class))).thenReturn(1);

        SiteLevelConfigResponse result = configService.updateSiteLevelConfig("level-1", request);

        assertNotNull(result);
        assertEquals("更新后VIP", result.levelName());
        verify(siteLevelConfigMapper).updateById(any(SiteLevelConfig.class));
    }

    @Test
    @DisplayName("删除站点级别配置成功")
    void deleteSiteLevelConfig_Success() {
        when(siteLevelConfigMapper.selectById("level-1")).thenReturn(testSiteLevelConfig);

        configService.deleteSiteLevelConfig("level-1");

        verify(siteLevelConfigMapper).deleteById("level-1");
    }
}
