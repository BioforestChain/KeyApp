# ui-components Spec Delta: E2E Coverage

## ADDED Requirements

### Requirement: Visual Regression Testing

系统 SHALL 提供视觉回归测试，确保 UI 变更不会意外破坏现有外观。

#### Scenario: 基线截图对比
- **GIVEN** 存在基线截图
- **WHEN** 运行 E2E 测试
- **THEN** 当前截图与基线截图进行像素级对比
- **AND** 差异超过阈值时报告失败

#### Scenario: 截图更新流程
- **GIVEN** 有意的 UI 变更
- **WHEN** 开发者运行 `pnpm e2e:update-snapshots`
- **THEN** 基线截图更新为新版本
- **AND** 差异在 PR 中可见

### Requirement: 关键流程 E2E 测试

系统 SHALL 对关键用户流程提供端到端测试覆盖。

#### Scenario: 设置页面流程
- **WHEN** 用户访问设置页面
- **THEN** 可以切换语言并立即看到效果
- **AND** 可以更改货币单位

#### Scenario: 交易历史流程
- **WHEN** 用户访问交易历史页面
- **THEN** 可以查看交易列表
- **AND** 可以点击进入交易详情

#### Scenario: 通知中心流程
- **WHEN** 用户访问通知中心
- **THEN** 可以查看通知列表
- **AND** 可以标记已读或清除全部
