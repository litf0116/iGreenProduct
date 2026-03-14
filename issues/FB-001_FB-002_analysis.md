# FB-001 & FB-002 问题分析报告

**分析日期**: 2025-03-14  
**分析人**: AI Assistant  
**文档版本**: 1.0  

---

## FB-001: 新账号登录报错分析

### 问题确认

**状态**: ✅ 问题已确认存在

### 根因分析

#### 1. 用户创建时 country 字段可为 null

**文件**: `UserCreateRequest.java`
```java
private String country;  // 没有 @NotBlank 注解，是可选字段
```

**文件**: `UserService.java` (第43-53行)
```java
User user = User.builder()
    // ...
    .country(request.getCountry())  // 直接使用 request 的 country，可能为 null
    .build();
```

#### 2. 登录时的 country 处理逻辑

**文件**: `UserService.java` (第78-97行)
```java
if (user.getRole() == UserRole.ADMIN) {
    // ADMIN 登录必须传 country
    if (request.getCountry() == null || request.getCountry().isBlank()) {
        throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
    }
    // ...
} else {
    // 非 ADMIN 用户
    if (request.getCountry() == null || request.getCountry().isBlank()) {
        tokenCountry = user.getCountry();  // ⚠️ 如果用户的 country 为 null，tokenCountry 也是 null
    }
    // ...
}
```

#### 3. JWT Token 生成

**文件**: `JwtUtils.java` (第107-114行)
```java
public String generateToken(String userId, String username, String role, String country) {
    Map<String, Object> claims = new HashMap<>();
    // ...
    claims.put("country", country);  // country 可以是 null
    return createToken(claims, username, jwtExpirationMs);
}
```

#### 4. 认证过滤器处理

**文件**: `JwtAuthenticationFilter.java` (第51-53行)
```java
String country = jwtUtils.extractCountry(jwt);
CountryContext.set(country);  // ⚠️ 如果 country 是 null，会设置 null 到 ThreadLocal
```

#### 5. 数据查询影响

**文件**: `TicketService.java` (第110-112行)
```java
if (country != null && !country.isBlank()) {
    wrapper.eq(Ticket::getCountry, country);
}
// ⚠️ 如果 country 是 null，不添加过滤条件，可能返回所有国家的数据
```

### 问题影响

| 场景 | 影响 |
|------|------|
| Admin 创建用户时未设置 country | 用户 country 字段为 null |
| 该用户登录 | Token 中 country 为 null |
| 请求携带该 Token | CountryContext.get() 返回 null |
| 数据查询 | 可能返回所有国家数据（安全风险）或查询异常 |

### 解决方案

#### 方案 A：强制必填（推荐）

修改 `UserCreateRequest.java`：
```java
@NotBlank(message = "国家不能为空")
private String country;
```

#### 方案 B：从创建者继承 country

修改 `UserService.createUser()` 方法：
```java
@Transactional
public UserResponse createUser(UserCreateRequest request) {
    // ...
    
    // 如果未设置 country，从当前用户（admin）的 country 继承
    String country = request.getCountry();
    if (country == null || country.isBlank()) {
        String currentUserCountry = CountryContext.get();
        if (currentUserCountry != null && !currentUserCountry.isBlank()) {
            country = currentUserCountry;
        } else {
            throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        }
    }
    
    User user = User.builder()
        // ...
        .country(country)
        .build();
    // ...
}
```

#### 方案 C：登录时验证

修改 `UserService.login()` 方法：
```java
// 非 ADMIN 用户
if (request.getCountry() == null || request.getCountry().isBlank()) {
    tokenCountry = user.getCountry();
    if (tokenCountry == null || tokenCountry.isBlank()) {
        throw new BusinessException(ErrorCode.COUNTRY_REQUIRED, 
            "用户国家信息缺失，请联系管理员设置");
    }
}
```

### 测试验证步骤

1. **创建测试用户**
   ```bash
   curl -X POST http://localhost:8080/api/users \
     -H "Authorization: Bearer {admin_token}" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "测试用户",
       "username": "testuser_nocountry",
       "password": "Test1234",
       "role": "ENGINEER"
       # 注意：不传 country 字段
     }'
   ```

2. **验证用户 country 字段**
   ```sql
   SELECT id, username, country FROM users WHERE username = 'testuser_nocountry';
   ```

