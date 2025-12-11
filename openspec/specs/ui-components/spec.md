# ui-components Specification

## Purpose
TBD - created by archiving change add-component-library-testing. Update Purpose after archive.
## Requirements
### Requirement: Storybook 组件开发环境

系统 SHALL 提供 Storybook 10.x 组件开发环境，支持移动端视口预览和交互测试。

#### Scenario: 启动 Storybook
- **WHEN** 运行 `pnpm storybook`
- **THEN** Storybook 在 localhost:6006 启动
- **AND** 所有组件 story 正常渲染

#### Scenario: 移动端视口预览
- **WHEN** 在 Storybook 中选择移动端视口
- **THEN** 组件以 iPhone 13 (390x844) 尺寸显示
- **OR** 组件以 iPhone SE (375x667) 尺寸显示

#### Scenario: 交互测试
- **WHEN** Story 定义了 `play` 函数
- **THEN** 交互测试自动执行
- **AND** 测试结果在 Storybook UI 中显示

---

### Requirement: Vitest 测试环境

系统 SHALL 提供 Vitest 4.x 测试环境，支持组件测试和覆盖率报告。

#### Scenario: 运行测试
- **WHEN** 运行 `pnpm test`
- **THEN** 所有测试用例执行
- **AND** 测试结果输出到控制台

#### Scenario: 覆盖率报告
- **WHEN** 运行 `pnpm test:coverage`
- **THEN** 生成覆盖率报告
- **AND** 报告显示行覆盖率、分支覆盖率、函数覆盖率

---

### Requirement: Tailwind CSS 4.x 配置

系统 SHALL 使用 Tailwind CSS 4.x CSS-first 配置模式。

#### Scenario: 主题变量
- **WHEN** 使用 `@theme` 定义的颜色变量
- **THEN** 样式正确应用
- **AND** 支持 OKLCH 色彩空间

#### Scenario: 深色模式
- **WHEN** 系统或手动切换到深色模式
- **THEN** 使用 `dark:` 前缀的样式生效

---

### Requirement: 容器查询响应式设计

系统 SHALL 使用 CSS Container Queries (`@container`) 实现组件级响应式，确保组件能根据容器尺寸自适应，而非依赖视口尺寸。

#### Scenario: 容器定义
- **WHEN** 组件父容器使用 `@container` 类名
- **THEN** 容器成为查询上下文
- **AND** 子组件可使用 `@container` 查询

#### Scenario: 组件响应式变体
- **WHEN** 组件在窄容器（< 320px）中渲染
- **THEN** 组件使用紧凑布局变体
- **WHEN** 组件在中等容器（320px - 480px）中渲染
- **THEN** 组件使用标准布局
- **WHEN** 组件在宽容器（> 480px）中渲染
- **THEN** 组件使用扩展布局（如双列）

#### Scenario: Storybook 容器尺寸预览
- **WHEN** 在 Storybook 中预览组件
- **THEN** 提供多种容器尺寸选项 (280px / 360px / 480px / 600px)
- **AND** 可实时拖拽调整容器宽度

#### Scenario: Tailwind 容器查询语法
- **WHEN** 使用 Tailwind 的 `@sm:` `@md:` `@lg:` 前缀
- **THEN** 样式根据容器尺寸应用
- **AND** 无需手写 CSS @container 规则

---

<!-- 二、布局组件 (Layout) -->

### Requirement: PageHeader 页面头部

系统 SHALL 提供页面头部组件，包含返回按钮、标题和可选右侧操作。

#### Scenario: 基础头部
- **WHEN** 渲染 `<PageHeader title="转账" />`
- **THEN** 左侧显示返回箭头图标
- **AND** 居中显示标题

#### Scenario: 点击返回
- **WHEN** 点击返回按钮
- **THEN** 触发 `onBack` 回调
- **OR** 默认调用路由返回

#### Scenario: 右侧操作区
- **WHEN** 渲染 `<PageHeader rightAction={<Button>保存</Button>} />`
- **THEN** 右侧显示自定义操作

#### Scenario: 透明背景模式
- **WHEN** 渲染 `<PageHeader transparent />`
- **THEN** 头部背景透明，适用于渐变背景页面

---

### Requirement: TabBar 底部标签栏

