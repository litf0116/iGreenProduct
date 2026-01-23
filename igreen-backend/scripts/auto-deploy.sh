#!/usr/bin/expect -f

# iGreen Backend 自动化部署脚本
# 使用 expect 自动处理 SSH 密码输入

set timeout 60

# 服务器配置
set SERVER_HOST "180.188.45.250"
set SERVER_USER "root"
set SERVER_DIR "/data/igreen-backend"
set LOCAL_JAR "./igreen-backend/target/igreen-backend-1.0.0-SNAPSHOT.jar"
set SERVER_JAR "${SERVER_DIR}/igreen-backend-1.0.0-SNAPSHOT.jar"

puts "=========================================="
puts "iGreen Backend 自动化部署"
puts "=========================================="

# 检查本地JAR是否存在
if {![file exists ${LOCAL_JAR}]} {
    puts "❌ 错误: 未找到本地JAR包 ${LOCAL_JAR}"
    puts "请先执行: mvn clean package -DskipTests"
    exit 1
}

# 获取密码（从环境变量或提示输入）
set password $::env(DEPLOY_PASSWORD)
if {$password eq ""} {
    puts -nonewline "请输入SSH密码: "
    stty -echo
    set password [gets stdin]
    stty echo
    puts ""
}

puts "\n📦 步骤 1: 上传JAR包到服务器..."

# 上传JAR包
spawn scp ${LOCAL_JAR} ${SERVER_USER}@${SERVER_HOST}:${SERVER_JAR}.new
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
        puts "\n✅ JAR包上传成功"
    }
    timeout {
        puts "\n❌ 上传失败"
        exit 1
    }
}

puts "🔄 步骤 2: 远程部署应用..."

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

# 执行部署脚本
send "cd ${SERVER_DIR}\r"
expect "*#*"

# 备份当前JAR
send "mkdir -p backup\r"
expect "*#*"
send "if [ -f ${SERVER_JAR} ]; then cp ${SERVER_JAR} backup/igreen-backend-\$(date +%Y%m%d_%H%M%S).jar; fi\r"
expect "*#*"
puts "  📦 备份完成"

# 停止应用
send "pkill -f igreen-backend || true\r"
expect "*#*"
send "sleep 2\r"
expect "*#*"
puts "  🛑 应用已停止"

# 替换JAR
send "mv ${SERVER_JAR}.new ${SERVER_JAR}\r"
expect "*#*"
puts "  🔄 JAR包已替换"

# 启动应用
send "cd ${SERVER_DIR}\r"
expect "*#*"
send "export JWT_SECRET_KEY='iGreenProduct2025SecureJWTKeyForProductionEnvironment'\r"
expect "*#*"
send "nohup java -jar -Xms512m -Xmx2g -XX:+UseG1GC ${SERVER_JAR} --spring.profiles.active=prod > logs/app.log 2>&1 &\r"
expect "*#*"
puts "  🚀 应用启动中..."

# 等待启动
send "sleep 5\r"
expect "*#*"

# 检查进程
send "pgrep -f igreen-backend\r"
expect {
    -re {[0-9]+} {
        puts "  ✅ 应用启动成功！PID: $expect_out(0,string)"
    }
    timeout {
        puts "  ⚠️  无法确认应用状态，请检查日志"
    }
}

# 显示日志
puts "\n📊 查看最新日志:"
send "tail -20 logs/app.log\r"
expect "*#*"

puts "\n=========================================="
puts "部署完成！"
puts "=========================================="
puts "应用地址: http://${SERVER_HOST}:8090"
puts "查看日志: ssh ${SERVER_USER}@${SERVER_HOST} 'tail -f ${SERVER_DIR}/logs/app.log'"

# 退出SSH
send "exit\r"
expect eof
