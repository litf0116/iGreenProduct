#!/usr/bin/expect -f

# iGreenticketing 前端自动化部署脚本
# 使用 expect 自动处理 SSH 密码输入

set timeout 60

# 服务器配置
set SERVER_HOST "180.188.45.250"
set SERVER_USER "root"
set SERVER_APP_DIR "/www/wwwroot/igreen"
set SERVER_NGINX_CONF "/etc/nginx/sites-available/iGreenticketing"
set LOCAL_DIST "./dist"
set SERVER_DIST "${SERVER_APP_DIR}"

puts "=========================================="
puts "iGreenticketing 前端自动化部署"
puts "=========================================="

# 检查本地构建产物是否存在
set BUILD_DIR "./build"
if {![file exists ${BUILD_DIR}]} {
    puts "❌ 错误: 未找到本地构建目录 ${BUILD_DIR}"
    puts "请先执行: npm run build"
    exit 1
}
set LOCAL_DIST ${BUILD_DIR}

# 获取密码（从环境变量或提示输入）
set password $::env(DEPLOY_PASSWORD)
if {$password eq ""} {
    puts -nonewline "请输入SSH密码: "
    stty -echo
    set password [gets stdin]
    stty echo
    puts ""
}

puts "\n📦 步骤 1: 构建验证..."

# 验证构建产物
set index_file "${LOCAL_DIST}/index.html"
if {![file exists ${index_file}]} {
    puts "❌ 错误: 构建产物不完整，缺少 index.html"
    exit 1
}
puts "✅ 构建产物验证通过"

puts "\n📦 步骤 2: 上传构建产物到服务器..."

# 上传构建目录
spawn scp -r ${LOCAL_DIST} ${SERVER_USER}@${SERVER_HOST}:${SERVER_APP_DIR}/igreen-front.new
expect {
    "password:" {
        send "${password}\r"
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    timeout {
        puts "❌ 上传超时"
        exit 1
    }
}
expect {
    "100%" {
        puts "\n✅ 构建产物上传成功"
    }
    "already exists" {
        puts "\n⚠️  文件已存在，继续部署流程"
    }
    timeout {
        puts "\n❌ 上传超时"
        exit 1
    }
}

puts "\n🔄 步骤 3: 远程部署更新..."

# 执行部署命令
spawn ssh ${SERVER_USER}@${SERVER_HOST}
expect {
    "password:" {
        send "${password}\r"
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    timeout {
        puts "❌ SSH连接超时"
        exit 1
    }
}

# 等待shell提示符
expect "*#*"

# 创建备份
send "cd ${SERVER_APP_DIR}\r"
expect "*#*"
send "mkdir -p backup\r"
expect "*#*"
send "if [ -d ${SERVER_DIST} ]; then mv ${SERVER_DIST} backup/igreen-front-\$(date +%Y%m%d_%H%M%S); fi\r"
expect "*#*"
puts "  📦 备份完成"

# 替换构建产物
send "mv igreen-front.new ${SERVER_DIST}\r"
expect "*#*"
puts "  🔄 构建产物已替换"

# 设置正确的权限
send "chown -R www-data:www-data ${SERVER_DIST}\r"
expect "*#*"
send "chmod -R 755 ${SERVER_DIST}\r"
expect "*#*"
puts "  🔐 权限设置完成"

# 测试Nginx配置
send "nginx -t\r"
expect {
    "successful" {
        puts "  ✅ Nginx配置测试通过"
    }
    timeout {
        puts "  ⚠️  Nginx配置测试失败，将继续部署"
    }
}

# 重启Nginx
send "systemctl reload nginx\r"
expect "*#*"
puts "  🚀 Nginx已重启"

# 等待服务启动
send "sleep 3\r"
expect "*#*"

# 检查Nginx状态
send "systemctl is-active nginx\r"
expect {
    "active" {
        puts "  ✅ Nginx服务运行正常"
    }
    timeout {
        puts "  ⚠️  Nginx服务状态检查失败"
    }
}

# 检查应用可访问性
puts "\n🌐 测试应用访问..."
send "curl -s -o /dev/null -w \"%{http_code}\" http://localhost/\r"
expect {
    -re {200|301|302} {
        puts "  ✅ 应用访问正常 (HTTP $expect_out(0,string))"
    }
    timeout {
        puts "  ⚠️  应用访问测试失败，请检查配置"
    }
}

puts "\n=========================================="
puts "部署完成！"
puts "=========================================="
puts "管理地址: http://${SERVER_HOST}/"
puts "查看日志: ssh ${SERVER_USER}@${SERVER_HOST} 'tail -f /var/log/nginx/iGreenticketing_access.log'"

# 退出SSH
send "exit\r"
expect eof