系统 SHALL 提供底部标签栏组件，用于主页面导航。

#### Scenario: 渲染标签
- **WHEN** 渲染 `<TabBar items={[...]} />`
- **THEN** 显示所有标签项（图标+文字）
- **AND** 当前激活项高亮显示

#### Scenario: 切换标签
- **WHEN** 点击非激活的标签
- **THEN** 触发路由导航
- **AND** 更新激活状态

#### Scenario: 安全区域
- **WHEN** 设备有底部安全区域（如 iPhone X+）
- **THEN** 标签栏底部自动填充安全区域

---

### Requirement: PageLayout 页面布局容器

系统 SHALL 提供统一的页面布局容器，处理安全区域和滚动。

#### Scenario: 基础布局
- **WHEN** 渲染 `<PageLayout>{children}</PageLayout>`
- **THEN** 内容区域正确处理顶部和底部安全区域
- **AND** 支持滚动

#### Scenario: 固定底部
- **WHEN** 渲染 `<PageLayout footer={<Button>确认</Button>}>`
- **THEN** footer 固定在底部
- **AND** 内容区域不被遮挡

---

### Requirement: BottomSheet 底部弹窗

系统 SHALL 提供移动端底部弹窗组件，支持拖拽关闭。

#### Scenario: 打开弹窗
- **WHEN** `<BottomSheet open={true}>`
- **THEN** 弹窗从底部滑入
- **AND** 背景显示半透明遮罩

#### Scenario: 拖拽关闭
- **WHEN** 用户向下拖拽弹窗
- **AND** 拖拽距离超过阈值
- **THEN** 弹窗关闭

#### Scenario: 高度变体
- **WHEN** 渲染 `<BottomSheet height="auto|half|full">`
- **THEN** 弹窗显示对应高度

---

<!-- 三、钱包组件 (Wallet) -->

### Requirement: WalletCard 钱包卡片

系统 SHALL 提供钱包卡片组件，显示当前钱包信息和快捷操作。

#### Scenario: 显示钱包信息
- **WHEN** 渲染 `<WalletCard wallet={...} />`
- **THEN** 显示钱包名称
- **AND** 显示当前链名称和图标
- **AND** 显示地址（中间省略）

#### Scenario: 复制地址
- **WHEN** 点击地址区域或复制按钮
- **THEN** 地址复制到剪贴板
- **AND** 显示"已复制"提示

#### Scenario: 快捷操作
- **WHEN** 卡片底部显示操作按钮
- **THEN** 显示转账、铸造、收款三个按钮
- **AND** 点击触发对应导航

#### Scenario: 未备份警告
- **WHEN** 钱包未备份助记词
- **THEN** 卡片显示备份警告标识

---

### Requirement: WalletSelector 钱包选择器

系统 SHALL 提供钱包选择器组件，在底部弹窗中展示钱包列表。

#### Scenario: 显示钱包列表
- **WHEN** 打开钱包选择器
- **THEN** 显示所有身份钱包
- **AND** 每项显示头像、名称
- **AND** 当前选中钱包带勾选标记

#### Scenario: 选择钱包
- **WHEN** 点击某个钱包
- **THEN** 触发 `onSelect` 回调
- **AND** 弹窗关闭

#### Scenario: 管理入口
- **WHEN** 点击"管理钱包"
- **THEN** 导航到钱包管理页面

---

### Requirement: ChainAddressSelector 链地址选择器

系统 SHALL 提供链地址选择器，左右分栏展示链和地址。

#### Scenario: 显示链列表
- **WHEN** 打开选择器
- **THEN** 左侧显示所有支持的链（图标）
- **AND** 当前选中链高亮

#### Scenario: 显示地址列表
- **WHEN** 选中某条链
- **THEN** 右侧显示该链下所有地址
- **AND** 每项显示地址（缩略）、来源钱包名

#### Scenario: 选择地址
- **WHEN** 点击某个地址
- **THEN** 触发 `onSelect` 回调
- **AND** 返回完整地址信息

---

### Requirement: AddressDisplay 地址显示

系统 SHALL 提供地址显示组件，支持缩略和复制。

#### Scenario: 缩略显示
- **WHEN** 渲染 `<AddressDisplay address="0x1234...abcd" />`
- **THEN** 显示前6位+...+后4位

