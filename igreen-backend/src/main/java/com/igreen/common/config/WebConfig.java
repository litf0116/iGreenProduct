package com.igreen.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源访问 - 上传文件目录
        // 支持绝对路径和相对路径（相对于工作目录）
        String path = uploadDir;
        if (!path.startsWith("/")) {
            path = System.getProperty("user.dir") + "/" + path;
        }
        if (!path.endsWith("/")) {
            path = path + "/";
        }
        // 同时支持 /uploads/** 和 /api/uploads/** 两种访问方式（向后兼容）
        registry.addResourceHandler("/uploads/**", "/api/uploads/**")
                .addResourceLocations("file:" + path)
                .setCachePeriod(3600);
    }
}
