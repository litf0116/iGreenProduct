
# Engineer Ticketing App (iGreenApp)

工程师移动APP - 充电桩维护工单系统

原始设计稿: https://www.figma.com/design/oGDLlcbGvLmCtZIaVognE9/Engineer-Ticketing-App

## 开发环境运行

安装依赖：
```bash
npm install
```

启动开发服务器：
```bash
npm run dev
```

## 环境配置

复制环境变量配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件配置：
- `VITE_API_URL`: 后端API地址

## 项目结构

```
iGreenApp/
├── src/
│   ├── components/     # React组件
│   ├── lib/           # 工具函数和API客户端
│   └── assets/        # 静态资源
├── dist/             # 构建输出目录
└── package.json      # 项目配置
```