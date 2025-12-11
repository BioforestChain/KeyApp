# wallet-onboarding Change Delta

## ADDED Requirements

### Requirement: Wallet creation form
系统 SHALL 提供钱包创建表单，收集名称、密码、确认密码、可选密码提示，以及助记词语言与长度选择，并要求用户勾选用户协议。

#### Scenario: Valid submit routes to backup
- **WHEN** 名称不超过 12 字符、密码 8-30 字符且无空白、确认密码一致、密码提示不超过 50 字符，并勾选用户协议
- **THEN** 表单允许提交
- **AND** 系统携带所选助记词语言与长度，并设置 `skipBackup=true` 跳转到“助记词备份提示”步骤

#### Scenario: Mnemonic options
- **WHEN** 用户选择助记词语言
- **THEN** 可选 English / 中文（简体） / 中文（繁體）
- **WHEN** 用户选择助记词长度
- **THEN** 可选 12 / 15 / 18 / 21 / 24 / 36 词

#### Scenario: Invalid password blocked
- **WHEN** 密码少于 8 字符、超过 30 字符、包含空白，或确认密码不匹配
- **THEN** 表单显示校验错误并阻止继续

---

### Requirement: Wallet creation execution & storage defaults
系统 SHALL 在创建成功页自动落盘新钱包，并按导入上下文设置安全默认值。

#### Scenario: Generate-and-store new wallet
- **WHEN** 创建页加载且未提供助记词
- **THEN** 系统按用户选择的语言与长度（默认 12 英文，BIP44 路径 44）生成助记词
- **AND** 若此次是首次创建（`addWallet=false`）先清空本地钱包存储，再创建主钱包并设置 `lastWalletActivate`、`password`，以及在选择指纹时将 `fingerprintLock=true` 且强制 `passwordLock=true`
- **AND** 新钱包保存 `skipBackup=true` 以便后续备份确认清除
- **AND** 若传入 `deleteMainWalletId`，系统 SHALL 删除该身份钱包及其链地址，并回退到剩余钱包作为激活钱包

#### Scenario: Add-on wallet creation
- **WHEN** `addWallet=true`
- **THEN** 系统不清空现有数据，仅追加新主钱包，并保持返回路由/backUrl 逻辑

---

### Requirement: Wallet recovery by mnemonic
系统 SHALL 支持使用助记词导入钱包，并防止重复或覆盖隐式冲突的钱包。

#### Scenario: Reject duplicate BFMeta address
- **WHEN** 导入助记词生成的 BFMeta 地址已存在于本地地址列表
- **THEN** 系统提示“地址已存在”并中止导入

#### Scenario: Guard private-key overlap
- **WHEN** 助记词为多链有效助记词且与现有“私钥导入”钱包的任一地址匹配
- **THEN** 系统提示用户即将覆盖，需确认后才删除旧身份并继续；取消则终止导入

#### Scenario: Successful mnemonic import
- **WHEN** 助记词校验通过且无阻塞冲突
- **THEN** 若处于“新增钱包”入口，系统跳转到创建成功页并标记 `showBackupBtn=false`
- **ELSE** 系统跳转到设置钱包密码页（携带 `showBackupBtn=false`），再继续后续流程

---

### Requirement: Biometric opt-in during onboarding
系统 SHALL 在移动端提供指纹验证以启用指纹锁，并处理不可用或冷却状态。

#### Scenario: Fingerprint success
- **WHEN** 设备指纹可用且用户验证成功（最多 5 次尝试）
- **THEN** 系统移除 30 秒冷却计时，继续创建钱包并启用指纹锁

#### Scenario: Fingerprint unavailable or rate limited
- **WHEN** 设备未注册指纹或返回错误码 7（连续失败）
- **THEN** 系统提示原因，记录 30 秒冷却时间并阻止继续
- **WHEN** 返回错误码 9（系统禁用）
- **THEN** 系统提示已被禁用并阻止继续，需用户先重置系统指纹

---

### Requirement: Mnemonic backup verification
系统 SHALL 要求用户在备份流程中按随机位置确认助记词，成功后更新备份状态。

#### Scenario: Backup quiz clears skip flag
- **WHEN** 用户在“助记词确认”页按提示填入 4 个随机位置的单词且全部正确
- **THEN** 系统将对应主钱包的 `skipBackup` 更新为 false
- **AND** 返回上一业务路由或切换到主标签页

#### Scenario: Incorrect word feedback
- **WHEN** 用户选择的单词与目标位置不匹配
- **THEN** 该位置标记为错误，表单阻止提交，直至用户更正
