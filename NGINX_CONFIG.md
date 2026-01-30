# iGreenProduct Nginx 配置指南

## 1. 宝塔面板创建站点

### 步骤1: 添加站点
1. 登录宝塔面板 (https://180.188.45.250:13189/7d423390)
2. 点击 **网站** → **添加站点**
3. 填写域名信息：
   - **域名**: `igreen.yourdomain.com` (或您的实际域名)
   - **根目录**: `/www/wwwroot/igreen.yourdomain.com`
   - **PHP版本**: 选择 **纯静态** (因为我们用Java后端)

### 步骤2: 配置反向代理
1. 进入站点设置 → **配置文件**
2. 在 `server` 配置块中添加反向代理：

```nginx
# 反向代理到Spring Boot应用
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket支持 (如果需要)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 2. 文件上传访问配置

### 步骤3: 配置文件上传路径
在同一个配置文件中添加：

```nginx
# 文件上传访问配置
location /uploads/ {
    alias /opt/igreen/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";

    # 安全配置
    location ~* \.(php|jsp|asp|exe)$ {
        deny all;
        return 403;
    }

    # 允许的MIME类型
    location ~* \.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$ {
        add_header Content-Type $content_type;
        try_files $uri =404;
    }

    # 记录访问日志
    access_log /www/wwwlogs/igreen.uploads.log;
}
```

## 3. 完整配置文件示例

### 宝塔面板配置文件位置
- 路径: `/www/server/panel/vhost/nginx/igreen.yourdomain.com.conf`

### 完整配置内容

```nginx
server {
    listen 80;
    server_name igreen.yourdomain.com;
    index index.php index.html index.htm default.php default.htm default.html;
    root /www/wwwroot/igreen.yourdomain.com;

    # SSL配置 (如果有SSL证书)
    # listen 443 ssl http2;
    # ssl_certificate /www/server/panel/vhost/cert/igreen.yourdomain.com/fullchain.pem;
    # ssl_certificate_key /www/server/panel/vhost/cert/igreen.yourdomain.com/privkey.pem;

    # 反向代理到Spring Boot
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传访问
    location /uploads/ {
        alias /opt/igreen/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 安全限制
        location ~* \.(php|jsp|asp|exe|bat|cmd|com)$ {
            deny all;
            return 403;
        }

        # 大文件支持
        client_max_body_size 100m;
    }

    # 静态资源优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/css application/javascript image/svg+xml;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 访问日志
    access_log /www/wwwlogs/igreen.yourdomain.com.log;
    error_log /www/wwwlogs/igreen.yourdomain.com.error.log;

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

## 4. 配置验证

### 步骤4: 测试配置
1. 在宝塔面板中点击 **保存** 配置
2. 测试Nginx配置：`nginx -t`
3. 重载Nginx：`nginx -s reload`

### 步骤5: 功能测试

#### 测试Spring Boot API
```bash
curl http://igreen.yourdomain.com/actuator/health
# 应该返回: {"status":"UP"}
```

#### 测试文件上传
```bash
curl -X POST \
  -F "file=@test.jpg" \
  -F "fieldType=photo" \
  http://igreen.yourdomain.com/api/files/upload
# 应该返回文件信息，包含url字段
```

#### 测试文件访问
```bash
# 假设上传返回的url是 "/uploads/file-123.jpg"
curl http://igreen.yourdomain.com/uploads/file-123.jpg
# 应该能访问到上传的文件
```

## 5. 性能优化配置

### 缓存配置
```nginx
# 浏览器缓存
location /uploads/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# CDN缓存 (如果使用CDN)
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### Gzip压缩
```nginx
# 启用Gzip
gzip on;
gzip_min_length 1k;
gzip_comp_level 4;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## 6. 安全配置

### 防火墙设置
在宝塔面板的 **安全** → **防火墙** 中：
- 允许 80 (HTTP) 和 443 (HTTPS) 端口
- 限制不必要的端口访问

### SSL证书配置
1. **SSL** → **免费证书** → 申请Let's Encrypt证书
2. 选择域名并申请
3. 自动配置到Nginx

### 备份配置
```bash
# 创建备份脚本
mkdir -p /opt/igreen/backups

# 数据库备份
mysqldump -u igreen_db -p'knS8jexaAnByhpj4' igreen_db > /opt/igreen/backups/db_$(date +%Y%m%d_%H%M%S).sql

# 文件备份
tar -czf /opt/igreen/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz /opt/igreen/uploads/
```

## 7. 监控配置

### 宝塔面板监控
1. **监控** → **添加监控**
2. 配置网站监控和服务器监控
3. 设置告警通知

### 日志分析
```bash
# 查看访问日志
tail -f /www/wwwlogs/igreen.yourdomain.com.log

# 分析文件上传访问
grep "/uploads/" /www/wwwlogs/igreen.yourdomain.com.log | head -10
```

## 8. 故障排除

### 常见问题

#### 问题1: 文件上传后无法访问
**检查**: 文件是否保存到正确的目录
```bash
ls -la /opt/igreen/uploads/
```

**检查**: Nginx配置是否正确
```bash
nginx -t
nginx -s reload
```

#### 问题2: 413 Request Entity Too Large
**解决**: 在Nginx配置中添加
```nginx
client_max_body_size 100m;
```

#### 问题3: 权限问题
**解决**: 确保Nginx用户有访问目录权限
```bash
chown -R www:www /opt/igreen/uploads/
chmod -R 755 /opt/igreen/uploads/
```

---

*最后更新: 2025-01-24*</content>
<parameter name="filePath">NGINX_CONFIG.md