# 变更提案：后端服务迁移到 Spring Boot 3 + Java 21

## 提案 ID
`20251227_backend_springboot_migration`

## 概述

将当前基于 FastAPI (Python) 的后端服务迁移到 Spring Boot 3 + Java 21 技术栈，保持现有 API 契约和业务逻辑不变。

## 为什么

当前后端服务使用 FastAPI + Python 实现，随着项目规模扩大，需要迁移到更成熟、企业级的 Java 技术栈以获得：
- 更好的类型安全和编译时检查
- 更强的生态系统和工具支持
- 更好的性能表现
- 更适合团队协作和长期维护

## 背景

### 当前实现分析

### 技术栈
- **框架**: FastAPI 0.104.1
- **语言**: Python 3.10+
- **ORM**: SQLAlchemy 2.0.23
- **数据验证**: Pydantic 2.9.0
- **数据库**: SQLite (开发) / MySQL (生产)
- **认证**: JWT (python-jose) + bcrypt

### API 模块
| 模块 | 端点前缀 | 主要功能 |
|------|---------|----------|
| Auth | `/api/auth` | 登录、注册、登出 |
| Users | `/api/users` | 用户 CRUD、权限管理 |
| Tickets | `/api/tickets` | 工单管理、工作流控制 |
| Templates | `/api/templates` | 模板管理 |
| Files | `/api/files` | 文件上传、人脸识别 |
| Groups | `/api/groups` | 分组管理 |
| Sites | `/api/sites` | 站点管理 |
| Configs | `/api/configs` | 配置管理 |

### 数据模型
- **User**: 用户信息、角色、状态
- **Ticket**: 工单、工作流状态、评论
- **Template**: 模板、步骤、字段定义
- **File**: 文件元数据
- **Group**: 用户分组
- **Site**: 站点信息
- **Config**: 系统配置

## 目标

1. 完整迁移所有 API 端点，保持向后兼容
2. 使用 Java 21 新特性（Records, Pattern Matching, Virtual Threads）
3. 采用 Spring Boot 3 最佳实践
4. 使用 Spring Security 6 + JWT 实现认证
5. 使用 Spring Data JPA + MyBatis Plus
6. 保持数据库结构兼容
7. 实现相同的业务逻辑

## 范围

### 包含
- 所有 REST API 端点迁移
- 认证授权系统
- 文件上传功能
- 数据库模型和迁移
- 配置管理
- 健康检查端点

### 不包含
- 前端应用（iGreenApp, iGreenticketing）
- 数据库结构重构（保持现有表结构）

## 架构设计

### 分层架构
```
┌─────────────────────────────────────────────────────┐
│                    Presentation Layer                ┌─────────────────────────────────────────────┐   │
│  │
│  │              REST Controllers                │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                    Application Layer                │
│  ┌─────────────────────────────────────────────┐   │
│  │               Service Layer                  │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                    Domain Layer                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           Entities & Repositories            │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                   Infrastructure Layer              │
│  ┌─────────────────────────────────────────────┐   │
│  │        Config, Security, Database            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 技术选型
| 组件 | 技术选择 | 说明 |
|------|---------|------|
| 框架 | Spring Boot 3.2.x | 最新稳定版，支持 Java 21 |
| 语言 | Java 21 | 使用 Records, Pattern Matching |
| 构建 | Maven 3.9+ | 项目构建管理 |
| ORM | Spring Data JPA + MyBatis Plus | 灵活的数据访问 |
| 安全 | Spring Security 6 + JWT | 认证授权 |
| 验证 | Hibernate Validator | Bean Validation |
| 数据库 | MySQL 8.0+ | 兼容现有数据结构 |
| 文档 | SpringDoc OpenAPI 3 | Swagger 文档 |
| 线程 | Virtual Threads | Java 21 特性提升并发 |

## 风险和注意事项

1. **API 兼容性**: 需要确保新 API 与现有前端兼容
2. **数据库兼容性**: 保持现有表结构，避免数据迁移风险
3. **认证兼容**: JWT 格式可能需要调整
4. **文件存储**: 保持现有文件存储方式

## 成功标准

1. 所有现有 API 端点正常工作
2. 认证流程兼容现有前端
3. 文件上传功能正常
4. 性能不低于现有实现
5. 单元测试覆盖率不低于 80%

## 详细技术规格

### Java 21 特性应用

#### 1.1 Records (JEP 440)
```java
// DTO 使用 Records 简化代码
public record UserResponse(
    String id, String name, String username, String email,
    String role, String groupId, String groupName,
    String status, LocalDateTime createdAt
) {}

