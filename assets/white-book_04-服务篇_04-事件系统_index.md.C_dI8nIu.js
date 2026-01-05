import{_ as s,c as n,o as t,ag as e}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"事件系统","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/04-服务篇/04-事件系统/index.md","filePath":"white-book/04-服务篇/04-事件系统/index.md"}'),l={name:"white-book/04-服务篇/04-事件系统/index.md"};function i(p,a,r,d,o,c){return t(),n("div",null,[...a[0]||(a[0]=[e(`<h1 id="事件系统" tabindex="-1">事件系统 <a class="header-anchor" href="#事件系统" aria-label="Permalink to &quot;事件系统&quot;">​</a></h1><blockquote><p>定义数据变化的订阅机制</p></blockquote><hr><h2 id="设计目标" tabindex="-1">设计目标 <a class="header-anchor" href="#设计目标" aria-label="Permalink to &quot;设计目标&quot;">​</a></h2><p>钱包应用需要实时响应以下变化：</p><ul><li><strong>余额变化</strong> - 收到转账、交易确认</li><li><strong>交易状态变化</strong> - pending → confirmed / failed</li><li><strong>新区块</strong> - 链上新区块产生</li><li><strong>汇率变化</strong> - 法币汇率更新</li></ul><h3 id="设计原则" tabindex="-1">设计原则 <a class="header-anchor" href="#设计原则" aria-label="Permalink to &quot;设计原则&quot;">​</a></h3><ul><li><strong>类型安全</strong> - 事件类型和数据类型严格对应</li><li><strong>统一接口</strong> - 所有事件源使用相同的订阅 API</li><li><strong>资源管理</strong> - 自动清理订阅，防止内存泄漏</li></ul><hr><h2 id="subscribable-接口" tabindex="-1">Subscribable 接口 <a class="header-anchor" href="#subscribable-接口" aria-label="Permalink to &quot;Subscribable 接口&quot;">​</a></h2><h3 id="核心接口" tabindex="-1">核心接口 <a class="header-anchor" href="#核心接口" aria-label="Permalink to &quot;核心接口&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Subscription {</span></span>
<span class="line"><span>  unsubscribe(): void</span></span>
<span class="line"><span>  readonly closed: boolean</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Observer&lt;T&gt; {</span></span>
<span class="line"><span>  next: (value: T) =&gt; void</span></span>
<span class="line"><span>  error?: (error: Error) =&gt; void</span></span>
<span class="line"><span>  complete?: () =&gt; void</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Subscribable&lt;T&gt; {</span></span>
<span class="line"><span>  subscribe(observer: Observer&lt;T&gt;): Subscription</span></span>
<span class="line"><span>  getCurrentValue?(): T | undefined</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="规范要求" tabindex="-1">规范要求 <a class="header-anchor" href="#规范要求" aria-label="Permalink to &quot;规范要求&quot;">​</a></h3><ul><li><strong>MUST</strong> 实现 subscribe 方法返回 Subscription</li><li><strong>MUST</strong> 调用 unsubscribe 后停止推送事件</li><li><strong>SHOULD</strong> 实现 getCurrentValue 获取当前值</li><li><strong>SHOULD</strong> 在错误时调用 observer.error</li></ul><hr><h2 id="事件类型定义" tabindex="-1">事件类型定义 <a class="header-anchor" href="#事件类型定义" aria-label="Permalink to &quot;事件类型定义&quot;">​</a></h2><h3 id="balancechangeevent-余额变化" tabindex="-1">BalanceChangeEvent 余额变化 <a class="header-anchor" href="#balancechangeevent-余额变化" aria-label="Permalink to &quot;BalanceChangeEvent 余额变化&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>chainId</td><td>ChainId</td><td>链标识</td></tr><tr><td>address</td><td>Address</td><td>账户地址</td></tr><tr><td>tokenAddress</td><td>Address | null</td><td>代币地址（null=原生币）</td></tr><tr><td>newBalance</td><td>AssetBalance</td><td>新余额</td></tr><tr><td>previousBalance</td><td>AssetBalance</td><td>旧余额（可选）</td></tr><tr><td>reason</td><td>string</td><td>变化原因</td></tr></tbody></table><h3 id="transactionstatusevent-交易状态" tabindex="-1">TransactionStatusEvent 交易状态 <a class="header-anchor" href="#transactionstatusevent-交易状态" aria-label="Permalink to &quot;TransactionStatusEvent 交易状态&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>chainId</td><td>ChainId</td><td>链标识</td></tr><tr><td>hash</td><td>TxHash</td><td>交易哈希</td></tr><tr><td>status</td><td>Status</td><td>pending/confirmed/failed/dropped</td></tr><tr><td>confirmations</td><td>number</td><td>确认数</td></tr><tr><td>receipt</td><td>TxReceipt</td><td>交易回执（可选）</td></tr></tbody></table><h3 id="newblockevent-新区块" tabindex="-1">NewBlockEvent 新区块 <a class="header-anchor" href="#newblockevent-新区块" aria-label="Permalink to &quot;NewBlockEvent 新区块&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>chainId</td><td>ChainId</td><td>链标识</td></tr><tr><td>blockNumber</td><td>bigint</td><td>区块高度</td></tr><tr><td>blockHash</td><td>string</td><td>区块哈希</td></tr><tr><td>timestamp</td><td>number</td><td>时间戳</td></tr></tbody></table><hr><h2 id="订阅服务接口" tabindex="-1">订阅服务接口 <a class="header-anchor" href="#订阅服务接口" aria-label="Permalink to &quot;订阅服务接口&quot;">​</a></h2><h3 id="iassetsubscription-资产订阅" tabindex="-1">IAssetSubscription 资产订阅 <a class="header-anchor" href="#iassetsubscription-资产订阅" aria-label="Permalink to &quot;IAssetSubscription 资产订阅&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IAssetSubscription {</span></span>
<span class="line"><span>  // 订阅原生代币余额</span></span>
<span class="line"><span>  subscribeNativeBalance(query: {</span></span>
<span class="line"><span>    address: Address</span></span>
<span class="line"><span>  }): Subscribable&lt;AssetBalance&gt;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 订阅代币余额</span></span>
<span class="line"><span>  subscribeTokenBalance(query: {</span></span>
<span class="line"><span>    address: Address</span></span>
<span class="line"><span>    tokenAddress: Address</span></span>
<span class="line"><span>  }): Subscribable&lt;AssetBalance&gt;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 订阅所有资产变化</span></span>
<span class="line"><span>  subscribeAllAssets(query: {</span></span>
<span class="line"><span>    address: Address</span></span>
<span class="line"><span>  }): Subscribable&lt;AssetBalance[]&gt;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="itransactionsubscription-交易订阅" tabindex="-1">ITransactionSubscription 交易订阅 <a class="header-anchor" href="#itransactionsubscription-交易订阅" aria-label="Permalink to &quot;ITransactionSubscription 交易订阅&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ITransactionSubscription {</span></span>
<span class="line"><span>  // 订阅单笔交易状态</span></span>
<span class="line"><span>  subscribeTransactionStatus(</span></span>
<span class="line"><span>    hash: TxHash</span></span>
<span class="line"><span>  ): Subscribable&lt;TransactionStatusEvent&gt;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 订阅地址相关交易</span></span>
<span class="line"><span>  subscribeAddressTransactions(</span></span>
<span class="line"><span>    address: Address</span></span>
<span class="line"><span>  ): Subscribable&lt;Transaction&gt;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="iblocksubscription-区块订阅" tabindex="-1">IBlockSubscription 区块订阅 <a class="header-anchor" href="#iblocksubscription-区块订阅" aria-label="Permalink to &quot;IBlockSubscription 区块订阅&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IBlockSubscription {</span></span>
<span class="line"><span>  // 订阅新区块</span></span>
<span class="line"><span>  subscribeNewBlocks(): Subscribable&lt;NewBlockEvent&gt;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 获取当前区块高度</span></span>
<span class="line"><span>  getCurrentBlockNumber(): Promise&lt;bigint&gt;</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="实现策略" tabindex="-1">实现策略 <a class="header-anchor" href="#实现策略" aria-label="Permalink to &quot;实现策略&quot;">​</a></h2><h3 id="websocket-订阅" tabindex="-1">WebSocket 订阅 <a class="header-anchor" href="#websocket-订阅" aria-label="Permalink to &quot;WebSocket 订阅&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件类型</th><th>WebSocket 消息</th><th>适用链</th></tr></thead><tbody><tr><td>余额变化</td><td>pendingTransactions, newBlocks</td><td>EVM</td></tr><tr><td>交易状态</td><td>transactionReceipt</td><td>EVM</td></tr><tr><td>新区块</td><td>newHeads</td><td>EVM</td></tr></tbody></table><h3 id="轮询订阅" tabindex="-1">轮询订阅 <a class="header-anchor" href="#轮询订阅" aria-label="Permalink to &quot;轮询订阅&quot;">​</a></h3><p>当 WebSocket 不可用时的降级策略：</p><table tabindex="0"><thead><tr><th>事件类型</th><th>轮询间隔</th><th>接口</th></tr></thead><tbody><tr><td>余额变化</td><td>30s</td><td>getBalance</td></tr><tr><td>交易状态</td><td>5s</td><td>getTransactionReceipt</td></tr><tr><td>新区块</td><td>15s</td><td>getBlockNumber</td></tr></tbody></table><h3 id="混合策略" tabindex="-1">混合策略 <a class="header-anchor" href="#混合策略" aria-label="Permalink to &quot;混合策略&quot;">​</a></h3><ul><li><strong>MUST</strong> 优先使用 WebSocket 获取实时数据</li><li><strong>MUST</strong> WebSocket 断开时自动降级到轮询</li><li><strong>SHOULD</strong> WebSocket 重连后恢复实时订阅</li><li><strong>SHOULD</strong> 合并相同查询避免重复请求</li></ul><hr><h2 id="ui-集成规范" tabindex="-1">UI 集成规范 <a class="header-anchor" href="#ui-集成规范" aria-label="Permalink to &quot;UI 集成规范&quot;">​</a></h2><h3 id="usesubscription-hook" tabindex="-1">useSubscription Hook <a class="header-anchor" href="#usesubscription-hook" aria-label="Permalink to &quot;useSubscription Hook&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>useSubscription&lt;T&gt;(</span></span>
<span class="line"><span>  subscribable: Subscribable&lt;T&gt; | null,</span></span>
<span class="line"><span>  initialValue: T</span></span>
<span class="line"><span>): T</span></span></code></pre></div><p><strong>行为规范：</strong></p><ul><li><strong>MUST</strong> 在组件卸载时自动取消订阅</li><li><strong>MUST</strong> subscribable 变化时重新订阅</li><li><strong>SHOULD</strong> 支持初始值设置</li><li><strong>SHOULD</strong> 处理订阅错误</li></ul><h3 id="使用模式" tabindex="-1">使用模式 <a class="header-anchor" href="#使用模式" aria-label="Permalink to &quot;使用模式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>组件挂载</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>创建 Subscribable（使用 useMemo）</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>调用 useSubscription</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 获取初始值</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 订阅变化</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>    收到新值 → 触发重渲染</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>组件卸载 → 自动取消订阅</span></span></code></pre></div><hr><h2 id="与状态缓存结合" tabindex="-1">与状态缓存结合 <a class="header-anchor" href="#与状态缓存结合" aria-label="Permalink to &quot;与状态缓存结合&quot;">​</a></h2><h3 id="订阅驱动缓存更新" tabindex="-1">订阅驱动缓存更新 <a class="header-anchor" href="#订阅驱动缓存更新" aria-label="Permalink to &quot;订阅驱动缓存更新&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>订阅事件</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>收到新数据</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>更新状态缓存（Query Cache）</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>依赖该缓存的组件自动更新</span></span></code></pre></div><h3 id="缓存键映射" tabindex="-1">缓存键映射 <a class="header-anchor" href="#缓存键映射" aria-label="Permalink to &quot;缓存键映射&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件类型</th><th>缓存键</th></tr></thead><tbody><tr><td>原生余额</td><td>[&#39;asset&#39;, &#39;native&#39;, chainId, address]</td></tr><tr><td>代币余额</td><td>[&#39;asset&#39;, &#39;token&#39;, chainId, address, tokenAddress]</td></tr><tr><td>交易状态</td><td>[&#39;transaction&#39;, &#39;status&#39;, hash]</td></tr></tbody></table><hr><h2 id="资源管理规范" tabindex="-1">资源管理规范 <a class="header-anchor" href="#资源管理规范" aria-label="Permalink to &quot;资源管理规范&quot;">​</a></h2><h3 id="订阅生命周期" tabindex="-1">订阅生命周期 <a class="header-anchor" href="#订阅生命周期" aria-label="Permalink to &quot;订阅生命周期&quot;">​</a></h3><ul><li><strong>MUST</strong> 组件卸载时取消所有订阅</li><li><strong>MUST</strong> 重复订阅相同数据时复用连接</li><li><strong>SHOULD</strong> 无订阅者时释放 WebSocket 连接</li><li><strong>MAY</strong> 实现订阅引用计数</li></ul><h3 id="错误处理" tabindex="-1">错误处理 <a class="header-anchor" href="#错误处理" aria-label="Permalink to &quot;错误处理&quot;">​</a></h3><table tabindex="0"><thead><tr><th>错误类型</th><th>处理方式</th></tr></thead><tbody><tr><td>连接断开</td><td>自动重连 + 降级轮询</td></tr><tr><td>订阅失败</td><td>调用 observer.error</td></tr><tr><td>数据解析错误</td><td>记录日志 + 跳过</td></tr></tbody></table><h3 id="重连策略" tabindex="-1">重连策略 <a class="header-anchor" href="#重连策略" aria-label="Permalink to &quot;重连策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>连接断开</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>等待 1s</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>尝试重连</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 成功 ──► 恢复订阅</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 失败 ──► 等待 2s ──► 重试（指数退避）</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              └── 最大 30s</span></span></code></pre></div><hr><h2 id="最佳实践" tabindex="-1">最佳实践 <a class="header-anchor" href="#最佳实践" aria-label="Permalink to &quot;最佳实践&quot;">​</a></h2><ol><li><strong>缓存 Subscribable</strong> - 使用 useMemo 避免重复创建</li><li><strong>清理订阅</strong> - 使用 useEffect 清理函数</li><li><strong>处理错误</strong> - 提供 error 回调处理异常</li><li><strong>合并请求</strong> - 相同数据使用单个订阅</li><li><strong>降级策略</strong> - 准备轮询作为后备方案</li></ol><hr><h2 id="本章小结" tabindex="-1">本章小结 <a class="header-anchor" href="#本章小结" aria-label="Permalink to &quot;本章小结&quot;">​</a></h2><ul><li>Subscribable 提供统一的订阅接口</li><li>支持余额、交易状态、新区块等事件</li><li>优先 WebSocket，降级轮询</li><li>与状态缓存结合实现自动更新</li><li>完善的资源管理防止内存泄漏</li></ul>`,67)])])}const u=s(l,[["render",i]]);export{b as __pageData,u as default};
