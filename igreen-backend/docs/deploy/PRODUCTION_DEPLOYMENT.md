# 生产环境部署文档

## 图片访问问题修复

### 问题现象

线上图片访问返回 404：
```
http://43.255.212.68:8088/api/uploads/828b839f-eed3-4e48-b2c7-d8b4f70bae2a.jpg → 404
```

### 问题原因

线上服务使用 nginx 反向代理，nginx 没有配置图片路径的转发规则。

### 解决方案

#### 方案一：nginx 配置图片路径（推荐）

在 nginx 配置中添加上传文件路径的 location 规则：

```nginx
server {
    listen 80;
    server_name 43.255.212.68;

    # 已有的API代理配置
    location /api/ {
        proxy_pass http://127.0.0.1:8088/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 新增：图片文件直接访问（推荐）
    location /api/uploads/ {
        alias /path/to/your/uploads/;  # 修改为实际的 uploads 目录路径
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 或者支持两种格式
    location /uploads/ {
        alias /path/to/your/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 方案二：Spring Boot 配置（需要重新部署）

1. **更新 application-prod.yml**

```yaml
app:
  upload:
    dir: /data/uploads
    max-size: 10485760
    base-url: http://43.255.212.68:8088  # 或使用 CDN 域名
```

2. **重新构建和部署**

```bash
# 构建新版本
mvn clean package -DskipTests

# 上传 JAR 到服务器
scp target/igreen-backend-1.0.0-SNAPSHOT.jar user@43.255.212.68:/opt/app/

# 重启服务
ssh user@43.255.212.68 "sudo systemctl restart igreen-backend"
```

### 验证步骤

#### 1. 检查文件是否存在

```bash
# 登录服务器
ssh user@43.255.212.68

# 查看上传目录
ls -la /path/to/uploads/ | grep 828b839f

# 检查文件权限
ls -lh /path/to/uploads/828b839f-eed3-4e48-b2c7-d8b4f70bae2a.jpg
```

#### 2. 测试本地访问

```bash
# 在服务器上直接访问
curl -I http://localhost:8088/api/uploads/828b839f-eed3-4e48-b2c7-d8b4f70bae2a.jpg
```

#### 3. 测试外部访问

```bash
# 从外部测试
curl -I http://43.255.212.68:8088/uploads/828b839f-eed3-4e48-b2c7-d8b4f70bae2a.jpg
curl -I http://43.255.212.68:8088/api/uploads/828b839f-eed3-4e48-b2c7-d8b4f70bae2a.jpg
```

### 环境变量配置

#### 生产环境

```bash
# 设置环境变量
export UPLOAD_BASE_URL=http://43.255.212.68:8088
export SERVER_PORT=8088

# 或在 systemd service 文件中配置
# /etc/systemd/system/igreen-backend.service
[Service]
Environment="UPLOAD_BASE_URL=http://43.255.212.68:8088"
Environment="SERVER_PORT=8088"
Environment="UPLOAD_DIR=/data/uploads"
```

### CDN 集成（可选）

如果使用 CDN，修改配置：

```yaml
app:
  upload:
    base-url: https://cdn.yourdomain.com
```

同时需要在 CDN 服务商处配置：
1. 源站地址：`http://43.255.212.68:8088`
2. 缓存路径：`/uploads/*`
3. 缓存时间：30 天

### nginx 配置完整示例

```nginx
server {
    listen 80;
    server_name yourdomain.com 43.255.212.68;

    # 前端静态资源
    location / {
        root /var/www/igreen-frontend;
        try_files $uri $uri/ /index.html;
    }

    # API 请求代理
    location /api/ {
        proxy_pass http://127.0.0.1:8088/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 图片文件访问（直接从文件系统读取，性能更好）
    location /api/uploads/ {
        alias /data/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # 兼容旧格式
    location /uploads/ {
        alias /data/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # 其他静态资源
    location /static/ {
        alias /var/www/static/;
        expires 1y;
    }
}
```

### 检查清单

部署前确认：

- [ ] 确认 `uploads` 目录路径正确
- [ ] 确认 `uploads` 目录有正确的读写权限
- [ ] 确认 nginx 配置已更新并重启
- [ ] 确认 Spring Boot 服务已重启
- [ ] 测试 `/uploads/{filename}` 可访问
- [ ] 测试 `/api/uploads/{filename}` 可访问
- [ ] 测试上传接口返回的 URL 可访问
- [ ] 测试 CORS 配置正确

### 故障排查

#### 1. 404 Not Found

**检查项：**
- 文件是否存在于 uploads 目录
- nginx location 配置是否正确
- nginx 是否已重启（`sudo nginx -s reload`）

#### 2. 403 Forbidden

**检查项：**
- 文件权限（`chmod 644`）
- 目录权限（`chmod 755`）
- nginx 用户是否有读取权限

#### 3. 401 Unauthorized

**检查项：**
- SecurityConfig 中是否配置了 `.requestMatchers("/uploads/**", "/api/uploads/**").permitAll()`

### 联系信息

如有问题，请联系：
- 开发团队：litengfei
- 服务器：43.255.212.68