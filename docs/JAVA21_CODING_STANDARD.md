# Java 21 编码规范

> 本规范适用于 iGreen Product 后端 Spring Boot 3.2 + Java 21 项目

## 1. 项目配置

### 1.1 Maven 配置 (pom.xml)

```xml
<properties>
    <java.version>21</java.version>
    <spring-boot.version>3.2.0</spring-boot.version>
    <lombok.version>1.18.30</lombok.version>
</properties>
```

### 1.2 必需依赖

```xml
<!-- Spring Boot 3.2+ -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.30</version>
    <scope>provided</scope>
</dependency>
```

---

## 2. 分层架构规范

```
com.igreen
├── IGreenApplication.java          # 启动类
├── common/
│   ├── config/                      # 配置类
│   ├── exception/                   # 异常处理
│   ├── result/                      # 统一响应
│   └── utils/                       # 工具类
├── domain/
│   ├── entity/                      # 实体类 (JPA)
│   ├── enums/                       # 枚举类
│   ├── dto/                         # 数据传输对象
│   │   ├── auth/
│   │   ├── user/
│   │   └── ticket/
│   ├── repository/                  # 数据访问层
│   ├── service/                     # 业务逻辑层
│   └── controller/                  # REST API 层
```

---

## 3. Java 21 特性使用规范

### 3.1 Records - DTO 和响应对象

**强制使用 Records 作为 DTO**

```java
// 正确 - 使用 record
public record UserResponse(
    String id,
    String name,
    String username,
    String email,
    String role,
    String status,
    LocalDateTime createdAt
) {}

// 错误 - 不要使用 class
public class UserResponse {
    private final String id;
    // ... 冗长的代码
}
```

**Records 可扩展方法**

```java
public record TicketResponse(
    String id,
    String title,
    String status
) {
    public boolean isOpen() {
        return "OPEN".equals(status);
    }
}
```

### 3.2 Pattern Matching - 条件判断

**switch 表达式简化**

```java
// 正确 - 使用 enhanced switch
public String getStatusDisplay(TicketStatus status) {
    return switch (status) {
        case OPEN -> "待处理";
        case ASSIGNED, ACCEPTED -> "已分配";
        case IN_PROGRESS -> "进行中";
        case COMPLETED -> "已完成";
        case ON_HOLD -> "暂停";
        case CANCELLED -> "已取消";
    };
}

// 错误 - 不要使用传统 switch
public String getStatusDisplayOld(TicketStatus status) {
    switch (status) {
        case OPEN: return "待处理";
        // ... 冗长的代码
    }
}
```

**instanceof 模式匹配**

```java
// 正确
public void process(Object obj) {
    if (obj instanceof User user && user.isActive()) {
        log.info("Active user: {}", user.getName());
    }
}

// 错误
if (obj instanceof User) {
    User user = (User) obj;
    if (user.isActive()) {
        // ...
    }
}
```

### 3.3 Text Blocks - 多行字符串

**SQL 查询使用 Text Blocks**

```java
// 正确
private static final String USER_QUERY = """
    SELECT u.id, u.name, u.username, u.email,
           r.name as role_name, g.name as group_name
    FROM users u
    LEFT JOIN roles r ON u.role = r.code
    LEFT JOIN groups g ON u.group_id = g.id
    WHERE u.status = 'ACTIVE'
    ORDER BY u.created_at DESC
    """;

// 错误
private static final String USER_QUERY_OLD =
    "SELECT u.id, u.name, u.username, u.email " +
    "FROM users u " +
    "WHERE u.status = 'ACTIVE'";
```

---

## 4. 命名规范

### 4.1 包名规范

| 包名 | 说明 | 示例 |
|------|------|------|
| entity | 实体类 (JPA) | `User.java`, `TicketComment.java` |
| enums | 枚举类 | `TicketStatus.java` |
| dto | 数据传输对象 | `UserResponse.java` |
| repository | 数据访问层 | `UserRepository.java` |
| service | 业务逻辑层 | `UserService.java` |
| controller | REST API 层 | `UserController.java` |

### 4.2 类名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Entity | PascalCase | `User`, `TicketComment` |
| Enum | PascalCase | `TicketStatus`, `UserRole` |
| Record (DTO) | PascalCase + Response/Request | `UserResponse`, `TicketCreateRequest` |
| Repository | PascalCase + Repository | `UserRepository` |
| Service | PascalCase + Service | `UserService` |
| Controller | PascalCase + Controller | `UserController` |

