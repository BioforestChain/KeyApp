# IHapticService 触觉反馈服务

触觉反馈服务提供跨平台的振动和触觉反馈能力，增强用户交互体验。

## 接口定义

```
IHapticService {
  // 预定义反馈
  impact(style: ImpactStyle): Promise<void>
  notification(type: NotificationType): Promise<void>
  selection(): Promise<void>
  
  // 自定义振动
  vibrate(pattern: number[]): Promise<void>
  
  // 能力查询
  isSupported(): Promise<boolean>
  getSupportedStyles(): Promise<ImpactStyle[]>
  
  // 控制
  enable(): void
  disable(): void
  isEnabled(): boolean
}
```

## 枚举定义

### ImpactStyle

| 值 | 说明 | 使用场景 |
|----|------|----------|
| light | 轻微反馈 | 选择项目、轻触 |
| medium | 中等反馈 | 确认操作、切换 |
| heavy | 强烈反馈 | 重要操作、完成 |
| soft | 柔和反馈 | 滑动、拖拽 |
| rigid | 硬质反馈 | 碰撞、边界 |

### NotificationType

| 值 | 说明 | 使用场景 |
|----|------|----------|
| success | 成功通知 | 操作完成、交易成功 |
| warning | 警告通知 | 需要注意、即将超时 |
| error | 错误通知 | 操作失败、验证错误 |

## 功能规范

### 冲击反馈

**impact(style: ImpactStyle)**

- MUST 产生与 style 对应的触觉反馈
- MUST 在不支持时静默失败
- SHOULD 与视觉反馈同步触发
- MAY 根据系统设置自动调整强度

### 通知反馈

**notification(type: NotificationType)**

- MUST 产生与通知类型对应的触觉模式
- MUST 区分 success/warning/error
- SHOULD 使用系统预定义的反馈模式

### 选择反馈

**selection()**

- MUST 产生轻微的选择反馈
- SHOULD 用于列表选择、开关切换
- SHOULD 频率限制避免过度振动

### 自定义振动

**vibrate(pattern: number[])**

- MUST 按模式数组执行振动
- 数组格式：[振动时长, 暂停时长, 振动时长, ...]
- MUST 支持取消正在进行的振动
- SHOULD 限制最大振动时长

## 使用场景

### 1. 交易成功

```
交易确认完成
  ↓
调用 notification('success')
  ↓
同时显示成功动画
```

### 2. 图案锁输入

```
用户输入每个数字
  ↓
调用 impact('light')
  ↓
图案错误时
  ↓
调用 notification('error')
```

### 3. 下拉刷新

```
用户下拉到阈值
  ↓
调用 impact('medium')
  ↓
释放触发刷新
```

### 4. 长按操作

```
长按达到激活时间
  ↓
调用 impact('heavy')
  ↓
显示操作菜单
```

## 平台适配

| 平台 | 实现方式 | 精度 |
|------|----------|------|
| Web | Vibration API | 低 |
| DWEB | dweb.haptic API | 高 |
| iOS | UIImpactFeedbackGenerator | 高 |
| Android | VibrationEffect | 中 |

### 平台能力对照

| 能力 | Web | DWEB | iOS | Android |
|------|-----|------|-----|---------|
| impact styles | 否 | 是 | 是 | 部分 |
| notification types | 否 | 是 | 是 | 否 |
| selection | 否 | 是 | 是 | 否 |
| custom pattern | 是 | 是 | 否 | 是 |

## 配置选项

```
HapticConfig {
  enabled: boolean       // 全局开关
  respectSystemSetting: boolean  // 遵循系统设置
  intensityScale: number // 强度缩放 0-1
}
```

## 最佳实践

1. **适度使用** - 避免过度振动造成骚扰
2. **提供开关** - 允许用户禁用触觉反馈
3. **配合视觉** - 触觉应与视觉反馈同步
4. **考虑场景** - 重要操作使用强反馈，日常操作使用轻反馈
5. **遵循系统** - 尊重系统级别的触觉设置

## 错误处理

| 错误类型 | 说明 | 处理方式 |
|----------|------|----------|
| NotSupported | 设备不支持触觉 | 静默忽略 |
| Disabled | 用户已禁用 | 静默忽略 |
| InvalidPattern | 振动模式无效 | 使用默认模式 |

## 可访问性

- MUST 提供关闭触觉反馈的选项
- SHOULD 与屏幕阅读器配合使用
- SHOULD 在静音模式下仍可工作
- MAY 根据用户偏好调整强度
