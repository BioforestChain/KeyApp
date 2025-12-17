# Change: Add Native App-like Navigation with Stackflow

## Status

**PROPOSAL** - Pending review and approval

## Why

当前项目使用 TanStack Router 进行路由管理，但缺乏移动端原生应用级别的导航体验：

1. **无页面堆栈动画**：页面切换没有 iOS/Android 风格的滑入滑出动画
2. **无手势返回**：不支持从屏幕边缘滑动返回上一页
3. **无 Header 动画**：原生应用的 header title 和 back button 有独立的过渡动画
4. **无滚动驱动效果**：缺少 Large Title 收缩等滚动联动效果
5. **Tab 切换无状态保持**：切换 Tab 时无法保持各 Tab 的导航历史

这些是移动端钱包应用的核心体验要素，直接影响用户对应用专业度的感知。

### 方案调研结论

经过对社区方案的调研（详见 design.md），**Stackflow** 是目前最适合的方案：

| 方案 | 样式污染 | 手势支持 | 维护方 | 与 shadcn 兼容 |
|------|----------|----------|--------|---------------|
| **Stackflow** | 低 | ✅ 内置 | Karrot (当当) | ✅ 好 |
| Ionic | 高 | ✅ 内置 | Ionic | ⚠️ 需适配 |
| Framer Motion 自研 | 无 | ⚠️ 需自己实现 | 自己 | ✅ 好 |
| View Transitions API | 无 | ❌ 不支持 | 浏览器原生 | ✅ 好 |

## What Changes

### 核心变更

1. **引入 Stackflow** 作为导航层
   - `@stackflow/core` - 核心逻辑
   - `@stackflow/react` - React 绑定
   - `@stackflow/plugin-renderer-basic` - 基础渲染器
   - `@stackflow/plugin-basic-ui` - iOS/Android 风格 UI（可选，可自定义）
   - `@stackflow/plugin-history-sync` - 浏览器历史同步

2. **路由架构调整**
   - TanStack Router 保留用于 URL 解析和类型安全
   - Stackflow 负责页面堆栈管理和导航动画
   - 两者通过 history-sync plugin 协同

3. **页面结构重构**
   - 现有 `src/pages/*` 改造为 Stackflow Activity
   - 使用 `AppScreen` 组件包裹页面（提供 header + 动画容器）
   - 页面内容继续使用 shadcn/ui 组件

4. **Tab Bar 实现**
   - 创建 `MainTabsActivity` 作为主入口
   - 底部 Tab Bar 在 Activity 内部实现
   - 支持 4 个 Tab：首页、钱包、转账、设置

5. **Safe Area 处理**
   - Stackflow AppBar 自动处理顶部 safe-area
   - 底部 Tab Bar 需手动处理 `env(safe-area-inset-bottom)`

### **BREAKING** 变更

- `src/routes/index.tsx` 路由配置需要重构
- `src/components/layout/app-layout.tsx` 需要适配 Stackflow
- 页面组件签名变更：从 Route Component 变为 ActivityComponentType

## Impact

### Affected Code

| 文件/目录 | 变更类型 | 说明 |
|----------|----------|------|
| `package.json` | 新增依赖 | Stackflow 相关包 |
| `src/stackflow/` | 新增 | Stackflow 配置和 Activity |
| `src/routes/index.tsx` | 重构 | 集成 Stackflow |
| `src/components/layout/` | 重构 | 适配新导航系统 |
| `src/pages/*` | 重构 | 转换为 Activity 组件 |
| `src/styles/globals.css` | 修改 | 引入 Stackflow CSS |

### Affected Specs

- `specs/ui-components/spec.md` - 新增导航相关组件规范
- 新建 `specs/navigation/spec.md` - 导航系统规范

### Migration Path

1. Phase 1: 并行运行（Stackflow + TanStack Router 共存）
2. Phase 2: 逐步迁移页面到 Activity
3. Phase 3: 移除冗余的 TanStack Router 配置

## Dependencies

- Stackflow 官方文档: https://stackflow.so
- Stackflow LLMs 完整文档: https://stackflow.so/llms-full.txt
- Demo 项目: `.tmp/stackflow-demo/`

## Success Criteria

1. ✅ 页面切换有 iOS/Android 风格动画
2. ✅ 支持边缘滑动返回手势
3. ✅ Tab Bar 正常工作，切换流畅
4. ✅ shadcn/ui 组件在 Activity 内正常渲染
5. ✅ Safe area 在 iPhone X+ 设备正确处理
6. ✅ 现有功能无回归

## References

- Stackflow GitHub: https://github.com/daangn/stackflow
- Stackflow LLMs Full: https://stackflow.so/llms-full.txt
- Demo 代码: `.tmp/stackflow-demo/`
- 本次调研对话记录: 包含 View Transitions API、Framer Motion、Ionic 等方案的对比分析
