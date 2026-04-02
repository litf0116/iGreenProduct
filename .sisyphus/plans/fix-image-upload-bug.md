# 修复图片上传Bug - 端口配置不匹配

## TL;DR

> **快速摘要**: 生产环境图片上传失败，根本原因是前端请求端口8088，后端运行端口8089，导致连接被拒绝。修复方案：修改后端配置文件将`app.upload.base-url`改为8089端口，并添加CORS生产域名配置。
>
> **交付物**:
> - 修改 `application-prod.yml` 配置文件
> - 修改 `WebConfig.java` CORS配置
> - 修改 `api.ts` 前端错误提示
> - 验证图片上传功能正常
>
> **预估工作量**: Quick（配置修改，无需重启服务）
> **并行执行**: YES - 3个任务可并行
> **关键路径**: Task1 → Task2 → Task3 → QA验证

---

## 背景

### 原始请求
用户报告生产环境(iGreenApp)拍照后上传图片显示错误"Failed to upload photo"

### 调查总结
**根本原因**: 端口不匹配
- 前端API地址: `http://43.255.212.68:8088` (api.ts硬编码)
- 后端运行端口: **8089** (用户已确认)
- 后端配置base-url: `http://43.255.212.68:8088` (application-prod.yml)
- **结果**: 前端请求8088端口，但后端在8089端口运行 → 连接被拒绝

**其他发现**:
1. CORS配置缺少生产前端域名
2. 文件大小限制不一致(Spring 20MB vs 业务层10MB-50MB)
3. 错误处理不区分具体错误类型

### Metis审查
**识别gap**:
- CORS配置缺口: 生产前端域名未在允许列表中
- 需要确认nginx反向代理配置
- 错误提示需改进为具体类型

---

## 工作目标

### 核心目标
修复端口配置不匹配问题，确保生产环境图片上传功能正常工作

### 具体交付物
- `application-prod.yml` 配置更新（base-url改为8089）
- `WebConfig.java` CORS添加生产域名
- `api.ts` 错误提示改进
- 功能验证：拍照上传成功

### 完成定义
- [ ] 后端配置base-url指向正确端口(8089)
- [ ] CORS包含生产前端域名
- [ ] 前端错误提示区分错误类型
- [ ] 图片上传测试通过（拍照→上传成功）

### 必须包含
- 端口配置修复（8089）
- CORS生产域名配置
- 具体错误提示实现

### 必须不包含（Guardrails）
- 不要修改前端API硬编码地址（可能其他环境依赖）
- 不要修改nginx反向代理配置（超出scope）
- 不要重构整个文件上传模块（过度工程）
- 不要添加文件压缩功能（不在scope内）

---

## 验证策略（强制）

> **零人工干预** - 所有验证由agent执行。禁止验收标准需要"用户手动测试/确认"

### 测试决策
- **基础设施存在**: YES (Spring Boot + React)
- **自动化测试**: Tests-after（先修复后验证）
- **框架**: 后端用curl测试API，前端用Playwright测试UI
- **Agent QA场景**: 每个任务必须包含（见任务模板）

### QA策略
每个任务必须包含agent执行的QA场景，证据保存到`.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`
- **前端/UI**: Playwright - 导航、交互、DOM断言、截图
- **API/后端**: Bash (curl) - 发送请求、断言状态+响应字段
- **配置**: Bash - 验证文件内容、配置值

---

## 执行策略

### 并行执行波次

```
Wave 1 (立即开始 - 配置修复):
├── Task 1: 后端配置修复 [quick]
├── Task 2: CORS配置更新 [quick]
└── Task 3: 前端错误提示改进 [quick]

Wave FINAL (全部完成后 - 4个并行审查):
├── Task F1: 计划合规审计 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: 实际QA测试 (unspecified-high + playwright)
└── Task F4: Scope fidelity检查 (deep)
-> 展示结果 -> 获取用户明确同意

关键路径: Task1-3 → F1-F4 → 用户同意
并行加速: ~70%快于顺序执行
最大并发: 3 (Wave 1)
```

### 依赖矩阵
- **1-3**: 无依赖，可立即并行
- **F1-F4**: 依赖1-3完成

### Agent分派总结
- **Wave1**: **3** - T1→`quick`, T2→`quick`, T3→`quick`
- **FINAL**: **4** - F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

