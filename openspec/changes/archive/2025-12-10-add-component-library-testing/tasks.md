# Implementation Tasks

## 1. 项目初始化

- [x] 1.1 使用 Vite 创建 React 19 + TypeScript 项目
- [x] 1.2 配置 TypeScript 严格模式
- [x] 1.3 配置 Oxlint + Prettier
- [x] 1.4 配置路径别名 `@/`

## 2. Tailwind CSS 4.x 配置

- [x] 2.1 安装 Tailwind CSS 4.x
- [x] 2.2 创建 CSS-first 配置 (`src/styles/globals.css`)
- [x] 2.3 配置 Vite 插件
- [x] 2.4 配置容器查询断点
- [x] 2.5 验证 Tailwind 工作正常
- [x] 2.6 验证容器查询 (`@container`, `@xs:`, `@md:`) 工作正常

## 3. shadcn/ui 集成

- [x] 3.1 初始化 shadcn/ui
- [x] 3.2 配置组件输出目录 (`src/components/ui`)
- [x] 3.3 安装基础组件 (button, input)
- [x] 3.4 验证组件导入正常

## 4. Storybook 10.x 配置

- [x] 4.1 安装 Storybook 10.x
- [x] 4.2 配置移动端视口 (`.storybook/preview.tsx`)
- [x] 4.3 配置 Tailwind CSS 导入
- [x] 4.4 配置交互测试插件 (`@storybook/test`)
- [x] 4.5 配置深色/浅色主题切换
- [x] 4.6 配置容器尺寸 Decorator
- [x] 4.7 添加容器宽度控制 (addon-toolbars)
- [x] 4.8 验证 Storybook 启动正常

## 5. Vitest 4.x 配置

- [x] 5.1 安装 Vitest 及相关依赖
- [x] 5.2 创建 `vitest.config.ts`
- [x] 5.3 创建测试 setup 文件 (`src/test/setup.ts`)
- [x] 5.4 配置 Workspace (单元测试、Storybook 测试分离)
- [x] 5.5 验证测试运行正常

## 6. 布局组件 (Layout)

### 6.1 PageHeader 页面头部
- [x] 6.1.1 创建组件 `src/components/layout/page-header.tsx`
- [x] 6.1.2 创建 Story (基础、透明背景、右侧操作)
- [x] 6.1.3 创建测试 (返回点击、标题渲染)

### 6.2 TabBar 底部标签栏
- [x] 6.2.1 创建组件 `src/components/layout/tab-bar.tsx`
- [x] 6.2.2 创建 Story (激活状态、徽章)
- [x] 6.2.3 创建测试 (切换、安全区域)

### 6.3 AppLayout 应用布局
- [x] 6.3.1 创建组件 `src/components/layout/app-layout.tsx`
- [ ] 6.3.2 创建 Story (基础、固定底部)
- [ ] 6.3.3 创建测试

### 6.4 BottomSheet 底部弹窗
- [x] 6.4.1 创建组件 `src/components/layout/bottom-sheet.tsx`
- [x] 6.4.2 创建 Story (自动高度、半屏、全屏)
- [x] 6.4.3 创建测试 (拖拽关闭、遮罩关闭)

## 7. 钱包组件 (Wallet)

### 7.1 WalletCard 钱包卡片
- [x] 7.1.1 创建组件 `src/components/wallet/wallet-card.tsx`
- [x] 7.1.2 创建 Story (完整信息、未备份警告)
- [x] 7.1.3 创建测试 (复制地址、快捷操作)

### 7.2 WalletSelector 钱包选择器
- [ ] 7.2.1 创建组件 `src/components/wallet/wallet-selector.tsx`
- [ ] 7.2.2 创建 Story (多钱包列表)
- [ ] 7.2.3 创建测试 (选择、关闭)

### 7.3 ChainAddressSelector 链地址选择器
- [ ] 7.3.1 创建组件 `src/components/wallet/chain-address-selector.tsx`
- [ ] 7.3.2 创建 Story (左右分栏)
- [ ] 7.3.3 创建测试 (链切换、地址选择)

### 7.4 AddressDisplay 地址显示
- [x] 7.4.1 创建组件 `src/components/wallet/address-display.tsx`
- [x] 7.4.2 创建 Story (缩略、完整、可复制)
- [x] 7.4.3 创建测试 (复制功能)

### 7.5 ChainIcon 链图标 (额外)
- [x] 7.5.1 创建组件 `src/components/wallet/chain-icon.tsx`
- [x] 7.5.2 创建 Story (各链图标)
- [x] 7.5.3 创建测试

## 8. 资产组件 (Asset)

### 8.1 TokenList 代币列表
- [x] 8.1.1 创建组件 `src/components/token/token-list.tsx`
- [x] 8.1.2 创建 Story (有数据、空状态、加载中)
- [x] 8.1.3 创建测试 (渲染、点击)

