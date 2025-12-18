# ICameraService 相机服务

> 相机访问和二维码扫描

---

## 职责

提供相机访问能力，主要用于扫描二维码。

---

## 接口定义

```
ICameraService {
  // 检查是否支持
  isSupported(): boolean
  
  // 请求相机权限
  requestPermission(): PermissionStatus
  
  // 扫描二维码
  scanQRCode(options?: ScanOptions): ScanResult
  
  // 停止扫描
  stopScan(): void
}
```

---

## 数据结构

### ScanOptions

```
ScanOptions {
  // 扫描区域（相对于视口）
  scanArea?: {
    x: number       // 0-1
    y: number       // 0-1
    width: number   // 0-1
    height: number  // 0-1
  }
  
  // 支持的格式
  formats?: QRFormat[]
  
  // 是否显示取景框
  showViewfinder?: boolean
  
  // 振动反馈
  hapticFeedback?: boolean
}

QRFormat = 'QR_CODE' | 'DATA_MATRIX' | 'AZTEC' | 'PDF_417'
```

### ScanResult

```
ScanResult {
  success: boolean
  
  // 成功时
  data?: string           // 解码内容
  format?: QRFormat       // 码格式
  
  // 失败时
  error?: ScanError
}

ScanError = 
  | 'PERMISSION_DENIED'   // 权限被拒绝
  | 'NO_CAMERA'           // 无可用相机
  | 'CANCELLED'           // 用户取消
  | 'DECODE_FAILED'       // 解码失败
```

---

## 扫描流程

### 用户流程

```
1. 用户点击"扫码"按钮
        │
        ▼
2. 检查权限状态
        │
        ├─ denied → 显示权限引导
        │
        ├─ prompt → requestPermission()
        │
        ▼ granted
3. 打开扫码界面
        │
        ▼
4. 实时扫描
        │
        ├─ 识别成功 → 处理结果
        │
        ├─ 用户取消 → 关闭
        │
        ▼
5. 返回结果
```

### 扫码界面规范

```
┌─────────────────────────────────┐
│  [←]        扫一扫              │
├─────────────────────────────────┤
│                                 │
│    ┌───────────────────┐       │
│    │                   │       │
│    │    取景框区域      │       │  ← 扫描区域
│    │    (带动画边框)    │       │
│    │                   │       │
│    └───────────────────┘       │
│                                 │
│    将二维码放入框内             │
│                                 │
├─────────────────────────────────┤
│  [相册]            [手电筒]     │
└─────────────────────────────────┘
```

---

## 扫描内容处理

### 支持的内容格式

| 格式 | 示例 | 处理 |
|-----|------|------|
| 纯地址 | `0x1234...` | 填入地址输入框 |
| EIP-681 | `ethereum:0x1234?value=1e18` | 解析并填入转账表单 |
| BFM 协议 | `bfm://transfer?to=...` | 解析并执行 |
| DWEB 授权 | `bfmpay://authorize?...` | 跳转授权页 |

### 解析流程

```
扫描结果
    │
    ▼
尝试解析为 URI
    │
    ├─ 是 URI → 按协议处理
    │
    ▼ 不是
尝试验证为地址
    │
    ├─ 是地址 → 填入地址框
    │
    ▼ 不是
显示"无法识别的内容"
```

---

## 权限处理

### 权限被拒绝

```
┌─────────────────────────────────┐
│                                 │
│      [相机图标]                 │
│                                 │
│   需要相机权限才能扫码          │
│                                 │
│   请在系统设置中允许            │
│   BFM Pay 访问相机              │
│                                 │
│      [打开设置]                 │
│                                 │
└─────────────────────────────────┘
```

---

## 性能要求

| 指标 | 目标值 |
|-----|-------|
| 相机启动时间 | < 1s |
| 识别延迟 | < 500ms |
| 帧率 | ≥ 30fps |

---

## 可访问性

- **MUST** 提供手动输入作为替代
- **SHOULD** 支持从相册选择图片
- **SHOULD** 扫描成功时振动反馈