> 实现+测试=一个任务。永不分离。
> 每个任务必须包含：推荐Agent Profile + 并行信息 + QA场景。
> **无QA场景的任务不完整。无例外。**

- [ ] 1. 后端配置文件修复（端口8089）

  **执行内容**:
  - 修改 `igreen-backend/src/main/resources/application-prod.yml`
  - 将 `app.upload.base-url` 从 `http://43.255.212.68:8088` 改为 `http://43.255.212.68:8089`
  - 保持其他配置不变（max-size等）

  **禁止操作**:
  - 不要修改 `server.port`（可能nginx依赖）
  - 不要修改 `app.upload.dir` 或 `max-size`

  **推荐Agent Profile**:
  > 选择category + skills基于任务领域。解释每个选择。
  - **Category**: `quick`
    - 原因: 单文件配置修改，风险低，无复杂逻辑
  - **Skills**: []（无需特殊skill）
  - **Skills评估但省略**: 所有skill - 简单配置修改无需specialized skill

  **并行化**:
  - **可并行执行**: YES
  - **并行组**: Wave 1 (with Tasks 2, 3)
  - **阻塞**: 无后续任务依赖此任务完成
  - **被阻塞**: 无（可立即开始）

  **参考**（关键 - 必须详尽）:

  > executor无采访上下文。参考是其唯一指引。
  > 每个参考必须回答："我应查看什么以及为什么？"

  **模式参考** (现有代码遵循):
  - `igreen-backend/src/main/resources/application.yml:6-11` - Spring multipart配置模式（max-file-size, max-request-size）
  - `igreen-backend/src/main/resources/application.yml:app.upload` - 上传配置section结构（dir, max-size, base-url）

  **配置参考** (目标配置):
  - `igreen-backend/src/main/resources/application-prod.yml:全文` - 生产环境配置文件，需修改第`app.upload.base-url`行

  **为什么每个参考重要**（解释相关性）:
  - application.yml展示配置结构，确保prod配置遵循相同格式
  - application-prod.yml是目标文件，找到需修改的具体行
  - 不要只列出文件 - 解释executor应提取什么模式/信息
  - 坏: `application.yml` (模糊，哪部分？为什么？)
  - 好: `application.yml:6-11` - Spring multipart配置模式作为参考，确保prod配置格式一致

  **验收标准**:

  > **仅AGENT可执行验证** - 禁止人工操作。
  > 每个标准必须可通过命令或工具验证。

  **QA场景（强制 - 无此任务不完整）**:

  > **非可选。无QA场景的任务将被拒绝。**
  >
  > 编写验证构建内容的**实际行为**的场景测试。
  > 最小: 1 happy path + 1 failure/edge case每个任务。
  > 每个场景 = 确切工具 + 确切步骤 + 确切断言 + 证据路径。
  >
  > **执行agent必须在实现后运行这些场景。**
  > **orchestrator将在标记任务完成前验证证据文件存在。**

  ```
  Scenario: 配置文件已更新（Happy path - 应该工作）
    Tool: Bash (cat/grep)
    Preconditions: 文件存在且可读
    Steps:
      1. cat igreen-backend/src/main/resources/application-prod.yml
      2. grep "app.upload.base-url" application-prod.yml
      3. Assert输出包含 "http://43.255.212.68:8089"
    Expected Result: base-url行显示8089端口（不是8088）
    Failure Indicators: 输出仍显示8088或行不存在
    Evidence: .sisyphus/evidence/task-1-config-updated.txt

  Scenario: 配置格式正确（Edge case - 应防止格式错误）
    Tool: Bash (grep)
    Preconditions: 文件已修改
    Steps:
      1. grep -A2 -B2 "app.upload:" application-prod.yml
      2. Assert YAML格式正确（缩进、冒号）
      3. Assert无语法错误（启动失败）
    Expected Result: YAML结构保持正确，无格式错误
    Failure Indicators: YAML语法错误或缺少section
    Evidence: .sisyphus/evidence/task-1-format-valid.txt
  ```

  > **具体性要求 - 每个场景必须使用**:
  > - **选择器**: 特定CSS选择器（`.login-button`，不是"登录按钮"）
  > - **数据**: 具体测试数据（`"test@example.com"`，不是`"[email]"`）
  > - **断言**: 确切值（`text contains "Welcome back"`，不是"验证工作"）
  > - **时序**: 等待条件（`timeout: 10s`）
  > - **负面**: 每个任务至少一个失败/错误场景
  >
  > **反模式（场景无效如果看起来像这样）**:
  > - ❌ "Verify it works correctly" - 如何？什么是"correctly"？
  > - ❌ "Check the API returns data" - 什么数据？什么字段？什么值？
  > - ❌ "Test the component renders" - 哪里？什么选择器？什么内容？
  > - ❌ 无证据路径的任何场景

  **证据捕获**:
  - [ ] 每个证据文件命名: task-{N}-{scenario-slug}.{ext}
  - [ ] UI截图，CLI终端输出，API响应体

  **提交**: YES (与Tasks 2,3分组)
  - Message: `fix(upload): correct port configuration to 8089 in production`
  - Files: `igreen-backend/src/main/resources/application-prod.yml`
  - Pre-commit: `cd igreen-backend && mvn validate`（配置验证）