3. **尝试登录**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser_nocountry",
       "password": "Test1234"
     }'
   ```

4. **预期结果**
   - 如果已修复：应该返回错误提示 "用户国家信息缺失" 或创建时强制要求 country
   - 如果未修复：登录成功但后续操作可能异常

---

## FB-002: 权限配置分析

### 问题确认

**状态**: ✅ 问题已确认存在

### 需求对比

| 角色 | 需求权限 | 当前实现 |
|------|----------|----------|
| **admin** | 全放开 | ✅ 基本符合 |
| **supervisor** | 没有 system settings 权限，其他与 admin 相同 | ❌ 无此角色，MANAGER 权限不完整 |
| **maintenance engineer** | 只读自己的工单 + 自己同组的工单 | ❌ ENGINEER 可查看所有工单 |

### 当前角色定义

**文件**: `UserRole.java`
```java
public enum UserRole {
    ADMIN,
    MANAGER,   // 对应什么角色？
    ENGINEER;  // 对应 maintenance engineer
}
```

**问题**: 缺少 `SUPERVISOR` 角色，`MANAGER` 的权限定义不明确。

### 权限控制问题分析

#### 1. 用户管理权限

**文件**: `UserController.java`
```java
@GetMapping
@PreAuthorize("hasRole('ADMIN')")  // ❌ 只有 ADMIN 能查看用户
public ResponseEntity<Result<PageResult<UserResponse>>> getAllUsers(...) { ... }

@PostMapping
@PreAuthorize("hasRole('ADMIN')")  // ❌ 只有 ADMIN 能创建用户
public ResponseEntity<Result<UserResponse>> createUser(...) { ... }
```

**问题**: supervisor (MANAGER) 应该也能管理用户，但当前被限制。

#### 2. 工单查询权限

**文件**: `TicketController.java`
```java
@GetMapping
// ❌ 没有权限注解，任何登录用户都能查看所有工单
public ResponseEntity<Result<PageResult<TicketResponse>>> getTickets(...) { ... }
```

**问题**: maintenance engineer (ENGINEER) 应该只能查看自己和同组的工单。

#### 3. 工单删除权限

**文件**: `TicketController.java`
```java
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")  // ❌ 只有 ADMIN 能删除
public ResponseEntity<Result<Void>> deleteTicket(@PathVariable Long id) { ... }
```

**问题**: 需求未明确 supervisor 是否能删除工单。

#### 4. 数据查询缺少权限过滤

**文件**: `TicketService.java` - `getTickets()` 方法
```java
public PageResult<TicketResponse> getTickets(...) {
    String country = CountryContext.get();
    
    // 只按 country 过滤，没有按用户角色过滤
    if (country != null && !country.isBlank()) {
        wrapper.eq(Ticket::getCountry, country);
    }
    // ❌ 缺少基于角色的权限过滤
}
```

### 解决方案

#### 方案 A：新增 SUPERVISOR 角色（推荐）

1. **修改 `UserRole.java`**：
```java
public enum UserRole {
    ADMIN,           // 全放开
    SUPERVISOR,      // 没有 system settings 权限，其他与 admin 相同
    ENGINEER;        // 只读自己的工单 + 自己同组的工单
    
    // 可选：保留 MANAGER 作为别名
    // MANAGER,      // 等同于 SUPERVISOR
}
```

2. **修改 `UserController.java`**：
```java
@GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public ResponseEntity<Result<PageResult<UserResponse>>> getAllUsers(...) { ... }

