# ui-components Spec Delta: i18n Completeness

## ADDED Requirements

### Requirement: i18n Key Completeness

系统 SHALL 提供完整的国际化支持，确保所有用户可见文本都有对应的翻译键。

#### Scenario: 多语言切换
- **WHEN** 用户在设置中切换语言到中文
- **THEN** 所有页面文本显示中文翻译
- **AND** 没有未翻译的键值显示（如 "common.loading"）

#### Scenario: RTL 语言支持
- **WHEN** 用户切换到阿拉伯语
- **THEN** 界面布局切换为 RTL 模式
- **AND** 所有文本显示阿拉伯语翻译

#### Scenario: 翻译键完整性
- **GIVEN** en.json 中定义了一个翻译键
- **WHEN** 运行翻译完整性测试
- **THEN** 该键在 zh-CN.json 和 ar.json 中也存在
- **AND** 每个键都有非空翻译值

---

### Requirement: i18n 键命名规范

系统 SHALL 使用一致的键命名规范，按功能模块组织命名空间。

#### Scenario: 命名空间组织
- **GIVEN** 一个新的用户可见文本需要国际化
- **WHEN** 添加翻译键
- **THEN** 键使用 camelCase 格式
- **AND** 键按功能模块分组（common, wallet, transaction, settings, security, staking, dweb）

#### Scenario: 键值映射一致性
- **GIVEN** mpay 原有翻译键 "CREATE_WALLET"
- **WHEN** 迁移到 KeyApp
- **THEN** 转换为 "wallet.createWallet" 格式
- **AND** 保留原有翻译文本语义
