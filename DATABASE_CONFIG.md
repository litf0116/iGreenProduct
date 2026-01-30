# iGreenProduct 数据库配置指南

## 1. MySQL 安装和配置

### ✅ 生产环境数据库已配置

**生产数据库连接信息：**
- **服务器**: 180.188.45.250
- **数据库名**: `igreen_db`
- **用户名**: `igreen_db`
- **密码**: `knS8jexaAnByhpj4`
- **端口**: `3306`

**Spring Boot生产配置已更新** (`application-prod.yml`)

### 在宝塔面板中安装MySQL

1. 登录宝塔面板 (https://180.188.45.250:13189/7d423390)
2. 进入 **软件商店** → **运行环境**
3. 找到 **MySQL 8.0** 并点击安装
4. 设置数据库root密码：`iGreen@2025!`

### 数据库初始化

```sql
-- 创建数据库
CREATE DATABASE igreen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户
CREATE USER 'igreen_user'@'localhost' IDENTIFIED BY 'iGreenSecure2025!';

-- 授予权限
GRANT ALL PRIVILEGES ON igreen_db.* TO 'igreen_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

## 2. 执行数据库初始化脚本

### 方法1: 通过宝塔面板

1. 进入 **数据库** → **MySQL管理**
2. 选择 `igreen_db` 数据库
3. 点击 **导入** → 选择 `igreen-backend/init-scripts/01-schema.sql`

### 方法2: 命令行执行

```bash
# 连接数据库
mysql -u igreen_user -p igreen_db < igreen-backend/init-scripts/01-schema.sql
```

## 3. Spring Boot 数据库配置

### 开发环境配置 (application-dev.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/igreen_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: igreen_user
    password: iGreenSecure2025!
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
```

### 生产环境配置 (application-prod.yml)

**实际生产配置** (已应用到 `application-prod.yml`)：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/igreen_db?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: igreen_db
    password: knS8jexaAnByhpj4
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      idle-timeout: 300000
      connection-timeout: 30000
      max-lifetime: 1200000

  jpa:
    hibernate:
      ddl-auto: validate  # 生产环境使用validate确保数据库结构一致性
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: false
```

**历史配置参考** (开发环境示例)：
```yaml
spring:
  datasource:
    username: igreen_user
    password: iGreenSecure2025!
```

## 4. 环境变量配置

### 生产环境建议使用环境变量

在宝塔面板中配置环境变量：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=igreen_db
DB_USERNAME=igreen_user
DB_PASSWORD=iGreenSecure2025!

# JWT配置
JWT_SECRET_KEY=your-very-long-and-secure-jwt-secret-key-here
JWT_EXPIRATION=7200000
JWT_REFRESH_EXPIRATION=604800000

# 服务器配置
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# 文件上传
UPLOAD_DIR=/opt/igreen/uploads
MAX_FILE_SIZE=10485760

# CORS配置
ALLOWED_ORIGINS=https://app.igreen.com,https://admin.igreen.com
```

## 5. 数据库备份策略

### 宝塔面板自动备份

1. 进入 **计划任务** → **添加任务**
2. 任务类型：**Shell脚本**
3. 执行周期：**每天 02:00**
4. 脚本内容：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u igreen_user -p'iGreenSecure2025!' igreen_db > /www/backup/igreen_db_${DATE}.sql

# 只保留最近7天的备份
find /www/backup -name "igreen_db_*.sql" -mtime +7 -delete
```

## 6. 数据库监控

### MySQL 性能监控

在宝塔面板中：
1. 进入 **软件商店** → **监控告警**
2. 安装 **MySQL监控插件**
3. 配置数据库连接信息

## 7. 默认数据

初始化脚本会创建：

### 默认管理员账户
- 用户名: `admin`
- 密码: `admin123`
- 角色: `ADMIN`

### 默认分组
- 华东区
- 华南区
- 华北区

### 示例站点
- 上海总部 (VIP)
- 北京分公司 (企业)
- 深圳工厂 (普通)

## 8. 连接测试

### 测试数据库连接

```bash
# 连接测试
mysql -u igreen_user -p -e "SELECT VERSION();"
mysql -u igreen_user -p igreen_db -e "SHOW TABLES;"
```

### Spring Boot 连接测试

启动应用后检查日志：
```
2025-01-24 12:00:00 INFO  HikariPool-1 - Starting...
2025-01-24 12:00:01 INFO  HikariPool-1 - Added connection conn0
```

---

*最后更新: 2025-01-24*</content>
<parameter name="filePath">DATABASE_CONFIG.md