#### Scenario: 完整显示
- **WHEN** 渲染 `<AddressDisplay address="..." full />`
- **THEN** 显示完整地址，自动换行

#### Scenario: 复制功能
- **WHEN** 点击复制按钮
- **THEN** 地址复制到剪贴板
- **AND** 显示复制成功提示

---

<!-- 四、资产组件 (Asset) -->

### Requirement: TokenList 代币列表

系统 SHALL 提供代币列表组件，展示当前地址的所有代币。

#### Scenario: 显示代币
- **WHEN** 渲染 `<TokenList tokens={[...]} />`
- **THEN** 每行显示代币图标、名称、余额
- **AND** 支持点击进入详情

#### Scenario: 空状态
- **WHEN** 代币列表为空
- **THEN** 显示"暂无资产"空状态

#### Scenario: 加载状态
- **WHEN** 数据加载中
- **THEN** 显示骨架屏

#### Scenario: 下拉刷新
- **WHEN** 用户下拉列表
- **THEN** 触发刷新回调

---

### Requirement: TokenItem 代币行

系统 SHALL 提供单个代币行组件。

#### Scenario: 显示代币信息
- **WHEN** 渲染 `<TokenItem token={...} />`
- **THEN** 左侧显示代币图标
- **AND** 中间显示代币名称和符号
- **AND** 右侧显示余额和估值

#### Scenario: 余额加载失败
- **WHEN** 余额获取失败
- **THEN** 余额位置显示"------"

---

### Requirement: BalanceDisplay 余额显示

系统 SHALL 提供余额显示组件，支持格式化和隐藏。

#### Scenario: 格式化显示
- **WHEN** 渲染 `<BalanceDisplay amount="1234567.89" decimals={8} />`
- **THEN** 按千分位格式化显示
- **AND** 保留合适的小数位

#### Scenario: 隐藏余额
- **WHEN** 渲染 `<BalanceDisplay hidden />`
- **THEN** 显示"****"

#### Scenario: 带符号显示
- **WHEN** 渲染 `<BalanceDisplay symbol="ETH" />`
- **THEN** 余额后显示代币符号

---

### Requirement: AssetTabs 资产标签切换

系统 SHALL 提供资产类型切换标签。

#### Scenario: 切换标签
- **WHEN** 点击不同标签（资产/数字藏品）
- **THEN** 切换显示对应内容
- **AND** 当前标签高亮

---

<!-- 五、交易组件 (Transaction) -->

### Requirement: TransactionList 交易列表

系统 SHALL 提供交易记录列表组件。

#### Scenario: 显示交易
- **WHEN** 渲染交易列表
- **THEN** 每行显示交易类型图标、金额、状态、时间
- **AND** 转入显示绿色+号，转出显示红色-号

#### Scenario: 无限滚动
- **WHEN** 滚动到底部
- **THEN** 自动加载更多记录

#### Scenario: 空状态
- **WHEN** 无交易记录
- **THEN** 显示"暂无交易记录"

---

### Requirement: TransactionItem 交易行

系统 SHALL 提供单个交易记录行。

#### Scenario: 显示交易信息
- **WHEN** 渲染交易项
- **THEN** 显示交易类型（转入/转出/合约调用）
- **AND** 显示金额
- **AND** 显示状态（成功/失败/待确认）
- **AND** 显示时间

#### Scenario: 点击查看详情
- **WHEN** 点击交易行
- **THEN** 导航到交易详情页

---

### Requirement: TransactionStatus 交易状态

系统 SHALL 提供交易状态标签组件。

#### Scenario: 状态显示
- **WHEN** 渲染 `<TransactionStatus status="success|failed|pending" />`
- **THEN** success: 绿色"成功"
- **AND** failed: 红色"失败"
- **AND** pending: 黄色"待确认"（带动画）

---

### Requirement: FeeDisplay 手续费显示

系统 SHALL 提供手续费显示组件。

#### Scenario: 显示手续费
- **WHEN** 渲染 `<FeeDisplay fee="0.001" symbol="ETH" />`
- **THEN** 显示"手续费: 0.001 ETH"
- **AND** 可选显示法币估值

#### Scenario: 手续费加载中
- **WHEN** 手续费计算中
- **THEN** 显示加载指示器

---

<!-- 六、转账组件 (Transfer) -->

