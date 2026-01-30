package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
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
        wrapper.eq(User::getUsername, request.username());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }

        wrapper = new LambdaQueryWrapper<>();
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.EMAIL_EXISTS);
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.name())
                .username(request.username())
                .hashedPassword(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : UserRole.ENGINEER)
                .groupId(request.groupId())
                .status(request.status() != null ? request.status() : UserStatus.ACTIVE)
                .country(request.country())
                .build();

        userMapper.insert(user);
        return toResponse(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.username());
        List<User> users = userMapper.selectList(wrapper);

        if (users.isEmpty()) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        User matchedUser = null;
        for (User user : users) {
            if (passwordEncoder.matches(request.password(), user.getHashedPassword())) {
                matchedUser = user;
                break;
            }
        }

        if (matchedUser == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (matchedUser.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.USER_INACTIVE);
        }

        // ADMIN 跳过国家校验，ENGINEER/MANAGER 使用账号自己的 country 属性
        if (matchedUser.getRole() != UserRole.ADMIN) {
            if (matchedUser.getCountry() == null || matchedUser.getCountry().isBlank()) {
                throw new BusinessException(ErrorCode.COUNTRY_NOT_ALLOWED);
            }
        }

        String token = jwtUtils.generateToken(matchedUser.getId(), matchedUser.getUsername(), matchedUser.getRole().name());
        return new TokenResponse(token, null, 0);
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (request.country() == null || request.country().isBlank()) {
            throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        }

        if (!request.password().equals(request.confirmPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }

        if (request.password().length() < 8) {
            throw new BusinessException(ErrorCode.PASSWORD_TOO_WEAK);
        }
        if (!request.password().matches(".*[A-Za-z].*") || !request.password().matches(".*[0-9].*")) {
            throw new BusinessException(ErrorCode.PASSWORD_TOO_WEAK);
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.username()).eq(User::getCountry, request.country());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }

        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getName, request.name()).eq(User::getCountry, request.country());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.NAME_EXISTS);
        }

        UserRole role;
        try {
            role = request.role() != null ? UserRole.valueOf(request.role().toUpperCase()) : UserRole.ENGINEER;
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_ROLE);
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.name())
                .username(request.username()).email(request.username() + "@igreen.com")
                .hashedPassword(passwordEncoder.encode(request.password()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .country(request.country())
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
        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
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

        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.username() != null && !request.username().equals(user.getUsername())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, request.username());
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException(ErrorCode.USERNAME_EXISTS);
            }
            user.setUsername(request.username());
        }
        if (request.groupId() != null) {
            user.setGroupId(request.groupId());
        }
        if (request.status() != null) {
            user.setStatus(request.status());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setHashedPassword(passwordEncoder.encode(request.password()));
        }
        if (request.country() != null) {
            user.setCountry(request.country());
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

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }

        userMapper.updateById(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getEngineers() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getRole, UserRole.ENGINEER);
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
