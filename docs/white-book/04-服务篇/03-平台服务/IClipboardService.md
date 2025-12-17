# IClipboardService 剪贴板服务

剪贴板服务提供跨平台的文本和数据复制粘贴能力。

## 接口定义

```
IClipboardService {
  // 写入
  writeText(text: string): Promise<void>
  writeData(data: ClipboardData): Promise<void>
  
  // 读取
  readText(): Promise<string>
  readData(): Promise<ClipboardData>
  
  // 查询
  hasText(): Promise<boolean>
  getAvailableTypes(): Promise<string[]>
  
  // 清空
  clear(): Promise<void>
}
```

## 数据模型

### ClipboardData

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | MIME 类型 |
| text | string | 否 | 文本内容 |
| html | string | 否 | HTML 内容 |
| uri | string | 否 | URI/URL |
| blob | Blob | 否 | 二进制数据 |

## 功能规范

### 文本写入

**writeText(text: string)**

- MUST 将文本写入系统剪贴板
- MUST 支持 Unicode 字符
- MUST 在写入失败时抛出异常
- SHOULD 支持大文本（>1MB）

### 文本读取

**readText()**

- MUST 从系统剪贴板读取文本
- MUST 在无文本时返回空字符串
- MUST 在无权限时抛出异常
- SHOULD 支持多种文本编码

### 权限处理

- MUST 在首次使用时请求剪贴板权限（如平台要求）
- MUST 在权限被拒绝时提供清晰错误信息
- SHOULD 缓存权限状态避免重复询问

## 使用场景

### 1. 复制地址

```
用户点击复制按钮
  ↓
调用 writeText(address)
  ↓
显示复制成功反馈
```

### 2. 粘贴地址

```
用户点击粘贴按钮
  ↓
检查 hasText()
  ↓
调用 readText()
  ↓
验证地址格式
  ↓
填入输入框
```

## 平台适配

| 平台 | 实现方式 |
|------|----------|
| Web | Clipboard API |
| DWEB | dweb.clipboard API |
| iOS | UIPasteboard |
| Android | ClipboardManager |

## 安全考虑

- MUST NOT 在后台自动读取剪贴板
- MUST 在读取敏感数据后及时清空
- SHOULD 提供剪贴板清空倒计时功能
- MAY 支持加密剪贴板内容

## 错误处理

| 错误类型 | 说明 | 处理方式 |
|----------|------|----------|
| PermissionDenied | 无剪贴板权限 | 提示用户授权 |
| NotSupported | 平台不支持 | 使用降级方案 |
| ReadError | 读取失败 | 重试或提示 |
| WriteError | 写入失败 | 重试或提示 |
