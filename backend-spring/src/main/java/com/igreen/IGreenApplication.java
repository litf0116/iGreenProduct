package com.igreen;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.igreen.domain.mapper")
public class IGreenApplication {

    public static void main(String[] args) {
        SpringApplication.run(IGreenApplication.class, args);
    }
}
