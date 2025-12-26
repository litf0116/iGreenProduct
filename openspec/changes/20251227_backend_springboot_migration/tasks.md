# 工作任务清单：后端服务迁移到 Spring Boot 3 + Java 21

## 阶段 1: 项目初始化和基础设施

### 1.1 创建 Spring Boot 项目结构
- **T1.1.1**: 创建 Maven pom.xml，配置 Spring Boot 3.2.x、Java 21、Spring Security、JPA 等依赖
- **T1.1.2**: 创建主应用类 `IGreenApplication.java`
- **T1.1.3**: 创建 application.yml 配置文件
- **T1.1.4**: 创建 application-dev.yml 开发环境配置
- **T1.1.5**: 创建 application-prod.yml 生产环境配置

### 1.2 配置数据库连接
- **T1.2.1**: 配置数据源 (MySQL/HikariCP)
- **T1.2.2**: 配置 JPA/Hibernate
- **T1.2.3**: 创建数据库初始化脚本 (兼容现有表结构)
- **T1.2.4**: 验证数据库连接

### 1.3 配置安全框架
- **T1.3.1**: 配置 SecurityConfig (Spring Security 6)
- **T1.3.2**: 实现 JWT 工具类 JwtUtils
- **T1.3.3**: 实现 JwtAuthenticationFilter
- **T1.3.4**: 配置 CORS
- **T1.3.5**: 配置密码加密 (BCrypt)

### 1.4 配置基础设施
- **T1.4.1**: 创建全局异常处理器 GlobalExceptionHandler
- **T1.4.2**: 创建统一响应 Result 类
- **T1.4.3**: 创建分页响应 PageResult 类
- **T1.4.4**: 配置 OpenAPI/Swagger 文档
- **T1.4.5**: 配置文件上传目录
- **T1.4.6**: 引入 Lombok 依赖 (pom.xml)

## 阶段 2: 领域模型层

### 2.1 枚举类实现
- **T2.1.1**: 创建 UserRole 枚举
- **T2.1.2**: 创建 UserStatus 枚举
- **T2.1.3**: 创建 TicketStatus 枚举
- **T2.1.4**: 创建 TicketType 枚举
- **T2.1.5**: 创建 Priority 枚举
- **T2.1.6**: 创建 CommentType 枚举
- **T2.1.7**: 创建 FieldType 枚举

### 2.2 实体类实现
- **T2.2.1**: 创建 User 实体 (兼容 users 表)
- **T2.2.2**: 创建 Group 实体 (兼容 groups 表)
- **T2.2.3**: 创建 Ticket 实体 (兼容 tickets 表)
- **T2.2.4**: 创建 TicketComment 实体 (兼容 ticket_comments 表)
- **T2.2.5**: 创建 Template 实体 (兼容 templates 表)
- **T2.2.6**: 创建 TemplateStep 实体 (兼容 template_steps 表)
- **T2.2.7**: 创建 TemplateField 实体 (兼容 template_fields 表)
- **T2.2.8**: 创建 File 实体 (兼容 files 表)
- **T2.2.9**: 创建 Site 实体 (兼容 sites 表)
- **T2.2.10**: 创建 Config 实体 (兼容 configs 表)

### 2.3 Repository 层实现
- **T2.3.1**: 创建 UserRepository
- **T2.3.2**: 创建 GroupRepository
- **T2.3.3**: 创建 TicketRepository
- **T2.3.4**: 创建 TicketCommentRepository
- **T2.3.5**: 创建 TemplateRepository
- **T2.3.6**: 创建 TemplateStepRepository
- **T2.3.7**: 创建 TemplateFieldRepository
- **T2.3.8**: 创建 FileRepository
- **T2.3.9**: 创建 SiteRepository
- **T2.3.10**: 创建 ConfigRepository

## 阶段 3: DTO 和请求/响应对象

### 3.1 认证模块 DTO
- **T3.1.1**: 创建 LoginRequest DTO
- **T3.1.2**: 创建 LoginResponse DTO
- **T3.1.3**: 创建 RegisterRequest DTO
- **T3.1.4**: 创建 TokenResponse DTO

### 3.2 用户模块 DTO
- **T3.2.1**: 创建 UserResponse DTO (使用 Record)
- **T3.2.2**: 创建 UserCreateRequest DTO
- **T3.2.3**: 创建 UserUpdateRequest DTO

### 3.3 工单模块 DTO
- **T3.3.1**: 创建 TicketResponse DTO (使用 Record)
- **T3.3.2**: 创建 TicketCreateRequest DTO
- **T3.3.3**: 创建 TicketUpdateRequest DTO
- **T3.3.4**: 创建 TicketCommentResponse DTO
- **T3.3.5**: 创建 TicketAcceptRequest DTO
- **T3.3.6**: 创建 TicketDeclineRequest DTO
- **T3.3.7**: 创建 TicketCancelRequest DTO

