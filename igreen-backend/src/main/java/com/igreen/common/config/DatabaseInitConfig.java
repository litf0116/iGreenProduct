package com.igreen.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    @Order(1)
    public ApplicationRunner initDatabase() {
        return args -> {
            log.info("开始初始化数据库表结构...");

            initSlaConfigsTable();
            initSiteLevelConfigsTable();

            log.info("数据库表结构初始化完成");
        };
    }

    private void initSlaConfigsTable() {
        log.info("检查并修复 sla_configs 表结构...");

        try {
            List<String> columns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sla_configs'",
                    String.class
            );

            if (!columns.contains("response_time_minutes")) {
                log.info("添加缺失字段: response_time_minutes");
                jdbcTemplate.execute("ALTER TABLE sla_configs ADD COLUMN response_time_minutes INT NOT NULL DEFAULT 60 AFTER priority");
            }

            if (!columns.contains("completion_time_hours")) {
                log.info("添加缺失字段: completion_time_hours");
                jdbcTemplate.execute("ALTER TABLE sla_configs ADD COLUMN completion_time_hours INT NOT NULL DEFAULT 24 AFTER response_time_minutes");
            }

            if (columns.contains("response_time_hours")) {
                log.info("删除冗余字段: response_time_hours");
                jdbcTemplate.execute("ALTER TABLE sla_configs DROP COLUMN response_time_hours");
            }

            if (columns.contains("resolution_time_hours")) {
                log.info("删除冗余字段: resolution_time_hours");
                jdbcTemplate.execute("ALTER TABLE sla_configs DROP COLUMN resolution_time_hours");
            }

            if (columns.contains("name")) {
                log.info("删除冗余字段: name");
                jdbcTemplate.execute("ALTER TABLE sla_configs DROP COLUMN name");
            }

            log.info("sla_configs 表结构修复完成");
        } catch (Exception e) {
            log.error("修复 sla_configs 表结构失败: {}", e.getMessage());
        }
    }

    private void initSiteLevelConfigsTable() {
        log.info("检查并修复 site_level_configs 表结构...");

        try {
            List<String> columns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_level_configs'",
                    String.class
            );

            if (!columns.contains("description")) {
                log.info("添加缺失字段: description");
                jdbcTemplate.execute("ALTER TABLE site_level_configs ADD COLUMN description TEXT AFTER level_name");
            }

            log.info("site_level_configs 表结构修复完成");
        } catch (Exception e) {
            log.error("修复 site_level_configs 表结构失败: {}", e.getMessage());
        }
    }
}
