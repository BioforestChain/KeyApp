# Tasks: Add Native App-like Navigation with Stackflow

## 前置准备

在开始实施前，务必阅读以下资料：

1. **Stackflow 完整文档**: https://stackflow.so/llms-full.txt
2. **Design 文档**: `openspec/changes/add-native-navigation/design.md`
3. **Demo 项目**: `.tmp/stackflow-demo/` (可运行参考)

## 1. 依赖安装

- [ ] 1.1 安装 Stackflow 核心包
  ```bash
  pnpm add @stackflow/core @stackflow/react
  ```

- [ ] 1.2 安装 Stackflow 插件
  ```bash
  pnpm add @stackflow/plugin-renderer-basic @stackflow/plugin-basic-ui @stackflow/plugin-history-sync
  ```

- [ ] 1.3 验证依赖安装成功
  ```bash
  pnpm list @stackflow/core
  ```

## 2. Stackflow 配置

- [ ] 2.1 创建目录结构
  ```
  src/stackflow/
  ├── stackflow.ts
  ├── activities/
  └── components/
  ```

- [ ] 2.2 创建 `src/stackflow/stackflow.ts` 配置文件
  - 导入所需插件
  - 配置 transitionDuration (350ms)
  - 使用 cupertino 主题
  - 注册所有 Activity
  - 导出 `Stack`, `useFlow`, `useStepFlow`

- [ ] 2.3 在 `src/styles/globals.css` 引入 Stackflow CSS
  ```css
  @import "@stackflow/plugin-basic-ui/index.css";
  ```

## 3. 主入口 Activity

- [ ] 3.1 创建 `src/stackflow/activities/MainTabsActivity.tsx`
  - 包含底部 Tab Bar (首页/钱包/转账/设置)
  - 使用 `useState` 管理当前 Tab
  - 处理底部 safe-area: `env(safe-area-inset-bottom)`
  - 内容区域预留 Tab Bar 高度

- [ ] 3.2 创建 `src/stackflow/components/TabBar.tsx`
  - 复用现有 `src/components/layout/tab-bar.tsx` 样式
  - 适配 Stackflow 的导航方式

- [ ] 3.3 实现各 Tab 内容组件
  - HomeTab: 余额卡片、快捷操作、钱包预览
  - WalletTab: 钱包列表
  - TransferTab: 快速转账、联系人
  - SettingsTab: 设置项列表

## 4. 页面 Activity 迁移

### 4.1 钱包相关

- [ ] 4.1.1 创建 `WalletListActivity.tsx` (从 `src/pages/wallet/list.tsx` 迁移)
- [ ] 4.1.2 创建 `WalletDetailActivity.tsx` (从 `src/pages/wallet/detail.tsx` 迁移)
- [ ] 4.1.3 创建 `WalletCreateActivity.tsx` (从 `src/pages/wallet/create.tsx` 迁移)
- [ ] 4.1.4 创建 `WalletImportActivity.tsx` (从 `src/pages/wallet/import.tsx` 迁移)

### 4.2 转账相关

- [ ] 4.2.1 创建 `TransferActivity.tsx` (从 `src/pages/send/index.tsx` 迁移)
  - 使用 `useStepFlow` 实现多步骤：input → confirm → success
  - 参考 `.tmp/stackflow-demo/src/stackflow/activities/TransferActivity.tsx`

- [ ] 4.2.2 创建 `ReceiveActivity.tsx` (从 `src/pages/receive/index.tsx` 迁移)

### 4.3 历史记录

- [ ] 4.3.1 创建 `TransactionHistoryActivity.tsx` (从 `src/pages/history/index.tsx` 迁移)
- [ ] 4.3.2 创建 `TransactionDetailActivity.tsx` (从 `src/pages/history/detail.tsx` 迁移)

### 4.4 设置相关

- [ ] 4.4.1 创建 `SettingsActivity.tsx` (从 `src/pages/settings/index.tsx` 迁移)
- [ ] 4.4.2 创建 `LanguageSettingsActivity.tsx`
- [ ] 4.4.3 创建 `CurrencySettingsActivity.tsx`
- [ ] 4.4.4 创建 `ChainConfigActivity.tsx`
- [ ] 4.4.5 创建 `ViewMnemonicActivity.tsx`
- [ ] 4.4.6 创建 `ChangePasswordActivity.tsx`

### 4.5 引导和 Onboarding

