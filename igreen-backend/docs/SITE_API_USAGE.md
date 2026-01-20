# Site 模块 API 使用文档

## 概述

本文档提供了 Site 模块 REST API 的详细使用说明、请求示例和响应格式。

## 基础信息

- **Base URL**: `http://localhost:8000`
- **认证方式**: Bearer Token
- **Content-Type**: `application/json`

## 认证

所有 API 请求（除登录外）需要在请求头中携带认证 Token：

```http
Authorization: Bearer <your_token>
```

### 获取 Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "country": "CN"
}
```

响应示例：

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 7200,
    "tokenType": "Bearer"
  },
  "code": "200"
}
```

## API 端点

### 1. 获取站点列表

**端点**: `GET /api/sites`

**权限**: 所有登录用户

**请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 | 约束 |
|------|------|--------|---------|------|
| page | int | 否 | 1 | 页码 | >=1, <=100 |
| size | int | 否 | 10 | 每页数量 | >=1, <=100 |
| keyword | string | 否 | - | 搜索关键字（匹配名称或地址） | 需要URL编码 |
| level | string | 否 | - | 站点级别 | vip, enterprise, normal |
| status | string | 否 | - | 站点状态 | ONLINE, OFFLINE, UNDER_CONSTRUCTION |

**请求示例**:

```bash
# 默认分页
GET /api/sites

# 自定义分页
GET /api/sites?page=1&size=20

# 按级别筛选
GET /api/sites?level=vip

# 按状态筛选
GET /api/sites?status=ONLINE

# 组合筛选
GET /api/sites?page=1&size=10&level=vip&status=ONLINE

# 关键字筛选（需要URL编码）
GET /api/sites?keyword=%E4%B8%8A%E6%B5%B7
```

**响应示例**:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "records": [
      {
        "id": "test-site-vip-001",
        "name": "上海陆家嘴超级充电站",
        "address": "上海市浦东新区陆家嘴环路1000号东方明珠旁",
        "level": "vip",
        "status": "ONLINE",
        "createdAt": "2026-01-21T02:18:05",
        "updatedAt": "2026-01-21T02:18:05"
      }
    ],
    "total": 14,
    "current": 1,
    "size": 10,
    "hasNext": true
  },
  "code": "200"
}
```

### 2. 获取站点统计

**端点**: `GET /api/sites/stats`

**权限**: 所有登录用户

**请求示例**:

```bash
GET /api/sites/stats
```

**响应示例**:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalSites": 66,
    "onlineSites": 42,
    "offlineSites": 14,
    "vipSites": 16
  },
  "code": "200"
}
```

### 3. 获取站点详情

**端点**: `GET /api/sites/{id}`

**权限**: 所有登录用户

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| id | string | 是 | 站点ID |

**请求示例**:

```bash
GET /api/sites/test-site-vip-001
```

**响应示例（成功）**:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "test-site-vip-001",
    "name": "上海陆家嘴超级充电站",
    "address": "上海市浦东新区陆家嘴环路1000号东方明珠旁",
    "level": "vip",
    "status": "ONLINE",
    "createdAt": "2026-01-21T02:18:05",
    "updatedAt": "2026-01-21T02:18:05"
  },
  "code": "200"
}
```

**响应示例（站点不存在）**:

```json
{
  "success": false,
  "message": "站点不存在",
  "data": null,
  "code": "SITE_NOT_FOUND"
}
```

### 4. 创建站点

**端点**: `POST /api/sites`

**权限**: ADMIN, MANAGER

**请求体**:

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|--------|--------|------|
| name | string | 是 | 非空，最大255字符 | 站点名称（唯一） |
| address | string | 否 | 最大1000字符 | 站点地址 |
| level | string | 否 | 最大50字符 | 站点级别（vip, enterprise, normal） |
| status | string | 否 | ONLINE, OFFLINE, UNDER_CONSTRUCTION | 站点状态 |

**请求示例**:

```bash
POST /api/sites
Content-Type: application/json

{
  "name": "新站点",
  "address": "测试地址",
  "level": "normal",
  "status": "ONLINE"
}
```

**响应示例（成功）**:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "d9e30c7e-1a39-4374-a4b1-11a8120b0597",
    "name": "新站点",
    "address": "测试地址",
    "level": "normal",
    "status": "ONLINE",
    "createdAt": "2026-01-21T02:15:42",
    "updatedAt": "2026-01-21T02:15:42"
  },
  "code": "200"
}
```

**响应示例（名称为空）**:

```json
{
  "success": false,
  "message": "不能为空",
  "data": null,
  "code": "VALIDATION_ERROR"
}
```

**响应示例（名称重复）**:

```json
{
  "success": false,
  "message": "站点已存在",
  "data": null,
  "code": "SITE_EXISTS"
}
```

### 5. 更新站点

**端点**: `POST /api/sites/{id}`

**权限**: ADMIN, MANAGER

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| id | string | 是 | 站点ID |

**请求体**:

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|--------|--------|------|
| name | string | 否 | 非空，最大255字符 | 站点名称 |
| address | string | 否 | 最大1000字符 | 站点地址 |
| level | string | 否 | 最大50字符 | 站点级别 |
| status | string | 否 | ONLINE, OFFLINE, UNDER_CONSTRUCTION | 站点状态 |

**请求示例**:

```bash
POST /api/sites/test-site-vip-001
Content-Type: application/json

{
  "name": "更新后的站点名称",
  "status": "OFFLINE"
}
```