### Requirement: AddressInput 地址输入框

系统 SHALL 提供地址输入框，带扫码和地址簿入口。

#### Scenario: 输入地址
- **WHEN** 用户输入地址
- **THEN** 实时验证格式
- **AND** 格式错误显示红色边框和错误提示

#### Scenario: 扫码输入
- **WHEN** 点击扫码图标
- **THEN** 打开扫码页面
- **AND** 扫描成功后自动填入地址

#### Scenario: 地址簿选择
- **WHEN** 点击地址簿图标
- **THEN** 打开地址簿选择器
- **AND** 选择后自动填入

#### Scenario: 粘贴地址
- **WHEN** 点击粘贴按钮
- **THEN** 从剪贴板粘贴地址

---

### Requirement: AmountInput 金额输入框

系统 SHALL 提供金额输入组件，支持快捷操作。

#### Scenario: 输入金额
- **WHEN** 用户输入金额
- **THEN** 只允许数字和小数点
- **AND** 限制小数位数（根据代币精度）

#### Scenario: 全部按钮
- **WHEN** 点击"全部"按钮
- **THEN** 填入最大可转金额（扣除手续费）

#### Scenario: 显示余额
- **WHEN** 渲染金额输入
- **THEN** 显示当前可用余额

#### Scenario: 余额不足
- **WHEN** 输入金额超过余额
- **THEN** 显示"余额不足"错误

---

### Requirement: TransferConfirmSheet 转账确认

系统 SHALL 提供转账确认弹窗，显示交易详情。

#### Scenario: 显示确认信息
- **WHEN** 打开确认弹窗
- **THEN** 显示发送地址、接收地址
- **AND** 显示转账金额和代币
- **AND** 显示预估手续费
- **AND** 显示备注（如有）

#### Scenario: 确认转账
- **WHEN** 点击确认按钮
- **THEN** 弹出密码/生物识别验证

---

<!-- 七、收款组件 (Receive) -->

### Requirement: QRCodeDisplay 二维码显示

系统 SHALL 提供收款二维码显示组件。

#### Scenario: 显示二维码
- **WHEN** 渲染 `<QRCodeDisplay value="0x..." />`
- **THEN** 生成并显示对应二维码
- **AND** 二维码尺寸适中（200x200）

#### Scenario: 保存二维码
- **WHEN** 点击保存按钮
- **THEN** 将二维码保存到相册
- **AND** 显示保存成功提示

#### Scenario: 分享二维码
- **WHEN** 点击分享按钮
- **THEN** 调用系统分享

---

<!-- 八、扫码组件 (Scanner) -->

### Requirement: QRScanner 二维码扫描

系统 SHALL 提供二维码扫描组件。

#### Scenario: 扫描二维码
- **WHEN** 对准二维码
- **THEN** 自动识别并返回内容

#### Scenario: 从相册选择
- **WHEN** 点击相册按钮
- **THEN** 打开相册选择图片
- **AND** 识别图片中的二维码

#### Scenario: 手电筒
- **WHEN** 环境光线暗
- **THEN** 显示手电筒开关
- **AND** 可开启闪光灯

#### Scenario: 权限处理
- **WHEN** 无相机权限
- **THEN** 显示权限引导

---

<!-- 九、安全组件 (Security) -->

### Requirement: PasswordInput 密码输入

系统 SHALL 提供密码输入组件，支持显示/隐藏切换。

#### Scenario: 密码隐藏（默认）
- **WHEN** 渲染密码输入框
- **THEN** 输入内容显示为圆点

#### Scenario: 切换可见
- **WHEN** 点击眼睛图标
- **THEN** 切换明文/密文显示

#### Scenario: 强度指示
- **WHEN** 渲染 `<PasswordInput showStrength />`
- **THEN** 显示密码强度指示条

---

### Requirement: PasswordConfirmSheet 密码确认弹窗

系统 SHALL 提供密码确认弹窗，用于敏感操作验证。

#### Scenario: 显示密码输入
- **WHEN** 打开确认弹窗
- **THEN** 显示密码输入框
- **AND** 显示确认按钮

#### Scenario: 支持生物识别
- **WHEN** 用户已启用指纹/面容
- **THEN** 同时显示生物识别选项

