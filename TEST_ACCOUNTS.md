# 测试账号密码记录

## 后端服务
- URL: http://localhost:8000

## 测试账号

### 管理员账号
| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| 123 | 123456 | ADMIN | 系统管理员 |

### 工程师账号
| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| lisi | password123 | ENGINEER | 工程师 |
| engineer_1768922385 | (自动生成) | ENGINEER | 测试工程师 |
| testuser_3 | (自动生成) | ENGINEER | 测试工程师 |

## API 登录示例

### 管理员登录
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "123", "password": "123456", "country": "CN"}'
```

### 工程师登录
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "lisi", "password": "password123", "country": "CN"}'
```

## 响应格式
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 7200,
    "tokenType": "Bearer"
  }
}
```

> 注意: 使用 accessToken 访问需要认证的 API 接口
