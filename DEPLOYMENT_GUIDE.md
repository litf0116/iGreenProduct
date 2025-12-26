# iGreen+ 部署指南

本文档提供详细的部署步骤，帮助您在生产环境中部署iGreen+系统。

## 目录
- [系统要求](#系统要求)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [数据库设置](#数据库设置)
- [安全配置](#安全配置)
- [维护和监控](#维护和监控)

## 系统要求

### 后端服务器
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Python**: 3.8+
- **内存**: 最低2GB，推荐4GB+
- **存储**: 20GB+
- **数据库**: MySQL 5.7+ 或 MariaDB 10.3+

### 前端服务器
- **Web服务器**: Nginx 1.18+ 或 Apache 2.4+
- **Node.js**: 16+ (仅构建时需要)

## 后端部署

### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Python 3和pip
sudo apt install python3 python3-pip python3-venv -y

# 安装MySQL
sudo apt install mysql-server -y
```

### 2. 配置MySQL数据库

```bash
# 登录MySQL
sudo mysql

# 创建数据库和用户
CREATE DATABASE igreen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'igreen_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON igreen_db.* TO 'igreen_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 部署后端代码

```bash
# 克隆代码（或上传代码包）
cd /opt
sudo git clone https://github.com/yourusername/iGreenProduct.git
sudo chown -R $USER:$USER /opt/iGreenProduct

# 进入后端目录
cd /opt/iGreenProduct/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 4. 配置环境变量

```bash
# 创建.env文件
cp .env.example .env
nano .env
```

编辑`.env`文件，配置以下关键参数：

```env
# 应用配置
APP_NAME=iGreen+ Unified Backend
DEBUG=False

# 数据库配置
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=igreen_user
DATABASE_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DATABASE_NAME=igreen_db

# 安全配置 - 请使用强随机密钥
SECRET_KEY=your-very-strong-random-secret-key-min-32-characters

# CORS配置 - 前端域名
ALLOWED_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com

# 文件上传
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 5. 初始化数据库

```bash
# 激活虚拟环境（如果还没激活）
source venv/bin/activate

# 运行数据库初始化脚本
python scripts/init_db.py
```

### 6. 使用Systemd管理服务

创建systemd服务文件：

```bash
sudo nano /etc/systemd/system/igreen-backend.service
```

添加以下内容：

```ini
[Unit]
Description=iGreen+ Backend API
After=network.target mysql.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/iGreenProduct/backend
Environment="PATH=/opt/iGreenProduct/backend/venv/bin"
ExecStart=/opt/iGreenProduct/backend/venv/bin/gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/igreen/access.log \
    --error-logfile /var/log/igreen/error.log

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 创建日志目录
sudo mkdir -p /var/log/igreen
sudo chown www-data:www-data /var/log/igreen

# 设置文件权限
sudo chown -R www-data:www-data /opt/iGreenProduct/backend

# 重新加载systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start igreen-backend

# 设置开机自启
sudo systemctl enable igreen-backend

# 检查状态
sudo systemctl status igreen-backend
```

### 7. 配置Nginx反向代理

```bash
sudo nano /etc/nginx/sites-available/igreen-backend
```

添加配置：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/igreen-api-access.log;
    error_log /var/log/nginx/igreen-api-error.log;

    # 上传文件大小限制
    client_max_body_size 10M;

    # 反向代理到后端
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件（上传的图片等）
    location /uploads/ {
        alias /opt/iGreenProduct/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/igreen-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 前端部署

### 1. 构建iGreenApp (工程师APP)

```bash
cd /opt/iGreenProduct/iGreenApp

# 创建.env.production
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 构建iGreenticketing (管理员系统)

```bash
cd /opt/iGreenProduct/iGreenticketing

# 创建.env.production
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 3. 配置Nginx托管前端

#### iGreenApp配置

```bash
sudo nano /etc/nginx/sites-available/igreen-app
```

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    root /opt/iGreenProduct/iGreenApp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### iGreenticketing配置

```bash
sudo nano /etc/nginx/sites-available/igreen-ticketing
```

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/admin.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourdomain.com/privkey.pem;

    root /opt/iGreenProduct/iGreenticketing/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/igreen-app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/igreen-ticketing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL证书配置

使用Let's Encrypt免费SSL证书：

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d app.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com

# 自动续期（certbot会自动设置cron任务）
```

## 安全配置

### 1. 防火墙配置

```bash
# 允许SSH、HTTP、HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 修改默认密码

登录系统后，立即修改默认用户密码：

```python
# 使用Python交互式shell
python3
>>> from app.core.database import SessionLocal
>>> from app.models.user import User
>>> from app.core.security import get_password_hash
>>> db = SessionLocal()
>>> admin = db.query(User).filter(User.username == "admin").first()
>>> admin.hashed_password = get_password_hash("your_new_strong_password")
>>> db.commit()
```

### 3. 数据库备份

设置每日自动备份：

```bash
sudo nano /etc/cron.daily/igreen-backup
```

```bash
#!/bin/bash
BACKUP_DIR=/var/backups/igreen
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u igreen_user -p'YOUR_PASSWORD' igreen_db | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /opt/iGreenProduct/backend/uploads

# 删除30天前的备份
find $BACKUP_DIR -type f -mtime +30 -delete
```

```bash
sudo chmod +x /etc/cron.daily/igreen-backup
```

## 维护和监控

### 查看日志

```bash
# 后端日志
sudo journalctl -u igreen-backend -f

# Nginx日志
sudo tail -f /var/log/nginx/igreen-api-access.log
sudo tail -f /var/log/nginx/igreen-api-error.log
```

### 重启服务

```bash
# 重启后端
sudo systemctl restart igreen-backend

# 重启Nginx
sudo systemctl restart nginx

# 重启MySQL
sudo systemctl restart mysql
```

### 更新代码

```bash
# 拉取最新代码
cd /opt/iGreenProduct
git pull

# 更新后端
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart igreen-backend

# 重新构建前端
cd ../iGreenApp
npm install
npm run build

cd ../iGreenticketing
npm install
npm run build
```

## 故障排除

### 后端无法启动
1. 检查日志: `sudo journalctl -u igreen-backend -n 50`
2. 检查数据库连接: `mysql -u igreen_user -p igreen_db`
3. 检查端口占用: `sudo netstat -tulpn | grep 8000`

### 前端无法访问
1. 检查Nginx配置: `sudo nginx -t`
2. 检查SSL证书: `sudo certbot certificates`
3. 检查DNS解析: `nslookup yourdomain.com`

### 数据库问题
1. 检查MySQL状态: `sudo systemctl status mysql`
2. 查看错误日志: `sudo tail -f /var/log/mysql/error.log`
3. 检查连接数: `show processlist;`

## 性能优化

### 数据库优化

```sql
-- 添加索引
USE igreen_db;
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_users_group_id ON users(group_id);
```

### 后端优化

增加Gunicorn workers数量（CPU核心数 * 2 + 1）：

```bash
sudo nano /etc/systemd/system/igreen-backend.service
# 修改 --workers 参数
```

### 前端优化

启用Nginx gzip压缩：

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_comp_level 6;
```

## 监控建议

考虑使用以下工具监控系统：
- **Prometheus + Grafana**: 性能监控
- **Sentry**: 错误追踪
- **Uptime Kuma**: 服务可用性监控
- **Fail2ban**: 防止暴力攻击

## 总结

完成以上步骤后，您的iGreen+系统应该已经成功部署并运行。确保定期：
- 备份数据库和上传文件
- 更新系统和依赖包
- 监控日志和性能
- 检查SSL证书有效期

如有问题，请查阅日志或联系技术支持。
