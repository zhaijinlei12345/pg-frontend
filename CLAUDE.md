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
├── main.tsx              # 入口, ConfigProvider 暗色主题 + 中文 locale
├── App.tsx               # 路由: /login, /users (需认证)
├── api/client.ts         # Axios 封装, JWT 拦截器, API 接口定义
├── context/AuthContext.tsx # 认证状态管理 (token/user)
├── pages/
│   ├── LoginPage.tsx     # 登录/注册 (Tabs 切换)
│   └── UsersPage.tsx     # 用户管理 (Table + Modal + Form)
├── components/
│   └── Layout.tsx        # 侧边栏布局 (Ant Layout + Menu)
└── styles/index.css      # 全局样式
```

## 后端依赖
- 后端地址: http://localhost:3000
- 数据库: PostgreSQL testdb, 用户 zhaijinlei, 无密码

## Git
- 仓库: git@github.com:zhaijinlei12345/pg-frontend.git
- 主分支: main
- 当前分支: feature-信息设置
