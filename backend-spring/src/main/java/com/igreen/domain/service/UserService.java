package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import com.igreen.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_EXISTS);
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.name())
                .username(request.username())
                .email(request.email())
                .hashedPassword(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : UserRole.ENGINEER)
                .groupId(request.groupId())
                .status(UserStatus.ACTIVE)
                .country(request.country())
                .build();

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        List<User> users = userRepository.findAllByUsername(request.username());
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

        if (matchedUser.getRole() != UserRole.ADMIN) {
            if (request.country() == null || !request.country().equalsIgnoreCase(matchedUser.getCountry())) {
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

        if (userRepository.existsByUsernameAndCountry(request.username(), request.country())) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }

        if (userRepository.existsByNameAndCountry(request.name(), request.country())) {
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
                .username(request.username())
                .hashedPassword(passwordEncoder.encode(request.password()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .country(request.country())
                .build();

        user = userRepository.save(user);
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return new TokenResponse(token, null, 0);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public PageResult<UserResponse> getAllUsers(int page, int size, String keyword) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<User> userPage = userRepository.searchByKeyword(keyword, pageRequest);
        List<UserResponse> users = userPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PageResult.of(users, userPage.getTotalElements(), page, size);
    }

    @Transactional
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.username())) {
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

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getEngineers() {
        return userRepository.findByRole(UserRole.ENGINEER).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUserCountry(String id, String country) {
        User user = userRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() == UserRole.ADMIN) {
            if (country != null && !country.isBlank()) {
                String[] countries = country.split(",");
                for (String c : countries) {
                    if (c.trim().isEmpty()) {
                        throw new BusinessException(ErrorCode.INVALID_COUNTRY_CODE);
                    }
                }
            }
        } else {
            if (country == null || country.isBlank()) {
                throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
            }
            if (country.contains(",")) {
                throw new BusinessException(ErrorCode.INVALID_COUNTRY_CODE);
            }
        }

        user.setCountry(country);
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        String groupName = null;
        if (user.getGroupId() != null) {
            groupName = userRepository.findById(user.getGroupId())
                    .map(User::getName)
                    .orElse(null);
        }
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getGroupId(),
                groupName,
                user.getStatus().name(),
                user.getCountry(),
                user.getCreatedAt()
        );
    }
}