### 3.4 模板模块 DTO
- **T3.4.1**: 创建 TemplateResponse DTO
- **T3.4.2**: 创建 TemplateCreateRequest DTO
- **T3.4.3**: 创建 TemplateUpdateRequest DTO
- **T3.4.4**: 创建 TemplateStepRequest DTO
- **T3.4.5**: 创建 TemplateFieldRequest DTO

### 3.5 文件模块 DTO
- **T3.5.1**: 创建 FileUploadResponse DTO
- **T3.5.2**: 创建 FileUploadRequest DTO

## 阶段 4: Service 层实现

### 4.1 认证服务
- **T4.1.1**: 实现 AuthService.login()
- **T4.1.2**: 实现 AuthService.register()
- **T4.1.3**: 实现 AuthService.logout()
- **T4.1.4**: 编写 AuthService 单元测试

### 4.2 用户服务
- **T4.2.1**: 实现 UserService.getUsers() (支持过滤)
- **T4.2.2**: 实现 UserService.getUserById()
- **T4.2.3**: 实现 UserService.createUser()
- **T4.2.4**: 实现 UserService.updateUser()
- **T4.2.5**: 实现 UserService.deleteUser()
- **T4.2.6**: 编写 UserService 单元测试

### 4.3 工单服务
- **T4.3.1**: 实现 TicketService.getTickets() (支持过滤)
- **T4.3.2**: 实现 TicketService.getTicketById()
- **T4.3.3**: 实现 TicketService.createTicket()
- **T4.3.4**: 实现 TicketService.updateTicket()
- **T4.3.5**: 实现 TicketService.deleteTicket()
- **T4.3.6**: 实现 TicketService.acceptTicket()
- **T4.3.7**: 实现 TicketService.declineTicket()
- **T4.3.8**: 实现 TicketService.cancelTicket()
- **T4.3.9**: 编写 TicketService 单元测试

### 4.4 模板服务
- **T4.4.1**: 实现 TemplateService.getTemplates()
- **T4.4.2**: 实现 TemplateService.getTemplateById()
- **T4.4.3**: 实现 TemplateService.createTemplate()
- **T4.4.4**: 实现 TemplateService.updateTemplate()
- **T4.4.5**: 实现 TemplateService.deleteTemplate()
- **T4.4.6**: 编写 TemplateService 单元测试

### 4.5 文件服务
- **T4.5.1**: 实现 FileService.uploadFile()
- **T4.5.2**: 实现 FileService.deleteFile()
- **T4.5.3**: 实现 FileService.verifyFace() (模拟)
- **T4.5.4**: 编写 FileService 单元测试

### 4.6 其他服务
- **T4.6.1**: 实现 GroupService (CRUD)
- **T4.6.2**: 实现 SiteService (CRUD)
- **T4.6.3**: 实现 ConfigService (CRUD)

## 阶段 5: Controller 层实现

### 5.1 认证控制器
- **T5.1.1**: 实现 AuthController (POST /login, POST /register, POST /logout)

### 5.2 用户控制器
- **T5.2.1**: 实现 UserController (GET /users, GET /users/{id}, POST /users, PUT /users/{id}, DELETE /users/{id})

### 5.3 工单控制器
- **T5.3.1**: 实现 TicketController (完整 CRUD + 工作流操作)

### 5.4 模板控制器
- **T5.4.1**: 实现 TemplateController (完整 CRUD)

### 5.5 文件控制器
- **T5.5.1**: 实现 FileController (POST /upload, DELETE /{id}, POST /face-recognition/verify)

### 5.6 其他控制器
- **T5.6.1**: 实现 GroupController
- **T5.6.2**: 实现 SiteController
- **T5.6.3**: 实现 ConfigController
- **T5.6.4**: 实现健康检查端点 GET /api/health

## 阶段 6: 测试

### 6.1 单元测试
- **T6.1.1**: 编写 AuthService 单元测试
- **T6.1.2**: 编写 UserService 单元测试
- **T6.1.3**: 编写 TicketService 单元测试
- **T6.1.4**: 编写 TemplateService 单元测试
- **T6.1.5**: 编写 FileService 单元测试

### 6.2 集成测试
- **T6.2.1**: 编写 AuthController 集成测试
- **T6.2.2**: 编写 UserController 集成测试
- **T6.2.3**: 编写 TicketController 集成测试

### 6.3 验证测试
- **T6.3.1**: API 契约验证 (与现有前端兼容)
- **T6.3.2**: 性能测试 (基准对比)

## 阶段 7: 部署和运维

