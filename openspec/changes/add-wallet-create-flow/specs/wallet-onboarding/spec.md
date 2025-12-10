## MODIFIED Requirements

### Requirement: Wallet creation form
系统 SHALL 提供钱包创建表单，收集名称、密码、确认密码、可选密码提示，以及助记词语言与长度选择，并要求用户勾选用户协议。

#### Scenario: Valid submit routes to password step
- **WHEN** 名称不超过 12 字符、密码 8-30 字符且无空白、确认密码一致、密码提示不超过 50 字符，并勾选用户协议
- **THEN** 表单允许提交
- **AND** 系统携带所选助记词语言与长度，并跳转到密码确认/生成步骤，默认设置 `skipBackup=true`

#### Scenario: Mnemonic options
- **WHEN** 用户选择助记词语言
- **THEN** 可选 English / 中文（简体） / 中文（繁體）
- **WHEN** 用户选择助记词长度
- **THEN** 可选 12 / 15 / 18 / 21 / 24 / 36 词

#### Scenario: Invalid password blocked
- **WHEN** 密码少于 8 字符、超过 30 字符、包含空白，或确认密码不匹配
- **THEN** 表单显示校验错误并阻止继续

### Requirement: Wallet creation execution & storage defaults
系统 SHALL 在创建成功页自动落盘新钱包，并按导入上下文设置安全默认值。

#### Scenario: Generate-and-store new wallet (create slice)
- **WHEN** 用户完成创建流程且未提供助记词
- **THEN** 系统按选择的语言与长度（默认 12 英文，BIP44 路径 44）生成助记词
- **AND** 若首次创建（`addWallet=false`）清空本地钱包存储，再创建主钱包并设置 `lastWalletActivate`、`password`，以及将 `passwordLock=true`
- **AND** 保存主钱包时写入 `skipBackup=true`，留待后续备份流程清除

#### Scenario: Add-on wallet creation
- **WHEN** `addWallet=true`
- **THEN** 系统不清空现有数据，仅追加新主钱包，并保持 backUrl 返回逻辑

### Requirement: Wallet recovery by mnemonic
本变更不修改该功能，行为保持基线要求，留待后续 change 处理重复检测与导入流程；系统 SHALL 维持现有助记词导入行为，不新增或移除校验。

#### Scenario: Deferred to later change
- **WHEN** 用户尝试助记词导入
- **THEN** 行为遵循现有基线规范（无新增/变更）
- **AND** 本变更不引入任何差异

### Requirement: Biometric opt-in during onboarding
本变更不修改该功能，行为保持基线要求，留待后续 change 处理指纹验证；系统 SHALL 维持现有生物识别入口与限制，不新增或删除能力。

#### Scenario: Deferred to later change
- **WHEN** 用户触发指纹/生物识别入口
- **THEN** 按基线行为处理；本变更不引入差异

### Requirement: Mnemonic backup verification
本变更不修改该功能，行为保持基线要求，留待后续 change 处理备份确认；系统 SHALL 维持现有助记词确认流程，不新增或删除步骤。

#### Scenario: Deferred to later change
- **WHEN** 进入助记词备份确认流程
- **THEN** 按基线行为处理；本变更不引入差异