// 实体类使用 record 作为 ID
public record UserId(String value) {}
```

#### 1.2 Pattern Matching (JEP 441)
```java
// switch 表达式增强
public String getStatusDisplay(TicketStatus status) {
    return switch (status) {
        case OPEN -> "待处理";
        case IN_PROGRESS -> "进行中";
        case COMPLETED -> "已完成";
        case ON_HOLD -> "暂停";
        case CANCELLED -> "已取消";
    };
}

// instanceof 模式匹配
if (obj instanceof User user && user.isActive()) {
    return user.getName();
}
```

#### 1.3 Virtual Threads (JEP 444)
```java
// 启用虚拟线程
@SpringBootApplication
public class IGreenApplication {
    public static void main(String[] args) {
        System.setProperty("jdk.virtualThreadScheduler.parallelism", "1");
        SpringApplication.run(IGreenApplication.class, args);
    }
}

// 使用虚拟线程处理并发请求
@Service
public class TicketService {
    public CompletableFuture<List<Ticket>> processTicketsAsync(List<String> ticketIds) {
        return CompletableFuture.supplyAsync(() -> 
            ticketIds.parallelStream()
                .map(this::processTicket)
                .collect(Collectors.toList())
        ); // 自动使用虚拟线程
    }
}
```

#### 1.4 Text Blocks (JEP 378)
```java
// SQL 查询使用 Text Blocks
private static final String TICKET_QUERY = """
    SELECT t.*, u.name as assigned_to_name, 
           c.name as created_by_name
    FROM tickets t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN users c ON t.created_by = c.id
    WHERE t.status = :status
    ORDER BY t.created_at DESC
    """;
```

### Spring Boot 3 特性应用

#### 2.1 Spring Security 6 配置
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/manager/**").hasAnyRole("ADMIN", "MANAGER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Unauthorized\",\"code\":\"401\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Forbidden\",\"code\":\"403\"}");
                })
            );

        return http.build();
    }
}
```

#### 2.2 Spring Data JPA 增强
```java
// 使用 Projection 接口
public interface UserProjection {
    String getId();
    String getName();
    String getUsername();
    @Value("#{target.role.value}")
    String getRole();
}

// 使用 Specification 进行动态查询
public interface TicketSpecification {
    static Specification<Ticket> withStatus(TicketStatus status) {
        return (root, query, cb) -> 
            status != null ? cb.equal(root.get("status"), status) : null;
    }
    
    static Specification<Ticket> withPriority(Priority priority) {
        return (root, query, cb) -> 
            priority != null ? cb.equal(root.get("priority"), priority) : null;
    }
    
    static Specification<Ticket> assignedTo(String userId) {
        return (root, query, cb) -> 
            userId != null ? cb.equal(root.get("assignedTo"), userId) : null;
    }
}
```

#### 2.3 声明式 HTTP 客户端
```java
@HttpInterface(baseUrl = "http://localhost:8000")
public interface ExternalServiceClient {
    @GetExchange("/api/health")
    HealthResponse healthCheck();
    
    @PostExchange("/api/notify")
    void sendNotification(@RequestBody NotificationRequest request);
}

// 使用 WebClient 进行响应式调用
@Service
public class NotificationService {
    private final WebClient webClient;
    
    public NotificationService(@Value("${notification.service.url}") String baseUrl) {
        this.webClient = WebClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}
```

### 数据库迁移策略

#### 3.1 数据类型映射
| Python/SQLAlchemy 类型 | Java/JPA 类型 | 备注 |
|----------------------|---------------|------|
| String(36) | String | UUID 字段 |
| String(255) | String | 普通字符串 |
| Integer | Integer | 数字类型 |
| DateTime | LocalDateTime | 时间戳 |
| Enum | @Enumerated(EnumType.STRING) | 枚举存储为字符串 |
| JSON | String 或 @JdbcType | JSON 数据 |
| Boolean | Boolean | 布尔值 |
| Text | String 或 @Lob | 长文本 |

#### 3.2 枚举迁移
```java
// Python 枚举定义
class TicketStatus(str, enum.Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    IN_PROGRESS = "inProgress"
    CLOSED = "closed"
    ON_HOLD = "onHold"
    CANCELLED = "cancelled"

-- Java 枚举定义
public enum TicketStatus {
    OPEN("open"),
    ACCEPTED("accepted"),
    IN_PROGRESS("inProgress"),
    CLOSED("closed"),
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

#### 3.3 数据迁移脚本
```sql
-- 数据验证脚本
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'templates', COUNT(*) FROM templates;

