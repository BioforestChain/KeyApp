# design-system Specification

## Purpose
Define the KeyApp design tokens (colors, typography, spacing) used across the app so visual-regression checks and future UI work have a single, explicit source of truth.
## Requirements
### Requirement: Visual Brand Consistency

系统 SHALL 使用一致的 KeyApp（Bioforest）品牌视觉，并保持关键 UI 的可读性与一致性。

#### Scenario: 颜色一致性
- **GIVEN** KeyApp 设计系统颜色定义
- **WHEN** 用户查看 KeyApp 界面
- **THEN** 主色调 (Bioforest green OKLCH 60% 0.13 163) 与当前实现一致
- **AND** 链颜色 (ETH blue, TRX red, BNB yellow, BTC orange) 正确

#### Scenario: 字体层次
- **GIVEN** mpay 字体层次结构
- **WHEN** 用户阅读界面文本
- **THEN** 正文使用 DM Sans
- **AND** 地址使用 DM Mono
- **AND** 标题使用 DM Serif Display

#### Scenario: 暗色模式对比度
- **GIVEN** 系统处于暗色模式
- **WHEN** 用户查看界面
- **THEN** 前景/背景对比度 ≥ 4.5:1 (WCAG AA)

#### Scenario: 间距一致性
- **GIVEN** Tailwind 4.x 设计系统
- **WHEN** 组件渲染
- **THEN** 使用 4px 基础单位间距
- **AND** 卡片/容器间距符合规范
