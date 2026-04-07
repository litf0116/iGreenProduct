# Problem Ticket Site 自动填充 - curl 测试命令

## 前置准备

1. 启动后端服务：
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-backend
mvn spring-boot:run
# 或使用: make dev
```

2. 确认服务运行：
```bash
curl http://localhost:8080/actuator/health
```

---

## 测试步骤

### 步骤 1: 登录获取 JWT Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "platform": "admin",
    "country": "China"
  }'
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
  }
}
```

**提取 Token**：
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","platform":"admin","country":"China"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"
```

---

### 步骤 2: 获取必要的 ID

#### 2.1 获取 Corrective Ticket ID 和 Site ID

```bash
curl -X GET "http://localhost:8080/api/tickets?type=corrective&page=1&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**提取第一个 Corrective Ticket**：
```bash
CORRECTIVE_TICKET=$(curl -s -X GET "http://localhost:8080/api/tickets?type=corrective&page=1&size=10" \
  -H "Authorization: Bearer $TOKEN")

CORRECTIVE_ID=$(echo "$CORRECTIVE_TICKET" | jq -r '.data.records[0].id')
CORRECTIVE_SITE_ID=$(echo "$CORRECTIVE_TICKET" | jq -r '.data.records[0].siteId')
CORRECTIVE_SITE_NAME=$(echo "$CORRECTIVE_TICKET" | jq -r '.data.records[0].siteName')

echo "Corrective ID: $CORRECTIVE_ID"
echo "Site ID: $CORRECTIVE_SITE_ID"
echo "Site Name: $CORRECTIVE_SITE_NAME"
```

#### 2.2 获取 Template ID

```bash
TEMPLATES=$(curl -s -X GET "http://localhost:8080/api/templates?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN")

TEMPLATE_ID=$(echo "$TEMPLATES" | jq -r '.data.records[] | select(.type == "problem") | .id' | head -1)

echo "Template ID: $TEMPLATE_ID"
```

#### 2.3 获取 Group ID

```bash
GROUPS=$(curl -s -X GET "http://localhost:8080/api/groups?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN")

GROUP_ID=$(echo "$GROUPS" | jq -r '.data.records[0].id')

echo "Group ID: $GROUP_ID"
```

#### 2.4 获取 Problem Type ID

```bash
PROBLEM_TYPES=$(curl -s -X GET "http://localhost:8080/api/problem-types" \
  -H "Authorization: Bearer $TOKEN")

PROBLEM_TYPE_ID=$(echo "$PROBLEM_TYPES" | jq -r '.data[0].id')

echo "Problem Type ID: $PROBLEM_TYPE_ID"
```

---

### 步骤 3: 测试场景

#### ✅ 场景 1: 自动填充 Site（不提供 siteId）

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - 自动填充 Site",
    "description": "测试从 relatedTicketIds 自动推断 siteId",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": ["'"$CORRECTIVE_ID"'"],
    "siteId": null
  }' | jq
```

**期望结果**：
- ✅ 创建成功
- ✅ `siteId` 自动填充为 `$CORRECTIVE_SITE_ID`
- ✅ `siteName` 显示正确的站点名称

---

#### ✅ 场景 2: 保留手动指定的 Site

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - 手动指定 Site",
    "description": "测试保留用户手动指定的 siteId",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": ["'"$CORRECTIVE_ID"'"],
    "siteId": "'"$CORRECTIVE_SITE_ID"'"
  }' | jq
```

**期望结果**：
- ✅ 创建成功
- ✅ `siteId` 保持为用户指定的值（不被覆盖）

---

#### ✅ 场景 3: 无 Related Tickets（Site 为空）

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试问题工单 - 无 Related Tickets",
    "description": "测试没有 relatedTicketIds 时 site 为空",
    "type": "problem",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "problemType": "'"$PROBLEM_TYPE_ID"'",
    "relatedTicketIds": [],
    "siteId": null
  }' | jq
```

**期望结果**：
- ✅ 创建成功
- ✅ `siteId` 为空（null）

---

#### ✅ 场景 4: 非 Problem 类型验证（必须提供 Site）

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试纠错工单 - 必须有 Site",
    "description": "测试 corrective 类型必须提供 siteId",
    "type": "corrective",
    "templateId": "'"$TEMPLATE_ID"'",
    "assignedTo": "'"$GROUP_ID"'",
    "dueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S" -d "+7 days")'",
    "siteId": null
  }' | jq
```

**期望结果**：
- ❌ 创建失败
- ✅ 错误码：`SITE_NOT_FOUND`
- ✅ 错误消息：提示 siteId 必填

---

## 一键测试脚本

执行完整测试：

```bash
./tests/backend/test-problem-ticket-autofill.sh
```

或快速测试：

```bash
./tests/backend/quick-test.sh
```

---

## 验证要点

### ✅ 成功标志

1. **场景 1**（自动填充）：
   - `success: true`
   - `data.siteId` = `$CORRECTIVE_SITE_ID`
   - 日志中有：`Auto-filled siteId xxx for problem ticket from related ticket xxx`

2. **场景 2**（保留手动值）：
   - `success: true`
   - `data.siteId` = 用户指定的值

3. **场景 3**（无 related）：
   - `success: true`
   - `data.siteId` = null

4. **场景 4**（验证必填）：
   - `success: false`
   - `code: "SITE_NOT_FOUND"`

### ❌ 失败排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Token 为空 | 登录失败 | 检查用户名密码 |
| Template ID 为空 | 没有模板 | 先创建模板 |
| Group ID 为空 | 没有用户组 | 先创建用户组 |
| Corrective ID 为空 | 没有 corrective ticket | 先创建 corrective ticket |
| Site 未填充 | 后端逻辑未生效 | 检查代码是否正确部署 |

---

## 日志查看

后端日志中应该能看到：

```log
INFO [TicketService] Auto-filled siteId 123 for problem ticket from related ticket 456
```

如果看到警告：

```log
WARN [TicketService] Invalid related ticket ID format: xxx
```

说明 related ticket ID 格式错误。

---

## 数据库验证

查询刚创建的 problem ticket：

```sql
SELECT 
  id, 
  title, 
  type, 
  site_id, 
  related_ticket_ids,
  problem_type
FROM tickets 
WHERE type = 'problem' 
ORDER BY created_at DESC 
LIMIT 5;
```

验证 `site_id` 字段是否正确填充。