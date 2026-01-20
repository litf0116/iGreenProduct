# Site 模块 - 文档索引

## 快速导航

本文档目录提供了 Site 模块的所有相关文档和测试资源。

## 文档列表

### 1. API 使用指南
**文件**: `docs/SITE_API_USAGE.md`

**内容**:
- 所有 API 端点的详细说明
- 请求/响应示例
- URL 编码处理方法
- 权限说明
- 错误码说明
- 分页使用指南
- JavaScript/cURL/Postman 使用示例

**适合**: 前端开发者、API 集成者

---

### 2. API 测试报告
**文件**: `docs/SITE_API_TEST_REPORT.md`

**内容**:
- 完整的测试结果（22个测试用例）
- 测试通过率（81.8%）
- 发现的问题和改进建议
- API 接口状态总结
- 测试数据清理方法

**适合**: QA 工程师、开发人员、项目经理

---

### 3. 优化总结
**文件**: `docs/SITE_OPTIMIZATION_SUMMARY.md`

**内容**:
- 4条改进建议的详细说明
- 每条改进的实施状态
- 代码示例和解决方案
- 优先级和预计工作量
- 下一步行动计划

**适合**: 技术负责人、架构师

---

### 4. 测试数据文档
**文件**: `docs/SITE_TEST_DATA.md`

**内容**:
- 66个测试站点的详细列表
- 按级别分类（VIP/Enterprise/Normal）
- 按地区分布（上海/北京/深圳/广州/杭州/成都）
- 按状态统计（ONLINE/OFFLINE/UNDER_CONSTRUCTION）
- 测试场景覆盖说明

**适合**: 测试工程师、数据准备人员

## 测试脚本

### 1. Bash 测试脚本
**文件**: `scripts/test_site_api.sh`

**使用方法**:
```bash
./scripts/test_site_api.sh [BASE_URL] [TOKEN]

# 示例
./scripts/test_site_api.sh http://localhost:8000 your_token_here
```

**功能**:
- 自动化 API 测试
- 彩色输出
- 测试结果统计

---

### 2. Node.js 测试脚本
**文件**: `scripts/test_site_api.mjs`

**使用方法**:
```bash
node scripts/test_site_api.mjs [BASE_URL] [TOKEN]

# 示例
node scripts/test_site_api.mjs http://localhost:8000 your_token_here
```

**功能**:
- 详细的测试输出
- JSON 格式化
- 测试结果统计

## 测试数据

### 测试数据生成脚本
**文件**: `scripts/generate_site_test_data.sql`

**使用方法**:
```bash
mysql -u root -p -h 127.0.0.1 -P 3306 igreen_db < scripts/generate_site_test_data.sql
```

**数据统计**:
- 总站点数: 66
- VIP 站点: 16
- Enterprise 站点: 15
- Normal 站点: 35
- ONLINE 状态: 42
- OFFLINE 状态: 16
- UNDER_CONSTRUCTION 状态: 11

## API 端点速查

| 端点 | 方法 | 权限 | 文档 |
|------|------|------|------|
| `/api/sites` | GET | 所有登录用户 | [使用指南](./SITE_API_USAGE.md#1-获取站点列表) |
| `/api/sites/stats` | GET | 所有登录用户 | [使用指南](./SITE_API_USAGE.md#2-获取站点统计) |
| `/api/sites/{id}` | GET | 所有登录用户 | [使用指南](./SITE_API_USAGE.md#3-获取站点详情) |
| `/api/sites` | POST | ADMIN, MANAGER | [使用指南](./SITE_API_USAGE.md#4-创建站点) |
| `/api/sites/{id}` | POST | ADMIN, MANAGER | [使用指南](./SITE_API_USAGE.md#5-更新站点) |
| `/api/sites/{id}` | DELETE | ADMIN | [使用指南](./SITE_API_USAGE.md#6-删除站点) |

## 测试结果总结

| 指标 | 数值 |
|------|------|
| 总测试数 | 22 |
| 通过 | 18 |
| 失败 | 4 |
| 通过率 | 81.8% |

## 改进状态

| 改进项 | 状态 | 优先级 |
|--------|------|--------|
| 参数验证优化 | ✅ 已完成 | 高 |
| 文档完善 | ✅ 已完成 | 中 |
| 统一错误响应 | ⚠️ 待优化 | 高 |
| 测试覆盖扩展 | ⚠️ 建议补充 | 中 |

## 快速开始

### 作为前端开发者

1. 查看 `docs/SITE_API_USAGE.md` 了解 API 使用方法
2. 参考 `docs/SITE_API_USAGE.md#url-编码说明` 处理中文参数
3. 使用提供的 JavaScript 示例代码进行集成

### 作为测试工程师

1. 运行 `scripts/generate_site_test_data.sql` 加载测试数据
2. 执行 `scripts/test_site_api.sh` 或 `scripts/test_site_api.mjs` 进行测试
3. 查看 `docs/SITE_API_TEST_REPORT.md` 了解测试详情

### 作为后端开发者

1. 查看 `docs/SITE_OPTIMIZATION_SUMMARY.md` 了解优化建议
2. 实施"统一错误响应"改进
3. 补充单元测试（并发、边界值、性能测试）

## 常见问题

### Q1: 为什么中文关键字需要 URL 编码？

**A**: 直接传递中文字符会导致 400 错误。参考 `docs/SITE_API_USAGE.md#url-编码说明` 了解三种编码方法。

### Q2: 测试脚本如何获取 Token？

**A**:
```bash
# 获取 Token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123", "country": "CN"}' \
  | jq -r '.data.accessToken')

# 使用 Token
./scripts/test_site_api.sh http://localhost:8000 $TOKEN
```

### Q3: 如何清理测试数据？

**A**: 执行以下 SQL：
```sql
DELETE FROM sites WHERE id LIKE 'test-site-%';
DELETE FROM site_level_configs WHERE id LIKE 'slc-test-%';
```

### Q4: 优化建议何时实施？

**A**: 参考优先级：
- **高**: 立即执行（1-2天）
- **中**: 本月内执行（1周）
- **低**: 本季度内执行（1个月）

## 贡献者

- **日期**: 2026-01-21
- **开发者**: litengfei
- **审核状态**: 待审核

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-01-21 | 初始版本 - 完成 API 测试和基础文档 |

## 联系方式

如有问题或建议，请联系：
- **GitHub Issues**: [项目仓库]/issues
- **文档问题**: 查阅对应文档
