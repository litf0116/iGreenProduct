# 架构设计文档：Spring Boot 3 + Java 21 后端迁移

## 1. Maven 配置

```xml
<!-- pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.igreen</groupId>
    <artifactId>igreen-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>igreen-backend</name>
    <description>iGreen Product Backend Service</description>
    
    <properties>
        <java.version>21</java.version>
        <lombok.version>1.18.30</lombok.version>
        <mybatis-plus.version>3.5.5</mybatis-plus.version>
        <jjwt.version>0.12.3</jjwt.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <!-- MyBatis Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>${mybatis-plus.version}</version>
        </dependency>
        
        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok (日志 @Slf4j, @Data 等) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- OpenAPI / Swagger -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 2. 项目结构

```
backend-spring/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/igreen/
│   │   │   ├── IGreenApplication.java
│   │   │   ├── common/
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── DatabaseConfig.java
│   │   │   │   │   ├── CorsConfig.java
│   │   │   │   │   └── OpenApiConfig.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── BusinessException.java
│   │   │   │   │   └── ErrorCode.java
│   │   │   │   ├── result/
│   │   │   │   │   ├── Result.java
│   │   │   │   │   └── PageResult.java
│   │   │   │   ├── utils/
│   │   │   │   │   ├── JwtUtils.java
│   │   │   │   │   ├── PasswordUtils.java
│   │   │   │   │   └── UuidUtils.java
│   │   │   │   └── constants/
│   │   │   │       └── Constants.java
│   │   │   ├── domain/
│   │   │   │   ├── entity/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Ticket.java
│   │   │   │   │   ├── TicketComment.java
│   │   │   │   │   ├── Template.java
│   │   │   │   │   ├── TemplateStep.java
│   │   │   │   │   ├── TemplateField.java
│   │   │   │   │   ├── File.java
│   │   │   │   │   ├── Group.java
│   │   │   │   │   ├── Site.java
│   │   │   │   │   └── Config.java
│   │   │   │   ├── enums/
│   │   │   │   │   ├── UserRole.java
│   │   │   │   │   ├── UserStatus.java
│   │   │   │   │   ├── TicketStatus.java
│   │   │   │   │   ├── TicketType.java
│   │   │   │   │   ├── Priority.java
│   │   │   │   │   ├── CommentType.java
│   │   │   │   │   └── FieldType.java
│   │   │   │   └── dto/
│   │   │   │       ├── auth/
│   │   │   │       │   ├── LoginRequest.java
│   │   │   │       │   ├── LoginResponse.java
│   │   │   │       │   ├── RegisterRequest.java
│   │   │   │       │   └── TokenResponse.java
│   │   │   │       ├── user/
│   │   │   │       │   ├── UserResponse.java
│   │   │   │       │   ├── UserCreateRequest.java
│   │   │   │       │   └── UserUpdateRequest.java
│   │   │   │       ├── ticket/
│   │   │   │       │   ├── TicketResponse.java
│   │   │   │       │   ├── TicketCreateRequest.java
│   │   │   │       │   ├── TicketUpdateRequest.java
│   │   │   │       │   ├── TicketCommentResponse.java
│   │   │   │       │   ├── TicketAcceptRequest.java
│   │   │   │       │   ├── TicketDeclineRequest.java
│   │   │   │       │   └── TicketCancelRequest.java
│   │   │   │       ├── template/
│   │   │   │       │   ├── TemplateResponse.java
│   │   │   │       │   ├── TemplateCreateRequest.java
│   │   │   │       │   ├── TemplateStepRequest.java
│   │   │   │       │   └── TemplateFieldRequest.java
│   │   │   │       └── file/
│   │   │   │           ├── FileUploadResponse.java
│   │   │   │           └── FileUploadRequest.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── TicketRepository.java
│   │   │   │   ├── TicketCommentRepository.java
│   │   │   │   ├── TemplateRepository.java
│   │   │   │   ├── TemplateStepRepository.java
│   │   │   │   ├── TemplateFieldRepository.java
│   │   │   │   ├── FileRepository.java
│   │   │   │   ├── GroupRepository.java
│   │   │   │   ├── SiteRepository.java
│   │   │   │   └── ConfigRepository.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── TicketService.java
│   │   │   │   ├── TemplateService.java
│   │   │   │   ├── FileService.java
│   │   │   │   ├── GroupService.java
│   │   │   │   ├── SiteService.java
│   │   │   │   └── ConfigService.java
│   │   │   └── controller/
│   │   │       ├── AuthController.java
│   │   │       ├── UserController.java
│   │   │       ├── TicketController.java
│   │   │       ├── TemplateController.java
│   │   │       ├── FileController.java
│   │   │       ├── GroupController.java
│   │   │       ├── SiteController.java
│   │   │       └── ConfigController.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── application-prod.yml
│   └── test/
│       └── java/com/igreen/
│           ├── service/
│           └── controller/
```

## 2. 关键设计决策

### 2.1 使用 Java 21 Records

```java
// DTO 使用 Records
public record UserResponse(
    String id,
    String name,
    String username,
    String email,
    String role,
    String groupId,
    String groupName,
    String status,
    LocalDateTime createdAt
) {}

