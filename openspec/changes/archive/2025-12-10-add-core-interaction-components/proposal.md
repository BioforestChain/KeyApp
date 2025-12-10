# Change: 补全核心交互组件

## Why

当前组件库缺少关键的用户交互组件，这些组件是完成钱包核心业务流程（钱包选择、转账确认、安全验证）的必要前提。没有这些组件，无法进入 Phase 2 的功能开发。

## What Changes

### 新增组件

1. **钱包选择组件**
   - WalletSelector: 多钱包切换选择器
   - ChainAddressSelector: 链地址二级选择器（左右分栏）

2. **转账确认组件**
   - TransferConfirmSheet: 转账详情确认弹窗

3. **安全验证组件**
   - PasswordConfirmSheet: 密码验证弹窗（支持生物识别）
   - MnemonicConfirm: 助记词备份确认（选词验证）

4. **辅助组件**
   - TransactionStatus: 交易状态标签
   - FeeDisplay: 手续费显示组件
   - TokenIcon: 代币图标组件

## Impact

- Affected specs: `ui-components` (修改)
- Affected code:
  - 新增 `src/components/wallet/wallet-selector.tsx`
  - 新增 `src/components/wallet/chain-address-selector.tsx`
  - 新增 `src/components/transfer/transfer-confirm-sheet.tsx`
  - 新增 `src/components/security/password-confirm-sheet.tsx`
  - 新增 `src/components/security/mnemonic-confirm.tsx`
  - 新增 `src/components/transaction/transaction-status.tsx`
  - 新增 `src/components/transaction/fee-display.tsx`
  - 新增 `src/components/token/token-icon.tsx`

## Success Criteria

- [ ] 所有新组件有完整的 Story
- [ ] 所有新组件有单元测试
- [ ] `pnpm test` 全部通过
- [ ] Storybook 正常渲染所有新组件
