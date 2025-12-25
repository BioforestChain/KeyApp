# 监控告警篇

> 定义应用埋点、指标监控和异常告警规范

---

## 监控体系

### 监控层次

```
┌─────────────────────────────────────────────────────────┐
│                    业务监控                              │
│              用户行为、功能使用、转化率                    │
├─────────────────────────────────────────────────────────┤
│                    性能监控                              │
│            加载时间、响应时间、帧率、内存                  │
├─────────────────────────────────────────────────────────┤
│                    稳定性监控                            │
│              错误率、崩溃率、异常上报                      │
├─────────────────────────────────────────────────────────┤
│                    可用性监控                            │
│              网络状态、服务可用性、节点健康                │
└─────────────────────────────────────────────────────────┘
```

---

## 埋点规范

### 事件命名规范

```
{namespace}_{action}_{target}

示例:
wallet_create_success
wallet_create_fail
transfer_submit_click
transfer_confirm_success
```

### 事件分类

| 类型 | 前缀 | 说明 |
|-----|------|------|
| 页面浏览 | page_ | 页面展示 |
| 用户行为 | action_ | 点击、滑动等 |
| 业务事件 | biz_ | 业务流程节点 |
| 系统事件 | sys_ | 系统级事件 |
| 错误事件 | error_ | 异常和错误 |

### 核心埋点列表

#### 钱包相关

| 事件名 | 触发时机 | 参数 |
|-------|---------|------|
| wallet_create_start | 开始创建钱包 | - |
| wallet_create_success | 创建成功 | wallet_count |
| wallet_create_fail | 创建失败 | error_code |
| wallet_import_start | 开始导入 | import_type |
| wallet_import_success | 导入成功 | chain_count |
| wallet_import_fail | 导入失败 | error_code |
| wallet_backup_view | 查看助记词 | - |
| wallet_backup_verify | 验证备份 | success |
| wallet_delete | 删除钱包 | - |

#### 转账相关

| 事件名 | 触发时机 | 参数 |
|-------|---------|------|
| transfer_start | 进入转账页 | chain_id |
| transfer_scan_qr | 扫码填充地址 | - |
| transfer_paste_address | 粘贴地址 | - |
| transfer_submit | 提交转账 | amount, chain_id |
| transfer_confirm | 确认转账 | - |
| transfer_success | 转账成功 | tx_hash, duration |
| transfer_fail | 转账失败 | error_code |

#### 认证相关

| 事件名 | 触发时机 | 参数 |
|-------|---------|------|
| auth_pattern_attempt | 图案验证尝试 | - |
| auth_pattern_success | 图案验证成功 | - |
| auth_pattern_fail | 图案验证失败 | attempt_count |
| auth_biometric_attempt | 生物识别尝试 | type |
| auth_biometric_success | 生物识别成功 | type |
| auth_biometric_fail | 生物识别失败 | type, reason |

### 埋点数据结构

```
TrackEvent {
  // 必需字段
  eventName: string
  timestamp: number
  
  // 用户标识（匿名化）
  sessionId: string
  deviceId: string
  
  // 环境信息
  platform: string
  appVersion: string
  osVersion: string
  
  // 事件参数
  params?: object
  
  // 性能数据
  duration?: number
}
```

---

## 性能指标

### 关键指标定义

| 指标 | 计算方式 | 告警阈值 |
|-----|---------|---------|
| FCP P95 | 首次内容绘制 95 分位 | > 2s |
| LCP P95 | 最大内容绘制 95 分位 | > 3s |
| API P95 | API 响应时间 95 分位 | > 3s |
| Error Rate | 错误数/总请求数 | > 1% |
| Crash Rate | 崩溃会话/总会话 | > 0.1% |

### 性能数据采集

```
PerformanceMetric {
  name: string           // 指标名
  value: number          // 指标值
  unit: string           // 单位
  tags: object           // 标签
  timestamp: number
}
```

### 采集的性能数据

| 数据 | 采集时机 | 说明 |
|-----|---------|------|
| 页面加载时间 | 页面 load | FCP, LCP, TTI |
| API 响应时间 | 请求完成 | 每个 API |
| 长任务 | performance observer | > 50ms 的任务 |
| 内存使用 | 定时采集 | 每分钟 |
| 帧率 | 动画/滚动时 | 低于 50fps 时 |

---