### 7.1 Docker 部署
- **T7.1.1**: 创建 Dockerfile (基于 Java 21 基础镜像)
- **T7.1.2**: 创建 .dockerignore 文件
- **T7.1.3**: 创建 docker-compose.yml (开发环境)
- **T7.1.4**: 创建 docker-compose-prod.yml (生产环境)
- **T7.1.5**: 创建 startup.sh 启动脚本
- **T7.1.6**: 创建 shutdown.sh 停止脚本
- **T7.1.7**: 优化 Docker 镜像大小 (分层构建)

### 7.2 日志配置
- **T7.2.1**: 引入 SLF4J + Lombok 依赖
- **T7.2.2**: 创建 logback-spring.xml 配置文件
- **T7.2.3**: 在 Service 层使用 @Slf4j 注解
- **T7.2.4**: 配置日志级别和格式
- **T7.2.5**: 配置日志轮转策略
- **T7.2.6**: 配置异步日志输出

### 7.3 回滚策略
- **T7.3.1**: 创建数据库备份脚本
- **T7.3.2**: 创建应用回滚脚本
- **T7.3.3**: 创建健康检查脚本
- **T7.3.4**: 验证回滚流程

### 7.4 性能优化
- **T7.4.1**: 配置连接池 (HikariCP)
- **T7.4.2**: 配置虚拟线程优化
- **T7.4.3**: 配置异步处理

## 阶段 8: 文档

### 8.1 文档更新
- **T8.1.1**: 更新 README.md (Spring Boot 版本)
- **T8.1.2**: 创建 API 文档 (OpenAPI/Swagger)
- **T8.1.3**: 创建部署文档
- **T8.1.4**: 创建开发者指南

### 8.2 团队培训
- **T8.2.1**: Java 21 新特性培训
- **T8.2.2**: Spring Boot 3 最佳实践培训

---

## 依赖关系图

```
阶段 1 (基础设施)
    ├── Maven 配置 + Java 21 环境
    ├── Spring Boot 初始化
    ├── 数据库连接配置
    ├── 安全框架配置
    └── 基础设施组件
         ↓
阶段 2 (领域模型)
    ├── 枚举类 (Python → Java)
    ├── 实体类映射
    └── Repository 层
         ↓
阶段 3 (DTO)
    ├── 请求/响应 DTO (使用 Records)
    └── 数据验证
         ↓
阶段 4 (Service)  [依赖阶段 2 + 3]
    ├── 业务逻辑实现
    └── 单元测试
         ↓
阶段 5 (Controller)  [依赖阶段 4]
    ├── REST API 实现
    └── 集成测试
         ↓
阶段 6 (测试)  [依赖阶段 5]
    ├── API 契约验证
    └── 性能测试
         ↓
阶段 7 (部署)
    ├── Docker 镜像构建
    └── K8s 部署配置
```

## 并行工作

以下任务可以并行执行：
- T1.1.x - T1.4.x (基础设施配置)
- T2.1.x - T2.2.x (枚举和实体)
- T3.1.x - T3.5.x (所有 DTO)
- T4.1.x - T4.6.x (所有 Service)
- T5.1.x - T5.6.x (所有 Controller)
- T6.1.x - T6.3.x (所有测试)

## 验收标准

1. 所有 API 端点与现有 FastAPI 实现功能一致
2. 单元测试覆盖率 ≥ 80%
3. API 文档完整 (Swagger UI 可访问)
4. 通过与现有前端的兼容性测试
5. 健康检查端点正常响应
6. 性能指标满足基准要求

## 新增任务：补充任务

### 1.7 Java 21 特性集成
- **T1.7.1**: 配置 Virtual Threads 支持
- **T1.7.2**: 创建 Pattern Matching 工具类
- **T1.7.3**: 配置 Text Blocks 模板

### 1.8 日志配置
- **T1.8.1**: 引入 SLF4J + Lombok 依赖 (pom.xml)
- **T1.8.2**: 创建 logback-spring.xml 配置文件
- **T1.8.3**: 配置健康检查端点

### 6.4 性能测试
- **T6.4.1**: 创建 k6 负载测试脚本
- **T6.4.2**: 执行基准性能测试
- **T6.4.3**: 性能优化和验证

### 6.5 兼容性测试
- **T6.5.1**: 创建 API 契约测试
- **T6.5.2**: 验证 JWT 兼容性
- **T6.5.3**: 验证响应格式兼容性

### 7.3 回滚策略
- **T7.3.1**: 创建数据库备份脚本
- **T7.3.2**: 创建应用回滚脚本
- **T7.3.3**: 验证回滚流程

## 任务优先级

| 优先级 | 任务类型 | 说明 |
|--------|---------|------|
| P0 | 核心功能 | 认证、工单、用户 API |
| P1 | 业务功能 | 模板、文件、分组 API |
| P2 | 基础设施 | 日志、CI/CD 脚本 |
| P3 | 优化 | 性能优化、文档完善 |
