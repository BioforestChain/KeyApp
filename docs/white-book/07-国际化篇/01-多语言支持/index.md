# 多语言支持

> 定义国际化架构规范

---

## 支持的语言

| 语言代码 | 语言名称 | 书写方向 |
|---------|---------|---------|
| zh-CN | 简体中文 | LTR |
| zh-TW | 繁體中文 | LTR |
| en | English | LTR |
| ja | 日本語 | LTR |
| ko | 한국어 | LTR |
| ar | العربية | RTL |

---

## 语言检测规范

### 检测顺序

1. **本地存储** - 用户上次选择的语言
2. **浏览器语言** - navigator.language
3. **系统语言** - 操作系统语言设置
4. **默认语言** - 英语 (en)

### 语言匹配规则

- **MUST** 精确匹配优先（zh-CN → zh-CN）
- **SHOULD** 支持语言族匹配（zh-HK → zh-TW）
- **MUST** 无匹配时使用默认语言

### 语言族映射

| 请求语言 | 匹配结果 |
|---------|---------|
| zh-CN | zh-CN |
| zh-TW | zh-TW |
| zh-HK | zh-TW |
| zh | zh-CN |
| en-US | en |
| en-GB | en |

---

## 翻译资源规范

### 命名空间划分

| 命名空间 | 用途 |
|---------|------|
| common | 通用词汇（确认、取消、返回等） |
| wallet | 钱包相关 |
| transfer | 转账相关 |
| settings | 设置相关 |
| error | 错误消息 |
| auth | 认证相关 |

### 翻译键命名规范

- **MUST** 使用小驼峰命名
- **MUST** 语义化命名
- **SHOULD** 按功能模块组织
- **SHOULD** 避免超过 3 层嵌套

```
示例：
✓ createWallet
✓ balance.available
✓ error.networkTimeout
✗ btn_create_wallet
✗ a.b.c.d.e.f
```

### 翻译文本规范

- **MUST** 避免拼接翻译（使用插值）
- **MUST** 考虑不同语言的语序差异
- **SHOULD** 为变量提供语义化的占位符名
- **SHOULD** 添加翻译备注说明上下文

```
✓ "available": "可用: {{amount}} {{symbol}}"
✗ "available": "可用: " + amount + " " + symbol
```

---

## 插值规范

### 基本插值

```
翻译文本: "余额: {{amount}}"
调用方式: t('balance', { amount: '100' })
结果: "余额: 100"
```

### 复数处理

```
翻译文本:
  "items_zero": "无项目"
  "items_one": "1 个项目"
  "items_other": "{{count}} 个项目"

调用方式: t('items', { count: 5 })
```

### 日期时间格式

| 格式 | zh-CN | en |
|-----|-------|-----|
| 短日期 | 2024/01/15 | 01/15/2024 |
| 长日期 | 2024年1月15日 | January 15, 2024 |
| 时间 | 14:30 | 2:30 PM |

---

## RTL 布局规范

### CSS 逻辑属性

| 物理属性 | 逻辑属性 |
|---------|---------|
| padding-left | padding-inline-start |
| padding-right | padding-inline-end |
| margin-left | margin-inline-start |
| margin-right | margin-inline-end |
| left | inset-inline-start |
| right | inset-inline-end |
| text-align: left | text-align: start |
| text-align: right | text-align: end |

### RTL 规范要求

- **MUST** 使用 CSS 逻辑属性
- **MUST** 设置 `dir` 属性（html 或容器）
- **MUST** 设置 `lang` 属性
- **SHOULD** 翻转方向性图标（箭头等）
- **MUST NOT** 翻转非方向性图标（品牌 logo）

### 需要翻转的元素

| 元素 | 翻转 | 说明 |
|-----|------|------|
| 返回箭头 | 是 | 方向性 |
| 前进箭头 | 是 | 方向性 |
| 列表顺序 | 是 | 起始位置变化 |
| 进度条方向 | 是 | 从右到左 |
| 品牌 Logo | 否 | 固定资产 |
| 电话号码 | 否 | 数字方向不变 |

---

## 语言切换规范

### 切换流程

```
用户进入语言设置
    │
    ▼
显示语言列表（当前语言高亮）
    │
    ▼
用户选择新语言
    │
    ▼
保存到本地存储
    │
    ▼
更新应用语言
    │
    ▼
刷新界面文本
    │
    ▼
更新 HTML dir 和 lang 属性
```

### 切换要求

- **MUST** 立即生效（无需重启）
- **MUST** 持久化到本地存储
- **MUST** 更新所有可见文本
- **SHOULD** 显示本地语言名称（非翻译名）

### 语言列表显示

每种语言 SHOULD 使用其本地名称显示：

```
简体中文
繁體中文
English
日本語
한국어
العربية
```

---

## 开发规范

### 添加新翻译

1. 在所有语言文件中添加新键
2. 确保键名一致
3. 添加必要的复数形式
4. 测试所有语言显示

### 翻译缺失处理

- **MUST** 有回退语言机制
- **SHOULD** 开发环境显示缺失键警告
- **SHOULD** 生产环境显示回退语言文本
- **MAY** 上报缺失翻译

### 测试规范

- **MUST** 测试所有支持语言的界面
- **MUST** 测试 RTL 布局正确性
- **SHOULD** 测试长文本不溢出
- **SHOULD** 测试占位符替换正确

---

## 本章小结

- 支持 6 种语言，包括 RTL 阿拉伯语
- 自动语言检测，支持用户手动切换
- 使用 CSS 逻辑属性支持双向布局
- 统一的翻译资源管理和命名规范
- 语言切换即时生效