-- 数据一致性检查
SELECT COUNT(*) as orphaned_tickets 
FROM tickets t 
LEFT JOIN users u ON t.assigned_to = u.id 
WHERE u.id IS NULL AND t.assigned_to IS NOT NULL;

-- 枚举值验证
SELECT DISTINCT status, COUNT(*) as count 
FROM tickets 
GROUP BY status;
```

### 测试策略

#### 4.1 测试工具栈
| 测试类型 | 工具/框架 | 覆盖率目标 |
|---------|----------|-----------|
| 单元测试 | JUnit 5 + Mockito + AssertJ | 80%+ |
| 集成测试 | Testcontainers + Spring Boot Test | 70%+ |
| API 测试 | REST Assured 或 MockMvc | 90%+ |
| 性能测试 | JMeter 或 k6 | 基准对比 |
| 安全测试 | OWASP ZAP 或 Snyk | 全覆盖 |

#### 4.2 测试配置
```yaml
# test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:tc:mysql:8.0:///test_db
    driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
  sql:
    init:
      mode: never

jwt:
  secret: test-secret-key-for-testing-only-min-32-chars
  expiration: 3600000
```

#### 4.3 测试用例示例
```java
@WebMvcTest(TicketController.class)
class TicketControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private TicketService ticketService;
    
    @Test
    @WithMockUser(username = "engineer1", roles = {"ENGINEER"})
    void getTickets_WithValidFilters_ReturnsTicketList() throws Exception {
        // Given
        List<TicketResponse> tickets = List.of(
            new TicketResponse(/* ... */)
        );
        when(ticketService.getTickets(any(), any(), any(), any(), any(), any()))
            .thenReturn(tickets);
        
        // When & Then
        mockMvc.perform(get("/api/tickets")
                .param("status", "open")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data[0].status").value("open"));
    }
    
    @Test
    void getTicket_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/tickets/123")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }
}
```

### 性能基准

#### 5.1 基准测试指标
| 指标 | 当前 (FastAPI) | 目标 (Spring Boot) |
|------|---------------|-------------------|
| 平均响应时间 | < 200ms | < 150ms |
| P95 响应时间 | < 500ms | < 400ms |
| P99 响应时间 | < 1000ms | < 800ms |
| QPS (单用户) | 1000 | 1500 |
| 并发连接数 | 100 | 500 |
| CPU 利用率 | < 60% | < 50% |
| 内存使用 | < 512MB | < 256MB |

#### 5.2 负载测试配置
```yaml
# k6 负载测试脚本
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // 预热
    { duration: '5m', target: 500 },   // 负载测试
    { duration: '2m', target: 1000 },  // 压力测试
    { duration: '5m', target: 0 },     // 降级
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function() {
  const response = http.get('http://localhost:8000/api/tickets');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => r.json('data') !== undefined,
  });
  sleep(1);
}
```

### 部署策略

#### 6.1 Docker 配置
```dockerfile
# Dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 创建非 root 用户运行
RUN addgroup -g 1000 app && \
    adduser -u 1000 -G app -s /bin/sh -D app

# 复制应用
COPY target/igreen-backend.jar app.jar

# 切换用户
USER app

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 6.2 docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_HOST=mysql
      - DATABASE_PORT=3306
    depends_on:
      mysql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: igreen_db
      MYSQL_USER: igreen_user
      MYSQL_PASSWORD: igreen_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 6.3 部署脚本
```bash
#!/bin/bash
# deploy.sh - 部署脚本

set -e

APP_NAME="igreen-backend"
APP_VERSION=$(git rev-parse --short HEAD)
DOCKER_REGISTRY="registry.example.com"

echo "Building application..."
mvn clean package -DskipTests -f pom.xml

echo "Building Docker image..."
docker build -t ${APP_NAME}:${APP_VERSION} .
docker tag ${APP_NAME}:${APP_VERSION} ${APP_NAME}:latest

echo "Stopping old containers..."
docker-compose down || true

echo "Starting services..."
docker-compose up -d

echo "Waiting for application to be healthy..."
sleep 10

HEALTH_STATUS=$(curl -s http://localhost:8000/api/health | jq -r '.status')
if [ "$HEALTH_STATUS" == "healthy" ]; then
    echo "Deployment successful!"
else
    echo "Deployment failed! Application health check failed."
    docker-compose logs
    exit 1
fi
```

