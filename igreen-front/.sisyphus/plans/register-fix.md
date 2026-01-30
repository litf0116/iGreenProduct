# 注册页面接口修复计划

## TL;DR

> **快速摘要**: 修复 igreen-front 注册页面与后端 API 的接口对接问题，移除前端不需要的 email 字段，添加后端必需的 confirmPassword 字段。
>
> **交付物**:
> - 修复 SignUp.tsx 第59行未定义变量错误
> - 更新 api.ts 注册函数参数
> - 更新 useAuth.tsx signUp 函数调用
> - 更新 types.ts 类型定义
>
> **预估工作量**: 简单修复 (15-30分钟)
> **并行执行**: 否 - 顺序依赖修复
> **关键路径**: SignUp.tsx → api.ts → types.ts → useAuth.tsx

---

## Context

### 原始请求
用户要求分析注册页面的接口对接是否完整。分析发现以下严重问题：

1. **SignUp.tsx 第59行**：`email` 变量未定义，导致提交时报 `ReferenceError`
2. **api.ts 缺失字段**：后端要求 `confirmPassword`，但前端 API 函数未包含
3. **useAuth.tsx 参数冗余**：传递后端不需要的 `email` 字段

### 用户决策
采用**方案1**：完全移除 email 字段，与后端设计保持一致（后端自动生成邮箱为 `username@igreen.com`）

### Metis 评审
因 Metis 服务不可用，跳过外部评审，直接基于已有分析生成计划。

---

## Work Objectives

### 核心目标
修复注册功能的接口对接，使前端参数与后端 RegisterRequest 完全匹配。

### 具体交付物
- [ ] SignUp.tsx: 移除 onSignUp 调用的 email 参数
- [ ] api.ts: 添加 confirmPassword 参数，移除 email 参数
- [ ] useAuth.tsx: 移除 signUp 函数的 email 参数
- [ ] types.ts: 更新 RegisterRequest 类型定义

### 完成定义
- [ ] 前端注册表单可以正常提交，不报 undefined 错误
- [ ] 前端传递的字段与后端 RegisterRequest 完全匹配
- [ ] 后端注册接口能成功接收请求并返回 token

### 必须有
- email 字段从所有注册相关代码中移除
- confirmPassword 参数正确传递给后端
- 密码一致性验证保持有效

### 不能有 (护栏)
- 不修改后端代码（后端接口已正确实现）
- 不改变现有表单 UI 结构
- 不修改密码验证逻辑

---

## Verification Strategy (MANDATORY)

> 此修复涉及 API 参数调整，需要验证前端向后端的请求格式正确。

### 测试决策
- **基础设施存在**: 是 (已有 api.test.ts)
- **用户要求测试**: 否 (简单参数修复，人工验证即可)
- **QA 方式**: 手动验证

### 验证方法

**对于 API 参数修复** (使用 Bash):
```bash
# 1. 检查编译是否通过
cd /Users/mac/workspace/iGreenProduct/igreen-front && pnpm build

# 2. 启动开发服务器验证页面可访问
cd /Users/mac/workspace/iGreenProduct/igreen-front && pnpm dev &
sleep 3

# 3. 测试 API 调用 (需要后端运行)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "password": "password123",
    "confirmPassword": "password123",
    "country": "Thailand"
  }'
```

---

## Execution Strategy

### 顺序执行

```
Task 1: 更新 types.ts RegisterRequest 类型
  ↓ (完成后再进行)
Task 2: 更新 api.ts register 函数参数
  ↓ (完成后再进行)
Task 3: 更新 useAuth.tsx signUp 函数
  ↓ (完成后再进行)
Task 4: 修复 SignUp.tsx 未定义变量
```

### 依赖矩阵

| 任务 | 依赖 | 阻塞 | 可并行 |
|------|------|------|--------|
| 1. 更新 types.ts | 无 | 2 | - |
| 2. 更新 api.ts | 1 | 3 | - |
| 3. 更新 useAuth.tsx | 2 | 4 | - |
| 4. 修复 SignUp.tsx | 3 | 无 | - |

---

## TODOs

- [ ] 1. 更新 types.ts RegisterRequest 类型定义

  **做什么**:
  - 将 `RegisterRequest` 接口从:
    ```typescript
    export interface RegisterRequest {
      name: string;
      username: string;
      email: string;
      password: string;
      role?: string;
    }
    ```
    修改为:
    ```typescript
    export interface RegisterRequest {
      name: string;
      username: string;
      password: string;
      confirmPassword: string;
      country: string;
      role?: string;
    }
    ```

  **必须不做**:
  - 不添加 email 字段
  - 不改变其他接口定义

  **推荐代理配置**:
  - **类别**: quick (小范围类型定义修改)
  - **技能**: 无需特殊技能
  - **并行化**: 否 - 顺序任务第一步

  **引用**:
  - `igreen-front/src/lib/types.ts:208-214` - 当前 RegisterRequest 定义

  **验收标准**:
  - [ ] RegisterRequest 接口包含 confirmPassword 和 country
  - [ ] email 字段已移除

