## ADDED Requirements
### Requirement: MarqueeText 文本滚动组件
系统 SHALL 提供用于展示关键长文本的 `MarqueeText` 组件，支持在有限宽度内自动横向滚动并提供复制能力。

#### Scenario: 溢出时自动滚动
- **WHEN** 文本内容的实际宽度大于容器可用宽度
- **THEN** 文本进入横向循环滚动动画，显示完整内容而不被截断
- **AND** 动画速度与间距可通过属性配置
- **AND** 当指针悬停或组件获得焦点时动画暂停

#### Scenario: 未溢出时静态展示
- **WHEN** 文本内容宽度小于或等于容器可用宽度
- **THEN** 组件不启用滚动动画，文本静态显示
- **AND** 仍保留最大宽度控制以适配布局

#### Scenario: 复制交互反馈
- **WHEN** 用户点击或轻触组件
- **THEN** 文本被复制到剪贴板
- **AND** 组件在至少 1 秒内显示已复制的视觉反馈
- **AND** 可选的 `aria-label` 或 title 暴露完整文本给可访问性工具

#### Scenario: Storybook 示例
- **WHEN** 在 Storybook 中查看 UI 组件
- **THEN** 提供短文本（无滚动）、长文本（自动滚动）、复制反馈三种示例
- **AND** 示例展示可配置最大宽度与动画参数
