# iGreenProduct 一键部署脚本使用指南

## 📋 脚本功能

`deploy-to-server.sh` 是一个全自动化的部署脚本，能够：

- ✅ 自动检查系统环境 (Java, Maven, MySQL, Nginx)
- ✅ 验证数据库连接
- ✅ 创建必要的目录结构
- ✅ 备份现有应用
- ✅ 编译Spring Boot应用
- ✅ 配置systemd服务
- ✅ 设置Nginx反向代理
- ✅ 验证部署结果

## 🚀 使用方法

### 1. 上传脚本到服务器
```bash
# 将脚本上传到服务器的项目根目录
scp deploy-to-server.sh root@180.188.45.250:/root/
```

### 2. 给脚本执行权限
```bash
chmod +x deploy-to-server.sh
```

### 3. 运行部署脚本
```bash
# 必须以root用户运行
sudo ./deploy-to-server.sh
```

## 🔧 脚本配置

脚本中的关键配置参数：

```bash
# 应用配置
APP_NAME="igreen-backend"          # 应用名称
APP_PORT=8080                      # 运行端口

# 数据库配置
DB_HOST="localhost"
DB_PORT=3306
DB_NAME="igreen_db"
DB_USERNAME="igreen_db"
DB_PASSWORD="knS8jexaAnByhpj4"

# 目录配置
UPLOAD_DIR="/opt/igreen/uploads"   # 文件上传目录
LOG_DIR="/opt/igreen/logs"         # 日志目录
DEPLOY_DIR="/opt/igreen"           # 部署目录
```

## 📊 部署流程

脚本执行的完整流程：

1. **环境检查** - 验证Java、Maven、MySQL、Nginx
2. **数据库验证** - 测试数据库连接
3. **目录创建** - 创建上传、日志、备份目录
4. **应用备份** - 备份现有JAR文件
5. **应用编译** - 执行Maven编译打包
6. **服务部署** - 创建systemd服务并启动
7. **Nginx配置** - 设置反向代理
8. **部署验证** - 测试所有功能

## 🎯 部署结果

成功部署后，你将获得：

### 访问地址
- **直接访问**: `http://180.188.45.250:8080`
- **Nginx代理**: `http://180.188.45.250`
- **健康检查**: `http://180.188.45.250/health`
- **API文档**: `http://180.188.45.250:8080/api/docs`

### 服务管理
```bash
# 查看状态
sudo systemctl status igreen-backend

# 重启服务
sudo systemctl restart igreen-backend

# 查看日志
sudo journalctl -u igreen-backend -f

# 停止服务
sudo systemctl stop igreen-backend
```

### 文件位置
- **应用JAR**: `/opt/igreen/igreen-backend.jar`
- **上传文件**: `/opt/igreen/uploads/`
- **应用日志**: `/opt/igreen/logs/`
- **备份文件**: `/opt/igreen/backups/`

## 🔍 故障排除

### 常见问题

#### 问题1: 权限不足
```bash
# 确保以root用户运行
sudo ./deploy-to-server.sh
```

#### 问题2: 数据库连接失败
```bash
# 检查数据库配置
mysql -u igreen_db -p'knS8jexaAnByhpj4' -e "SELECT 1;" igreen_db
```

#### 问题3: 端口占用
```bash
# 查看端口占用
lsof -i :8080

# 修改端口配置
# 编辑脚本中的 APP_PORT 变量
```

#### 问题4: Nginx配置失败
```bash
# 检查Nginx状态
sudo nginx -t
sudo systemctl status nginx

# 重新配置Nginx
sudo nginx -s reload
```

### 日志查看

#### 应用日志
```bash
# systemd日志
sudo journalctl -u igreen-backend -f

# 应用文件日志
tail -f /opt/igreen/logs/igreen-backend.log
```

#### Nginx日志
```bash
# 访问日志
tail -f /var/log/nginx/igreen-backend.access.log

# 错误日志
tail -f /var/log/nginx/igreen-backend.error.log
```

## 🔄 更新部署

当需要更新应用时：

```bash
# 1. 上传新版本代码
# 2. 重新运行部署脚本
sudo ./deploy-to-server.sh

# 脚本会自动备份旧版本并部署新版本
```

## 🛑 回滚方案

如果新版本有问题：

```bash
# 停止当前服务
sudo systemctl stop igreen-backend

# 从备份恢复旧版本
sudo cp /opt/igreen/backups/igreen-backend-YYYYMMDD_HHMMSS.jar /opt/igreen/igreen-backend.jar

# 重启服务
sudo systemctl start igreen-backend
```

## 📞 技术支持

如果部署过程中遇到问题，请提供：

1. **错误信息**: 完整的错误输出
2. **系统信息**: `uname -a` 和 `lsb_release -a`
3. **服务状态**: `sudo systemctl status igreen-backend`
4. **日志文件**: 相关的错误日志

---

**重要提醒**: 
- 首次运行前请备份重要数据
- 生产环境建议在业务低峰期执行部署
- 部署完成后务必测试所有功能

🎉 **开始一键部署**: `sudo ./deploy-to-server.sh`</content>
<parameter name="filePath">DEPLOY_SCRIPT_README.md