- [ ] 4.5.1 创建 `WelcomeActivity.tsx` (从 `src/pages/guide/WelcomeScreen.tsx` 迁移)
- [ ] 4.5.2 创建 `OnboardingCreateActivity.tsx`
- [ ] 4.5.3 创建 `OnboardingRecoverActivity.tsx`
- [ ] 4.5.4 创建 `MigrationActivity.tsx`

### 4.6 其他

- [ ] 4.6.1 创建 `ScannerActivity.tsx`
- [ ] 4.6.2 创建 `AddressBookActivity.tsx`
- [ ] 4.6.3 创建 `NotificationsActivity.tsx`
- [ ] 4.6.4 创建 `StakingActivity.tsx`
- [ ] 4.6.5 创建 `TokenDetailActivity.tsx`

### 4.7 DWEB 授权

- [ ] 4.7.1 创建 `AuthorizeAddressActivity.tsx`
- [ ] 4.7.2 创建 `AuthorizeSignatureActivity.tsx`

## 5. 路由集成

- [ ] 5.1 修改 `src/routes/index.tsx`
  - 保留 TanStack Router 的基础配置
  - 在根路由渲染 `<Stack />`
  - 移除或注释原有的页面路由

- [ ] 5.2 配置 `historySyncPlugin` (可选)
  - 同步 URL 到浏览器历史
  - 映射 Activity 到 URL 路径

- [ ] 5.3 更新 `src/App.tsx` (如有)
  - 确保 Stack 正确挂载

## 6. 布局适配

- [ ] 6.1 处理 `src/components/layout/app-layout.tsx`
  - 与 Stackflow 的 AppScreen 协调
  - 可能需要简化或移除

- [ ] 6.2 验证 safe-area 处理
  - 顶部: Stackflow AppBar 自动处理
  - 底部: Tab Bar 需手动添加 padding

- [ ] 6.3 更新 CSS 变量
  - 确保 Stackflow 的 CSS 变量与 shadcn 主题兼容
  - 必要时覆盖 Stackflow 默认样式

## 7. 导航逻辑迁移

- [ ] 7.1 替换 `useNavigate` 为 `useFlow`
  - 搜索所有 `router.navigate` 调用
  - 替换为 `push()` / `replace()` / `pop()`

- [ ] 7.2 替换 `Link` 组件
  - 使用 Stackflow 的导航方式
  - 或保留 TanStack Router 的 Link（如果使用 historySyncPlugin）

- [ ] 7.3 处理深层链接
  - 确保从 URL 直接进入页面时正确初始化 Stack

## 8. 测试

- [ ] 8.1 手动测试导航流程
  - Tab 切换
  - 页面堆栈 push/pop
  - 手势返回
  - Step 导航（转账流程）

- [ ] 8.2 测试 safe-area
  - iPhone X+ 模拟器测试
  - 底部 Tab Bar 不被遮挡

- [ ] 8.3 更新现有测试
  - 修复因路由变更导致的测试失败
  - 添加 Stackflow 相关的测试 mock

- [ ] 8.4 E2E 测试
  - 更新 Playwright 测试以适应新导航
  - 验证关键用户流程

## 9. 清理

- [ ] 9.1 移除冗余代码
  - 不再使用的 TanStack Router 路由定义
  - 旧的页面组件（如果完全迁移）

- [ ] 9.2 更新类型定义
  - Activity 参数类型
  - 导航相关类型

## 10. 文档

- [ ] 10.1 更新 `TDD.md`
  - 添加 Stackflow 架构说明
  - 导航 API 使用指南

- [ ] 10.2 更新 `CLAUDE.md` / `AGENTS.md`
  - 添加 Stackflow 相关的开发指南

- [ ] 10.3 创建 Storybook stories
  - Activity 组件的 story（如果需要独立展示）
  - TabBar 组件的 story

## 验证清单

完成所有任务后，确保以下功能正常：

- [ ] 首页正常显示，余额卡片渲染正确
- [ ] Tab 切换流畅，内容即时更新
- [ ] 点击钱包卡片进入详情页，有滑入动画
- [ ] 左边缘滑动可返回上一页
- [ ] 转账流程的多步骤导航正常
- [ ] 设置页面各项可进入
- [ ] URL 与当前页面同步（如果使用 historySyncPlugin）
- [ ] iPhone X+ 的 safe-area 正确处理
- [ ] 暗色模式下样式正常
- [ ] 所有 shadcn/ui 组件正常渲染
- [ ] TypeScript 无类型错误
- [ ] 现有测试通过或已更新
