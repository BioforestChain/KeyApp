# 导航系统

> 定义栈式导航架构规范

---

## 导航模式

### 栈式导航

BFM Pay 采用栈式导航模式，提供原生 App 般的用户体验。

```
┌─────────────────────────────────────┐
│            Navigation Stack          │
├─────────────────────────────────────┤
│  [4] 交易详情页                       │ ← 栈顶（当前页面）
│  [3] 发送确认页                       │
│  [2] 发送页                          │
│  [1] 钱包详情页                       │
│  [0] 首页 (Tab)                      │ ← 栈底
└─────────────────────────────────────┘
```

### 导航类型

| 操作 | 说明 | 动画方向 |
|-----|------|---------|
| Push | 压入新页面到栈顶 | 从右进入 |
| Pop | 弹出栈顶页面 | 向右退出 |
| Replace | 替换栈顶页面 | 淡入淡出 |
| Reset | 重置导航栈 | 无动画 |

---

## 页面（Screen）规范

### Screen 定义

每个 Screen MUST 包含：

| 属性 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | string | 是 | 唯一标识符 |
| path | string | 是 | URL 路径模式 |
| params | ParamSchema | 否 | 参数定义 |
| component | Component | 是 | 渲染组件 |
| options | ScreenOptions | 否 | 页面配置 |

### Screen 参数

```
ParamSchema = {
  [paramName: string]: {
    type: 'string' | 'number' | 'boolean'
    required: boolean
    default?: any
  }
}
```

### Screen 配置

```
ScreenOptions = {
  title: string | null        // 页面标题
  headerVisible: boolean      // 是否显示头部
  gestureEnabled: boolean     // 是否启用手势返回
  animation: AnimationType    // 过渡动画类型
}
```

---

## Screen 列表

### Tab 页面

| Screen | 路径 | 说明 |
|--------|------|------|
| MainTabs | / | Tab 容器页 |
| HomeTab | /home | 首页 Tab |
| HistoryTab | /history | 历史 Tab |
| SettingsTab | /settings | 设置 Tab |

### 钱包相关

| Screen | 路径 | 参数 | 说明 |
|--------|------|------|------|
| WalletCreate | /wallet/create | - | 创建钱包 |
| WalletImport | /wallet/import | - | 导入钱包 |
| WalletDetail | /wallet/:id | id: string | 钱包详情 |
| WalletBackup | /wallet/:id/backup | id: string | 备份钱包 |

### 交易相关

| Screen | 路径 | 参数 | 说明 |
|--------|------|------|------|
| Send | /send | token?: string | 发送页 |
| SendConfirm | /send/confirm | tx: TxData | 发送确认 |
| Receive | /receive | - | 收款页 |
| TxDetail | /tx/:hash | hash: string | 交易详情 |

### 设置相关

| Screen | 路径 | 说明 |
|--------|------|------|
| SettingsLanguage | /settings/language | 语言设置 |
| SettingsCurrency | /settings/currency | 货币设置 |
| SettingsChains | /settings/chains | 链配置 |
| SettingsWalletLock | /settings/wallet-lock | 修改钱包锁 |
| SettingsMnemonic | /settings/mnemonic | 查看助记词 |

### DWEB 授权

| Screen | 路径 | 参数 | 说明 |
|--------|------|------|------|
| AuthorizeAddress | /authorize/address/:eventId | eventId: string | 地址授权 |
| AuthorizeSignature | /authorize/signature/:eventId | eventId: string | 签名授权 |

---

## 导航接口规范

### INavigator

```
INavigator {
  // 导航操作
  push(screen: string, params?: object): void
  pop(): void
  replace(screen: string, params?: object): void
  reset(screens: ScreenConfig[]): void
  
  // 状态查询
  canGoBack(): boolean
  getCurrentScreen(): ScreenInfo
  getNavigationState(): NavigationState
  
  // 事件监听
  addListener(event: NavigationEvent, callback: Function): Unsubscribe
}
```

### NavigationEvent

| 事件 | 触发时机 |
|-----|---------|
| beforeNavigate | 导航开始前 |
| afterNavigate | 导航完成后 |
| focus | 页面获得焦点 |
| blur | 页面失去焦点 |

---

## Tab 导航规范

### Tab 配置

| 属性 | 类型 | 说明 |
|-----|------|------|
| key | string | Tab 唯一标识 |
| label | string | Tab 显示文本 |
| icon | Icon | Tab 图标 |
| screen | string | 对应 Screen |
| badge | number | 角标数字 |

### Tab 列表

| Tab | 图标 | Screen | 说明 |
|-----|------|--------|------|
| home | Wallet | HomeTab | 首页/钱包 |
| history | History | HistoryTab | 交易历史 |
| settings | Settings | SettingsTab | 设置 |

### Tab 行为规范

- **MUST** 点击当前 Tab 滚动到顶部
- **MUST** 记住每个 Tab 的滚动位置
- **SHOULD** 支持 Tab 切换动画
- **MAY** 支持 Tab 长按快捷操作

---

## URL 同步规范

### 路由模式

- **MUST** 支持 Hash 路由模式（兼容静态部署）
- **SHOULD** 支持 History 路由模式（可选）

### URL 格式

```
Hash 模式：https://example.com/#/wallet/abc123
History 模式：https://example.com/wallet/abc123
```

### 参数编码

- **MUST** 路径参数使用 URL 安全字符
- **MUST** 复杂参数使用 URL Search 编码
- **SHOULD** 敏感参数加密后传递

---

## 过渡动画规范

### 动画类型

| 类型 | 说明 | 使用场景 |
|-----|------|---------|
| slideRight | 从右滑入 | 进入新页面 |
| slideLeft | 从左滑入 | 返回上一页 |
| slideUp | 从下滑入 | 弹出层/Sheet |
| fade | 淡入淡出 | 替换页面 |
| none | 无动画 | 快速切换 |

### 动画参数

| 参数 | 建议值 | 说明 |
|-----|--------|------|
| duration | 250-300ms | 动画时长 |
| easing | ease-out | 缓动函数 |
| delay | 0ms | 延迟时间 |

---

## 手势导航规范

### 手势返回

- **MUST** 支持从屏幕左边缘向右滑动返回
- **MUST** 滑动距离 > 屏幕 1/3 时触发返回
- **SHOULD** 显示返回预览效果
- **MAY** 支持自定义触发阈值

### 禁用场景

以下页面 SHOULD 禁用手势返回：

- 支付确认页（防止误操作）
- 密码输入页（防止泄露）
- 重要表单页（防止数据丢失）

---

## 深度链接规范

### 支持的 Scheme

| Scheme | 说明 |
|--------|------|
| bfmpay:// | 应用内链接 |
| https://pay.bfm.network | Web 链接 |

### 链接格式

```
bfmpay://send?to=ADDRESS&amount=100
bfmpay://wallet/WALLET_ID
bfmpay://authorize/address/EVENT_ID
```

### 处理流程

```
接收深度链接
    │
    ▼
解析 scheme 和 path
    │
    ▼
验证参数合法性
    │
    ├── 无效 ──► 显示错误
    │
    └── 有效 ──► 导航到对应页面
```

---

## 本章小结

- 栈式导航提供原生 App 体验
- Screen 统一定义页面和参数
- Tab 导航管理主要功能入口
- URL 同步支持页面分享和书签
- 手势导航增强操作体验
- 深度链接支持外部唤起
