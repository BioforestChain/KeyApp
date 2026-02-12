# 02. MiniApp 交易金额语义标准（Raw Amount Standard）

> Last Updated: 2026-02-12  
> Status: Active（生态升级基线）

本文定义 MiniApp 与 KeyApp 交互中所有“链上金额字段”的统一语义，避免“展示金额与真实广播金额不一致”的高风险问题。

---

## 1. 统一规则（必须遵守）

### 1.1 金额字段一律使用 raw（最小单位整数）

- `amount` 必须是 **十进制整数字符串**（`^\d+$`）
- 表示链最小单位（如 USDT 8 位精度时，`1000000000` 表示 `10.00000000`）
- 禁止传入格式化小数字符串（例如 `10.00000000`）

### 1.2 展示与签名/广播职责分离

- 展示层：根据 `decimals` 把 raw 转为人类可读金额
- 交易层：签名与广播始终使用 raw
- 严禁在显示修复时改动实际广播语义

### 1.3 适用接口（第一批）

- `bio_sendTransaction.params.amount`
- `bio_createTransaction.params.amount`
- `bio_destroyAsset.params.amount`

---

## 2. 风险背景（为什么必须统一）

当调用方把 raw 当 formatted，或 Host 把 formatted 当 raw，会导致：

- 面板显示金额被放大/缩小（误导用户）
- 签名/广播金额与用户预期不一致
- 后端入库与链上数据出现语义冲突（含重复提交与对账困难）

这是高风险交易语义问题，不是纯 UI 问题。

---

## 3. 当前审计结论（KeyApp 内置应用）

### 3.1 已符合或基本符合

- `xin.dweb.rwahub`：调用 `bio_sendTransaction` 前使用整数运算构造 raw（BigInt 路径）
- `xin.dweb.biobridge`（forge/redemption 主路径）：在有精度上下文时将用户输入转换为 raw 再调用

### 3.2 需升级

- `xin.dweb.teleport`：当前 `bio_createTransaction` 调用路径仍可能传格式化小数字符串（示例：补 `.0`）

### 3.3 Host 侧需对齐项

- `bio_sendTransaction` 已按 raw 语义处理（现状）
- `bio_destroyAsset` 对话框仍存在 formatted 假设（需要改为 raw 语义）
- `bio_createTransaction` 当前存在“自动识别 raw/formatted”路径（应收敛为单一 raw 语义）

---

## 4. 升级计划（执行顺序）

### Phase 0：标准冻结（立即）

- 白皮书明确 raw-only 规则（本文）
- 对外同步“禁止 formatted amount”

### Phase 1：Host 收敛（优先）

- `bio_destroyAsset` 切换为 raw 解析与展示
- `bio_createTransaction` 去除双语义自动判断，统一 raw-only
- 参数不合规时统一返回 `INVALID_PARAMS`

### Phase 2：内置应用对齐

- 升级 `xin.dweb.teleport`，确保传入 raw
- 回归验证 `biobridge`、`rwahub` 多笔交易流程

### Phase 3：生态外部应用迁移

- 发布迁移窗口和截止版本
- 要求每个应用提交“amount 字段转换点”自检清单
- 逐步开启严格校验（不再接收 formatted）

---

## 5. 测试与验收基线

### 5.1 最小验收样例

- 输入 `amount="1000000000"`, `decimals=8`：展示 `10.00000000`
- 输入 `amount="10.00000000"`：直接 `INVALID_PARAMS`（严格模式）
- 广播上链金额必须保持 `raw=1000000000`

### 5.2 回归重点

- 多笔交易队列（FIFO，不互相覆盖）
- 手势/支付密码步骤下金额不漂移
- 广播失败时状态文案与实际阶段一致

---

## 6. 迁移沟通模板（摘要）

对生态方统一口径：

1. `amount` 改为 raw 整数字符串
2. UI 层自行处理 formatted ↔ raw
3. 不再依赖 Host 自动兼容 formatted

完整可执行提示词见：`/.chat/2026-02-12-miniapp-amount-raw-upgrade-plan.md`

