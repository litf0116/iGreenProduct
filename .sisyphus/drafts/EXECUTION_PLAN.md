# iGreen+ 问题修复与功能开发执行计划

> 生成日期: 2026年1月28日
> 
> 基于代码分析发现的问题和需求，生成执行计划

---

## 一、问题清单与优先级

### P0 - 阻塞性问题 (必须立即处理)

| 问题 | 影响 | 优先级 |
|------|------|:------:|
| igreen-front TypeScript编译错误 | 无法正常开发和构建 | P0 |
| sonner依赖缺失 | iGreenApp toast通知功能异常 | P0 |

### P1 - 核心功能 (本周完成)

| 功能 | 预估工时 | 优先级 |
|------|:--------:|:------:|
| 站点数据导入导出API | 6h | P1 |
| APK打包 | 4h | P1 |
| Google Maps集成 | 8h | P1 |

### P2 - 优化功能 (可选)

| 功能 | 预估工时 | 优先级 |
|------|:--------:|:------:|
| iGreenApp sonner依赖修复 | 0.5h | P2 |

---

## 二、P0 - TypeScript类型错误修复

### 2.1 问题分析

igreen-front存在大量TypeScript编译错误，主要集中在：

| 错误类型 | 文件 | 数量 |
|----------|------|------|
| React类型声明缺失 | Dashboard.tsx, TicketDetail.tsx | ~50+ |
| TicketStatus枚举不匹配 | Dashboard.tsx, TicketDetail.tsx | ~30+ |
| ImportMeta.env属性不存在 | kyInstance.ts | 1 |
| 语言类型索引错误 | Dashboard.tsx | 4 |
| 参数个数不匹配 | kyInstance.ts | 2 |

### 2.2 修复步骤

```bash
# 1. 进入igreen-front目录
cd igreen-front

# 2. 安装React类型声明
npm install --save-dev @types/react @types/react-dom

# 3. 创建Vite环境变量声明文件
echo "/// <reference types="vite/client" />" > src/vite-env.d.ts

# 4. 修复TicketStatus类型定义
# 编辑 src/lib/types.ts
# 添加 SUBMITTED 状态

# 5. 编译验证
npm run build
```

### 2.3 详细修复任务

- [ ] 1.1 安装 @types/react @types/react-dom
- [ ] 1.2 创建 src/vite-env.d.ts 声明Vite环境变量
- [ ] 1.3 修复 TicketStatus 枚举 (添加 SUBMITTED, REVIEW, COMPLETED)
- [ ] 1.4 修复 Dashboard.tsx 语言类型索引
- [ ] 1.5 修复 kyInstance.ts ImportMeta 类型
- [ ] 1.6 编译验证

**验收标准**: `npm run build` 编译通过，无错误

---

## 三、P0 - iGreenApp sonner依赖修复

### 3.1 问题分析

iGreenApp使用了 sonner 但未安装依赖：

```
Cannot find module 'sonner@2.0.3' or its corresponding type declarations
```

### 3.2 修复步骤

```bash
# 进入iGreenApp目录
cd iGreenApp

# 安装sonner
npm install sonner

# 编译验证
npm run build
```

**验收标准**: 编译通过，Toast通知功能正常

---

## 四、P1 - 站点数据导入导出功能

### 4.1 功能说明

前端 SiteManagement.tsx 已有导入导出UI，但后端API未实现：

| 功能 | 前端函数 | 状态 |
|------|----------|------|
| 导出站点 | handleExport() | 纯前端实现 |
| 下载模板 | handleDownloadTemplate() | 纯前端实现 |
| 导入站点 | handleImport() | 纯前端实现 |

### 4.2 需要开发的后端API

| API端点 | 方法 | 说明 |
|---------|------|------|
| `/api/sites/export` | GET | 导出全部站点数据(Excel/CSV) |
| `/api/sites/export` | POST | 根据条件筛选导出 |
| `/api/sites/import` | POST | 批量导入站点 |

### 4.3 实现步骤

1. **添加Apache POI依赖** (pom.xml)
   ```xml
   <dependency>
       <groupId>org.apache.poi</groupId>
       <artifactId>poi-ooxml</artifactId>
       <version>5.2.5</version>
   </dependency>
   ```

2. **创建导出服务**
   - `SiteExportService.java` - 站点数据导出逻辑

3. **创建导入服务**
   - `SiteImportService.java` - 站点数据导入逻辑

4. **创建API控制器**
   - `SiteImportExportController.java`

5. **前端对接**
   - 更新 api.ts 添加导出导入方法
   - 对接 handleExport, handleImport

### 4.4 详细任务

- [ ] 4.1 添加Apache POI依赖
- [ ] 4.2 创建 SiteExportService (导出Excel)
- [ ] 4.3 创建 SiteImportService (导入Excel)
- [ ] 4.4 创建 SiteImportExportController
- [ ] 4.5 前端api.ts添加导入导出方法
- [ ] 4.6 测试导入导出功能

**验收标准**: 
- 站点数据可导出为Excel
- 可下载导入模板
- 可通过Excel批量导入站点

