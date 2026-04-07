# Problem Ticket Site 自动填充功能测试

## 测试场景

### 测试 1：前端自动填充（正常流程）

**步骤**：
1. 打开管理员系统：http://localhost:5173
2. 登录管理员账户
3. 进入 "Tickets" → "Create Ticket"
4. 选择模板（Problem 类型）
5. 填写基本信息：
   - Title: "测试问题工单"
   - Description: "测试 site 自动填充功能"
   - Ticket Type: Problem
   - Problem Type: 选择一个类型
6. **关键步骤**：选择 Relevant Corrective Tickets
   - 从下拉列表中选择一个或多个 corrective tickets
   - 观察下方是否出现 Site 字段
   - 验证 Site 字段是否自动填充为第一个 corrective ticket 的 site
   - 验证 Site 字段是否为只读（灰色背景）
7. 填写其他必填字段
8. 提交工单

**预期结果**：
- ✅ 选择 corrective tickets 后，Site 字段自动出现
- ✅ Site 字段自动填充正确的站点名称
- ✅ Site 字段显示为只读（disabled 状态）
- ✅ 提示文字显示：*Site is automatically inherited from the first selected corrective ticket*
- ✅ 工单创建成功，siteId 正确保存

### 测试 2：多个不同 site 的 corrective tickets

**步骤**：
1. 创建 problem ticket
2. 选择多个具有不同 site 的 corrective tickets
   - Ticket A: Site = "站点 A"
   - Ticket B: Site = "站点 B"
3. 观察 Site 字段

**预期结果**：
- ✅ Site 字段填充为第一个选中 ticket 的 site
- ✅ 如果先选 Ticket A，则填充 "站点 A"
- ✅ 如果先选 Ticket B，则填充 "站点 B"

### 测试 3：不选择 corrective tickets

**步骤**：
1. 创建 problem ticket
2. **不选择**任何 corrective tickets
3. 观察表单

**预期结果**：
- ✅ Site 字段不显示
- ✅ 工单可以正常创建（siteId 为空）
- ✅ 后端不会报错

### 测试 4：后端兜底逻辑验证

**场景**：前端未提供 siteId（模拟前端错误或 API 直接调用）

**测试方法**：
使用 curl 或 Postman 直接调用后端 API：

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "title": "后端测试问题工单",
    "description": "测试后端自动推断 site",
    "type": "problem",
    "templateId": "template-uuid",
    "assignedTo": "group-uuid",
    "dueDate": "2025-12-31T23:59:59",
    "problemType": "problem-type-uuid",
    "relatedTicketIds": ["corrective-ticket-id-1", "corrective-ticket-id-2"],
    "siteId": null
  }'
```

**预期结果**：
- ✅ 后端从第一个 relatedTicketIds 的 ticket 提取 siteId
- ✅ 工单创建成功，siteId 自动填充
- ✅ 日志输出：*Auto-filled siteId xxx for problem ticket from related ticket xxx*

### 测试 5：非 Problem 类型工单

**步骤**：
1. 创建 corrective 或 planned 类型工单
2. 观察表单

**预期结果**：
- ✅ Site 字段正常显示（非只读）
- ✅ Site 字段为必填项
- ✅ 不提交 siteId 时报错：*Site not found*

---

## 验证清单

### 前端验证
- [ ] 选择 corrective tickets 后，site 自动填充
- [ ] Site 字段为只读状态（灰色背景）
- [ ] 显示提示文字说明来源
- [ ] 多个 tickets 时使用第一个的 site
- [ ] 不选择 tickets 时 site 字段不显示
- [ ] 提交时 siteId 正确传递

### 后端验证
- [ ] Problem ticket 无 siteId 但有 relatedTicketIds 时自动推断
- [ ] 日志正确记录推断过程
- [ ] 异常情况处理（related ticket 不存在、ID 格式错误）
- [ ] 已有 siteId 时不会被覆盖
- [ ] 非 Problem 类型不受影响

### 数据库验证
- [ ] 创建的 problem ticket 的 site_id 字段正确保存
- [ ] 可以通过 SQL 查询验证：
  ```sql
  SELECT id, title, type, site_id, related_ticket_ids 
  FROM tickets 
  WHERE type = 'problem' 
  ORDER BY created_at DESC 
  LIMIT 5;
  ```

---

## 测试数据准备

### 前置条件
1. 至少有 2 个站点数据
2. 至少有 3 个 corrective tickets（关联不同站点）
3. 有 problem type 配置
4. 有有效的用户组和模板

### SQL 查询辅助数据
```sql
-- 查询所有 corrective tickets 及其 site
SELECT t.id, t.title, t.site_id, s.name as site_name
FROM tickets t
LEFT JOIN sites s ON t.site_id = s.id
WHERE t.type = 'corrective'
ORDER BY t.created_at DESC;

-- 查询所有站点
SELECT id, code, name, address
FROM sites
WHERE status = 'ONLINE';
```

---

## 常见问题排查

### Q1: Site 字段未自动填充
**检查**：
- 确认选择的 ticket 类型是否为 corrective
- 检查 corrective ticket 是否有 siteId
- 查看浏览器控制台是否有错误

### Q2: Site 字段未显示
**检查**：
- 确认是否选择了至少一个 corrective ticket
- 检查 ticket type 是否为 problem
- 查看前端代码 useEffect 是否正确触发

### Q3: 后端未自动推断
**检查**：
- 查看后端日志是否有 "Auto-filled siteId" 消息
- 确认 relatedTicketIds 是否正确传递
- 检查 related ticket 是否存在且有 siteId

---

## 性能测试

### 并发测试
使用 Apache Bench 或 wrk 进行压力测试：

```bash
# 创建 100 个 problem tickets
ab -n 100 -c 10 -p problem_ticket.json -T application/json \
  -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/tickets
```

**预期**：
- 所有请求成功
- Site 正确填充
- 响应时间 < 500ms

---

## 回归测试

测试其他类型工单创建流程，确保未受影响：

- [ ] Corrective ticket 创建正常
- [ ] Planned ticket 创建正常
- [ ] Preventive ticket 创建正常
- [ ] 所有类型的 site 验证逻辑正常