#### 6.4 回滚脚本
```bash
#!/bin/bash
# rollback.sh - 回滚脚本

set -e

APP_NAME="igreen-backend"
BACKUP_DIR="/opt/backups"

# 查找最新备份
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/${APP_NAME}-*.jar 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup found in ${BACKUP_DIR}"
    exit 1
fi

echo "Stopping application..."
docker-compose stop backend

echo "Restoring backup: ${LATEST_BACKUP}"
cp ${LATEST_BACKUP} ./target/${APP_NAME}.jar

echo "Starting application..."
docker-compose up -d backend

sleep 10

HEALTH_STATUS=$(curl -s http://localhost:8000/api/health | jq -r '.status')
if [ "$HEALTH_STATUS" == "healthy" ]; then
    echo "Rollback successful!"
else
    echo "Rollback failed! Manual intervention required."
    exit 1
fi
```

### 监控和日志

#### 8.1 SLF4J 日志门面
```java
// 日志使用 SLF4J 门面
@Slf4j
@Service
public class TicketService {
    
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    
    public TicketResponse createTicket(TicketCreateRequest request) {
        log.info("Creating ticket: {}", request.getTitle());
        try {
            // 业务逻辑
            Ticket ticket = ticketRepository.save(entity);
            log.info("Ticket created successfully: {}", ticket.getId());
            return mapper.toResponse(ticket);
        } catch (Exception e) {
            log.error("Failed to create ticket: {}", request.getTitle(), e);
            throw new BusinessException("Failed to create ticket");
        }
    }
}
```

#### 8.2 日志配置
```yaml
# logback-spring.xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="${LOG_PATH:-/var/log/igreen}"/>
    <property name="APP_NAME" value="igreen-backend"/>
    <property name="MAX_FILE_SIZE" value="100MB"/>
    <property name="MAX_HISTORY" value="30"/>
    
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxHistory>${MAX_HISTORY}</maxHistory>
            <timeBasedFileNamingAndTriggeringPolicy 
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>${MAX_FILE_SIZE}</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 异步文件输出 -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="FILE"/>
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
        <includeCallerData>false</includeCallerData>
    </appender>
    
    <!-- SQL 日志 (调试用) -->
    <appender name="SQL_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-sql.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-sql.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 日志级别配置 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE"/>
    </root>
    
    <logger name="com.igreen" level="DEBUG"/>
    <logger name="org.springframework.security" level="INFO"/>
    <logger name="org.hibernate.SQL" level="DEBUG" additivity="false">
        <appender-ref ref="SQL_FILE"/>
    </logger>
    <logger name="org.hibernate.type.descriptor.sql" level="TRACE"/>
    <logger name="org.springframework.web" level="INFO"/>
    <logger name="org.hibernate.engine.jdbc.batch" level="DEBUG"/>
</configuration>
```

#### 8.3 应用日志级别配置
```yaml
# application.yml
logging:
  level:
    root: INFO
    com.igreen: DEBUG
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql: WARN
    org.springframework.web: INFO
  file:
    name: /var/log/igreen/igreen-backend.log
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

### 回滚策略

#### 9.1 回滚场景
| 场景 | 触发条件 | 回滚操作 |
|------|---------|---------|
| API 响应异常 | 5xx 错误率 > 1% | 自动回滚到上一版本 |
| 性能下降 | P95 延迟增加 > 50% | 手动回滚 |
| 功能异常 | 用户反馈或监控告警 | 手动回滚 |
| 安全漏洞 | 扫描发现高危漏洞 | 立即回滚 |

#### 9.2 回滚脚本
```bash
#!/bin/bash
# rollback.sh

BACKUP_DIR="/opt/backups"
CURRENT_VERSION=$(kubectl get deployment igreen-backend -o jsonpath='{.spec.template.spec.containers[0].image}' | cut -d':' -f2)

# 查找上一版本
PREVIOUS_VERSION=$(ls -t ${BACKUP_DIR} | head -2 | tail -1)

echo "Current version: ${CURRENT_VERSION}"
echo "Rolling back to: ${PREVIOUS_VERSION}"

# 执行回滚
kubectl set image deployment/igreen-backend backend=${PREVIOUS_VERSION}

# 验证回滚
kubectl rollout status deployment/igreen-backend

