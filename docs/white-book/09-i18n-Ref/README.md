# 📘 Book T5: The i18n Reference (国际化技术参考)

> 多语言支持、本地化格式化和 RTL 布局规范

## 📖 目录

| 文档 | 说明 |
|------|------|
| [01-Language-Support](./01-Language-Support.md) | 支持语言、检测规范、翻译资源 |
| [02-Localization](./02-Localization.md) | 数字/日期格式化、术语表 |
| [03-Action-Status-Copy](./03-Action-Status-Copy.md) | 高风险动作文案与错误映射规范 |

---

## 🌍 支持语言

| 语言代码 | 语言名称 | 书写方向 |
|----------|----------|----------|
| zh-CN | 简体中文 | LTR |
| zh-TW | 繁體中文 | LTR |
| en | English | LTR |
| ja | 日本語 | LTR |
| ko | 한국어 | LTR |
| ar | العربية | **RTL** |

---

## 🔄 语言检测顺序

```
1. 本地存储 (用户上次选择)
      │
      ▼
2. 浏览器语言 (navigator.language)
      │
      ▼
3. 系统语言
      │
      ▼
4. 默认语言 (en)
```

---

## 📁 翻译资源结构

```
src/i18n/locales/
├── zh-CN/
│   ├── common.json      # 通用文案
│   ├── wallet.json      # 钱包相关
│   ├── transfer.json    # 转账相关
│   └── settings.json    # 设置相关
├── en/
│   └── ...
└── ...
```

---

## 🎯 核心原则

### MUST

- 使用 CSS 逻辑属性 (支持 RTL)
- 避免拼接翻译 (使用插值)
- 语言切换立即生效
- 有回退语言机制

### SHOULD

- 使用本地语言名称显示语言列表
- 测试所有支持语言的界面
- 测试长文本不溢出

### MUST NOT

- 在翻译文本中硬编码数字格式
- 翻转非方向性图标 (如 Logo)

---

## 相关文档

- [UI Reference](../03-UI-Ref/README.md) - 组件库
- [Edge Cases](../99-Appendix/04-Edge-Cases.md) - 国际化边界条件
