# E2E 测试清单

每次涉及交易流程的修改，**必须**运行以下测试确保功能正常。

## 必须运行的测试

### 1. Mock E2E 测试
```bash
pnpm test:e2e:mock
```

覆盖场景：
- [ ] Pending Transaction Service 状态管理
- [ ] UI 组件状态显示
- [ ] 通知系统集成

### 2. Real E2E 测试
```bash
pnpm test:e2e:real
```

覆盖场景：
- [ ] 广播成功 → UI 显示成功状态
- [ ] 广播失败 → 九宫格显示错误 + 可重试
- [ ] 钱包锁验证失败 → 显示错误 + 可重试

### 3. Storybook E2E 截图测试
```bash
pnpm test:storybook:e2e
```

覆盖场景：
- [ ] PendingTxList 各状态截图
- [ ] 视觉回归测试

## 手动测试清单

在 `localhost:5173` 手动执行以下场景：

### 转账成功流程
1. [ ] 打开发送页面
2. [ ] 输入有效地址和金额
3. [ ] 完成九宫格验证
4. [ ] 确认显示"广播成功"状态
5. [ ] 确认 Pending Transaction 列表显示新交易

### 转账失败流程
1. [ ] 输入超过余额的金额
2. [ ] 完成九宫格验证
3. [ ] 确认九宫格显示错误信息
4. [ ] 确认可以重新输入九宫格

### 钱包锁验证失败
1. [ ] 输入错误的九宫格图案
2. [ ] 确认显示错误状态
3. [ ] 确认九宫格被清空
4. [ ] 确认可以重新输入

## 环境变量

Real E2E 测试需要以下环境变量（`.env.local`）：

```
E2E_TEST_MNEMONIC=your-test-mnemonic-here
E2E_TEST_ADDRESS=your-test-address-here
```

## 重要提醒

1. **API 交互修改**：必须先用 `console.log` 打印实际 API 响应
2. **UI 流程修改**：必须运行 Storybook 截图测试
3. **状态管理修改**：必须运行 Mock E2E + Real E2E
