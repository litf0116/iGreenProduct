# iGreenProduct JAR包控制脚本使用指南

## 📋 脚本功能

`jar-control.sh` 是一个强大的Spring Boot JAR包生命周期管理脚本，提供以下功能：

- ✅ **启动应用** - 优雅启动Spring Boot应用
- ✅ **停止应用** - 优雅停止或强制停止
- ✅ **重启应用** - 重新启动应用
- ✅ **状态查看** - 详细的应用运行状态
- ✅ **日志管理** - 查看和清理日志文件
- ✅ **资源监控** - 系统资源使用情况
- ✅ **健康检查** - 自动健康状态检测

## 🚀 快速开始

### 1. 上传脚本到服务器
```bash
# 将脚本上传到服务器
scp igreen-backend/scripts/jar-control.sh root@180.188.45.250:/opt/igreen/

# 或者直接在服务器上创建
```

### 2. 给脚本执行权限
```bash
chmod +x /opt/igreen/jar-control.sh
```

### 3. 基本操作
```bash
cd /opt/igreen

# 基本操作 (自动检测路径)
./jar-control.sh start          # 启动应用
./jar-control.sh stop           # 停止应用
./jar-control.sh restart        # 重启应用
./jar-control.sh status         # 查看应用状态

# 指定路径的操作
./jar-control.sh --app-dir=/opt/my-app start
./jar-control.sh --jar-file=/path/to/app.jar start
./jar-control.sh --app-name=my-app --log-dir=/var/log start

# 日志管理
./jar-control.sh logs           # 查看最近50行日志
./jar-control.sh logs 100       # 查看最近100行日志
./jar-control.sh logs-follow    # 实时查看日志
./jar-control.sh clean-logs     # 清理日志文件

# 系统监控
./jar-control.sh resources      # 查看资源使用情况

# 帮助信息
./jar-control.sh help           # 显示详细帮助和当前配置
```

## 📂 JAR包位置说明

### 灵活的路径支持

脚本**不需要**JAR包和脚本在同一目录，可以灵活配置：

#### 情况1: JAR包和脚本同级
```
/opt/igreen/
├── igreen-backend.jar    # JAR文件
├── jar-control.sh        # 控制脚本
├── logs/                 # 日志目录
└── igreen-backend.pid    # PID文件
```

#### 情况2: JAR包在上级目录
```
/opt/igreen/
├── igreen-backend.jar    # JAR文件
├── logs/                 # 日志目录
└── scripts/
    └── jar-control.sh    # 控制脚本 (自动检测上级目录)
```

#### 情况3: 完全自定义路径
```
/home/user/
├── my-app.jar           # JAR文件
└── bin/
    └── jar-control.sh   # 控制脚本

# 使用方式
./jar-control.sh --jar-file=/home/user/my-app.jar --app-name=my-app start
```

### 智能路径检测

脚本启动时会按以下优先级自动检测路径：

1. **命令行参数** - 最高优先级，手动指定
2. **环境变量** - 次高优先级
3. **自动检测** - 检查当前目录和上级目录
4. **默认配置** - 最后兜底

## 📚 详细使用指南

### 启动应用

```bash
./jar-control.sh start
```

**执行过程**:
1. 检查JAR文件是否存在
2. 创建日志目录
3. 启动Java进程 (后台运行)
4. 保存进程PID
5. 等待应用启动完成
6. 验证健康检查

**成功输出示例**:
```
[INFO] 启动 igreen-backend 应用...
[INFO] 应用PID: 12345
[INFO] 等待应用启动...
[SUCCESS] 应用启动成功!
[INFO] 健康检查: http://localhost:8080/actuator/health
[INFO] 应用日志: tail -f /opt/igreen/logs/igreen-backend.log
```

### 停止应用

```bash
./jar-control.sh stop
```

**执行过程**:
1. 检查应用是否在运行
2. 发送TERM信号 (优雅停止)
3. 等待最多30秒
4. 如未停止，发送KILL信号 (强制停止)
5. 清理PID文件

### 重启应用

```bash
./jar-control.sh restart
```

相当于执行 `stop` 后跟 `start`，中间有3秒等待时间。

### 查看应用状态

```bash
./jar-control.sh status
```

**输出信息**:
- 运行状态 (✅ 正在运行 / ❌ 未运行)
- 进程PID
- JAR文件路径
- 日志文件路径
- 启动时间
- 内存使用量
- 端口监听状态
- 健康检查结果

**示例输出**:
```
[SUCCESS] ✅ 应用正在运行
   PID: 12345
   JAR文件: /opt/igreen/igreen-backend.jar
   日志文件: /opt/igreen/logs/igreen-backend.log
   启动时间: Mon Jan 24 15:30:00 2025
   内存使用: 450MB
   端口状态: ✅ 8080端口已监听
   健康检查: ✅ 通过
```

### 日志管理

#### 查看最近日志
```bash
# 查看最近50行日志
./jar-control.sh logs

# 查看最近100行日志
./jar-control.sh logs 100
```

#### 实时查看日志
```bash
./jar-control.sh logs-follow
```
按 `Ctrl+C` 退出实时查看。

#### 清理日志文件
```bash
./jar-control.sh clean-logs
```
这会清空日志文件，但保留文件本身。

### 资源监控

```bash
./jar-control.sh resources
```

**显示信息**:
- 进程详细信息 (CPU、内存、运行时间)
- 内存使用详情
- 磁盘使用情况 (JAR文件和日志目录大小)
- 网络连接状态

