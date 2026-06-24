# pg-frontend

用户管理系统前端，React + TypeScript + Vite + Ant Design 5。

## 启动
```bash
cd ~/zhaijinlei/pg-frontend
npm run dev      # 开发服务器 http://localhost:5173
```

## 技术栈
- React 19 + TypeScript
- Vite 8
- Ant Design 5 (暗色主题, 紫色系 primary #6366f1)
- React Router v7 (createBrowserRouter)
- Axios (API 客户端)

## 项目结构
```
src/
├── main.tsx                  # 入口, ConfigProvider 暗色主题 + 中文 locale
├── App.tsx                   # 路由 + ErrorBoundary 包裹
├── api/
│   ├── client.ts             # Axios 实例 + 拦截器
│   ├── auth.api.ts           # Auth API + 类型
│   ├── users.api.ts          # Users API + User 类型
│   └── auditLogs.api.ts      # AuditLogs API + 类型
├── routes/
│   └── index.tsx             # ROUTES 路径常量
├── hooks/
│   ├── useUsers.ts           # 用户数据逻辑 (fetch/create/update/delete)
│   └── useAuditLogs.ts       # 操作日志数据逻辑
├── context/AuthContext.tsx    # 认证状态管理 (token/user)
├── pages/
│   ├── LoginPage.tsx         # 登录/注册 (Tabs 切换)
│   ├── UsersPage.tsx         # 用户管理 (Table + Modal + Form)
│   └── AuditLogsPage.tsx     # 操作日志 (Table + 筛选)
├── components/
│   ├── Layout.tsx            # 侧边栏布局 (Ant Layout + Menu)
│   └── ErrorBoundary.tsx     # 全局错误边界
└── styles/index.css          # 全局样式
```

## 后端依赖
- 后端地址: http://localhost:3000/api/v1
- 数据库: PostgreSQL testdb, 用户 zhaijinlei, 无密码

## 拓展指南
- **新页面**: 创建 api/xxx.api.ts → hooks/useXxx.ts → pages/XxxPage.tsx，routes/index.tsx 加路径
- **新 API**: 在 api/ 下新建域文件，按 client.ts 的 axios 实例扩展

## Git
- 仓库: git@github.com:zhaijinlei12345/pg-frontend.git
- 主分支: main
- 当前分支: feature-信息设置
