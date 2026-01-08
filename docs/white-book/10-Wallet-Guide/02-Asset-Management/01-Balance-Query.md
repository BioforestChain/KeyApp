# 01. 余额查询机制 (Balance Query)

Code: `src/stores/wallet.ts` (`refreshBalance`)

余额更新是一个从 UI 到 Driver 再回到 Store 的闭环流程。

## 流程详解

1.  **Trigger**: 
    *   用户下拉刷新。
    *   应用从后台回到前台。
    *   定时器轮询。

2.  **Dispatch**:
    *   调用 `walletActions.refreshBalance(walletId, chainId)`。

3.  **Driver Call**:
    *   获取对应的 `ChainProvider`。
    *   调用 `getNativeBalance(address)`。
    *   调用 `getTokenBalances(address)` (如果支持)。

4.  **Update Store**:
    *   Driver 返回标准化的 `Balance` 对象。
    *   Store 更新 `chainAddresses` 中的 `tokens` 列表。
    *   React 组件自动重渲染。

## 性能优化
为了避免阻塞 UI，所有查询都是异步并行的 (`Promise.all`)。单个链的失败不会影响其他链的更新。