- [ ] 2. 更新 api.ts register 函数参数

  **做什么**:
  - 修改 `api.ts` 第63-77行:
    ```typescript
    register: async (data: {
      name: string;
      username: string;
      email: string;      // 移除
      password: string;
      role?: string;
      country?: string;   // 改为必填
    }): Promise<TokenResponse>
    ```
    修改为:
    ```typescript
    register: async (data: {
      name: string;
      username: string;
      password: string;
      confirmPassword: string;  // 添加
      country: string;          // 改为必填
      role?: string;
    }): Promise<TokenResponse>
    ```

  **必须不做**:
  - 不修改其他 API 函数

  **推荐代理配置**:
  - **类别**: quick (单文件函数参数修改)
  - **技能**: 无需特殊技能
  - **并行化**: 否 - 依赖 Task 1

  **引用**:
  - `igreen-front/src/lib/api.ts:63-77` - 当前 register 函数
  - `igreen-backend/src/main/java/com/igreen/domain/dto/RegisterRequest.java` - 后端接口定义

  **验收标准**:
  - [ ] register 函数参数包含 confirmPassword
  - [ ] email 参数已移除
  - [ ] country 改为必填

- [ ] 3. 更新 useAuth.tsx signUp 函数

  **做什么**:
  - 修改 `useAuth.tsx` 第57-69行:
    ```typescript
    const signUp = useCallback(async (
      name: string,
      username: string,
      email: string,       // 移除
      password: string,
      role: string,
      country: string
    ) => {
      await api.register({ name, username, email, password, role: role.toUpperCase(), country });
      ...
    }, []);
    ```
    修改为:
    ```typescript
    const signUp = useCallback(async (
      name: string,
      username: string,
      password: string,
      confirmPassword: string,  // 添加
      role: string,
      country: string
    ) => {
      await api.register({ name, username, password, confirmPassword, role: role.toUpperCase(), country });
      ...
    }, []);
    ```

  **必须不做**:
  - 不修改 login 或 logout 函数

  **推荐代理配置**:
  - **类别**: quick (单文件函数签名修改)
  - **技能**: 无需特殊技能
  - **并行化**: 否 - 依赖 Task 2

  **引用**:
  - `igreen-front/src/hooks/useAuth.tsx:57-69` - 当前 signUp 函数

  **验收标准**:
  - [ ] signUp 函数签名移除 email，添加 confirmPassword
  - [ ] api.register 调用传递 confirmPassword

- [ ] 4. 修复 SignUp.tsx 未定义变量

  **做什么**:
  - 修改 `SignUp.tsx` 第19-23行接口定义:
    ```typescript
    interface SignUpProps {
      language: Language;
      onSignUp: (name: string, username: string, password: string, role: string, country: string) => Promise<void>;
      onSwitchToLogin: () => void;
    }
    ```
    (email 参数已不存在)

  - 修改 `SignUp.tsx` 第59行:
    ```typescript
    // 当前 (错误)
    await onSignUp(name, username, email, password, role, country);
    
    // 修复后
    await onSignUp(name, username, password, role, country);
    ```

  **必须不做**:
  - 不修改表单 UI 结构
  - 不修改密码验证逻辑

  **推荐代理配置**:
  - **类别**: quick (单文件变量引用修复)
  - **技能**: 无需特殊技能
  - **并行化**: 否 - 依赖 Task 3

  **引用**:
  - `igreen-front/src/components/SignUp.tsx:19-23` - SignUpProps 接口
  - `igreen-front/src/components/SignUp.tsx:59` - 错误调用位置

  **验收标准**:
  - [ ] SignUp.tsx 第59行不再引用 undefined 的 email 变量
  - [ ] onSignUp 调用参数与 useAuth.signUp 签名匹配

---

## 提交策略

| 任务后 | 消息 | 文件 | 验证 |
|--------|------|------|------|
| 全部完成后 | `fix: 修复注册接口参数不匹配问题` | types.ts, api.ts, useAuth.tsx, SignUp.tsx | pnpm build |

---

## 成功标准

### 验证命令
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-front
pnpm build   # 必须通过，无编译错误
```

### 最终检查清单
- [ ] RegisterRequest 类型包含 name, username, password, confirmPassword, country, role
- [ ] email 字段已从所有注册相关代码中移除
- [ ] api.ts register 函数正确传递参数给后端
- [ ] useAuth.tsx signUp 函数签名与 onSignUp 调用匹配
- [ ] SignUp.tsx 不再有 undefined 变量错误
- [ ] pnpm build 成功通过