---

## 五、P1 - APK打包

### 5.1 方案选择

推荐使用 **Capacitor**，原因：
- 与React生态兼容性最好
- 支持原生Android和iOS
- 社区活跃，文档完善

### 5.2 实现步骤

```bash
# 1. 进入iGreenApp目录
cd iGreenApp

# 2. 安装Capacitor
npm install @capacitor/core @capacitor/android

# 3. 初始化Capacitor
npx cap init "iGreenApp" --web-dir dist

# 4. 添加Android平台
npx cap add android

# 5. 构建并同步
npm run build
npx cap sync

# 6. 在Android Studio中打开
npx cap open android

# 7. 生成签名APK
# 在Android Studio中: Build > Generate Signed Bundle/APK
```

### 5.3 配置要求

**Android要求**:
- Android Studio 安装
- Android SDK (API 23+)
- JDK 11+

**config.xml配置**:
```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.igreen.app" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>iGreenApp</name>
    <description>EV Charging Station Maintenance App</description>
    <platform name="android">
        <preference name="android-minSdkVersion" value="23" />
        <preference name="android-targetSdkVersion" value="33" />
    </platform>
</widget>
```

### 5.4 详细任务

- [ ] 5.1 安装Capacitor依赖
- [ ] 5.2 初始化Capacitor配置
- [ ] 5.3 添加Android平台
- [ ] 5.4 配置Android签名
- [ ] 5.5 首次构建APK
- [ ] 5.6 测试APK功能

**验收标准**: 生成可安装的APK文件，功能正常

---

## 六、P1 - Google Maps集成

### 6.1 实现方案

使用 `@react-google-maps/api` 库：

```bash
npm install @react-google-maps/api
```

### 6.2 功能模块

| 模块 | 页面 | 功能 |
|------|------|------|
| 站点地图 | SiteManagement | 在地图上显示所有站点位置 |
| 工单地图 | TicketDetail | 显示工单对应站点位置 |
| 位置选择 | CreateTicket | 在地图上选择站点位置 |

### 6.3 实现步骤

1. **获取Google Maps API Key**
   - 访问 Google Cloud Console
   - 创建项目，启用 Maps JavaScript API
   - 生成API Key

2. **安装依赖**
   ```bash
   npm install @react-google-maps/api
   ```

3. **创建地图组件**
   - `src/components/ui/GoogleMap.tsx`
   - `src/components/ui/Marker.tsx`

4. **集成到页面**
   - SiteManagement.tsx 添加地图展示
   - TicketDetail.tsx 添加地图展示

### 6.4 详细任务

- [ ] 6.1 获取Google Maps API Key
- [ ] 6.2 安装 @react-google-maps/api
- [ ] 6.3 创建 GoogleMap 基础组件
- [ ] 6.4 站点管理页面集成地图
- [ ] 6.5 工单详情页面集成地图
- [ ] 6.6 配置API Key和计费

**验收标准**:
- 地图正常显示
- 站点位置标注正确
- 无控制台错误

---

## 七、执行顺序

### 第一阶段: P0问题修复 (Day 1)

| 时间 | 任务 | 负责 |
|------|------|------|
| 上午 | TypeScript类型错误修复 | 开发者 |
| 下午 | sonner依赖修复 | 开发者 |

### 第二阶段: 核心功能开发 (Day 2-3)

| 时间 | 任务 | 负责 |
|------|------|------|
| Day 2 上午 | APK打包 | 开发者 |
| Day 2 下午 | 导入导出API开发 | 开发者 |
| Day 3 | Google Maps集成 | 开发者 |

### 第三阶段: 测试验证 (Day 3-4)

| 时间 | 任务 | 负责 |
|------|------|------|
| Day 3 下午 | 功能联调测试 | 开发者 |
| Day 4 | 问题修复和验收 | 开发者 |

---

## 八、验收清单

### P0验收

- [ ] igreen-front `npm run build` 编译通过
- [ ] iGreenApp `npm run build` 编译通过
- [ ] sonner toast通知功能正常

### P1验收

- [ ] 站点数据可导出Excel
- [ ] 站点数据可从Excel导入
- [ ] APK文件可安装运行
- [ ] Google Maps正常显示
- [ ] 站点位置标注正确

---

## 九、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| Google Maps需要科学上网 | 开发环境无法测试 | 使用离线地图替代方案 |
| APK签名配置复杂 | 影响打包进度 | 提前准备签名文件 |
| 导入格式不统一 | 数据导入失败 | 提供标准模板和验证 |

---

## 十、输出产物

| 产物 | 说明 |
|------|------|
| igreen-front编译通过的代码 | 修复所有TypeScript错误 |
| iGreenApp编译通过的代码 | 安装sonner依赖 |
| 导入导出API | 后端Java代码 |
| APK文件 | 可安装的Android应用 |
| Google Maps集成代码 | 地图展示功能 |

---

> **计划制定**: Prometheus (战略规划顾问)  
> **预计执行时间**: 4天
