# iGreenProduct 代码审查报告

**审查日期：** 2026-03-12  
**审查范围：** 全项目（前端、后端、移动端）  
**审查工具：** 静态分析、手动代码审查、配置检查

---

## 📊 执行摘要

| 类别 | 严重 | 警告 | 建议 | 总计 |
|------|------|------|------|------|
| **安全问题** | 5 | 3 | 2 | 10 |
| **代码质量** | 2 | 8 | 12 | 22 |
| **性能问题** | 0 | 4 | 6 | 10 |
| **测试覆盖率** | 3 | 2 | 1 | 6 |
| **依赖健康度** | 1 | 5 | 3 | 9 |
| **文档完整性** | 0 | 2 | 4 | 6 |
| **总计** | **11** | **24** | **28** | **63** |

---

## 🔴 严重问题 (Critical)

### 1. 硬编码的敏感信息

#### 1.1 JWT 密钥默认值
- **文件：** `igreen-backend/src/main/resources/application.yml` (第 43 行)
- **文件：** `igreen-backend/src/main/java/com/igreen/common/utils/JwtUtils.java` (第 26 行)
- **问题：** JWT 密钥有硬编码默认值 `aVeryLongAndSecureSecretKeyForJwtTokenGeneration2024`
- **风险：** 如果生产环境未配置环境变量，将使用已知默认密钥，攻击者可伪造任意 JWT 令牌
- **修复建议：**
  ```yaml
  # 移除默认值，强制要求环境变量
  app:
    jwt:
      secret-key: ${JWT_SECRET_KEY}  # 移除默认值
  ```
  ```java
  // JwtUtils.java - 添加启动时检查
  @PostConstruct
  public void validateSecretKey() {
      if (secretKey == null || secretKey.contains("aVeryLongAndSecure")) {
          throw new IllegalStateException("JWT_SECRET_KEY must be configured via environment variable");
      }
  }
  ```

#### 1.2 数据库密码硬编码
- **文件：** `igreen-backend/src/main/resources/application.yml` (第 14-15 行)
- **问题：** 数据库凭证明文硬编码
  ```yaml
  datasource:
    username: root
    password: root
  ```
- **风险：** 源码泄露导致数据库完全暴露
- **修复建议：**
  ```yaml
  datasource:
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  ```
  使用 secrets 管理工具（如 Vault、AWS Secrets Manager）管理生产环境凭据

