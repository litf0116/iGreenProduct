package com.igreen.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPasswordMatch {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String hashFromDB = "$2a$10$SsLi6BgTx4A51z2ZJhMkb.BLAz2Y6ga46olJVLPSJWPjYHeMMoIKy";
        String password = "123456";

        System.out.println("测试密码匹配:");
        System.out.println("密码: " + password);
        System.out.println("哈希: " + hashFromDB);
        System.out.println("匹配结果: " + encoder.matches(password, hashFromDB));

        System.out.println("\n重新生成并验证:");
        String newHash = encoder.encode(password);
        System.out.println("新哈希: " + newHash);
        System.out.println("新哈希匹配: " + encoder.matches(password, newHash));
    }
}
