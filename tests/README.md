# 测试文档

本目录包含 iGreenProduct 项目的集成测试和回归测试脚本。

## 目录结构

```
tests/
├── backend/              # 后端 API 测试
│   ├── auth.test.sh
│   ├── user.test.sh
│   └── ticket.test.sh
├── integration/          # 集成测试
│   └── e2e.test.sh
├── logs/                # 测试日志
└── README.md            # 本文档
```

## 测试脚本规范

### 命名约定
- 使用 `*.test.sh` 作为测试脚本文件名
- 测试脚本应包含：描述、依赖、执行步骤

### 脚本模板

```bash
#!/bin/bash
# ============================================================================
# 测试名称: 用户注册和登录
# 描述: 验证用户注册流程和登录功能
# 依赖: 后端服务运行在 8080 端口
# ============================================================================

BASE_URL="http://localhost:8080"
LOG_FILE="tests/logs/$(basename $0 .sh).log"

# 创建日志目录
mkdir -p tests/logs

# 测试函数
test_register() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试用户注册..." | tee -a "$LOG_FILE"

  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "测试用户",
      "username": "testuser_$(date +%s)",
      "password": "Test1234",
      "confirmPassword": "Test1234",
      "country": "China"
    }')

  SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')

  if [ "$SUCCESS" = "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 注册成功" | tee -a "$LOG_FILE"
    return 0
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 注册失败: $RESPONSE" | tee -a "$LOG_FILE"
    return 1
  fi
}

# 执行测试并检查结果
if test_register; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试通过 ✓" | tee -a "$LOG_FILE"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 测试失败 ✗" | tee -a "$LOG_FILE"
  exit 1
fi
```

## 测试管理

### 运行单个测试
```bash
./tests/backend/auth.test.sh
```

### 运行所有测试
```bash
make test-all      # 运行所有测试（需要在 Makefile 中定义）
```

### 查看测试日志
```bash
tail -f tests/logs/backend/auth.test.sh.log
```

## 回归测试管理

### 定期清理
- 删除超过 30 天的测试日志
- 清理不符合命名规范的测试文件

### 版本标记
- 测试脚本名称包含版本或日期
- 失败的测试在文件名添加 `.failed` 后缀

## 注意事项

1. 确保后端服务在运行状态
2. 确保数据库已正确初始化
3. 测试失败时应返回非零退出码
4. 测试日志应包含时间戳
5. 避免在测试脚本中使用硬编码的敏感信息

---

**文档版本**: 1.0.0
**最后更新**: 2025-02-11