## ⚙️ 配置说明

### 智能路径检测

脚本会自动检测路径，支持以下情况：

1. **脚本在 `*/scripts/` 目录下** - 自动使用上级目录作为应用目录
2. **脚本在应用目录中** - 使用当前目录
3. **JAR文件在当前目录** - 自动检测并使用

### 灵活配置选项

#### 环境变量配置
```bash
export APP_NAME="my-app"                    # 应用名称
export APP_DIR="/opt/my-app"                # 应用目录
export JAR_FILE="/path/to/app.jar"          # JAR文件路径
export LOG_DIR="/var/log/my-app"            # 日志目录
```

#### 命令行参数配置
```bash
# 指定应用目录 (推荐)
./jar-control.sh --app-dir=/opt/my-app start

# 指定JAR文件路径
./jar-control.sh --jar-file=/path/to/my-app.jar start

# 指定应用名称
./jar-control.sh --app-name=my-spring-app start

# 指定日志目录
./jar-control.sh --log-dir=/var/log/my-app logs
```

#### 默认配置
```bash
APP_NAME="igreen-backend"                   # 默认应用名称
APP_DIR="/opt/igreen"                       # 默认应用目录
JAR_FILE="${APP_DIR}/${APP_NAME}.jar"       # JAR文件路径
PID_FILE="${APP_DIR}/${APP_NAME}.pid"       # PID文件路径
LOG_DIR="${APP_DIR}/logs"                   # 日志目录
LOG_FILE="${LOG_DIR}/${APP_NAME}.log"       # 日志文件路径
```

### 自定义配置

如需修改配置，请编辑脚本开头的变量定义，或者创建配置文件：

```bash
# 创建配置文件
cat > /opt/igreen/jar-control.conf << 'EOF'
JAVA_OPTS="-Xmx2g -Xms1g"
SPRING_OPTS="-Dserver.port=9090"
LOG_FILE="/var/log/igreen-backend.log"
EOF

# 修改脚本读取配置
# 在脚本开头添加: source /opt/igreen/jar-control.conf
```

## 🔍 故障排除

### 常见问题

#### 问题1: 启动失败
```bash
# 查看详细日志
./jar-control.sh logs 100

# 检查Java版本
java -version

# 检查端口占用
netstat -tlnp | grep :8080
```

#### 问题2: 停止超时
```bash
# 强制停止
pkill -9 -f "igreen-backend.jar"

# 清理PID文件
rm -f /opt/igreen/igreen-backend.pid
```

#### 问题3: 内存不足
```bash
# 检查系统内存
free -h

# 调整JVM参数
# 编辑脚本中的 JAVA_OPTS 变量
JAVA_OPTS="-Xmx512m -Xms256m"
```

#### 问题4: 权限问题
```bash
# 以root用户运行
sudo ./jar-control.sh start

# 或修改文件权限
sudo chown -R root:root /opt/igreen
sudo chmod -R 755 /opt/igreen
```

#### 问题5: 数据库连接失败
```bash
# 检查数据库状态
sudo systemctl status mysql

# 测试连接
mysql -u igreen_db -p'knS8jexaAnByhpj4' -e "SELECT 1;" igreen_db
```

### 健康检查失败

```bash
# 手动测试健康检查
curl http://localhost:8080/actuator/health

# 检查应用日志中的错误
./jar-control.sh logs 50 | grep -i error
```

## 📊 监控和维护

### 定期检查脚本

```bash
#!/bin/bash
# 每5分钟检查一次应用状态
*/5 * * * * /opt/igreen/jar-control.sh status >> /opt/igreen/monitor.log 2>&1
```

### 自动重启脚本

```bash
#!/bin/bash
# 如果应用停止了，自动重启
if ! /opt/igreen/jar-control.sh status | grep -q "正在运行"; then
    /opt/igreen/jar-control.sh restart
fi
```

### 日志轮转

```bash
# 配置logrotate
cat > /etc/logrotate.d/igreen-backend << 'EOF'
/opt/igreen/logs/igreen-backend.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 644 root root
    postrotate
        /opt/igreen/jar-control.sh status > /dev/null
    endscript
}
EOF
```

## 🔄 集成到其他脚本

### 与部署脚本集成

```bash
# 在部署成功后自动启动
if ./deploy-to-server.sh; then
    ./jar-control.sh start
fi
```

### CI/CD集成

```bash
# 在Drone CI中使用
- name: restart-app
  commands:
    - ./jar-control.sh stop
    - sleep 5
    - ./jar-control.sh start
```

## 📞 技术支持

### 调试模式

启用详细日志：
```bash
# 修改脚本，添加 set -x
set -x  # 在脚本开头添加
```

### 获取帮助

```bash
./jar-control.sh help
```

### 版本信息

```bash
./jar-control.sh status | grep "JAR文件"
ls -la /opt/igreen/igreen-backend.jar
```

---

## 🎯 最佳实践

1. **权限管理**: 建议以root用户运行以获得完整权限
2. **监控告警**: 设置定时任务监控应用状态
3. **日志管理**: 定期清理和轮转日志文件
4. **备份策略**: 重要更新前备份当前JAR文件
5. **资源监控**: 定期检查系统资源使用情况

**🚀 快速操作**: `./jar-control.sh start` | `./jar-control.sh status` | `./jar-control.sh logs`</content>
<parameter name="filePath">JAR_CONTROL_README.md