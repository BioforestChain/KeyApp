## 1. Implementation
- [ ] 1.1 Add WalletAPI logical-failure detection (NOTOK/status!=1) and surface as errors in txHistory sources
- [ ] 1.2 Skip token-history sources when base txHistory fails
- [ ] 1.3 Ensure txHistory emits incremental merged updates per source
- [ ] 1.4 Decouple balance refresh from txHistory failure (balances still refresh on schedule)
- [ ] 1.5 Extend httpFetchCached to apply canCache across strategies (incl. network-first)
- [ ] 1.6 Add/adjust provider docs and inline references to legacy endpoints
- [ ] 1.7 Add tests or verification notes for fallback + cache gating