**响应示例（成功）**:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "test-site-vip-001",
    "name": "更新后的站点名称",
    "address": "上海市浦东新区陆家嘴环路1000号东方明珠旁",
    "level": "vip",
    "status": "OFFLINE",
    "createdAt": "2026-01-21T02:18:05",
    "updatedAt": "2026-01-21T02:20:15"
  },
  "code": "200"
}
```

**响应示例（站点不存在）**:

```json
{
  "success": false,
  "message": "站点不存在",
  "data": null,
  "code": "SITE_NOT_FOUND"
}
```

### 6. 删除站点

**端点**: `DELETE /api/sites/{id}`

**权限**: ADMIN

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| id | string | 是 | 站点ID |

**请求示例**:

```bash
DELETE /api/sites/test-site-vip-001
```

**响应示例（成功）**:

```json
{
  "success": true,
  "message": "Success",
  "data": null,
  "code": "200"
}
```

**响应示例（站点不存在）**:

```json
{
  "success": false,
  "message": "站点不存在",
  "data": null,
  "code": "SITE_NOT_FOUND"
}
```

## 响应格式说明

所有 API 响应遵循统一格式：

```json
{
  "success": boolean,      // 请求是否成功
  "message": string,       // 响应消息
  "data": object|null,   // 响应数据（成功时存在）
  "code": string         // 响应码（"200"表示成功）
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| VALIDATION_ERROR | 参数验证失败 |
| SITE_NOT_FOUND | 站点不存在 |
| SITE_EXISTS | 站点已存在 |
| INTERNAL_ERROR | 服务器内部错误 |
| UNAUTHORIZED | 未认证 |
| FORBIDDEN | 无权限 |

## URL 编码说明

### 为什么需要 URL 编码

当请求参数包含中文字符时，直接传递会导致 400 错误。需要使用 URL 编码。

### URL 编码方法

#### 方法1：前端使用 encodeURIComponent

```javascript
const keyword = "上海";
const encodedKeyword = encodeURIComponent(keyword);
// encodedKeyword = "%E4%B8%8A%E6%B5%B7"

fetch(`/api/sites?keyword=${encodedKeyword}`);
```

#### 方法2：使用 URLSearchParams API

```javascript
const params = new URLSearchParams({
  keyword: "上海",
  level: "vip",
  status: "ONLINE"
});

fetch(`/api/sites?${params.toString()}`);
```

#### 方法3：后端自动处理（推荐）

如果后端支持自动 URL 解码，前端可以直接传递：

```javascript
fetch('/api/sites?keyword=上海&level=vip');
```

### 手动 URL 编码示例

| 原文 | URL 编码 |
|------|---------|
| 上海 | %E4%B8%8A%E6%B5%B7 |
| 北京 | %E5%8C%97%E4%BA%AC |
| 深圳 | %E6%B7%B1%E5%9C%B3 |
| ONLINE | ONLINE |
| vip | vip |

## 分页说明

站点列表接口使用标准的分页参数：

- **page**: 页码，从 1 开始
- **size**: 每页数量，建议值 10, 20, 50, 100

响应中的分页信息：

```json
{
  "data": {
    "records": [...],      // 当前页数据
    "total": 100,          // 总记录数
    "current": 1,          // 当前页码
    "size": 10,            // 每页数量
    "hasNext": true         // 是否有下一页
  }
}
```

## 权限说明

| 角色 | 查询 | 统计 | 详情 | 创建 | 更新 | 删除 |
|------|------|------|------|------|------|
| ENGINEER | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| MANAGER | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 站点状态说明

| 状态 | 值 | 说明 |
|------|-----|------|
| ONLINE | ONLINE | 在线，正常运营 |
| OFFLINE | OFFLINE | 离线，暂停服务 |
| UNDER_CONSTRUCTION | UNDER_CONSTRUCTION | 建设中，正在施工 |

## 站点级别说明

| 级别 | 值 | 说明 |
|------|-----|------|
| VIP | vip | VIP级别，高优先级服务 |
| Enterprise | enterprise | 企业级，中型站点 |
| Normal | normal | 普通级别，基础站点 |

## 使用示例

### JavaScript/Fetch

```javascript
// 获取 Token
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'password123',
    country: 'CN'
  })
});
const { data } = await loginResponse.json();
const token = data.accessToken;

// 获取站点列表
const sitesResponse = await fetch('http://localhost:8000/api/sites?page=1&size=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const { data: sitesData } = await sitesResponse.json();

console.log('站点列表:', sitesData.records);
console.log('总数:', sitesData.total);
```

### cURL

```bash
# 1. 登录获取 Token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123", "country": "CN"}' \
  | jq -r '.data.accessToken')

# 2. 获取站点列表
curl -s -X GET "http://localhost:8000/api/sites?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 3. 创建站点
curl -s -X POST http://localhost:8000/api/sites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新站点",
    "address": "测试地址",
    "level": "normal",
    "status": "ONLINE"
  }' \
  | jq '.'
```

### Postman

1. **设置环境变量**：
   - `base_url`: `http://localhost:8000`
   - `token`: 通过登录接口获取

2. **添加请求头**：
   ```
   Authorization: Bearer {{token}}
   Content-Type: application/json
   ```

3. **示例请求**：
   - GET `{{base_url}}/api/sites?page=1&size=10`
   - POST `{{base_url}}/api/sites`
     ```json
     {
       "name": "新站点",
       "address": "测试地址",
       "level": "normal",
       "status": "ONLINE"
     }
     ```

## 最佳实践

1. **使用分页**: 避免一次性加载大量数据，使用合理的 page 和 size 参数
2. **缓存数据**: 站点列表变化不频繁，可以适当缓存
3. **错误处理**: 始终检查 `success` 字段，并根据 `code` 进行错误处理
4. **URL 编码**: 包含中文字符的参数必须进行 URL 编码
5. **Token 管理**: Token 有效期为 2 小时（7200秒），需要定期刷新
6. **权限检查**: 前端应根据用户角色控制功能按钮的显示