## 错误监控

### 错误采集

| 错误类型 | 采集方式 |
|---------|---------|
| JS 异常 | window.onerror |
| Promise 异常 | unhandledrejection |
| 资源加载失败 | error 事件 |
| API 错误 | 请求拦截器 |
| 业务错误 | 手动上报 |

### 错误数据结构

```
ErrorReport {
  // 错误信息
  type: string
  message: string
  stack?: string
  
  // 上下文
  page: string
  action?: string
  
  // 用户信息
  sessionId: string
  
  // 环境
  platform: string
  appVersion: string
  
  // 时间
  timestamp: number
}
```

### 错误聚合规则

| 聚合维度 | 说明 |
|---------|------|
| 错误类型 + 消息 | 同类错误合并 |
| 页面 | 按页面分组 |
| 版本 | 按应用版本分组 |
| 时间窗口 | 5 分钟窗口 |

---

## 告警规则

### 告警级别

| 级别 | 说明 | 响应时间 |
|-----|------|---------|
| P0 Critical | 核心功能不可用 | 立即 |
| P1 Major | 重要功能受影响 | 30 分钟 |
| P2 Minor | 次要功能异常 | 4 小时 |
| P3 Warning | 预警，暂无影响 | 24 小时 |

### 告警规则配置

| 指标 | P0 阈值 | P1 阈值 | P2 阈值 |
|-----|--------|--------|--------|
| Error Rate | > 5% | > 2% | > 1% |
| Crash Rate | > 1% | > 0.5% | > 0.1% |
| API P95 | > 10s | > 5s | > 3s |
| 转账失败率 | > 10% | > 5% | > 2% |

### 告警抑制

| 规则 | 说明 |
|-----|------|
| 相同告警 5 分钟内不重复 | 避免告警风暴 |
| 恢复后自动关闭 | 自愈处理 |
| 静默时间段 | 维护窗口 |

---

## 数据上报

### 上报策略

| 数据类型 | 上报方式 | 频率 |
|---------|---------|------|
| 埋点事件 | 批量上报 | 每 30s 或 20 条 |
| 性能数据 | 批量上报 | 每 60s |
| 错误数据 | 即时上报 | P0/P1 错误 |
| 心跳数据 | 定时上报 | 每 5 分钟 |

### 上报数据结构

```
ReportPayload {
  // 批次信息
  batchId: string
  reportTime: number
  
  // 设备信息
  deviceInfo: DeviceInfo
  
  // 数据
  events?: TrackEvent[]
  metrics?: PerformanceMetric[]
  errors?: ErrorReport[]
}
```

### 上报失败处理

```
上报失败
    │
    ▼
存入本地队列
    │
    ▼
等待下次上报（最多重试 3 次）
    │
    ├── 成功 ──► 清除队列
    │
    └── 仍失败 ──► 丢弃旧数据（保留最近 100 条）
```

---

## 用户隐私

### 数据脱敏

| 数据类型 | 脱敏方式 |
|---------|---------|
| 钱包地址 | 保留前 6 + 后 4 位 |
| 交易金额 | 不采集具体金额 |
| 设备 ID | 哈希后存储 |
| IP 地址 | 不采集 |

### 采集开关

- **MUST** 提供关闭数据采集的选项
- **MUST** 首次使用时告知用户
- **SHOULD** 允许用户查看采集的数据
- **MUST NOT** 采集敏感信息

---

## Dashboard 指标

### 核心看板

| 指标 | 说明 | 更新频率 |
|-----|------|---------|
| DAU | 日活用户数 | 实时 |
| 新增用户 | 当日新创建钱包 | 实时 |
| 转账成功率 | 成功/总数 | 实时 |
| API 可用性 | 成功请求占比 | 实时 |
| 错误趋势 | 错误数时间序列 | 1 分钟 |

### 业务看板

| 指标 | 说明 |
|-----|------|
| 创建钱包转化率 | 完成创建/开始创建 |
| 转账完成率 | 确认/发起 |
| 功能使用分布 | 各功能使用占比 |
| 链使用分布 | 各链交易占比 |

---

## 本章小结

- 四层监控体系：业务、性能、稳定性、可用性
- 统一的埋点命名和数据结构规范
- 分级告警机制，快速响应问题
- 批量上报 + 本地缓存保证数据不丢失
- 严格的用户隐私保护
