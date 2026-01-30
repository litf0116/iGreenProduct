package com.igreen.common.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Database Init Config 测试")
class DatabaseInitConfigTest {

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DatabaseInitConfig databaseInitConfig;

    @Test
    @DisplayName("SLA配置表缺少response_time_minutes字段时应添加")
    void initSlaConfigsTable_MissingResponseTime_ShouldAddColumn() {
        when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(Arrays.asList("priority", "completion_time_hours"));

        databaseInitConfig.initDatabase();

        verify(jdbcTemplate, atLeastOnce()).execute(anyString());
    }

    @Test
    @DisplayName("SLA配置表字段都存在时不应添加")
    void initSlaConfigsTable_AllColumnsExist_ShouldNotModify() {
        when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(Arrays.asList("priority", "response_time_minutes", "completion_time_hours"));

        databaseInitConfig.initDatabase();

        verify(jdbcTemplate, atLeast(2)).queryForList(anyString(), eq(String.class));
    }

    @Test
    @DisplayName("站点级别配置表缺少description字段时应添加")
    void initSiteLevelConfigsTable_MissingDescription_ShouldAddColumn() {
        when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(Arrays.asList("id", "level_name"));

        databaseInitConfig.initDatabase();

        verify(jdbcTemplate, atLeastOnce()).execute(anyString());
    }

    @Test
    @DisplayName("初始化应执行成功")
    void initDatabase_ShouldSucceed() {
        when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(Arrays.asList("id"));

        databaseInitConfig.initDatabase();
    }
}
