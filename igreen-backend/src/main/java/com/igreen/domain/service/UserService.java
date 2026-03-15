package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.context.CountryContext;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.CountryCode;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }

        // 处理 country 字段：优先使用请求中的 country，否则从当前用户继承
        String country = request.getCountry();
        if (country == null || country.isBlank()) {
            country = CountryContext.get();
            if (country == null || country.isBlank()) {
                throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
            }
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getUsername() + "@igreen.com")
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : UserRole.ENGINEER)
                .groupId(request.getGroupId())
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .country(country)
                .build();

        userMapper.insert(user);
        return toResponse(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        wrapper.last("LIMIT 1");
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.USER_INACTIVE);
        }

        String tokenCountry;

        if (user.getRole() == UserRole.ADMIN) {
            if (request.getCountry() == null || request.getCountry().isBlank()) {
                throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
            }
            // 支持国家代码 (TH/ID/BR/MX) 或国家名称 (Thailand/Indonesia/Brazil/Mexico)
            if (!CountryCode.isValidCountry(request.getCountry())) {
                throw new BusinessException(ErrorCode.INVALID_COUNTRY_CODE);
            }
            // 统一转换为国家代码
            tokenCountry = CountryCode.fromNameOrCode(request.getCountry()).getCode();
        } else {
            if (request.getCountry() == null || request.getCountry().isBlank()) {
                tokenCountry = user.getCountry();
            } else {
                if (!request.getCountry().equalsIgnoreCase(user.getCountry())) {
                    throw new BusinessException(ErrorCode.COUNTRY_NOT_ALLOWED);
                }
                tokenCountry = user.getCountry();
            }
        }

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole().name(), tokenCountry);
        return new TokenResponse(token, null, 0);
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (request.getCountry() == null || request.getCountry().isBlank()) {
            throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }

        if (request.getPassword().length() < 8) {
            throw new BusinessException(ErrorCode.PASSWORD_TOO_WEAK);
        }
        if (!request.getPassword().matches(".*[A-Za-z].*") || !request.getPassword().matches(".*[0-9].*")) {
            throw new BusinessException(ErrorCode.PASSWORD_TOO_WEAK);
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername()).eq(User::getCountry, request.getCountry());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }

        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getName, request.getName()).eq(User::getCountry, request.getCountry());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.NAME_EXISTS);
        }

        UserRole role;
        try {
            role = request.getRole() != null ? UserRole.valueOf(request.getRole().toUpperCase()) : UserRole.ENGINEER;
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_ROLE);
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .username(request.getUsername()).email(request.getUsername() + "@igreen.com")
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .country(request.getCountry())
                .build();

        userMapper.insert(user);
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return new TokenResponse(token, null, 0);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public PageResult<UserResponse> getAllUsers(int page, int size, String keyword) {
        String country = CountryContext.get();
        
        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getCountry, country);
            
            if (keyword != null && !keyword.isBlank()) {
                wrapper.and(w -> w.like(User::getUsername, keyword).or().like(User::getName, keyword));
            }
            wrapper.orderByDesc(User::getCreatedAt);

            List<User> users = userMapper.selectList(wrapper);
            PageInfo<User> pageInfo = new PageInfo<>(users);

            List<UserResponse> userResponses = users.stream().map(this::toResponse).collect(Collectors.toList());

            return PageResult.of(pageInfo, userResponses);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, request.getUsername());
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException(ErrorCode.USERNAME_EXISTS);
            }
            user.setUsername(request.getUsername());
        }
        if (request.getGroupId() != null) {
            user.setGroupId(request.getGroupId());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setHashedPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }

        userMapper.updateById(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteUser(String id) {
        if (userMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        userMapper.deleteById(id);
    }

    /**
     * 用户更新自己的个人信息 (姓名和电话)
     */
    @Transactional
    public UserResponse updateUserProfile(String id, UserProfileUpdateRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        userMapper.updateById(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getEngineers() {
        String country = CountryContext.get();
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getCountry, country).eq(User::getRole, UserRole.ENGINEER);
        return userMapper.selectList(wrapper).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUserCountry(String id, String country) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (user.getRole() == UserRole.ADMIN) {
            if (country != null && !country.isBlank()) {
                try {
                    List<CountryCode> countries = CountryCode.parseCountries(country);
                    String validCountryStr = CountryCode.getAllCodes().stream()
                            .filter(code -> countries.stream().anyMatch(c -> c.getCode().equals(code)))
                            .collect(Collectors.joining(","));
                    country = validCountryStr;
                } catch (IllegalArgumentException e) {
                    throw new BusinessException(ErrorCode.INVALID_COUNTRY_CODE);
                }
            }
        } else {
            if (country == null || country.isBlank()) {
                throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
            }
            if (country.contains(",")) {
                throw new BusinessException(ErrorCode.INVALID_COUNTRY_CODE);
            }
            if (!CountryCode.isValidCountry(country)) {
                throw new BusinessException(ErrorCode.INVALID_COUNTRY_CODE);
            }
            country = CountryCode.fromNameOrCode(country).getCode();
        }

        user.setCountry(country);
        userMapper.updateById(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        String groupName = null;
        if (user.getGroupId() != null) {
            User groupUser = userMapper.selectById(user.getGroupId());
            if (groupUser != null) {
                groupName = groupUser.getName();
            }
        }
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(), user.getRole() != null ? user.getRole().name().toLowerCase() : null,
                user.getGroupId(),
                groupName, user.getStatus() != null ? user.getStatus().name().toLowerCase() : null,
                user.getCountry(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }
}
