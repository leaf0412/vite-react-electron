# Electron 项目重构指南

## 🎯 重构目标

将现有复杂的目录结构重构为简单、实用的架构，专为 3~5 人团队设计。

## 📁 新的目录结构

```
src/main/
├── main.ts                     # 应用入口
├── core/                       # 核心基础设施
│   ├── app.ts                 # 应用管理器
│   ├── ipc-manager.ts         # IPC 管理器
│   └── logger.ts              # 日志系统
├── features/                   # 功能模块
│   ├── file/                  # 文件管理 ✅ 已完成
│   │   ├── service.ts         # 业务逻辑 (~130 行)
│   │   ├── ipc.ts             # IPC 处理 (~80 行)
│   │   └── index.ts           # 导出 (~8 行)
│   ├── window/                # 窗口管理 (待迁移)
│   ├── dialog/                # 对话框 (待迁移)
│   ├── network/               # 网络功能 (待迁移)
│   └── system/                # 系统功能 (待迁移)
├── shared/                     # 共享资源 ✅ 已完成
│   ├── constants.ts           # 事件和常量定义
│   ├── types.ts               # 类型定义
│   ├── utils.ts               # 工具函数
│   └── index.ts               # 统一导出
└── protocols/                  # 协议注册 (可选)
```

// 当 file/service.ts 超过 300 行时的拆分方案
file/
├── service.ts           # 主服务类 (~150 行)
├── operations/          # 操作细分
│   ├── read.ts         # 读取操作 (~100 行)
│   ├── write.ts        # 写入操作 (~100 行)
│   ├── directory.ts    # 目录操作 (~100 行)
│   └── permissions.ts  # 权限操作 (~80 行)
├── ipc.ts              # IPC 处理 (~120 行)
└── index.ts            # 导出


## 🚀 已完成的工作

### 1. 共享基础设施
- ✅ `shared/constants.ts` - 统一的事件定义和常量
- ✅ `shared/types.ts` - 通用类型定义
- ✅ `shared/utils.ts` - 工具函数
- ✅ `shared/index.ts` - 统一导出

### 2. 核心基础设施
- ✅ `core/logger.ts` - 简化的日志系统
- ✅ `core/ipc-manager.ts` - IPC 管理器
- ✅ `core/app.ts` - 应用管理器

### 3. 文件模块 (示例)
- ✅ `features/file/service.ts` - 文件操作业务逻辑
- ✅ `features/file/ipc.ts` - 文件操作 IPC 处理
- ✅ `features/file/index.ts` - 模块导出

## 📋 下一步迁移计划

### 迁移优先级

1. **Window 模块** (优先级：高)
   - 从 `src/main/core/window/` 迁移到 `src/main/features/window/`
   - 负责人：前端开发者

2. **Dialog 模块** (优先级：高)
   - 从 `src/main/services/dialog/` 迁移到 `src/main/features/dialog/`
   - 负责人：前端开发者

3. **Network 模块** (优先级：中)
   - 合并 `websocket` 和 `udp` 到 `src/main/features/network/`
   - 负责人：后端开发者

4. **System 模块** (优先级：低)
   - 合并 `update` 等系统功能到 `src/main/features/system/`
   - 负责人：全栈开发者

### 迁移步骤模板

每个模块按以下步骤迁移：

1. **创建新目录**
   ```bash
   mkdir src/main/features/[module-name]
   ```

2. **迁移业务逻辑**
   - 将 `services/[module]/index.ts` 内容迁移到 `features/[module]/service.ts`
   - 移除单例模式，改为简单的类
   - 使用新的 Logger: `Logger.create('[ModuleName]Service')`

3. **迁移 IPC 处理**
   - 将 `services/[module]/ipc.ts` 内容迁移到 `features/[module]/ipc.ts`
   - 实现 `IpcHandler` 接口
   - 使用统一的事件常量: `Events.MODULE_ACTION`

4. **创建模块导出**
   - 创建 `features/[module]/index.ts`
   - 导出服务类和 IPC 处理类
   - 提供 `createModuleModule()` 工厂函数

5. **更新应用管理器**
   - 在 `core/app.ts` 中注册新模块
   - 删除旧的导入和初始化代码

## 🔧 开发规范

### 文件大小控制
- `service.ts`: 150-250 行
- `ipc.ts`: 80-150 行  
- `index.ts`: 5-15 行

### 错误处理
```typescript
// 统一的错误处理模式
try {
  const result = await operation();
  this.logger.info('Operation completed');
  return result;
} catch (error) {
  this.logger.error('Operation failed:', error);
  throw new Error(`Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### IPC 响应格式
```typescript
// 统一的 IPC 响应格式
{
  success: boolean;
  data?: T;
  error?: string;
}
```

## 👥 团队分工建议

- **开发者A**: window + dialog 模块
- **开发者B**: network 模块  
- **开发者C**: system 模块 + 主应用重构
- **开发者D**: 测试 + 文档

## 🎯 成功指标

- [ ] 每个功能模块独立，文件大小合理
- [ ] 团队成员可以并行开发，减少冲突
- [ ] 新人能在 1 天内理解新结构
- [ ] 添加新功能只需新增模块目录

## ⚠️ 注意事项

1. **保持向后兼容**: 迁移过程中不要破坏现有 API
2. **逐步迁移**: 一次迁移一个模块，确保每步都能正常运行
3. **测试验证**: 每个模块迁移后都要测试功能正常
4. **文档更新**: 及时更新相关文档和导入路径

## 🔥 关键原则

- **简单优于复杂**: 避免过度工程化
- **实用优于完美**: 专注解决实际问题
- **团队协作**: 结构服务于团队效率
- **渐进改进**: 允许后续根据需要调整 