### 4.3 字段名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Entity | camelCase | `userName`, `createdAt` |
| DTO (Record) | camelCase | `userName`, `createdAt` |
| JSON 响应 | snake_case | 通过 `@JsonProperty` 映射 |

```java
// 字段命名规范
public record UserResponse(
    String id,
    String userName,
    String emailAddress,
    LocalDateTime createdAt
) {}
```

### 4.4 常量规范

```java
// 正确 - UPPER_SNAKE_CASE
public static final int MAX_PAGE_SIZE = 100;
public static final long TOKEN_EXPIRATION = 86400000L;

// 错误
public static final int maxPageSize = 100;
```

---

## 5. 实体类 (Entity) 规范

### 5.1 基础模板

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_username", columnList = "username"),
    @Index(name = "idx_user_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(unique = true, length = 100)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 5.2 关联关系规范

```java
// 正确 - 使用 LAZY 加载
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "group_id")
private Group group;

// 正确 - 使用 @Builder.Default
@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
@Builder.Default
private List<Ticket> tickets = new ArrayList<>();
```

---

## 6. 枚举类 (Enum) 规范

### 6.1 标准枚举

```java
// 正确 - 包含 value 和 fromValue 方法
public enum TicketStatus {
    OPEN("open"),
    ASSIGNED("assigned"),
    ACCEPTED("accepted"),
    IN_PROGRESS("inProgress"),
    COMPLETED("completed"),
    ON_HOLD("onHold"),
    CANCELLED("cancelled");

    private final String value;

    TicketStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TicketStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(s -> s.value.equals(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown status: " + value));
    }
}
```

---

## 7. Repository 规范

### 7.1 基础模板

```java
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByRole(UserRole role);

    @Query("""
        SELECT u FROM User u
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
```

### 7.2 分页查询规范

```java
// 正确 - page 从 1 开始，转换为 0-based
public PageResult<UserResponse> getUsers(int page, int size) {
    Pageable pageable = PageRequest.of(page - 1, size);
    Page<User> userPage = repository.findAll(pageable);
    return PageResult.of(
        userPage.getContent().stream()
            .map(this::toResponse)
            .collect(Collectors.toList()),
        userPage.getTotalElements(),
        page,
        size
    );
}
```

---

## 8. Service 规范

### 8.1 基础模板

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Creating user with username: {}", request.username());

        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }

        User user = User.builder()
            .id(UUID.randomUUID().toString())
            .name(request.name())
            .username(request.username())
            .hashedPassword(passwordEncoder.encode(request.password()))
            .build();

        user = userRepository.save(user);
        log.info("User created successfully: {}", user.getId());

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getUsername(),
            user.getRole().name(),
            user.getCreatedAt()
        );
    }
}
```

### 8.2 事务规范

| 方法类型 | 注解 |
|---------|------|
| 只读查询 | `@Transactional(readOnly = true)` |
| 写操作 | `@Transactional` |
| 嵌套调用 | 省略事务注解，继承外层事务 |

---

## 9. Controller 规范

### 9.1 基础模板

```java
@Tag(name = "用户管理", description = "用户相关接口")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取用户列表")
    @GetMapping
    public ResponseEntity<Result<PageResult<UserResponse>>> getUsers(
        @RequestParam @Min(1) @Max(100) int page,
        @RequestParam @Min(1) @Max(100) int size,
        @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(Result.success(userService.getUsers(page, size, keyword)));
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    public ResponseEntity<Result<UserResponse>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(Result.success(userService.getUserById(id)));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Result<UserResponse>> createUser(
        @Valid @RequestBody UserCreateRequest request
    ) {
        return ResponseEntity.ok(Result.success(userService.createUser(request)));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (String) auth.getPrincipal();
    }
}
```

### 9.2 响应格式规范

```java
// 统一响应格式
public ResponseEntity<Result<T>> ok(T data) {
    return ResponseEntity.ok(Result.success(data));
}

public ResponseEntity<Result<Void>> noContent() {
    return ResponseEntity.ok(Result.successResult());
}
```

---

## 10. 统一响应规范

```java
// 响应记录
public record Result<T>(
    boolean success,
    String message,
    T data,
    String code
) {
    public static <T> Result<T> success(T data) {
        return new Result<>(true, "Success", data, "200");
    }

    public static <T> Result<T> successResult() {
        return new Result<>(true, "Success", null, "200");
    }

    public static <T> Result<T> error(String message, String code) {
        return new Result<>(false, message, null, code);
    }
}

