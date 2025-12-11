# staking Spec Delta: Staking Epic

## ADDED Requirements

### Requirement: Token Staking (Mint)

用户 SHALL 能够将外链代币质押（Mint）到 BioForest 内链。

#### Scenario: 选择质押资产
- **GIVEN** 用户在质押页面
- **WHEN** 用户选择源链和代币
- **THEN** 显示可用余额
- **AND** 显示支持的目标链

#### Scenario: 输入质押金额
- **GIVEN** 用户已选择资产
- **WHEN** 用户输入金额
- **THEN** 验证金额不超过可用余额
- **AND** 显示预估手续费

#### Scenario: 确认质押交易
- **GIVEN** 用户已输入有效金额
- **WHEN** 用户确认交易
- **THEN** 显示交易确认弹窗
- **AND** 用户密码验证后提交交易

### Requirement: Token Unstaking (Burn)

用户 SHALL 能够将内链代币赎回（Burn）到外链。

#### Scenario: 选择赎回资产
- **GIVEN** 用户在赎回页面
- **WHEN** 用户选择内链代币
- **THEN** 显示已质押余额
- **AND** 显示支持的目标外链

#### Scenario: 确认赎回交易
- **GIVEN** 用户已输入有效金额
- **WHEN** 用户确认交易
- **THEN** 显示交易确认弹窗
- **AND** 交易提交后更新余额

### Requirement: Staking History

用户 SHALL 能够查看质押/赎回交易历史。

#### Scenario: 查看历史记录
- **GIVEN** 用户在质押模块
- **WHEN** 用户访问记录页面
- **THEN** 显示所有质押/赎回交易
- **AND** 支持按类型筛选
