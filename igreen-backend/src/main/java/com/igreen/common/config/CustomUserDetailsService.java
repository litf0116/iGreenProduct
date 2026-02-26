package com.igreen.common.config;

import com.igreen.domain.entity.User;
import com.igreen.domain.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userMapper.selectByEmail(usernameOrEmail)
                .orElseGet(() -> userMapper.selectByUsername(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + usernameOrEmail)));

        // 使用原始输入作为 username，保持与登录时的一致
        return new org.springframework.security.core.userdetails.User(
                usernameOrEmail,
                user.getHashedPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