#### Scenario: 密码错误
- **WHEN** 输入错误密码
- **THEN** 显示错误提示
- **AND** 清空输入框

---

### Requirement: MnemonicDisplay 助记词显示

系统 SHALL 提供助记词显示组件。

#### Scenario: 显示助记词
- **WHEN** 渲染助记词
- **THEN** 以网格形式显示12/24个单词
- **AND** 每个单词显示序号

#### Scenario: 复制助记词
- **WHEN** 点击复制按钮
- **THEN** 复制所有助记词（空格分隔）
- **AND** 显示安全警告

#### Scenario: 安全提示
- **WHEN** 显示助记词
- **THEN** 底部显示安全警告文字

---

### Requirement: MnemonicInput 助记词输入

系统 SHALL 提供助记词输入组件，支持智能提示。

#### Scenario: 输入助记词
- **WHEN** 用户输入单词
- **THEN** 显示 BIP39 词库匹配建议
- **AND** 支持选择建议词

#### Scenario: 粘贴助记词
- **WHEN** 粘贴完整助记词
- **THEN** 自动拆分到各输入框

#### Scenario: 验证助记词
- **WHEN** 输入完成
- **THEN** 验证助记词有效性
- **AND** 无效则显示错误

---

### Requirement: MnemonicConfirm 助记词确认

系统 SHALL 提供助记词备份确认组件。

#### Scenario: 随机选词确认
- **WHEN** 进入确认页面
- **THEN** 随机显示几个位置
- **AND** 用户需选择对应位置的单词

#### Scenario: 确认成功
- **WHEN** 所有选择正确
- **THEN** 确认通过，更新备份状态

#### Scenario: 确认失败
- **WHEN** 选择错误
- **THEN** 显示错误提示
- **AND** 可重试

---

<!-- 十、地址簿组件 (AddressBook) -->

### Requirement: AddressBookList 地址簿列表

系统 SHALL 提供地址簿列表组件。

#### Scenario: 显示联系人
- **WHEN** 渲染地址簿
- **THEN** 按字母分组显示联系人
- **AND** 每项显示名称、地址、链标识

#### Scenario: 搜索联系人
- **WHEN** 输入搜索关键词
- **THEN** 过滤匹配的联系人

#### Scenario: 空状态
- **WHEN** 地址簿为空
- **THEN** 显示空状态和添加按钮

---

### Requirement: AddressBookForm 地址表单

系统 SHALL 提供添加/编辑联系人表单。

#### Scenario: 添加联系人
- **WHEN** 填写名称、地址、选择链
- **THEN** 验证地址格式
- **AND** 保存成功后返回列表

#### Scenario: 编辑联系人
- **WHEN** 打开已有联系人
- **THEN** 预填现有信息
- **AND** 支持修改

---

<!-- 十一、设置组件 (Settings) -->

### Requirement: SettingsList 设置列表

系统 SHALL 提供设置列表组件。

#### Scenario: 设置项
- **WHEN** 渲染设置项
- **THEN** 显示图标、标题、描述
- **AND** 右侧显示箭头/开关/值

#### Scenario: 分组显示
- **WHEN** 有多个设置组
- **THEN** 按组分隔显示

---

### Requirement: LanguageSelector 语言选择器

系统 SHALL 提供语言选择组件。

#### Scenario: 显示语言列表
- **WHEN** 打开语言选择
- **THEN** 显示所有支持的语言
- **AND** 当前语言带勾选标记

#### Scenario: 切换语言
- **WHEN** 选择新语言
- **THEN** 立即切换界面语言
- **AND** 保存设置

---

<!-- 十二、DWEB 授权组件 -->

### Requirement: AuthorizeCard 授权卡片

系统 SHALL 提供 DApp 授权卡片组件。

#### Scenario: 显示 DApp 信息
- **WHEN** 收到授权请求
- **THEN** 显示 DApp 图标、名称、域名

#### Scenario: 授权操作
- **WHEN** 显示授权内容
- **THEN** 底部显示拒绝和确认按钮

---

### Requirement: SignatureDetail 签名详情

系统 SHALL 提供签名请求详情展示。

#### Scenario: 消息签名
- **WHEN** 类型为 message
- **THEN** 显示待签名的消息内容