- [ ] 2. CORS配置添加生产前端域名

  **执行内容**:
  - 修改 `igreen-backend/src/main/java/com/igreen/common/config/WebConfig.java`
  - 在 `addCorsMappings` 方法的 `allowedOrigins` 列表中添加生产前端域名
  - 当前允许: `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000`
  - 添加: 生产域名（需用户确认具体URL，或添加通配符 `http://43.255.212.68:*`）

  **禁止操作**:
  - 不要删除现有的localhost配置（开发需要）
  - 不要修改其他CORS设置（methods, headers等）

  **推荐Agent Profile**:
  - **Category**: `quick`
    - 原因: 单文件配置修改，Java配置类简单编辑
  - **Skills**: []（无需特殊skill）

  **并行化**:
  - **可并行执行**: YES
  - **并行组**: Wave 1 (with Tasks 1, 3)
  - **阻塞**: 无后续任务依赖
  - **被阻塞**: 无

  **参考**:
  - `igreen-backend/src/main/java/com/igreen/common/config/WebConfig.java:addCorsMappings` - CORS配置方法，找到allowedOrigins列表
  - `WebConfig.java:allowedOrigins(Arrays.asList(...))` - 当前允许的域名列表结构

  **验收标准**:
  - [ ] 生产域名添加到allowedOrigins列表
  - [ ] CORS配置编译通过（mvn compile）

  **QA场景**:
  ```
  Scenario: CORS域名已添加（happy path）
    Tool: Bash (grep)
    Preconditions: WebConfig.java已修改
    Steps:
      1. grep -A10 "allowedOrigins" WebConfig.java
      2. Assert输出包含生产域名或通配符
    Expected Result: allowedOrigins列表包含生产域名
    Evidence: .sisyphus/evidence/task-2-cors-added.txt

  Scenario: CORS配置编译成功（failure case）
    Tool: Bash (mvn)
    Steps:
      1. cd igreen-backend && mvn compile
      2. Assert BUILD SUCCESS
    Expected Result: Java代码编译无错误
    Failure Indicators: 编译错误，CORS配置语法错误
    Evidence: .sisyphus/evidence/task-2-compile.txt
  ```

  **提交**: YES (与Tasks 1, 3分组)

