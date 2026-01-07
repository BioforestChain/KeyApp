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
- ❌ bg-primary text-white → ✅ bg-primary text-primary-foreground（暗色模式下 text-white 对比度不足）
- ❌ bg-muted 无文字色 → ✅ bg-muted text-muted-foreground（详见白皮书 02-设计篇/02-视觉设计/dark-mode）
- ❌ bg-gray-100 无 dark: 变体 → ✅ bg-gray-100 dark:bg-gray-800 或使用 bg-muted
- ❌ getByText('硬编码中文') → ✅ getByText(t('i18n.key')) 或 getByTestId
- ❌ password/Password（宽泛含义） → ✅ walletLock（钱包锁）/ twoStepSecret（安全密码）/ payPassword（支付密码）等具体命名
- 圆形元素必须使用 aspect-square 标记，与 w-*/h-*/size-* 不冲突，是规范要求
- 组件尺寸属性要考虑响应式布局，如 lg 尺寸应包含 @xs:w-12 等容器查询断点
- ❌ JS scroll 事件监听 → ✅ CSS scroll-driven animations（animation-timeline: scroll()）
- 滚动驱动动画使用 `scroll-timeline: --name block` 定义 + `animation-timeline: --name` 绑定
- 跨层级绑定使用 `timeline-scope: --name` 在公共祖先上声明
- 紧凑头部效果使用 `animation-range: 0 80px` 限制动画范围
- ⚠️ scroll-driven animations 是渐进增强：初始状态必须是可用的（如 opacity-0），不支持时保持初始状态
- E2E 截图变更后运行 `pnpm e2e:audit` 检查残留截图，详见白皮书 08-测试篇/03-Playwright配置/e2e-best-practices
- 组件专属样式使用 CSS Modules：`component-name.module.css` + `import styles from './xxx.module.css'`
- CSS Modules 适用场景：@keyframes 动画、伪元素(::before/::after)、复杂选择器(:focus-within)、scroll-driven animations
- CSS Modules 与 Tailwind 混用：`className={cn(styles.header, 'sticky top-0 z-10 px-5')}`
- 优先级：CSS Modules > globals.css，组件样式应内聚到组件目录
- ❌ as TypeAssertion → ✅ z.looseObject().safeParse() 验证外部 API 响应
- ❌ z.record(z.record(...)) → ✅ z.record(z.string(), z.record(z.string(), schema))（Zod 4 嵌套 record 需显式 key 类型）
