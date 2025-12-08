# Change: 搭建组件库与测试环境

## Why

BFM Pay 需要建立坚实的技术基础设施，确保组件开发的可视化、可测试性和高质量。这是项目的第一阶段，为后续功能开发奠定基础。

## What Changes

### 新增功能

1. **项目初始化**
   - Vite 7.x + React 19.x 项目脚手架
   - TypeScript 严格模式配置
   - ESLint + Prettier 代码规范

2. **Storybook 10.x 组件开发环境**
   - 移动端视口配置 (375x812, 390x844, 414x896)
   - 交互测试 (play function)
   - Tailwind CSS 4.x 集成
   - 深色/浅色主题切换

3. **Vitest 4.x 测试环境**
   - Workspace 配置 (单元测试、组件测试分离)
   - Testing Library 集成
   - 覆盖率报告 (目标: 业务逻辑 80%+, UI 60%+)

4. **shadcn/ui 组件库**
   - 基础配置与主题定制
   - Tailwind CSS 4.x CSS-first 配置

5. **基础 UI 组件**
   - Button (渐变按钮、轮廓按钮、加载状态)
   - Input (标准、密码、错误状态)
   - BottomSheet (移动端底部弹窗)
   - PageHeader (带返回的页面头部)
   - LoadingSpinner (加载指示器)
   - Toast (提示信息)

## Impact

- **Affected specs**: `ui-components` (新建)
- **Affected code**: 
  - 新增 `.storybook/` 配置目录
  - 新增 `src/components/ui/` 组件目录
  - 新增 `src/test/` 测试配置
  - 修改 `package.json` 添加依赖
  - 新增 `vitest.config.ts`
  - 新增 `tailwind.css` (Tailwind 4.x)

## Success Criteria

- [ ] `pnpm dev` 启动开发服务器
- [ ] `pnpm storybook` 启动 Storybook
- [ ] `pnpm test` 运行测试并通过
- [ ] 所有基础组件有 Storybook story
- [ ] 所有基础组件有单元测试
- [ ] 覆盖率报告生成成功
