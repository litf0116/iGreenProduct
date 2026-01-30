# Spring Boot 部署指南

## 当前系统部署状态

### ✅ 已完成的配置
- Java 环境: 已安装
- Maven: 已安装
- MySQL 数据库: 已配置
- Spring Boot 应用: 已编译
- Nginx: 已安装

### 🔧 部署方式选择

#### 方式1: 使用systemd服务 (推荐生产环境)

```bash
# 1. 停止现有应用
sudo systemctl stop igreen-backend 2>/dev/null || true

# 2. 复制JAR文件到部署目录
sudo cp igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar /opt/igreen/igreen-backend.jar

# 3. 创建systemd服务文件
sudo tee /etc/systemd/system/igreen-backend.service > /dev/null << 'EOF'
[Unit]
Description=iGreen Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=root
ExecStart=/usr/bin/java -Dspring.profiles.active=prod \
    -Dserver.port=8080 \
    -jar /opt/igreen/igreen-backend.jar
Restart=always
RestartSec=10
Environment=JAVA_OPTS=-Xmx1024m -Xms512m
Environment=DB_HOST=localhost
Environment=DB_PORT=3306
Environment=DB_NAME=igreen_db
Environment=DB_USERNAME=igreen_db
Environment=DB_PASSWORD=knS8jexaAnByhpj4
Environment=UPLOAD_DIR=/opt/igreen/uploads
Environment=JWT_SECRET_KEY=iGreenProduct2025SecureJWTKeyForProductionEnvironment

[Install]
WantedBy=multi-user.target
EOF

# 4. 重新加载systemd并启动服务
sudo systemctl daemon-reload
sudo systemctl start igreen-backend
sudo systemctl enable igreen-backend

# 5. 检查服务状态
sudo systemctl status igreen-backend
```

#### 方式2: 直接运行JAR包 (开发测试)

```bash
# 1. 设置环境变量
export SPRING_PROFILES_ACTIVE=prod
export SERVER_PORT=8080
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=igreen_db
export DB_USERNAME=igreen_db
export DB_PASSWORD=knS8jexaAnByhpj4
export UPLOAD_DIR=/opt/igreen/uploads
export JWT_SECRET_KEY=iGreenProduct2025SecureJWTKeyForProductionEnvironment

# 2. 运行应用
java -jar igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar

# 或者后台运行
nohup java -jar igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar > app.log 2>&1 &
```

#### 方式3: 使用Docker (如果支持)

```dockerfile
# Dockerfile
FROM openjdk:21-jdk-slim

WORKDIR /app

COPY igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENV DB_HOST=localhost
ENV DB_NAME=igreen_db
ENV DB_USERNAME=igreen_db
ENV DB_PASSWORD=knS8jexaAnByhpj4

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# 构建和运行
docker build -t igreen-backend .
docker run -p 8080:8080 \
  -e DB_HOST=localhost \
  -e DB_PASSWORD=knS8jexaAnByhpj4 \
  igreen-backend
```

## 部署验证

### 1. 检查应用是否启动
```bash
# 检查端口占用
netstat -tlnp | grep 8080

# 检查Java进程
ps aux | grep java

# 检查服务状态 (systemd方式)
sudo systemctl status igreen-backend
```

### 2. 测试API访问
```bash
# 健康检查
curl http://localhost:8080/actuator/health

# API文档 (如果启用)
curl http://localhost:8080/api/docs

# 测试数据库连接
curl http://localhost:8080/api/users
```

### 3. 查看应用日志
```bash
# systemd日志
sudo journalctl -u igreen-backend -f

# 应用日志文件
tail -f /opt/igreen/logs/igreen-backend.log

# 后台运行的日志
tail -f app.log
```

## 故障排除

### 问题1: 端口占用
```bash
# 查看端口占用
lsof -i :8080

# 杀死进程
kill -9 <PID>
```

### 问题2: 数据库连接失败
```bash
# 测试数据库连接
mysql -u igreen_db -p'knS8jexaAnByhpj4' -e "SELECT 1;" igreen_db

# 检查数据库服务
sudo systemctl status mysql
```

### 问题3: 内存不足
```bash
# 检查内存使用
free -h

# 调整JVM参数
JAVA_OPTS="-Xmx512m -Xms256m"
```

### 问题4: 文件权限问题
```bash
# 检查上传目录权限
ls -la /opt/igreen/uploads/

# 修复权限
sudo chown -R www-data:www-data /opt/igreen/uploads/
sudo chmod -R 755 /opt/igreen/uploads/
```

## 性能优化

### JVM调优
```bash
# 生产环境推荐配置
JAVA_OPTS="-Xmx1024m -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport"
```

### 应用配置优化
```yaml
# application-prod.yml
server:
  tomcat:
    threads:
      max: 200
      min-spare: 10

spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
```

## 监控和维护

### 健康检查端点
- `GET /actuator/health` - 应用健康状态
- `GET /actuator/info` - 应用信息
- `GET /actuator/metrics` - 性能指标

### 日志配置
```yaml
logging:
  level:
    root: INFO
    com.igreen: DEBUG
  file:
    name: /opt/igreen/logs/igreen-backend.log
    max-size: 100MB
    max-history: 30
```

## 推荐部署流程

1. **准备环境**: 确保Java、Maven、MySQL已安装
2. **编译应用**: `mvn clean package -DskipTests`
3. **配置数据库**: 确保数据库连接信息正确
4. **部署应用**: 使用systemd服务方式
5. **配置Nginx**: 设置反向代理
6. **测试功能**: 验证所有API正常工作
7. **配置监控**: 设置日志和健康检查

当前系统推荐使用 **systemd服务方式** 进行部署，这样可以自动重启和管理应用生命周期。</content>
<parameter name="filePath">SPRINGBOOT_DEPLOY_GUIDE.md