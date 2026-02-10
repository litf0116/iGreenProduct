package com.igreen.util;

import com.igreen.domain.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DirectPasswordTest {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.scan("com.igreen");
        context.refresh();

        PasswordEncoder encoder = context.getBean(PasswordEncoder.class);
        UserMapper userMapper = context.getBean(UserMapper.class);

        var admin = userMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.igreen.domain.entity.User>()
                .eq(com.igreen.domain.entity.User::getUsername, "admin")
        ).get(0);

        System.out.println("Admin user found: " + admin.getUsername());
        System.out.println("Hash from DB: " + admin.getHashedPassword());
        System.out.println();
        System.out.println("Testing password '123456': " + encoder.matches("123456", admin.getHashedPassword()));
        System.out.println("Testing password 'admin123': " + encoder.matches("admin123", admin.getHashedPassword()));
        System.out.println("Testing password 'password123': " + encoder.matches("password123", admin.getHashedPassword()));
        System.out.println("Testing password 'admin': " + encoder.matches("admin", admin.getHashedPassword()));

        context.close();
    }
}
