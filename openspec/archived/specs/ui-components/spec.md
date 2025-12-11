# ui-components Spec Delta: i18n Multi-file Structure

## MODIFIED Requirements

### Requirement: i18n Key Completeness (from T014)

系统 SHALL 使用基于命名空间的多文件结构组织国际化翻译。

#### Scenario: 命名空间文件加载
- **GIVEN** 应用启动
- **WHEN** i18n 系统初始化
- **THEN** 按命名空间加载翻译文件 (common, wallet, transaction, security, staking, dweb, error, settings)
- **AND** 默认命名空间为 'common'

#### Scenario: 命名空间前缀使用
- **GIVEN** 需要使用非默认命名空间的翻译
- **WHEN** 调用 t() 函数
- **THEN** 使用命名空间前缀 (e.g., `t('wallet:createWallet')`)
- **OR** 使用 useTranslation hook 指定命名空间

#### Scenario: 多语言文件结构
- **GIVEN** 一个语言目录 (e.g., `en/`)
- **WHEN** 查看文件结构
- **THEN** 包含按命名空间拆分的 JSON 文件
- **AND** 每个文件 < 100 行以保持可维护性
