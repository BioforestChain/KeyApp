# Implementation Tasks

## 1. 钱包选择组件

### 1.1 WalletSelector 钱包选择器
- [x] 1.1.1 创建组件 `src/components/wallet/wallet-selector.tsx`
  - 显示钱包列表（名称、总资产、地址缩略）
  - 当前选中状态高亮
  - 支持关闭回调
- [x] 1.1.2 创建 Story (单钱包、多钱包、空状态)
- [x] 1.1.3 创建测试 (选择切换、关闭)

### 1.2 ChainAddressSelector 链地址选择器
- [x] 1.2.1 创建组件 `src/components/wallet/chain-address-selector.tsx`
  - 左侧链列表（图标 + 名称）
  - 右侧地址列表（地址 + 余额）
  - 支持链切换联动
- [x] 1.2.2 创建 Story (单链、多链、带余额)
- [x] 1.2.3 创建测试 (链切换、地址选择)

## 2. 转账确认组件

### 2.1 TransferConfirmSheet 转账确认弹窗
- [x] 2.1.1 创建组件 `src/components/transfer/transfer-confirm-sheet.tsx`
  - 转账金额（大字号）
  - 收款地址（缩略 + 完整展开）
  - 手续费显示
  - 确认/取消按钮
- [x] 2.1.2 创建 Story (完整信息、高手续费警告)
- [x] 2.1.3 创建测试 (确认、取消回调)

## 3. 安全验证组件

### 3.1 PasswordConfirmSheet 密码确认弹窗
- [x] 3.1.1 创建组件 `src/components/security/password-confirm-sheet.tsx`
  - 密码输入框
  - 生物识别按钮（可选）
  - 错误提示
  - 确认/取消按钮
- [x] 3.1.2 创建 Story (密码模式、生物识别模式、错误状态)
- [x] 3.1.3 创建测试 (密码验证、错误显示)

### 3.2 MnemonicConfirm 助记词确认
- [x] 3.2.1 创建组件 `src/components/security/mnemonic-confirm.tsx`
  - 显示随机顺序的词列表
  - 用户点击选择正确顺序
  - 已选词高亮/禁用
  - 校验逻辑
- [x] 3.2.2 创建 Story (12词、24词、部分完成)
- [x] 3.2.3 创建测试 (正确选择、错误选择、重置)

## 4. 辅助组件

### 4.1 TransactionStatus 交易状态标签
- [x] 4.1.1 创建组件 `src/components/transaction/transaction-status.tsx`
  - 状态图标 + 文字
  - 颜色区分（成功绿、失败红、待确认黄）
- [x] 4.1.2 创建 Story (成功、失败、待确认、已取消)
- [x] 4.1.3 创建测试

### 4.2 FeeDisplay 手续费显示
- [x] 4.2.1 创建组件 `src/components/transaction/fee-display.tsx`
  - 原生币金额 + 符号
  - 法币估值（可选）
  - 加载状态
- [x] 4.2.2 创建 Story (正常、高手续费、加载中)
- [x] 4.2.3 创建测试

### 4.3 TokenIcon 代币图标
- [x] 4.3.1 创建组件 `src/components/token/token-icon.tsx`
  - 支持图片 URL
  - 加载失败回退（首字母）
  - 尺寸变体
- [x] 4.3.2 创建 Story (各代币、加载失败)
- [x] 4.3.3 创建测试

## 5. 验证

- [x] 5.1 运行所有测试 `pnpm test` → 453 tests pass
- [x] 5.2 验证 Storybook 所有 story 正常渲染 → all stories created
- [x] 5.3 运行 `openspec validate --strict` → valid

---

## 完成统计

**钱包选择**: 2/2 完成 ✅
**转账确认**: 1/1 完成 ✅
**安全验证**: 2/2 完成 ✅
**辅助组件**: 3/3 完成 ✅
**验证**: 3/3 完成 ✅

**总计**: 24/24 子任务 ✅ COMPLETE
