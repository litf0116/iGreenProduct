# Spring Boot 应用启动命令

## 完整启动命令 (修复JWT配置问题)

```bash
# 基本启动 (prod环境)
java -jar app.jar --spring.profiles.active=prod

# 完整生产环境启动命令 (包含所有必需的环境变量)
java \
  -Xmx1024m \
  -Xms512m \
  -XX:+UseG1GC \
  -XX:+UseContainerSupport \
  -Dspring.profiles.active=prod \
  -Dserver.port=8080 \
  -Ddb.host=localhost \
  -Ddb.port=3306 \
  -Ddb.name=igreen_db \
  -Ddb.username=igreen_db \
  -Ddb.password=knS8jexaAnByhpj4 \
  -Dupload.dir=/opt/igreen/uploads \
  -DJWT_SECRET_KEY=iGreenProduct2025SecureJWTKeyForProductionEnvironment \
  -DJWT_EXPIRATION=7200000 \
  -DJWT_REFRESH_EXPIRATION=604800000 \
  -DMAX_FILE_SIZE=52428800 \
  -DALLOWED_ORIGINS=https://yourdomain.com \
  -jar app.jar

# 后台运行 (推荐用于生产环境)
nohup java \
  -Xmx1024m \
  -Xms512m \
  -XX:+UseG1GC \
  -XX:+UseContainerSupport \
  -Dspring.profiles.active=prod \
  -Dserver.port=8080 \
  -Ddb.host=localhost \
  -Ddb.port=3306 \
  -Ddb.name=igreen_db \
  -Ddb.username=igreen_db \
  -Ddb.password=knS8jexaAnByhpj4 \
  -Dupload.dir=/opt/igreen/uploads \
  -DJWT_SECRET_KEY=iGreenProduct2025SecureJWTKeyForProductionEnvironment \
  -DJWT_EXPIRATION=7200000 \
  -DJWT_REFRESH_EXPIRATION=604800000 \
  -DMAX_FILE_SIZE=52428800 \
  -DALLOWED_ORIGINS=https://yourdomain.com \
  -jar app.jar > app.log 2>&1 &
```

## 环境变量方式

```bash
# 设置环境变量
export SPRING_PROFILES_ACTIVE=prod
export SERVER_PORT=8080
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=igreen_db
export DB_USERNAME=igreen_db
export DB_PASSWORD=knS8jexaAnByhpj4
export UPLOAD_DIR=/opt/igreen/uploads
export JWT_SECRET_KEY=iGreenProduct2025SecureJWTKeyForProductionEnvironment

# 启动应用
java -jar app.jar
```

## 使用jar-control.sh脚本 (推荐)

```bash
# 如果使用我们创建的控制脚本
./jar-control.sh start

# 或指定JAR文件路径
./jar-control.sh --jar-file=/path/to/app.jar start
```

## 验证启动成功

```bash
# 检查端口是否监听
netstat -tlnp | grep :8080

# 测试健康检查
curl -s http://localhost:8080/actuator/health | jq .

# 测试API
curl -s http://localhost:8080/api/health

# 查看应用日志
tail -f app.log
```</content>
<parameter name="filePath">START_COMMANDS.md