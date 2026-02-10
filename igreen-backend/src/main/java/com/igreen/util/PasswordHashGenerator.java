package com.igreen.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String plainPassword = "123456";
        String hashedPassword = encoder.encode(plainPassword);

        System.out.println("明文密码: " + plainPassword);
        System.out.println("BCrypt哈希: " + hashedPassword);
        System.out.println();
        System.out.println("验证测试:");
        System.out.println("验证123456: " + encoder.matches(plainPassword, hashedPassword));
        System.out.println("验证password123: " + encoder.matches("password123", hashedPassword));

        System.out.println("\n生成多个哈希值（都可使用）:");
        for (int i = 0; i < 5; i++) {
            String hash = encoder.encode(plainPassword);
            System.out.println(hash);
        }
    }
}
