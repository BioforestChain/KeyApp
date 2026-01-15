# Transaction API 适配计划

## ✅ 已完成
- **BioChain (biowallet-provider)**: 
  - ✅ 实现 `transaction` fetcher (combine pending + confirmed)
  - ✅ 支持 pending 交易查询
  - ✅ 支持 confirmed 交易查询
  - ✅ 自动订阅状态变化

## 🔄 待适配

### EVM 链 (Ethereum, BSC, etc.)
**Provider**: `evm-rpc-provider.ts`

**需要实现**:
```typescript
readonly transaction: KeyFetchInstance<typeof TransactionOutputSchema>
```

**实现方案**:
1. 使用 `eth_getTransactionByHash` 获取交易详情
2. 使用 `eth_getTransactionReceipt` 获取收据（status, blockNumber）
3. 使用 `combine` 合并两个 RPC 调用
4. 解析 EVM 交易格式到统一的 Transaction schema
5. 处理 pending 交易（receipt 为 null）

**参考资料**:
- https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyhash
- https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt

---

### Tron
**Provider**: `tron-rpc-provider.ts` / `tronwallet-provider.ts`

**需要实现**:
```typescript
readonly transaction: KeyFetchInstance<typeof TransactionOutputSchema>
```

**实现方案**:
1. 使用 TronGrid API `/wallet/gettransactionbyid`
2. 解析 Tron 交易格式
3. 映射到统一的 Transaction schema

**参考资料**:
- https://developers.tron.network/reference/gettransactionbyid

---

### Bitcoin
**Provider**: `mempool-provider.ts`

**需要实现**:
```typescript
readonly transaction: KeyFetchInstance<typeof TransactionOutputSchema>
```

**实现方案**:
1. 使用 Mempool.space API `/api/tx/{txid}`
2. 解析 Bitcoin 交易格式
3. 处理 UTXO 模型的特殊性（多输入多输出）
4. 映射到统一的 Transaction schema

**参考资料**:
- https://mempool.space/docs/api/rest#get-transaction

---

## 通用注意事项

1. **统一的 Transaction Schema**
   - 所有 provider 必须返回符合 `TransactionSchema` 的数据
   - 包含：hash, from, to, timestamp, status, action, direction, assets

2. **Pending 交易处理**
   - EVM: receipt 为 null 时为 pending
   - Tron: ret[0].contractRet 为 null 时为 pending
   - Bitcoin: confirmations = 0 时为 pending

3. **订阅支持**
   - 利用 `blockHeight` 的自动刷新机制
   - 或使用 WebSocket 实时推送（如果 API 支持）

4. **错误处理**
   - 交易不存在：返回 null
   - API 错误：抛出异常
   - 格式错误：记录日志并返回 null

5. **性能优化**
   - 使用 `ttl` 插件缓存结果
   - pending 交易使用较短的 TTL (5s)
   - confirmed 交易使用较长的 TTL (60s)