// 分页响应
public record PageResult<T>(
    List<T> records,
    long total,
    int size,
    int current,
    boolean hasNext
) {
    public static <T> PageResult<T> of(List<T> records, long total, int current, int size) {
        return new PageResult<>(
            records,
            total,
            size,
            current,
            (current * size) < total
        );
    }
}
```

---

## 11. 异常处理规范

```java
// 业务异常
public class BusinessException extends RuntimeException {
    private final String code;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }

    public BusinessException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}

// 错误码枚举
public enum ErrorCode {
    USER_NOT_FOUND("U001", "用户不存在"),
    USERNAME_EXISTS("U002", "用户名已存在"),
    INVALID_CREDENTIALS("A001", "用户名或密码错误");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
```

---

## 12. API 文档规范

### 12.1 Swagger/OpenAPI 标注

```java
@Tag(name = "工单管理", description = "工单全生命周期接口")
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Operation(
        summary = "获取工单列表",
        description = "支持按状态、优先级、负责人筛选，支持分页"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功"),
        @ApiResponse(responseCode = "401", description = "未授权")
    })
    @GetMapping
    public ResponseEntity<Result<PageResult<TicketResponse>>> getTickets(
        @Parameter(description = "页码，从1开始") @RequestParam int page,
        @Parameter(description = "每页数量") @RequestParam int size,
        @Parameter(description = "工单状态") @RequestParam(required = false) String status
    ) {
        // ...
    }
}
```

---

## 13. 日志规范

```java
@Slf4j
@Service
public class UserService {

    public void createUser(UserCreateRequest request) {
        log.info("Creating user: username={}", request.username());

        try {
            // 业务逻辑
            log.info("User created successfully: id={}", user.getId());
        } catch (Exception e) {
            log.error("Failed to create user: username={}", request.username(), e);
            throw e;
        }
    }
}
```

### 13.1 日志级别使用

| 级别 | 使用场景 |
|------|---------|
| DEBUG | 调试信息，详细执行流程 |
| INFO | 关键操作日志 (登录、创建、删除) |
| WARN | 潜在问题 (业务警告) |
| ERROR | 异常错误 (需要处理) |

---

## 14. 注释规范

### 14.1 Javadoc 标注

```java
/**
 * 用户服务类
 * <p>
 * 提供用户相关的业务逻辑处理，包括用户注册、登录、信息查询等功能。
 * </p>
 *
 * @author litengfei
 * @version 1.0.0
 * @since 2024-01-01
 */
@Service
public class UserService {

    /**
     * 根据ID获取用户信息
     *
     * @param id 用户ID
     * @return 用户信息
     * @throws BusinessException 用户不存在时抛出
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        // ...
    }
}
```

---

## 15. 代码格式检查

### 15.1 EditorConfig

```ini
# .editorconfig
root = true

[*.java]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 120
```

---

## 16. 禁止使用的模式

| 禁止 | 替代方案 |
|------|--------|
| `public class UserResponse` | `public record UserResponse(...)` |
| `switch` 老语法 | `switch` 表达式 + `->` |
| 字符串拼接 SQL | Text Blocks + 参数化查询 |
| `@Autowired` 字段注入 | 构造函数注入 (`@RequiredArgsConstructor`) |
| `new ArrayList<>()` 声明 | `@Builder.Default` |
| 返回 `null` | `Optional<T>` 或空集合 |
| 硬编码魔法数字 | 常量定义 |

---

## 17. 检查清单

新代码提交前检查：

- [ ] DTO 使用 `record` 而非 `class`
- [ ] Service 层使用 `@Transactional`
- [ ] Repository 接口继承 `JpaRepository`
- [ ] Controller 返回 `Result<T>` 包装
- [ ] 枚举包含 `getValue()` 和 `fromValue()` 方法
- [ ] SQL 使用 Text Blocks
- [ ] 条件判断使用 enhanced switch
- [ ] 日志使用 `@Slf4j`
- [ ] 构造函数使用 `@RequiredArgsConstructor`
- [ ] API 文档使用 `@Tag` 和 `@Operation`

---

## 18. 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| 1.0.0 | 2026-01-11 | 初始版本 |
