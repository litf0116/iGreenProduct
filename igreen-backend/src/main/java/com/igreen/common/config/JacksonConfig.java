package com.igreen.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson 日期时间序列化配置
 * 配置所有日期时间类型（LocalDateTime, Date 等）的输出格式为 yyyy-MM-dd HH:mm:ss
 */
@Configuration
public class JacksonConfig {

    /**
     * 配置 ObjectMapper，添加 Java 8 时间模块支持
     * 并设置日期时间格式为 yyyy-MM-dd HH:mm:ss
     * 时区设置为亚洲/上海
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // 注册 Java 8 时间模块（支持 LocalDateTime, LocalDate 等）
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        mapper.registerModule(javaTimeModule);

        // 禁用将日期写入时间戳（使用日期时间字符串代替）
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // 配置全局日期时间格式
        // 注意：这里主要作为后备配置，主要格式配置在 application.yml 中
        // mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

        return mapper;
    }
}
