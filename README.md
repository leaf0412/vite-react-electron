# Vite React Electron

一个使用 Vite + React + Electron 构建的现代桌面应用程序模板。

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **桌面框架**: Electron 30
- **开发语言**: TypeScript
- **代码规范**: ESLint
- **Git 规范**: Commitlint
- **包管理器**: npm

## 特性

- ⚡️ 基于 Vite 的快速热重载开发体验
- 🎯 TypeScript 支持，提供类型安全
- 📦 开箱即用的 Electron 配置
- 🔍 ESLint 代码检查
- 💻 现代化的开发工具链
- 🚀 使用 electron-builder 进行应用打包
- 📝 规范的 Git 提交信息格式

## 项目结构

```
├── electron/               # Electron 主进程相关代码
│   ├── config/            # 配置文件
│   ├── handlers/          # 事件处理程序
│   ├── main.ts           # 主进程入口文件
│   └── preload.ts        # 预加载脚本
├── src/                   # 渲染进程源代码
│   ├── assets/           # 静态资源
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 渲染进程入口文件
├── public/                # 静态资源目录
└── dist-electron/         # 编译后的 Electron 代码
```

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run build
```

## 脚本命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 运行代码检查
- `npm run preview` - 预览生产构建

## Git 提交规范

项目使用 Commitlint 来规范 Git 提交信息，支持以下类型：

- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- perf: 性能优化
- test: 测试相关
- chore: 构建过程或辅助工具的变动
