# IShareService 分享服务

分享服务提供跨平台的内容分享能力，支持文本、链接、图片等多种内容类型。

## 接口定义

```
IShareService {
  // 分享
  share(data: ShareData): Promise<ShareResult>
  
  // 能力查询
  canShare(data: ShareData): Promise<boolean>
  getSupportedTypes(): Promise<string[]>
  
  // 特定分享
  shareText(text: string, title?: string): Promise<ShareResult>
  shareUrl(url: string, title?: string): Promise<ShareResult>
  shareFile(file: ShareFile): Promise<ShareResult>
  shareImage(image: ImageData): Promise<ShareResult>
}
```

## 数据模型

### ShareData

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 分享标题 |
| text | string | 否 | 分享文本 |
| url | string | 否 | 分享链接 |
| files | ShareFile[] | 否 | 分享文件列表 |

### ShareFile

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 文件名 |
| type | string | 是 | MIME 类型 |
| data | Blob | 是 | 文件数据 |

### ShareResult

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 是否成功 |
| target | string | 分享目标应用 |
| error | Error | 错误信息 |

## 功能规范

### 通用分享

**share(data: ShareData)**

- MUST 调用系统分享面板
- MUST 支持至少一种内容类型
- MUST 在用户取消时返回相应状态
- SHOULD 支持同时分享多种内容

### 能力查询

**canShare(data: ShareData)**

- MUST 在不触发 UI 的情况下检查分享能力
- MUST 准确反映平台支持情况
- SHOULD 考虑当前内容类型的兼容性

### 文本分享

**shareText(text: string)**

- MUST 支持纯文本分享
- MUST 支持长文本（>10KB）
- SHOULD 自动识别文本中的 URL

## 使用场景

### 1. 分享收款地址

```
用户点击分享按钮
  ↓
构建 ShareData {
  title: "我的收款地址",
  text: address,
  url: deepLink
}
  ↓
调用 share(data)
  ↓
用户选择分享目标
```

### 2. 分享交易凭证

```
交易完成
  ↓
生成交易截图
  ↓
调用 shareImage(screenshot)
  ↓
用户分享到社交平台
```

### 3. 分享收款二维码

```
用户点击分享二维码
  ↓
生成二维码图片
  ↓
调用 shareFile({
  name: "qrcode.png",
  type: "image/png",
  data: qrBlob
})
```

## 平台适配

| 平台 | 实现方式 | 文件支持 |
|------|----------|----------|
| Web | Web Share API | 部分 |
| DWEB | dweb.share API | 完整 |
| iOS | UIActivityViewController | 完整 |
| Android | Intent.ACTION_SEND | 完整 |

## 降级策略

当 Web Share API 不可用时：

1. **复制到剪贴板** - 最基本的降级
2. **生成分享链接** - 用户手动复制
3. **显示二维码** - 供其他设备扫描

## 错误处理

| 错误类型 | 说明 | 处理方式 |
|----------|------|----------|
| NotSupported | 平台不支持分享 | 使用降级策略 |
| UserCancelled | 用户取消分享 | 静默处理 |
| PermissionDenied | 无分享权限 | 提示用户授权 |
| InvalidContent | 内容格式无效 | 检查并修正内容 |

## 最佳实践

1. **预检查分享能力** - 使用 canShare 隐藏不支持的分享选项
2. **提供降级方案** - 确保所有平台都有可用的分享方式
3. **优化分享内容** - 根据目标平台优化文本长度
4. **处理取消操作** - 用户取消不应视为错误
