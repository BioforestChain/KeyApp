# 最佳实践

> 由 `pnpm agent practice` 维护。

## 列表

- ❌ Radix Dialog / position:fixed → ✅ Stackflow BottomSheet/Modal
- ❌ React Router → ✅ Stackflow push/pop/replace
- ❌ 复制 mpay 代码 → ✅ 理解后用 React/TS 重写
- ❌ 随意创建 store → ✅ 遵循 stores/ 现有模式
- ❌ 明文选择器 → ✅ data-testid
- ❌ 安装新 UI 库 → ✅ shadcn/ui（已集成）
- ❌ 新建 CSS → ✅ Tailwind CSS
- ❌ text-secondary → ✅ text-muted-foreground 或 bg-secondary text-secondary-foreground（详见白皮书 02-设计篇/02-视觉设计/theme-colors）
- ❌ bg-gray-100 无 dark: 变体 → ✅ bg-gray-100 dark:bg-gray-800 或使用 bg-muted（详见白皮书 02-设计篇/02-视觉设计/dark-mode）
- ❌ text-primary-foreground 无背景 → ✅ 确保元素或父级有 bg-primary
- ❌ getByText('硬编码中文') → ✅ getByText(t('i18n.key')) 或 getByTestId
- ❌ password/Password（宽泛含义） → ✅ walletLock（钱包锁）/ twoStepSecret（安全密码）/ payPassword（支付密码）等具体命名
- 圆形元素必须使用 aspect-square 标记，与 w-*/h-*/size-* 不冲突，是规范要求
- 组件尺寸属性要考虑响应式布局，如 lg 尺寸应包含 @xs:w-12 等容器查询断点
