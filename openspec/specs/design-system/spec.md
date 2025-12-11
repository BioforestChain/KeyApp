# design-system Specification

## Purpose
TBD - created by archiving change add-theme-audit. Update Purpose after archive.
## Requirements
### Requirement: Visual Brand Consistency

系统 SHALL 与 mpay 品牌视觉保持一致。

#### Scenario: 颜色一致性
- **GIVEN** mpay 品牌颜色定义
- **WHEN** 用户查看 KeyApp 界面
- **THEN** 主色调 (purple OKLCH 65% 0.25 290) 与 mpay 一致
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