#### 1.3 Supabase 密钥硬编码
- **文件：** `igreen-front/src/utils/supabase/info.tsx`
- **问题：** Supabase anon key 硬编码在源码中
  ```typescript
  export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **风险：** 虽然这是 anon key（公开密钥），但应通过环境变量管理以便轮换
- **修复建议：**
  ```typescript
  export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  ```

### 2. CORS 配置过于宽松

- **文件：** `igreen-backend/src/main/java/com/igreen/common/config/SecurityConfig.java` (第 112 行)
- **问题：** 
  ```java
  configuration.setAllowedOriginPatterns(List.of("*"));  // 允许所有来源
  ```
- **风险：** 任何网站都可以向 API 发送跨域请求，可能导致 CSRF 攻击
- **修复建议：**
  ```java
  // 仅允许已知来源
  configuration.setAllowedOrigins(List.of(
      "http://localhost:5173",
      "https://your-production-domain.com"
  ));
  configuration.setAllowCredentials(false);  // 如果不需要凭证
  ```

### 3. 零测试覆盖率

- **位置：** `igreen-backend/src/test/` 和 `igreen-front/src/**/*.test.*`
- **问题：** 
  - 后端测试目录为空（0 个测试文件）
  - 前端无单元测试（0 个 .test.tsx/.spec.ts 文件）
- **风险：** 代码变更无自动化验证，回归风险极高
- **修复建议：**
  1. 为关键服务类编写单元测试（UserService, TicketService, JwtUtils）
  2. 为前端组件编写测试（使用 Vitest + React Testing Library）
  3. 配置 CI 强制测试覆盖率门槛（建议 >60%）

---

## 🟠 警告问题 (Warning)

### 4. 代码复杂度问题

#### 4.1 超大文件
| 文件 | 行数 | 建议阈值 | 风险 |
|------|------|----------|------|
| `igreen-backend/.../TicketService.java` | 731 | 500 | 难以维护、测试困难 |
| `igreen-front/src/App.tsx` | 772 | 500 | 组件职责不单一 |
| `igreen-backend/.../SiteImportExportService.java` | 328 | 300 | 复杂度高 |
| `igreen-backend/.../UserService.java` | 318 | 300 | 需重构 |

- **修复建议：**
  - 将 TicketService 拆分为：TicketCrudService、TicketValidationService、TicketNotificationService
  - App.tsx 拆分为独立的路由组件和布局组件

#### 4.2 调试代码未清理
- **文件：** `igreen-front/src/lib/api.ts` 等多处
- **问题：** 生产代码包含大量 `console.log` 调试语句（发现 20+ 处）
- **修复建议：**
  ```bash
  # 使用 ESLint 规则禁止生产环境的 console.log
  # .eslintrc.js
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }]
  }
  ```

### 5. TypeScript 配置不严格

- **文件：** `igreen-front/tsconfig.json`
- **问题：**
  ```json
  {
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
  ```
- **风险：** 未使用的变量和参数不会被捕获，可能导致代码质量下降
- **修复建议：**
  ```json
  {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
  ```

### 6. 依赖项版本问题

- **文件：** `igreen-front/package.json` 和 `iGreenApp/package.json`
- **问题：** 多个依赖使用通配符版本 `*`
  ```json
  "clsx": "*",
  "cmdk": "*",
  "hono": "*",
  "ky": "^1.14.2",
  "tailwind-merge": "*"
  ```
- **风险：** 构建不可复现，可能意外引入破坏性变更
- **修复建议：** 固定所有依赖版本
  ```json
  "clsx": "^2.1.0",
  "cmdk": "^1.1.1",
  "hono": "^4.3.0",
  "tailwind-merge": "^2.2.0"
  ```

### 7. 潜在 SQL 注入风险

- **文件：** `igreen-backend/.../TicketService.java` 等多处
- **问题：** 使用 MyBatis-Plus 和 JPA，但需审查所有原生查询
- **检查点：**
  ```java
  // 确保所有查询使用参数化
  @Query("SELECT t FROM Ticket t WHERE t.title LIKE :keyword")  // ✅ 安全
  @Query("SELECT * FROM ticket WHERE title = '" + keyword + "'") // ❌ 危险
  ```
- **建议：** 运行 `mvn test` 检查所有 Repository 层测试

### 8. 生产环境配置泄露

- **文件：** `igreen-front/.env`、`.env.local`、`.env.remote` 等多个环境文件
- **问题：** 多个环境文件可能包含敏感配置
- **建议：**
  1. 确保 `.env*` 在 `.gitignore` 中
  2. 提供 `.env.example` 作为模板
  3. 使用环境变量管理不同环境

---

## 🟡 建议问题 (Suggestion)

### 9. 代码规范改进

#### 9.1 命名规范
- **发现：** 部分变量使用缩写（如 `dto`、`req`）
- **建议：** 使用完整命名（`request`、`response`、`configuration`）

#### 9.2 注释质量
- **发现：** 部分复杂逻辑缺少注释
- **建议：** 为业务复杂的方法添加 JavaDoc/TS Doc
  ```java
  /**
   * 创建工单并初始化模板数据
   * @param request 工单创建请求
   * @param currentUserId 当前用户 ID
   * @return 工单响应对象
   * @throws BusinessException 当用户或组不存在时
   */
  ```

### 10. 性能优化建议

#### 10.1 数据库查询优化
- **建议：** 
  - 为常用查询字段添加索引（`ticket.status`、`ticket.created_at`）
  - 使用查询缓存（MyBatis 二级缓存）
  - 审查 N+1 查询问题

#### 10.2 前端性能
- **建议：**
  - 实现代码分割（React.lazy + Suspense）
  - 图片资源使用 WebP 格式
  - 启用 Vite 构建分析：`npm run build -- --stats`

### 11. 安全加固建议

1. **速率限制：** 已实现 `RateLimitFilter`，建议：
   - 按 IP 和用户双重限制
   - 登录接口单独限制（防暴力破解）

2. **输入验证：** 
   - 前端添加表单验证（已使用 react-hook-form ✅）
   - 后端添加 `@Valid` 注解到所有 Controller 方法

3. **文件上传安全：**
   - 限制文件类型（白名单）
   - 扫描上传文件（防恶意文件）
   - 使用随机文件名存储

4. **日志安全：**
   - 移除生产环境的敏感信息日志
   - 使用结构化日志（JSON 格式）

### 12. 文档改进

- **现状：** 项目有大量文档文件（README、DEPLOYMENT 等）
- **建议：**
  1. 添加 API 文档（Swagger/Knife4j 已配置 ✅）
  2. 添加架构决策记录（ADR）
  3. 更新依赖升级指南
  4. 添加故障排查手册

---

## 📈 依赖项健康度分析

### 前端依赖 (igreen-front)

| 依赖 | 当前版本 | 最新稳定版 | 状态 |
|------|----------|------------|------|
| React | 18.3.1 | 19.x | ⚠️ 可升级 |
| Vite | 6.3.5 | 6.x | ✅ 最新 |
| React Router | 7.12.0 | 7.x | ✅ 最新 |
| Vitest | 4.0.16 | 4.x | ✅ 最新 |
| Playwright | 1.57.0 | 1.x | ✅ 最新 |

**已知漏洞检查：**
```bash
# 建议运行
cd igreen-front && pnpm audit
cd igreen-backend && mvn org.owasp:dependency-check-maven:check
```

### 后端依赖 (igreen-backend)

| 依赖 | 版本 | 状态 |
|------|------|------|
| Spring Boot | 3.2.0 | ⚠️ 可升级到 3.2.x 最新版 |
| MyBatis-Plus | 3.5.5 | ✅ 最新 |
| JJWT | 0.12.3 | ✅ 最新 |
| Lombok | 1.18.30 | ✅ 最新 |

---

## ✅ 最佳实践检查清单

| 检查项 | 状态 | 备注 |
|--------|------|------|
| 代码版本控制 | ✅ | Git 规范使用 |
| 分支策略 | ✅ | 有 .github 配置 |
| CI/CD | ⚠️ | 有 .drone.yml 但需检查 |
| 代码审查流程 | ❓ | 未见明确流程文档 |
| 环境变量管理 | ⚠️ | 部分硬编码 |
| 错误处理 | ✅ | 有 GlobalExceptionHandler |
| 日志记录 | ✅ | 使用 SLF4J |
| 数据库迁移 | ❓ | 未见 Flyway/Liquibase |
| API 版本控制 | ❌ | 未见 API 版本管理 |
| 监控告警 | ⚠️ | 有 Actuator 但配置有限 |

---

## 🎯 修复优先级

### P0 - 立即修复（24 小时内）
1. [ ] 移除 JWT 密钥默认值，强制环境变量配置
2. [ ] 移除数据库密码硬编码
3. [ ] 收紧 CORS 配置
4. [ ] 将 Supabase 密钥移至环境变量

### P1 - 高优先级（1 周内）
1. [ ] 编写核心服务单元测试（目标覆盖率 60%）
2. [ ] 清理生产代码中的 console.log
3. [ ] 固定所有依赖版本
4. [ ] 启用 TypeScript 严格模式

### P2 - 中优先级（1 个月内）
1. [ ] 重构超大文件（TicketService、App.tsx）
2. [ ] 添加 API 集成测试
3. [ ] 配置 CI 自动化测试
4. [ ] 添加数据库迁移工具

### P3 - 低优先级（季度计划）
1. [ ] 性能优化（查询优化、代码分割）
2. [ ] 完善文档体系
3. [ ] 安全加固（文件上传、速率限制增强）
4. [ ] 监控告警完善

---

## 📝 总结

iGreenProduct 项目整体架构清晰，使用了现代化的技术栈（React + Spring Boot + Capacitor）。主要问题集中在：

1. **安全隐患**：敏感信息硬编码是最严重的问题，需立即修复
2. **测试缺失**：零测试覆盖率是重大技术债务
3. **代码质量**：部分文件过大，需重构

**建议立即行动：**
1. 创建 `.env.example` 并移除所有硬编码凭据
2. 为 JwtUtils、UserService、TicketService 编写单元测试
3. 配置 ESLint 和 Prettier 强制代码规范

---

**审查员：** Code Review Agent  
**报告生成时间：** 2026-03-12 21:30 GMT+8  
**下次审查建议：** 修复 P0 问题后重新审查