- [ ] 3. 前端错误提示改进（区分错误类型）

  **执行内容**:
  - 修改 `iGreenApp/src/lib/api.ts` 的 `uploadFile` 方法（行377-403）
  - 当前: `throw new Error('File upload failed')`（通用错误）
  - 改进: 根据response.status和result.code区分错误类型
  - 错误类型映射:
    - 401: "Authentication failed. Please login again."
    - 400 + FILE_EMPTY: "File is empty. Please select a valid file."
    - 400 + FILE_TOO_LARGE: "File is too large. Maximum size is 10MB."
    - 404: "Upload endpoint not found. Server configuration error."
    - 500: "Server error. Please try again later."
    - 其他: "Upload failed. Please check your connection."

  **禁止操作**:
  - 不要修改API_BASE_URL（其他环境依赖）
  - 不要添加文件压缩功能（超出scope）

  **推荐Agent Profile**:
  - **Category**: `quick`
    - 原因: 错误处理逻辑改进，单文件修改
  - **Skills**: []（无需特殊skill）

  **并行化**:
  - **可并行执行**: YES
  - **并行组**: Wave 1 (with Tasks 1, 2)
  - **阻塞**: 无
  - **被阻塞**: 无

  **参考**:
  - `iGreenApp/src/lib/api.ts:377-403` - uploadFile方法，找到throw Error位置
  - `igreen-backend/src/main/java/com/igreen/common/exception/ErrorCode.java` - 后端错误码定义（FILE_EMPTY, FILE_TOO_LARGE）
  - `iGreenApp/src/components/TicketDetail.tsx:catch` - 前端catch块，查看如何处理uploadFile错误

  **验收标准**:
  - [ ] uploadFile方法根据status和code抛出不同错误消息
  - [ ] 错误消息包含具体原因（非通用"Failed to upload photo")

  **QA场景**:
  ```
  Scenario: 错误提示代码已改进（happy path）
    Tool: Bash (grep)
    Steps:
      1. grep -A20 "uploadFile" iGreenApp/src/lib/api.ts
      2. Assert代码包含多个错误判断（if response.status === 401等）
      3. Assert throw new Error包含具体消息（非通用"File upload failed")
    Expected Result: 错误处理分支存在，消息具体化
    Evidence: .sisyphus/evidence/task-3-error-improved.txt

  Scenario: 前端编译成功（failure case）
    Tool: Bash (npm)
    Steps:
      1. cd iGreenApp && npm run build
      2. Assert编译成功无TypeScript错误
    Expected Result: 前端代码编译通过
    Failure Indicators: TypeScript类型错误，语法错误
    Evidence: .sisyphus/evidence/task-3-frontend-build.txt
  ```

  **提交**: YES (与Tasks 1, 2分组)

---

## Final Verification Wave (强制 - 所有实现任务完成后)

> 4个审查agent并行运行。全部必须批准。展示综合结果给用户并获取明确"同意"后再完成。
>
> **不要在验证后自动继续。等待用户明确批准后再标记工作完成。**
> **不要在获取用户同意前标记F1-F4为checked。** 拒绝或用户反馈 -> fix -> 重跑 -> 再次展示 -> 等待同意。

- [ ] F1. **计划合规审计** — `oracle`
  完整阅读计划。对每个"Must Have": 验证实现存在（读文件，curl端点，运行命令）。对每个"Must NOT Have": 搜索代码库禁止模式 - 如发现则用file:line拒绝。检查证据文件存在于.sisyphus/evidence/。对比交付物与计划。
  输出: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **代码质量审查** — `unspecified-high`
  运行 `tsc --noEmit` + linter + `bun test`。审查所有修改文件: `as any`/`@ts-ignore`，空catch，console.log在prod，注释代码，未用imports。检查AI slop: 过多注释，过度抽象，通用名（data/result/item/temp）。
  输出: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **实际QA测试** — `unspecified-high` (+ `playwright` skill if UI)
  从干净状态开始。执行每个任务的每个QA场景 - 遵循确切步骤，捕获证据。测试跨任务集成（功能一起工作，非孤立）。测试edge cases: 空状态，无效输入，快速动作。保存到 `.sisyphus/evidence/final-qa/`。
  输出: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity检查** — `deep`
  对每个任务: 读"What to do"，读实际diff (git log/diff)。验证1:1 - spec中的所有已构建（无缺失），无超出spec的构建（无蔓延）。检查"Must NOT do"合规。检测跨任务污染: Task N触碰Task M的文件。标记未说明变更。
  输出: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## 提交策略

- **1**: `fix(upload): correct backend port configuration and CORS` — application-prod.yml, WebConfig.java, api.ts
  - Pre-commit: `cd igreen-backend && mvn validate && cd ../iGreenApp && npm run build`

---

## 成功标准

### 验证命令
```bash
# 后端配置验证
cd igreen-backend
grep "app.upload.base-url" src/main/resources/application-prod.yml
# Expected: http://43.255.212.68:8089

# CORS配置验证
grep "43.255.212.68" src/main/java/com/igreen/common/config/WebConfig.java
# Expected: 域名在allowedOrigins列表中

# API测试（需要token）
curl -X POST http://43.255.212.68:8089/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"
# Expected: {"success":true, "data":{"id":"...", "url":"..."}}
```

### 最终清单
- [ ] 所有"Must Have"存在
- [ ] 所有"Must NOT Have"缺失
- [ ] 所有测试通过
- [ ] 图片上传功能验证（拍照→上传成功）
- [ ] 证据文件完整（task-1至F3）