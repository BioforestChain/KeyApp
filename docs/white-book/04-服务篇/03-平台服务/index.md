# 平台服务

> 跨平台能力的统一抽象

---

## 概述

BFM Pay 运行在多种环境（Web 浏览器、DWEB 容器），平台服务层提供统一抽象，屏蔽环境差异。

---

## 服务列表

| 服务 | 说明 | Web | DWEB |
|-----|------|-----|------|
| [IBiometricService](./IBiometricService) | 生物识别认证 | WebAuthn | Plaoc |
| [IStorageService](./IStorageService) | 安全存储 | IndexedDB+加密 | Plaoc |
| [IClipboardService](./IClipboardService) | 剪贴板操作 | Clipboard API | Plaoc |
| [ICameraService](./ICameraService) | 相机/扫码 | MediaDevices | Plaoc |
| [IShareService](./IShareService) | 系统分享 | Web Share | Plaoc |
| [IHapticService](./IHapticService) | 振动反馈 | Vibration API | Plaoc |
| [IDeepLinkService](./IDeepLinkService) | 深度链接 | URL handling | Plaoc |

---

## 平台检测

```
IPlatformDetector {
  // 当前平台类型
  platform: 'web' | 'dweb'
  
  // 检查能力是否可用
  isAvailable(capability: Capability): boolean
  
  // 获取平台服务实例
  getServices(): IPlatformServices
}

Capability = 
  | 'biometric'
  | 'secure-storage'
  | 'clipboard'
  | 'camera'
  | 'share'
  | 'haptic'
  | 'deep-link'
```

---

## 降级策略

当某能力不可用时：

| 能力 | 降级方案 |
|-----|---------|
| 生物识别 | 仅使用图案锁认证 |
| 安全存储 | 使用加密的 IndexedDB |
| 相机 | 隐藏扫码，提供手动输入 |
| 分享 | 提供复制功能替代 |
| 振动 | 静默失败 |

---

## 权限管理

### 需要权限的服务

| 服务 | 权限 | 请求时机 |
|-----|------|---------|
| 相机 | camera | 首次扫码时 |
| 生物识别 | biometric | 启用生物识别时 |
| 剪贴板读取 | clipboard-read | 粘贴地址时 |

### 权限状态

```
PermissionStatus = 'granted' | 'denied' | 'prompt'
```

### 权限被拒绝处理

- **MUST** 显示引导用户到系统设置
- **MUST NOT** 反复请求被拒绝的权限
- **SHOULD** 提供替代操作方式
