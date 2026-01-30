# iGreenProduct API 路径配置

## 1. Spring Boot API 路径映射

### 控制器路径配置

| 控制器 | 基础路径 | 完整API路径示例 |
|--------|----------|------------------|
| **AuthController** | `/api/auth` | `/api/auth/login`, `/api/auth/register` |
| **UserController** | `/api/users` | `/api/users`, `/api/users/{id}` |
| **GroupController** | `/api/groups` | `/api/groups`, `/api/groups/{id}` |
| **TicketController** | `/api/tickets` | `/api/tickets`, `/api/tickets/{id}` |
| **SiteController** | `/api/sites` | `/api/sites`, `/api/sites/{id}` |
| **FileController** | `/api/files` | `/api/files/upload`, `/api/files/{id}` |
| **TemplateController** | `/api/templates` | `/api/templates`, `/api/templates/{id}` |
| **ConfigController** | `/api/configs` | `/api/configs`, `/api/configs/{id}` |
| **HealthController** | `/api` | `/api/health` |

### 特殊路径

| 路径 | 用途 | 配置位置 |
|------|------|----------|
| `/api/docs` | Swagger API文档 | Spring Boot配置 |
| `/api/swagger-ui.html` | Swagger UI界面 | Spring Boot配置 |
| `/actuator/health` | 健康检查端点 | Spring Boot Actuator |
| `/uploads/*` | 文件访问 | Nginx静态文件 |

## 2. Nginx 配置 - API 路径处理

### 完整的Nginx配置示例

```nginx
server {
    listen 80;
    server_name igreen.yourdomain.com;
    root /www/wwwroot/igreen.yourdomain.com;

    # API请求反向代理到Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # API请求不缓存
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 文件上传访问 (静态文件)
    location /uploads/ {
        alias /opt/igreen/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 安全限制
        location ~* \.(php|jsp|asp|exe)$ {
            deny all;
            return 403;
        }
    }

    # 前端静态文件 (如果有)
    location / {
        try_files $uri $uri/ /index.html;

        # 静态文件缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 健康检查 (公开访问)
    location /actuator/health {
        proxy_pass http://127.0.0.1:8080;
        access_log off;  # 不记录健康检查日志
    }

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

## 3. API 访问测试

### 测试所有API端点

```bash
#!/bin/bash

BASE_URL="http://igreen.yourdomain.com"

echo "🧪 测试iGreen API端点..."

# 健康检查
echo "📊 健康检查:"
curl -s "$BASE_URL/actuator/health" | jq .

# API文档检查
echo "📚 API文档:"
curl -s "$BASE_URL/api/docs" | head -20

# 用户API
echo "👥 用户API:"
curl -s "$BASE_URL/api/users" | jq .

# 文件上传API (需要认证)
echo "📁 文件API:"
curl -s "$BASE_URL/api/files" | jq .

echo "✅ API测试完成"
```

### 具体API测试

#### 1. 用户登录
```bash
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### 2. 文件上传
```bash
curl -X POST "$BASE_URL/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.jpg" \
  -F "fieldType=photo"
```

#### 3. 获取工单列表
```bash
curl -X GET "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. 生产环境优化

### API性能优化

```nginx
# API限流
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;

    proxy_pass http://127.0.0.1:8080;
    # ... 其他配置
}
```

### CORS配置 (如果前端分离部署)

```nginx
# CORS头
location /api/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";

    # 处理OPTIONS预检请求
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    proxy_pass http://127.0.0.1:8080;
}
```

### SSL/HTTPS配置

```nginx
server {
    listen 443 ssl http2;
    server_name igreen.yourdomain.com;

    ssl_certificate /www/server/panel/vhost/cert/igreen.yourdomain.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/igreen.yourdomain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers off;

    # ... 其他配置
}
```

## 5. 监控和日志

### API访问日志

```nginx
# 详细的API访问日志
log_format api_log '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for" '
                   'rt=$request_time uct="$upstream_connect_time" '
                   'uht="$upstream_header_time" urt="$upstream_response_time"';

location /api/ {
    access_log /www/wwwlogs/igreen.api.log api_log;
    # ... 其他配置
}
```

### 错误日志

```nginx
# 错误日志级别
error_log /www/wwwlogs/igreen.error.log warn;

# API错误单独记录
location /api/ {
    error_log /www/wwwlogs/igreen.api.error.log;
    # ... 其他配置
}
```

## 6. 故障排除

### 常见问题

#### 问题1: API返回404
**检查**: Spring Boot应用是否正常运行
```bash
curl http://127.0.0.1:8080/actuator/health
```

**检查**: Nginx配置是否正确
```bash
nginx -t
nginx -s reload
```

#### 问题2: API超时
**解决**: 增加Nginx超时时间
```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

#### 问题3: CORS错误
**解决**: 添加CORS头配置
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
add_header Access-Control-Allow-Headers "Authorization, Content-Type";
```

### 日志分析

```bash
# 查看API访问日志
tail -f /www/wwwlogs/igreen.api.log

# 统计API访问量
awk '{print $6}' /www/wwwlogs/igreen.api.log | sort | uniq -c | sort -nr

# 查看错误日志
tail -f /www/wwwlogs/igreen.api.error.log
```

---

*API基础路径: `/api/`*
*文件访问路径: `/uploads/`*
*健康检查: `/actuator/health`*</content>
<parameter name="filePath">API_CONFIG.md