/**
 * Site 模块 API 测试脚本 (Node.js 版本)
 * 使用方式: node test_site_api.mjs [BASE_URL] [TOKEN]
 * 示例: node test_site_api.mjs http://localhost:8080 your_token_here
 */

import http from 'http';

const BASE_URL = process.argv[2] || 'http://localhost:8080';
const TOKEN = process.argv[3] || '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// 工具函数
const printTest = (msg) => console.log(`${colors.yellow}[TEST]${colors.reset} ${msg}`);
const printSuccess = (msg) => console.log(`${colors.green}[PASS]${colors.reset} ${msg}`);
const printError = (msg) => console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`);
const printInfo = (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`);

// HTTP 请求封装
async function request(method, path, data = null, useAuth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (useAuth && TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试结果统计
let totalTests = 0;
let passedTests = 0;

async function runTest(testName, testFn) {
  totalTests++;
  printTest(testName);
  try {
    const result = await testFn();
    if (result.success) {
      passedTests++;
      printSuccess(result.message || '测试通过');
    } else {
      printError(result.message || '测试失败');
    }
  } catch (error) {
    printError(`测试异常: ${error.message}`);
  }
  console.log();
}

// ============================================
// 1. 站点列表查询测试
// ============================================
console.log('\n============================================');
console.log('站点列表查询测试');
console.log('============================================\n');

await runTest('获取站点列表（默认分页）', async () => {
  const result = await request('GET', '/api/sites');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `状态码: ${result.status}, 响应码: ${result.data.code}`
  };
});

await runTest('获取站点列表（page=1, size=5）', async () => {
  const result = await request('GET', '/api/sites?page=1&size=5');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `返回 ${result.data.data?.records?.length || 0} 条记录`
  };
});

await runTest('按关键字筛选（keyword=上海）', async () => {
  const result = await request('GET', '/api/sites?keyword=上海');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `返回 ${result.data.data?.records?.length || 0} 条记录`
  };
});

await runTest('按级别筛选（level=VIP）', async () => {
  const result = await request('GET', '/api/sites?level=VIP');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `返回 ${result.data.data?.records?.length || 0} 条记录（预期16个）`
  };
});

await runTest('按状态筛选（status=ONLINE）', async () => {
  const result = await request('GET', '/api/sites?status=ONLINE');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `返回 ${result.data.data?.records?.length || 0} 条记录（预期39个）`
  };
});

await runTest('组合筛选（keyword=上海&level=VIP&status=ONLINE）', async () => {
  const result = await request('GET', '/api/sites?keyword=上海&level=VIP&status=ONLINE');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `返回 ${result.data.data?.records?.length || 0} 条记录（预期5个）`
  };
});

// ============================================
// 2. 站点统计测试
// ============================================
console.log('\n============================================');
console.log('站点统计测试');
console.log('============================================\n');

await runTest('获取站点统计信息', async () => {
  const result = await request('GET', '/api/sites/stats');
  if (result.status === 200 && result.data.code === 200) {
    const stats = result.data.data;
    printInfo(`统计数据: ${stats.totalSites} 总数, ${stats.onlineSites} 在线, ${stats.offlineSites} 离线, ${stats.vipSites} VIP`);
    return { success: true, message: '统计查询成功' };
  }
  return { success: false, message: '统计查询失败' };
});

// ============================================
// 3. 站点详情查询测试
// ============================================
console.log('\n============================================');
console.log('站点详情查询测试');
console.log('============================================\n');

await runTest('获取存在的站点详情（test-site-vip-001）', async () => {
  const result = await request('GET', '/api/sites/test-site-vip-001');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: `站点名称: ${result.data.data?.name}`
  };
});

await runTest('获取不存在的站点详情', async () => {
  const result = await request('GET', '/api/sites/nonexistent-id');
  return {
    success: result.status === 400,
    message: `错误码: ${result.data.code}（预期400）`
  };
});

