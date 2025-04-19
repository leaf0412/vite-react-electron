# Vite React Electron

一个现代化的 Vite + React + Electron 桌面应用程序开发框架。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.6-green.svg)](https://github.com/leaf0412/vite-react-electron)

## 📋 项目概述

这是一个集成了最新技术栈的桌面应用开发模板，提供了开箱即用的配置和工具链，帮助开发者快速构建高性能、美观的跨平台桌面应用。

## 🔥 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 6
- **桌面框架**: Electron 31
- **UI 组件库**: Ant Design 5
- **路由**: React Router DOM 7
- **状态管理**: 支持集成Redux（已配置）
- **国际化**: i18next + react-i18next
- **开发语言**: TypeScript 5
- **代码规范**: ESLint
- **Git 规范**: Commitlint
- **自动发布**: release-it
- **自动更新**: electron-updater

## ✨ 特性

- ⚡️ 基于 Vite 的极速热重载开发体验
- 🌐 内置国际化支持（中文/英文）
- 🎯 TypeScript 全面类型支持
- 📦 优化的 Electron 配置与打包设置
- 🔍 ESLint 代码检查与自动修复
- 🚀 一键构建与发布流程
- 📝 标准化的 Git 提交信息格式
- 🔄 应用内自动更新支持
- 📂 文件管理组件示例
- 🧩 模块化的项目结构

## 🚀 快速开始

### 创建项目

```bash
git clone https://github.com/leaf0412/vite-react-electron.git

cd vite-react-electron
```

### 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建应用
npm run build

# 构建并打包应用
npm run package
```

### 发布版本

```bash
# 自动发布新版本
npm run release

# 仅测试发布流程
npm run release:dry

# 指定版本级别发布
npm run release:patch  # 补丁版本
npm run release:minor  # 次要版本
npm run release:major  # 主要版本
```

## 📁 项目结构

```
├── src/                   # 源代码目录
│   ├── main/             # Electron 主进程
│   │   ├── core/        # 核心功能
│   │   ├── ipc/         # IPC 通信处理
│   │   ├── services/    # 服务模块
│   │   └── main.ts      # 主进程入口
│   ├── preload/          # 预加载脚本
│   ├── renderer/         # 渲染进程（React）
│   │   ├── assets/      # 静态资源
│   │   ├── components/  # 公共组件
│   │   ├── pages/       # 页面组件
│   │   ├── layouts/     # 布局组件
│   │   ├── router/      # 路由配置
│   │   ├── i18n/        # 国际化
│   │   ├── store/       # 状态管理
│   │   ├── bridge/      # 主进程通信桥接
│   │   ├── utils/       # 工具函数
│   │   └── App.tsx      # 应用入口
│   ├── shared/           # 共享代码
│   └── types/            # 类型定义
├── public/                # 静态资源目录
├── electron-builder.json5 # Electron 构建配置
├── vite.config.ts         # Vite 配置
├── .release-it.json       # 发布配置
└── commitlint.config.mjs  # 提交规范配置
```

## ⚙️ 配置说明

### Vite 配置

`vite.config.ts` 文件包含了 Vite 的配置，包括插件配置和构建选项：

- vite-plugin-electron: 处理 Electron 主进程代码
- vite-plugin-electron-renderer: 处理渲染进程代码
- @vitejs/plugin-react: React 支持

### Electron 构建配置

`electron-builder.json5` 包含了应用打包配置：

- 应用图标设置
- 构建目标平台
- 安装程序选项
- 自动更新配置

## 🔄 IPC 通信

主进程和渲染进程之间的通信通过 IPC (进程间通信) 实现：

1. 主进程IPC处理 (`src/main/ipc/`)
2. 预加载脚本 (`src/preload/`)
3. 渲染进程桥接 (`src/renderer/bridge/`)

## ⌨️ 开发环境

### 前置要求

- Node.js 18+ 
- npm 9+

### 常用命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run package` - 构建并打包应用
- `npm run lint` - 运行代码检查
- `npm run typecheck` - 类型检查
- `npm run preview` - 预览生产构建

## 🔖 Git 提交规范

项目使用 Commitlint 来规范 Git 提交信息，支持以下类型：

- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- perf: 性能优化
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 🌟 特色功能

### 国际化支持

项目内置了完整的国际化支持，可以轻松切换中英文界面。

- **位置**: `src/renderer/i18n/`
- **功能**: 提供中英文语言切换，自动检测系统语言并应用
- **接口**: 通过 `useTranslation` 钩子在组件中使用

### 自动更新

使用 electron-updater 实现应用的自动检查更新和安装功能。

- **位置**: `src/main/core/upgrade/`
- **功能**: 自动检查新版本、下载更新、安装更新
- **配置**: 在 `electron-builder.json5` 中配置更新服务器

### 文件管理示例

内置文件管理组件示例，展示如何在 Electron 中进行文件操作。

- **位置**: `src/renderer/pages/file-manager/` 和 `src/main/services/file/`
- **功能**: 文件浏览、读取、写入、删除等操作
- **通信**: 通过 IPC 在渲染进程和主进程间传递文件操作指令

## 📦 功能模块详解

项目提供了多种功能模块，每个模块都有特定的用途和位置：

### 主进程模块 (src/main/)

| 模块 | 位置 | 功能描述 |
|------|------|----------|
| 窗口管理 | `src/main/core/window/` | 管理应用窗口的创建、关闭、最小化、最大化等操作 |
| 对话框 | `src/main/core/dialog/` | 提供文件选择、消息提示、确认框等原生对话框功能 |
| 自动更新 | `src/main/core/upgrade/` | 应用程序自动更新检测与安装 |
| 协议处理 | `src/main/core/protocol/` | 自定义协议处理，支持从URL启动应用 |
| 文件服务 | `src/main/services/file/` | 文件系统操作，包括读写、复制、移动、删除等 |
| 网络通信 | `src/main/network/` | 网络相关功能，包括UDP和WebSocket支持 |

### 渲染进程模块 (src/renderer/)

| 模块 | 位置 | 功能描述 |
|------|------|----------|
| 主页 | `src/renderer/pages/home/` | 应用主页面，展示核心功能入口 |
| 启动页 | `src/renderer/pages/startup/` | 应用启动页，显示加载进度 |
| 窗口管理 | `src/renderer/pages/window/` | 窗口控制界面示例 |
| 文件管理器 | `src/renderer/pages/file-manager/` | 文件浏览和操作界面 |
| 对话框示例 | `src/renderer/pages/dialog/` | 各种对话框使用示例 |
| 通信桥接 | `src/renderer/bridge/` | 与主进程通信的桥接模块 |
| 国际化 | `src/renderer/i18n/` | 多语言支持，默认支持中英文 |

### 通信与集成

| 功能 | 位置 | 描述 |
|------|------|------|
| IPC 事件 | `src/main/ipc/` | 定义和处理进程间通信事件 |
| 预加载脚本 | `src/preload/` | 安全地暴露主进程API给渲染进程 |
| 共享类型 | `src/types/` | 在主进程和渲染进程间共享的类型定义 |
| 共享工具 | `src/shared/` | 可在两种进程中复用的工具函数 |

## 🔌 扩展功能

除了基本功能外，项目还提供以下扩展功能：

### 网络通信

- **UDP通信**: `src/main/network/udp/` - 提供UDP协议通信能力
- **WebSocket**: `src/main/network/websocket/` - 支持WebSocket服务器和客户端

### 系统集成

- **协议注册**: 支持自定义URL协议打开应用