public record TicketResponse(
    String id,
    String title,
    String description,
    String type,
    String site,
    String status,
    String priority,
    String templateId,
    String templateName,
    String assignedTo,
    String assignedToName,
    String createdBy,
    String createdByName,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime dueDate,
    List<String> completedSteps,
    Map<String, Object> stepData,
    Boolean accepted,
    LocalDateTime acceptedAt,
    LocalDateTime departureAt,
    String departurePhoto,
    LocalDateTime arrivalAt,
    String arrivalPhoto,
    String completionPhoto,
    String cause,
    String solution,
    List<TicketCommentResponse> comments,
    List<String> relatedTicketIds
) {}
```

### 2.2 使用 Virtual Threads (Project Loom)

```java
@Configuration
@EnableVirtualThreads
public class AsyncConfig {
    // Spring Boot 3.2+ 支持 Virtual Threads
    // 默认情况下，Spring Web MVC 使用虚拟线程处理请求
}

// 文件上传服务
@Service
public class FileService {
    public CompletableFuture<FileUploadResponse> uploadAsync(MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            // 虚拟线程执行文件处理
            return processFile(file);
        });
    }
}
```

### 2.3 安全性设计

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 2.4 JWT 认证

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                Claims claims = jwtUtils.extractAllClaims(jwt);
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                    if (jwtUtils.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                            );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                // 处理无效 token
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### 2.5 统一响应格式

```java
public record Result<T>(
    boolean success,
    String message,
    T data,
    String code
) {
    public static <T> Result<T> success(T data) {
        return new Result<>(true, "Success", data, "200");
    }

    public static <T> Result<T> success() {
        return new Result<>(true, "Success", null, "200");
    }

    public static <T> Result<T> error(String message, String code) {
        return new Result<>(false, message, null, code);
    }
}

public record PageResult<T>(
    List<T> records,
    long total,
    int size,
    int current,
    boolean hasNext
) {}
```

### 2.6 日志配置 (SLF4J + Lombok)

```java
// 使用 Lombok @Slf4j 注解简化日志代码
@Slf4j
@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;

    public TicketService(TicketRepository ticketRepository, TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.ticketMapper = ticketMapper;
    }

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request) {
        log.info("Creating ticket with title: {}", request.getTitle());
        
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID().toString());
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setType(request.getType());
        ticket.setSite(request.getSite());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPriority(request.getPriority());
        ticket.setTemplateId(request.getTemplateId());
        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setCreatedBy(request.getCreatedBy());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        try {
            Ticket savedTicket = ticketRepository.save(ticket);
            log.info("Ticket created successfully with id: {}", savedTicket.getId());
            return ticketMapper.toResponse(savedTicket);
        } catch (Exception e) {
            log.error("Failed to create ticket: {}", request.getTitle(), e);
            throw new BusinessException("Failed to create ticket", "TICKET_CREATE_FAILED");
        }
    }

    public List<TicketResponse> getTickets(TicketStatus status, String assignedTo, 
                                           String createdBy, Priority priority,
                                           String type, Integer offset, Integer limit) {
        log.debug("Fetching tickets with filters - status: {}, assignedTo: {}, createdBy: {}", 
                  status, assignedTo, createdBy);
        
        List<Ticket> tickets = ticketRepository.findTickets(
            status, assignedTo, createdBy, priority, type, offset, limit);
        
        log.debug("Found {} tickets", tickets.size());
        return tickets.stream()
            .map(ticketMapper::toResponse)
            .collect(Collectors.toList());
    }
}
```

### 2.7 文件上传设计

```java
@RestController
@RequestMapping("/api/files")
public class FileController {