// ============================================
// 4. 站点 CRUD 测试（需要权限）
// ============================================
console.log('\n============================================');
console.log('站点 CRUD 测试');
console.log('============================================\n');

if (!TOKEN) {
  console.log(`${colors.yellow}跳过 CRUD 测试（未提供 TOKEN）${colors.reset}\n`);
} else {
  let newSiteId = '';

  // 创建站点
  await runTest('创建新站点', async () => {
    const timestamp = Date.now();
    const result = await request('POST', '/api/sites', {
      name: `测试站点-${timestamp}`,
      address: `测试地址-${timestamp}`,
      level: 'normal',
      status: 'ONLINE'
    }, true);

    if (result.status === 200 && result.data.code === 200) {
      newSiteId = result.data.data.id;
      return { success: true, message: `新站点 ID: ${newSiteId}` };
    }
    return { success: false, message: `创建失败: ${JSON.stringify(result.data)}` };
  });

  // 更新站点
  if (newSiteId) {
    await runTest(`更新站点（${newSiteId}）`, async () => {
      const result = await request('POST', `/api/sites/${newSiteId}`, {
        name: '测试站点-已更新',
        status: 'OFFLINE'
      }, true);

      return {
        success: result.status === 200 && result.data.code === 200,
        message: `新名称: ${result.data.data?.name}`
      };
    });
  }

  // 删除站点
  if (newSiteId) {
    await runTest(`删除站点（${newSiteId}）`, async () => {
      const result = await request('DELETE', `/api/sites/${newSiteId}`, null, true);
      return {
        success: result.status === 200 && result.data.code === 200,
        message: '删除成功'
      };
    });
  }

  // 创建重复名称的站点
  await runTest('创建重复名称的站点（应失败）', async () => {
    const result = await request('POST', '/api/sites', {
      name: '上海陆家嘴超级充电站',
      address: '测试地址',
      level: 'normal',
      status: 'ONLINE'
    }, true);

    return {
      success: result.status === 400,
      message: `错误码: ${result.data.code}（预期400）`
    };
  });

  // 验证失败（名称为空）
  await runTest('创建站点时名称为空（应失败）', async () => {
    const result = await request('POST', '/api/sites', {
      name: '',
      address: '测试地址',
      level: 'normal',
      status: 'ONLINE'
    }, true);

    return {
      success: result.status === 400,
      message: `错误码: ${result.data.code}（预期400）`
    };
  });
}

// ============================================
// 5. 边界条件测试
// ============================================
console.log('\n============================================');
console.log('边界条件测试');
console.log('============================================\n');

await runTest('分页参数边界测试（page=100, size=100）', async () => {
  const result = await request('GET', '/api/sites?page=100&size=100');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: '边界参数处理正确'
  };
});

await runTest('无效分页参数（page=0）', async () => {
  const result = await request('GET', '/api/sites?page=0&size=10');
  return {
    success: result.status === 400,
    message: `错误码: ${result.data.code}（预期400）`
  };
});

await runTest('无效状态值筛选（status=INVALID）', async () => {
  const result = await request('GET', '/api/sites?status=INVALID');
  return {
    success: result.status === 200 && result.data.code === 200,
    message: '无效状态值处理正确'
  };
});

// ============================================
// 测试完成
// ============================================
console.log('\n============================================');
console.log('测试完成');
console.log('============================================\n');
console.log(`总计: ${totalTests} 个测试`);
console.log(`${colors.green}通过: ${passedTests} 个${colors.reset}`);
console.log(`${colors.red}失败: ${totalTests - passedTests} 个${colors.reset}`);
console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%\n`);

console.log('说明:');
console.log('1. 所有测试用例都是幂等的，可以安全重复执行');
console.log('2. 创建、更新、删除测试需要有效的 TOKEN');
console.log('3. 某些测试依赖于已加载的测试数据\n');
