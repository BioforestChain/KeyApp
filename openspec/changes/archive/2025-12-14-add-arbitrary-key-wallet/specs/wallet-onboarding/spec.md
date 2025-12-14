# wallet-onboarding Change Delta

## ADDED Requirements

### Requirement: Key type selection for wallet recovery
系统 SHALL 在钱包恢复流程开始时提供密钥类型选择，支持标准助记词和任意密钥两种模式。

#### Scenario: Display key type options
- **WHEN** 用户进入钱包恢复页面
- **THEN** 系统显示两个选项："标准助记词 (BIP39)" 和 "任意密钥 (BioforestChain)"
- **AND** 默认选中 "标准助记词" 选项

#### Scenario: Select arbitrary key mode
- **WHEN** 用户选择 "任意密钥" 选项
- **THEN** 系统显示安全警告对话框
- **AND** 用户必须确认理解风险后才能继续

#### Scenario: Proceed with mnemonic mode
- **WHEN** 用户选择 "标准助记词" 选项并点击继续
- **THEN** 系统导航到现有的助记词输入页面
- **AND** 流程与当前恢复流程一致

---

### Requirement: Arbitrary key input component
系统 SHALL 提供任意密钥输入组件，允许用户输入任意字符串作为 BioforestChain 钱包密钥。

#### Scenario: Display textarea for secret input
- **WHEN** 用户处于任意密钥输入页面
- **THEN** 系统显示多行文本输入框（textarea）
- **AND** 显示占位符提示文本
- **AND** 显示字符计数

#### Scenario: Toggle secret visibility
- **WHEN** 用户点击显示/隐藏切换按钮
- **THEN** 输入框内容在明文和掩码状态之间切换
- **AND** 默认状态为掩码（隐藏）

#### Scenario: Clear input
- **WHEN** 用户点击清除按钮
- **THEN** 输入框内容被清空
- **AND** 焦点返回到输入框

#### Scenario: Validate non-empty input
- **WHEN** 用户尝试提交空白输入
- **THEN** 系统阻止提交
- **AND** 显示验证错误提示

---

### Requirement: Multi-chain address preview
系统 SHALL 在用户确认创建钱包前显示所有 BioforestChain 网络的派生地址预览。

#### Scenario: Display enabled BioforestChain addresses
- **WHEN** 用户输入有效的任意密钥并点击预览
- **THEN** 系统使用启用的 Bioforest 链配置（chain-config）派生地址（默认配置内置多条链，可通过订阅扩展）
- **AND** 显示每条链的图标、名称和缩略地址
- **AND** 预览列表由 chain-config 的“已启用 Bioforest 链配置”驱动（不在 spec 中硬编码具体链名）

#### Scenario: Copy address from preview
- **WHEN** 用户点击某条链地址旁的复制按钮
- **THEN** 完整地址被复制到剪贴板
- **AND** 显示复制成功提示

#### Scenario: Loading state during derivation
- **WHEN** 系统正在派生地址
- **THEN** 显示骨架屏加载状态
- **AND** 禁用确认按钮

---

### Requirement: Security warning for arbitrary keys
系统 SHALL 在用户使用任意密钥导入钱包前显示安全警告。

#### Scenario: Display security warning dialog
- **WHEN** 用户选择任意密钥模式
- **THEN** 系统显示模态对话框，说明以下风险：
  - 任意密钥可能熵值较低
  - 无校验和验证
  - 非标准备份格式
- **AND** 提供 "我理解风险" 复选框

#### Scenario: Confirm acknowledgment required
- **WHEN** 用户未勾选 "我理解风险" 复选框
- **THEN** 确认按钮保持禁用状态

#### Scenario: Proceed after acknowledgment
- **WHEN** 用户勾选复选框并点击确认
- **THEN** 对话框关闭
- **AND** 用户可以继续输入任意密钥

#### Scenario: Cancel security warning
- **WHEN** 用户点击取消按钮
- **THEN** 对话框关闭
- **AND** 密钥类型选择重置为 "标准助记词"

---

### Requirement: Arbitrary key wallet storage
系统 SHALL 正确存储使用任意密钥创建的钱包，并标记其密钥类型。

#### Scenario: Store wallet with key type flag
- **WHEN** 用户确认使用任意密钥创建钱包
- **THEN** 钱包数据包含 `keyType: 'arbitrary'` 标记
- **AND** 仅包含 BioforestChain 网络的地址（不包含 BIP44 链）

#### Scenario: Encrypt arbitrary secret
- **WHEN** 钱包创建成功
- **THEN** 任意密钥使用用户密码加密存储
- **AND** 存储格式与助记词加密一致

#### Scenario: Recovery with arbitrary key
- **WHEN** 用户使用相同的任意密钥恢复钱包
- **THEN** 派生出相同的地址
- **AND** 可以访问所有 BioforestChain 网络的资产