### 8.2 TokenItem 代币行
- [x] 8.2.1 创建组件 `src/components/token/token-item.tsx`
- [x] 8.2.2 创建 Story (正常、加载失败)
- [x] 8.2.3 创建测试

### 8.3 BalanceDisplay 余额显示
- [x] 8.3.1 创建组件 `src/components/token/balance-display.tsx`
- [x] 8.3.2 创建 Story (格式化、隐藏、带符号)
- [x] 8.3.3 创建测试 (格式化逻辑)

### 8.4 TokenIcon 代币图标
- [ ] 8.4.1 创建组件 `src/components/token/token-icon.tsx`
- [ ] 8.4.2 创建 Story (各代币、加载失败回退)
- [ ] 8.4.3 创建测试

## 9. 交易组件 (Transaction)

### 9.1 TransactionList 交易列表
- [x] 9.1.1 创建组件 `src/components/transaction/transaction-list.tsx`
- [x] 9.1.2 创建 Story (有数据、空状态)
- [x] 9.1.3 创建测试

### 9.2 TransactionItem 交易行
- [x] 9.2.1 创建组件 `src/components/transaction/transaction-item.tsx`
- [x] 9.2.2 创建 Story (转入、转出、待确认)
- [x] 9.2.3 创建测试

### 9.3 TransactionStatus 状态标签
- [ ] 9.3.1 创建组件 `src/components/transaction/transaction-status.tsx`
- [ ] 9.3.2 创建 Story (成功、失败、待确认)
- [ ] 9.3.3 创建测试

### 9.4 FeeDisplay 手续费显示
- [ ] 9.4.1 创建组件 `src/components/transaction/fee-display.tsx`
- [ ] 9.4.2 创建 Story (加载中、显示)
- [ ] 9.4.3 创建测试

## 10. 转账组件 (Transfer)

### 10.1 AddressInput 地址输入
- [x] 10.1.1 创建组件 `src/components/transfer/address-input.tsx`
- [x] 10.1.2 创建 Story (空、有值、错误)
- [x] 10.1.3 创建测试 (验证、粘贴)

### 10.2 AmountInput 金额输入
- [x] 10.2.1 创建组件 `src/components/transfer/amount-input.tsx`
- [x] 10.2.2 创建 Story (空、有值、余额不足)
- [x] 10.2.3 创建测试 (全部按钮、精度限制)

### 10.3 TransferConfirmSheet 转账确认
- [ ] 10.3.1 创建组件 `src/components/transfer/transfer-confirm-sheet.tsx`
- [ ] 10.3.2 创建 Story (完整信息)
- [ ] 10.3.3 创建测试

## 11. 收款 & 扫码组件

### 11.1 QRCode 二维码显示
- [x] 11.1.1 创建组件 `src/components/common/qr-code.tsx`
- [x] 11.1.2 创建 Story (地址二维码)
- [x] 11.1.3 创建测试

### 11.2 QRScanner 二维码扫描
- [ ] 11.2.1 创建组件 `src/components/scanner/qr-scanner.tsx`
- [ ] 11.2.2 创建 Story (扫描界面)
- [ ] 11.2.3 创建测试 (Mock 相机)

## 12. 安全组件 (Security)

### 12.1 PasswordInput 密码输入
- [x] 12.1.1 创建组件 `src/components/security/password-input.tsx`
- [x] 12.1.2 创建 Story (隐藏、显示、强度)
- [x] 12.1.3 创建测试 (切换可见、强度计算)

### 12.2 PasswordConfirmSheet 密码确认弹窗
- [ ] 12.2.1 创建组件 `src/components/security/password-confirm-sheet.tsx`
- [ ] 12.2.2 创建 Story (密码、生物识别)
- [ ] 12.2.3 创建测试

### 12.3 MnemonicDisplay 助记词显示
- [x] 12.3.1 创建组件 `src/components/security/mnemonic-display.tsx`
- [x] 12.3.2 创建 Story (12词、24词)
- [x] 12.3.3 创建测试 (复制)

### 12.4 MnemonicInput 助记词输入
- [x] 12.4.1 创建组件 `src/components/security/mnemonic-input.tsx`
- [x] 12.4.2 创建 Story (输入、建议、粘贴)
- [x] 12.4.3 创建测试 (验证、粘贴拆分)

### 12.5 MnemonicConfirm 助记词确认
- [ ] 12.5.1 创建组件 `src/components/security/mnemonic-confirm.tsx`
- [ ] 12.5.2 创建 Story (选词确认)
- [ ] 12.5.3 创建测试 (正确、错误)

## 13. 设置 & 地址簿组件

### 13.1 SettingsList 设置列表
- [ ] 13.1.1 创建组件 `src/components/settings/settings-list.tsx`
- [ ] 13.1.2 创建 Story (分组、开关、箭头)
- [ ] 13.1.3 创建测试

### 13.2 LanguageSelector 语言选择
- [ ] 13.2.1 创建组件 `src/components/settings/language-selector.tsx`
- [ ] 13.2.2 创建 Story (多语言列表)
- [ ] 13.2.3 创建测试

