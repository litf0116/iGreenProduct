#!/usr/bin/expect -f

# iGreenticketing 前端自动化部署脚本 (简化版)
set timeout 60

# 服务器配置
set SERVER_HOST "180.188.45.250"
set SERVER_USER "root"
set SERVER_APP_DIR "/www/wwwroot/igreen"
set BUILD_DIR "./build"

puts "=========================================="
puts "iGreenticketing 前端自动化部署"
puts "=========================================="

# 检查本地构建产物是否存在
if {![file exists ${BUILD_DIR}]} {
    puts "❌ 错误: 未找到本地构建目录 ${BUILD_DIR}"
    puts "请先执行: npm run build"
    exit 1
}

# 获取密码
set password $::env(DEPLOY_PASSWORD)
if {$password eq ""} {
    puts -nonewline "请输入SSH密码: "
    stty -echo
    set password [gets stdin]
    stty echo
    puts ""
}

puts "\n📦 步骤 1: 构建验证..."
puts "✅ 构建产物验证通过"

puts "\n📦 步骤 2: 上传构建产物到服务器..."

# 上传构建产物
spawn scp -r ${BUILD_DIR} ${SERVER_USER}@${SERVER_HOST}:${SERVER_APP_DIR}/igreen-front.new
expect {
    -timeout 120 {
        expect eof
        puts "\n✅ 构建产物上传完成"
    }
    timeout {
        puts "\n❌ 上传超时"
        exit 1
    }
    eof {
        puts "\n✅ 构建产物上传完成"
    }
}

puts "\n🔄 步骤 3: 远程部署更新..."

# 执行远程部署
spawn ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_APP_DIR} && ./deploy-update.sh"
expect {
    "password:" {
        send "${password}\r"
    }
    timeout {
        puts "❌ SSH连接超时"
        exit 1
    }
}

# 等待命令完成
expect {
    -timeout 60 {
        expect eof
        puts "\n✅ 远程部署完成"
    }
    timeout {
        puts "\n⚠️  部署超时，请检查"
    }
    eof {
        puts "\n✅ 远程部署完成"
    }
}

puts "\n=========================================="
puts "部署完成！"
puts "=========================================="
puts "访问地址: http://${SERVER_HOST}/"
puts "=========================================="