# 健康检查
sleep 10
HEALTH_STATUS=$(curl -s http://localhost:8000/api/health | jq -r '.status')

if [ "$HEALTH_STATUS" == "healthy" ]; then
    echo "Rollback successful!"
else
    echo "Rollback failed! Manual intervention required."
    exit 1
fi
```

### API 兼容性保证

#### 10.1 响应格式对比
```json
// FastAPI 原始响应
{
  "id": "uuid",
  "title": "维修工单",
  "status": "open",
  "created_at": "2024-01-15T10:30:00"
}

// Spring Boot 新响应 (兼容格式)
{
  "id": "uuid",
  "title": "维修工单",
  "status": "open",
  "createdAt": "2024-01-15T10:30:00",
  "created_at": "2024-01-15T10:30:00"  // 保持兼容性
}
```

#### 10.2 兼容性测试套件
```java
@Test
void responseFormat_CompatibilityWithOldAPI() {
    // 验证日期格式兼容性
    assertThat(ticket.getCreatedAt())
        .isEqualTo(LocalDateTime.parse("2024-01-15T10:30:00"));
    
    // 验证枚举值兼容性
    assertThat(ticket.getStatus().getValue())
        .isEqualTo("open");
    
    // 验证字段命名兼容性 (camelCase vs snake_case)
    assertThat(responseJson).hasJsonPath("created_at");
    assertThat(responseJson).hasJsonPath("createdAt");
}
```

### 实施时间表

| 阶段 | 时间 | 任务 | 交付物 |
|------|------|------|--------|
| Phase 1 | Week 1-2 | 项目初始化、基础设施搭建 | 项目骨架、CI/CD |
| Phase 2 | Week 3-4 | 领域模型、Repository 层 | 实体类、数据库映射 |
| Phase 3 | Week 5-6 | Service 层实现 | 业务逻辑、单元测试 |
| Phase 4 | Week 7-8 | Controller 层实现 | REST API、集成测试 |
| Phase 5 | Week 9 | 性能测试、优化 | 性能报告、优化方案 |
| Phase 6 | Week 10 | 预发布测试、修复 | 测试报告、Bug 修复 |
| Phase 7 | Week 11 | 灰度发布、监控 | 灰度方案、监控配置 |
| Phase 8 | Week 12 | 全量发布、回滚验证 | 发布报告、回滚验证 |

### 附录：完整 API 清单

| 模块 | 端点 | 方法 | 认证 | 状态 |
|------|------|------|------|------|
| Auth | /api/auth/login | POST | 否 | 待迁移 |
| Auth | /api/auth/register | POST | 否 | 待迁移 |
| Auth | /api/auth/logout | POST | 是 | 待迁移 |
| Users | /api/users | GET | 是 | 待迁移 |
| Users | /api/users/{id} | GET | 是 | 待迁移 |
| Users | /api/users | POST | 是 | 待迁移 |
| Users | /api/users/{id} | PUT | 是 | 待迁移 |
| Users | /api/users/{id} | DELETE | 是 | 待迁移 |
| Tickets | /api/tickets | GET | 是 | 待迁移 |
| Tickets | /api/tickets/{id} | GET | 是 | 待迁移 |
| Tickets | /api/tickets | POST | 是 | 待迁移 |
| Tickets | /api/tickets/{id} | PUT | 是 | 待迁移 |
| Tickets | /api/tickets/{id} | DELETE | 是 | 待迁移 |
| Tickets | /api/tickets/{id}/accept | POST | 是 | 待迁移 |
| Tickets | /api/tickets/{id}/decline | POST | 是 | 待迁移 |
| Tickets | /api/tickets/{id}/cancel | POST | 是 | 待迁移 |
| Templates | /api/templates | GET | 是 | 待迁移 |
| Templates | /api/templates/{id} | GET | 是 | 待迁移 |
| Templates | /api/templates | POST | 是 | 待迁移 |
| Templates | /api/templates/{id} | PUT | 是 | 待迁移 |
| Templates | /api/templates/{id} | DELETE | 是 | 待迁移 |
| Files | /api/files/upload | POST | 是 | 待迁移 |
| Files | /api/files/{id} | DELETE | 是 | 待迁移 |
| Files | /api/files/face-recognition/verify | POST | 是 | 待迁移 |
| Groups | /api/groups | GET | 是 | 待迁移 |
| Sites | /api/sites | GET | 是 | 待迁移 |
| Configs | /api/configs | GET | 是 | 待迁移 |
| Health | /api/health | GET | 否 | 待迁移 |
