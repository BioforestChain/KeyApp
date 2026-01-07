# 02. BioBridge 协议 (BioBridge Protocol)

**BioBridge** 是 Host 和 Guest (DApp) 之间的通信桥梁。

## 通信机制

基于 `window.postMessage` 实现双向 RPC 调用。

### 1. 请求 (Request)
DApp -> Host:
```json
{
  "id": 123,
  "method": "bio.wallet.requestAccounts",
  "params": []
}
```

### 2. 响应 (Response)
Host -> DApp:
```json
{
  "id": 123,
  "result": ["0x..."],
  "error": null
}
```

## API 命名空间

*   `bio.wallet.*`: 钱包相关 (连接、签名、转账)
*   `bio.device.*`: 设备能力 (剪贴板、震动、生物识别)
*   `bio.window.*`: 窗口控制 (关闭、全屏)

## 安全检查

在处理任何请求之前，内核会检查：
1.  **Origin**: 消息来源是否匹配 Manifest 中的定义。
2.  **Permission**: DApp 是否申请了对应的权限 (e.g., `wallet:write`).
3.  **User Consent**: 敏感操作 (签名、授权) 必须弹出系统级对话框供用户确认。