### 13.3 AddressBookList 地址簿
- [ ] 13.3.1 创建组件 `src/components/address-book/address-book-list.tsx`
- [ ] 13.3.2 创建 Story (有数据、空状态、搜索)
- [ ] 13.3.3 创建测试

## 14. DWEB 授权组件

### 14.1 AuthorizeCard 授权卡片
- [ ] 14.1.1 创建组件 `src/components/authorize/authorize-card.tsx`
- [ ] 14.1.2 创建 Story (DApp 信息)
- [ ] 14.1.3 创建测试

### 14.2 SignatureDetail 签名详情
- [ ] 14.2.1 创建组件 `src/components/authorize/signature-detail.tsx`
- [ ] 14.2.2 创建 Story (消息、转账、合约)
- [ ] 14.2.3 创建测试

## 15. 通用组件 (Common)

### 15.1 GradientButton 渐变按钮
- [x] 15.1.1 创建组件 `src/components/common/gradient-button.tsx`
- [x] 15.1.2 创建 Story (默认、加载、禁用、尺寸)
- [x] 15.1.3 创建测试

### 15.2 LoadingSpinner 加载指示器
- [x] 15.2.1 创建组件 `src/components/common/loading-spinner.tsx`
- [x] 15.2.2 创建 Story (尺寸、全屏)
- [x] 15.2.3 创建测试

### 15.3 EmptyState 空状态
- [x] 15.3.1 创建组件 `src/components/common/empty-state.tsx`
- [x] 15.3.2 创建 Story (不同场景)
- [x] 15.3.3 创建测试

### 15.4 Skeleton 骨架屏
- [x] 15.4.1 创建组件 `src/components/common/skeleton.tsx`
- [x] 15.4.2 创建 Story (列表、卡片)
- [x] 15.4.3 创建测试

### 15.5 NetworkStatus 网络状态
- [ ] 15.5.1 创建组件 `src/components/common/network-status.tsx`
- [ ] 15.5.2 创建 Story (离线、在线)
- [ ] 15.5.3 创建测试

### 15.6 CopyButton & Avatar
- [ ] 15.6.1 创建组件 `src/components/common/copy-button.tsx`
- [ ] 15.6.2 创建组件 `src/components/common/avatar.tsx`
- [ ] 15.6.3 创建 Story
- [ ] 15.6.4 创建测试

### 15.7 RefreshControl 下拉刷新
- [ ] 15.7.1 创建组件 `src/components/common/refresh-control.tsx`
- [ ] 15.7.2 创建 Story
- [ ] 15.7.3 创建测试

### 15.8 Toast 提示 (使用 sonner)
- [ ] 15.8.1 安装 `sonner`
- [ ] 15.8.2 创建 ToastProvider
- [ ] 15.8.3 创建 Story (成功、错误、加载)
- [ ] 15.8.4 创建测试

### 15.9 额外已实现组件
- [x] 15.9.1 Alert 提示框 `src/components/common/alert.tsx`
- [x] 15.9.2 AmountDisplay 金额显示 `src/components/common/amount-display.tsx`
- [x] 15.9.3 FormField 表单字段 `src/components/common/form-field.tsx`
- [x] 15.9.4 IconCircle 图标圆圈 `src/components/common/icon-circle.tsx`
- [x] 15.9.5 StepIndicator 步骤指示器 `src/components/common/step-indicator.tsx`
- [x] 15.9.6 TimeDisplay 时间显示 `src/components/common/time-display.tsx`

## 16. 配置 package.json scripts

- [x] 16.1 添加开发脚本 (dev, build, test, storybook, lint, typecheck)

## 17. 验证与文档

- [ ] 17.1 运行所有测试，确保通过
- [ ] 17.2 检查覆盖率报告
- [ ] 17.3 验证 Storybook 所有 story 正常渲染
- [ ] 17.4 更新 README (可选)

---

## 完成统计

**基础设施**: 5/5 (100%)
- 项目初始化 ✅
- Tailwind CSS ✅
- shadcn/ui ✅
- Storybook ✅
- Vitest ✅

**组件开发**: 约 70% 完成
- 布局组件: 3/4 完成
- 钱包组件: 3/5 完成
- 资产组件: 3/4 完成
- 交易组件: 2/4 完成
- 转账组件: 2/3 完成
- 收款扫码: 1/2 完成
- 安全组件: 3/5 完成
- 设置地址簿: 0/3 完成
- DWEB授权: 0/2 完成
- 通用组件: 4/8 + 6额外 完成

**待完成重点**:
1. WalletSelector, ChainAddressSelector (钱包选择)
2. TransactionStatus, FeeDisplay (交易相关)
3. TransferConfirmSheet (转账确认)
4. PasswordConfirmSheet, MnemonicConfirm (安全确认)
5. 设置 & 地址簿组件
6. DWEB 授权组件
7. Toast, NetworkStatus 等通用组件