    @PostMapping("/upload")
    public Result<FileUploadResponse> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "fieldType", required = false) String fieldType,
        @CurrentUser UserPrincipal user
    ) {
        if (file.isEmpty()) {
            throw new BusinessException("File cannot be empty", "FILE_EMPTY");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds maximum", "FILE_TOO_LARGE");
        }

        String fileId = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = fileId + extension;

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 保存文件元数据到数据库
        File fileEntity = new File();
        fileEntity.setId(fileId);
        fileEntity.setName(originalFilename);
        fileEntity.setUrl("/" + UPLOAD_DIR + "/" + uniqueFilename);
        fileEntity.setType(file.getContentType());
        fileEntity.setSize(file.getSize());
        fileEntity.setFieldType(fieldType);
        fileEntity.setCreatedBy(user.getId());
        fileRepository.save(fileEntity);

        return Result.success(new FileUploadResponse(
            fileId,
            fileEntity.getUrl(),
            originalFilename,
            file.getContentType(),
            file.getSize()
        ));
    }
}
```

## 3. 数据库映射

### 3.1 实体类映射 (兼容现有表结构)

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "hashed_password", nullable = false, length = 255)
    private String hashedPassword;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "group_id", length = 36)
    private String groupId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", insertable = false, updatable = false)
    private Group group;
}
```

## 4. API 端点映射

| FastAPI 端点 | Spring Boot 端点 | 方法 |
|--------------|------------------|------|
| POST /api/auth/login | POST /api/auth/login | POST |
| POST /api/auth/register | POST /api/auth/register | POST |
| POST /api/auth/logout | POST /api/auth/logout | POST |
| GET /api/users | GET /api/users | GET |
| GET /api/users/{id} | GET /api/users/{id} | GET |
| POST /api/users | POST /api/users | POST |
| PUT /api/users/{id} | PUT /api/users/{id} | PUT |
| DELETE /api/users/{id} | DELETE /api/users/{id} | DELETE |
| GET /api/tickets | GET /api/tickets | GET |
| GET /api/tickets/{id} | GET /api/tickets/{id} | GET |
| POST /api/tickets | POST /api/tickets | POST |
| PUT /api/tickets/{id} | PUT /api/tickets/{id} | PUT |
| DELETE /api/tickets/{id} | DELETE /api/tickets/{id} | DELETE |
| POST /api/tickets/{id}/accept | POST /api/tickets/{id}/accept | POST |
| POST /api/tickets/{id}/decline | POST /api/tickets/{id}/decline | POST |
| POST /api/tickets/{id}/cancel | POST /api/tickets/{id}/cancel | POST |
| GET /api/templates | GET /api/templates | GET |
| GET /api/templates/{id} | GET /api/templates/{id} | GET |
| POST /api/templates | POST /api/templates | POST |
| PUT /api/templates/{id} | PUT /api/templates/{id} | PUT |
| DELETE /api/templates/{id} | DELETE /api/templates/{id} | DELETE |
| POST /api/files/upload | POST /api/files/upload | POST |
| DELETE /api/files/{id} | DELETE /api/files/{id} | DELETE |
| GET /api/groups | GET /api/groups | GET |
| GET /api/sites | GET /api/sites | GET |
| GET /api/configs | GET /api/configs | GET |

## 5. 配置管理

### 5.1 application.yml

```yaml
spring:
  application:
    name: igreen-backend
  config:
    import: optional:file:./.env

  datasource:
    url: jdbc:mysql://${DATABASE_HOST:localhost}:${DATABASE_PORT:3306}/${DATABASE_NAME:igreen_db}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DATABASE_USER:igreen_user}
    password: ${DATABASE_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000

  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true

server:
  port: ${SERVER_PORT:8000}

app:
  jwt:
    secret-key: ${JWT_SECRET_KEY:your-secret-key-change-in-production-use-strong-random-key}
    expiration-ms: ${JWT_EXPIRATION:86400000}
  upload:
    dir: ${UPLOAD_DIR:uploads}
    max-size: ${MAX_FILE_SIZE:10485760}
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

## 6. 测试策略

- **单元测试**: 使用 JUnit 5 + Mockito 测试 Service 层
- **集成测试**: 使用 @SpringBootTest 测试 Controller 层
- **数据库测试**: 使用 @DataJpaTest 测试 Repository 层
- **测试覆盖率**: 目标 80%+
- **日志测试**: 验证 SLF4J 日志输出格式
