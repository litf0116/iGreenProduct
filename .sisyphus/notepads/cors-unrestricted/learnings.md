## CORS 配置放开 - 2026-04-03

### 修改内容
- 文件：`igreen-backend/src/main/java/com/igreen/common/config/SecurityConfig.java`
- 方法：`corsConfigurationSource()`

### 具体变更
1. 删除 `setAllowedOrigins(List.of(...))` - 移除特定域名限制
2. 保留 `setAllowedOriginPatterns(List.of("*"))` - 允许所有来源
3. 添加 PATCH 到 AllowedMethods
4. 添加 Accept, Origin 到 AllowedHeaders
5. 添加 Content-Type 到 ExposedHeaders
6. 保持 `setAllowCredentials(true)`

### 验证
- ✅ 编译通过：`mvn compile -q`
- ✅ 配置包含 `setAllowedOriginPatterns(List.of("*"))`
- ✅ 配置不包含 `setAllowedOrigins`
- ✅ 包含所有常用 HTTP 方法 (GET, POST, PUT, DELETE, OPTIONS, PATCH)
- ✅ 包含所有常用 headers (Authorization, Content-Type, X-Requested-With, Accept, Origin)

### 证据
- `.sisyphus/evidence/cors-unrestricted.txt`
- `.sisyphus/evidence/cors-compile.txt`
