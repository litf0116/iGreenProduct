# iGreenProduct JAR包快速更新脚本使用指南

## 📋 脚本功能

`quick-update.sh` 是一个轻量级的更新脚本，专门用于：

- ✅ **快速编译** Spring Boot应用
- ✅ **上传JAR包** 到服务器
- ✅ **重启服务** 应用新版本
- ✅ **验证部署** 确保服务正常运行

## 🚀 使用方法

### 完整更新 (推荐)
```bash
./quick-update.sh
```

### 分步执行

#### 1. 仅编译
```bash
./quick-update.sh build-only
```

#### 2. 编译并上传
```bash
./quick-update.sh upload-only
```

#### 3. 仅重启服务
```bash
./quick-update.sh restart-only
```

## ⚙️ 配置说明

脚本中的默认配置：

```bash
REMOTE_HOST="180.188.45.250"        # 服务器IP
REMOTE_USER="root"                  # SSH用户名
REMOTE_PATH="/opt/igreen"           # 服务器部署路径
LOCAL_JAR="igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar"
```

如需修改配置，请编辑脚本开头的变量。

## 📊 执行流程

1. **本地编译** - Maven编译JAR包
2. **文件上传** - SCP传输到服务器
3. **服务重启** - systemctl重启服务
4. **健康检查** - 验证服务状态

## 🔍 验证结果

成功更新后会显示：

```
=== 部署信息 ===
应用名称: igreen-backend
服务器: 180.188.45.250
部署路径: /opt/igreen
访问地址: http://180.188.45.250:8080
健康检查: http://180.188.45.250:8080/actuator/health
```

## 🛠️ 故障排除

### SSH连接问题
```bash
# 测试SSH连接
ssh root@180.188.45.250 "echo '连接成功'"

# 如果失败，检查密钥或密码
ssh -v root@180.188.45.250
```

### 服务启动失败
```bash
# 查看服务状态
ssh root@180.188.45.250 "sudo systemctl status igreen-backend"

# 查看详细日志
ssh root@180.188.45.250 "sudo journalctl -u igreen-backend -f"
```

### JAR文件问题
```bash
# 检查本地JAR文件
ls -la igreen-backend/target/*.jar

# 检查远程JAR文件
ssh root@180.188.45.250 "ls -la /opt/igreen/*.jar"
```

## 📈 性能优化

脚本默认跳过测试以加快编译速度，如需运行测试：

```bash
# 修改脚本中的编译命令
mvn clean package  # 移除 -DskipTests
```

## 🔄 回滚方案

如果新版本有问题：

```bash
# 服务器上回滚
ssh root@180.188.45.250 << 'EOF'
sudo systemctl stop igreen-backend
# 恢复备份的JAR文件
sudo cp /opt/igreen/backups/igreen-backend-*.jar /opt/igreen/igreen-backend.jar
sudo systemctl start igreen-backend
EOF
```

## ⏱️ 执行时间

- **完整更新**: 2-5分钟 (取决于代码大小)
- **仅重启**: 10-30秒
- **仅编译**: 1-3分钟

## 📞 技术支持

更新过程中遇到问题，请检查：

1. **网络连接** - 确保能访问服务器
2. **SSH密钥** - 配置正确的SSH访问
3. **文件权限** - 本地和服务器的文件权限
4. **Java环境** - 服务器Java版本兼容性
5. **磁盘空间** - 确保服务器有足够空间

---

**快速开始**: `./quick-update.sh`

**适用场景**: 代码更新后快速部署到已配置好的环境</content>
<parameter name="filePath">QUICK_UPDATE_README.md