@PostMapping
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public ResponseEntity<Result<UserResponse>> createUser(...) { ... }
```

3. **修改 `TicketService.java`** - 添加权限过滤：
```java
public PageResult<TicketResponse> getTickets(
    int page, int size, String type, String status, 
    String priority, String assignedTo, String keyword, 
    LocalDateTime createdAfter, String currentUserId, UserRole currentUserRole
) {
    String country = CountryContext.get();
    
    PageHelper.startPage(page, size);
    try {
        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        
        // 按国家过滤
        if (country != null && !country.isBlank()) {
            wrapper.eq(Ticket::getCountry, country);
        }
        
        // 按角色过滤数据
        if (currentUserRole == UserRole.ENGINEER) {
            User user = userMapper.selectById(currentUserId);
            String groupId = user.getGroupId();
            
            // 只能查看自己的工单或同组的工单
            wrapper.and(w -> w
                .eq(Ticket::getAcceptedUserId, currentUserId)  // 自己的工单
                .or()
                .eq(Ticket::getAssignedTo, groupId)            // 同组的工单
            );
        }
        // ADMIN 和 SUPERVISOR 可以查看所有工单
        
        // 其他过滤条件...
    }
}
```

4. **修改 `TicketController.java`**：
```java
@GetMapping
public ResponseEntity<Result<PageResult<TicketResponse>>> getTickets(
    HttpServletRequest httpRequest,
    @RequestParam @Min(1) int page,
    @RequestParam @Min(1) @Max(100) int size,
    // ... 其他参数
) {
    String userId = getCurrentUserId(httpRequest);
    UserRole userRole = getCurrentUserRole(httpRequest);
    return ResponseEntity.ok(Result.success(
        ticketService.getTickets(page, size, type, status, priority, 
            assignedTo, keyword, createdAfter, userId, userRole)
    ));
}
```

#### 方案 B：保持现有角色，调整权限

将 `MANAGER` 作为 supervisor 使用：
- `MANAGER` = supervisor
- `ENGINEER` = maintenance engineer

修改权限注解和数据过滤逻辑同上。

### 权限对照表（推荐方案 A 后）

| 功能 | ADMIN | SUPERVISOR | ENGINEER |
|------|-------|------------|----------|
| 查看所有用户 | ✅ | ✅ | ❌ |
| 创建/编辑/删除用户 | ✅ | ✅ | ❌ |
| 查看所有工单 | ✅ | ✅ | ❌ (仅自己和同组) |
| 创建工单 | ✅ | ✅ | ❌ |
| 删除工单 | ✅ | ❌ | ❌ |
| 分配工单 | ✅ | ✅ | ❌ |
| 接单/完成工单 | ✅ | ✅ | ✅ (仅自己) |
| 系统设置 | ✅ | ❌ | ❌ |
| 站点管理 | ✅ | ✅ | ❌ |
| 模板管理 | ✅ | ✅ | ❌ |

---

## 测试验证计划

### FB-001 测试用例

| 测试ID | 测试场景 | 预期结果 |
|--------|----------|----------|
| TC-001 | Admin 创建用户时不传 country | 应报错或使用默认值 |
| TC-002 | 无 country 用户尝试登录 | 应报错提示国家信息缺失 |
| TC-003 | 有 country 用户正常登录 | 登录成功，Token 包含正确 country |

### FB-002 测试用例

| 测试ID | 测试场景 | 预期结果 |
|--------|----------|----------|
| TC-101 | ADMIN 用户查看所有工单 | 返回所有工单 |
| TC-102 | SUPERVISOR 用户查看所有工单 | 返回所有工单 |
| TC-103 | ENGINEER 用户查看工单列表 | 只返回自己和同组的工单 |
| TC-104 | ENGINEER 用户尝试访问系统设置 | 返回 403 Forbidden |
| TC-105 | SUPERVISOR 用户尝试访问系统设置 | 返回 403 Forbidden |

---

## 下一步行动

### FB-001 ✅ 方案已确认：从创建者继承 country

**实施方案**:
修改 `UserService.createUser()` 方法，当 `request.getCountry()` 为空时，从当前用户的 country 继承。

1. [ ] 修改 `UserService.createUser()` 方法
2. [ ] 编写测试用例验证
3. [ ] 执行测试验证

### FB-002 ✅ 方案已确认：MANAGER = SUPERVISOR

**角色映射**:
- `ADMIN` = admin（全放开）
- `MANAGER` = supervisor（没有 system settings 权限，其他与 admin 相同）
- `ENGINEER` = maintenance engineer（只读自己的工单 + 自己同组的工单）

**实施内容**:
1. [ ] 修改工单查询权限过滤（ENGINEER 只能看自己和同组的工单）
2. [ ] 调整权限注解（MANAGER 应有用户管理、工单管理等权限）
3. [ ] 确认 System Settings 接口权限控制
4. [ ] 前端适配（菜单/按钮权限控制）
5. [ ] 编写测试用例
6. [ ] 执行测试验证

---

**报告完成时间**: 2025-03-14  
**需要确认**: 请确认解决方案后开始实施