#### Scenario: 转账签名
- **WHEN** 类型为 transfer
- **THEN** 显示发送地址、接收地址、金额、手续费

#### Scenario: 合约签名
- **WHEN** 类型为 contract
- **THEN** 显示合约地址、调用数据

---

<!-- 十三、通用组件 (Common) -->

### Requirement: GradientButton 渐变按钮

系统 SHALL 提供渐变背景按钮组件。

#### Scenario: 默认状态
- **WHEN** 渲染渐变按钮
- **THEN** 显示渐变背景
- **AND** 白色文字

#### Scenario: 加载状态
- **WHEN** `loading={true}`
- **THEN** 显示加载指示器
- **AND** 按钮不可点击

#### Scenario: 禁用状态
- **WHEN** `disabled={true}`
- **THEN** 降低透明度
- **AND** 不可点击

---

### Requirement: LoadingSpinner 加载指示器

系统 SHALL 提供加载指示器组件。

#### Scenario: 尺寸变体
- **WHEN** 渲染 `<LoadingSpinner size="sm|md|lg" />`
- **THEN** 显示对应尺寸

#### Scenario: 全屏加载
- **WHEN** `fullScreen={true}`
- **THEN** 居中显示在全屏遮罩上

---

### Requirement: EmptyState 空状态

系统 SHALL 提供空状态组件。

#### Scenario: 显示空状态
- **WHEN** 渲染空状态
- **THEN** 显示插图、标题、描述
- **AND** 可选操作按钮

---

### Requirement: Skeleton 骨架屏

系统 SHALL 提供骨架屏组件。

#### Scenario: 列表骨架
- **WHEN** 数据加载中
- **THEN** 显示列表形式的骨架屏

#### Scenario: 卡片骨架
- **WHEN** 卡片数据加载中
- **THEN** 显示卡片形式的骨架屏

---

### Requirement: NetworkStatus 网络状态

系统 SHALL 提供网络状态指示组件。

#### Scenario: 离线状态
- **WHEN** 网络断开
- **THEN** 顶部显示离线提示条

#### Scenario: 恢复在线
- **WHEN** 网络恢复
- **THEN** 提示条消失
- **AND** 自动刷新数据

---

### Requirement: CopyButton 复制按钮

系统 SHALL 提供复制按钮组件。

#### Scenario: 复制成功
- **WHEN** 点击复制按钮
- **THEN** 复制内容到剪贴板
- **AND** 图标变为勾选
- **AND** 2秒后恢复

---

### Requirement: Avatar 头像

系统 SHALL 提供头像组件。

#### Scenario: 显示头像
- **WHEN** 渲染头像
- **THEN** 支持图片或文字初始化

#### Scenario: 钱包头像
- **WHEN** 用于钱包
- **THEN** 根据钱包名生成唯一颜色

---

### Requirement: ChainIcon 链图标

系统 SHALL 提供链图标组件。

#### Scenario: 显示链图标
- **WHEN** 渲染 `<ChainIcon chain="Ethereum" />`
- **THEN** 显示对应链的图标

#### Scenario: 尺寸变体
- **WHEN** 指定 size
- **THEN** 图标显示对应尺寸

---

### Requirement: TokenIcon 代币图标

系统 SHALL 提供代币图标组件。

#### Scenario: 显示代币图标
- **WHEN** 提供图标 URL
- **THEN** 加载并显示图标

#### Scenario: 加载失败
- **WHEN** 图标加载失败
- **THEN** 显示代币符号首字母

---

### Requirement: RefreshControl 下拉刷新

系统 SHALL 提供下拉刷新组件。

#### Scenario: 下拉刷新
- **WHEN** 用户下拉列表
- **THEN** 显示刷新指示器
- **AND** 触发刷新回调

#### Scenario: 刷新完成
- **WHEN** 刷新完成
- **THEN** 指示器消失
- **AND** 列表回弹

---

### Requirement: Toast 提示

系统 SHALL 提供 Toast 提示功能。

#### Scenario: 成功提示
- **WHEN** `toast.success(message)`
- **THEN** 显示绿色成功提示

#### Scenario: 错误提示
- **WHEN** `toast.error(message)`
- **THEN** 显示红色错误提示

#### Scenario: 加载提示
- **WHEN** `toast.loading(message)`
- **THEN** 显示带加载动画的提示

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

