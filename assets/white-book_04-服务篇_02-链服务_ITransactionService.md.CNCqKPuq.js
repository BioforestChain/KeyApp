import{_ as a,c as n,o as i,ag as t}from"./chunks/framework.B0we9iV-.js";const o=JSON.parse('{"title":"ITransactionService 交易服务","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/04-服务篇/02-链服务/ITransactionService.md","filePath":"white-book/04-服务篇/02-链服务/ITransactionService.md"}'),p={name:"white-book/04-服务篇/02-链服务/ITransactionService.md"};function e(l,s,h,r,d,k){return i(),n("div",null,[...s[0]||(s[0]=[t(`<h1 id="itransactionservice-交易服务" tabindex="-1">ITransactionService 交易服务 <a class="header-anchor" href="#itransactionservice-交易服务" aria-label="Permalink to &quot;ITransactionService 交易服务&quot;">​</a></h1><blockquote><p>交易构建、签名、广播</p></blockquote><hr><h2 id="职责" tabindex="-1">职责 <a class="header-anchor" href="#职责" aria-label="Permalink to &quot;职责&quot;">​</a></h2><p>构建、签名、广播交易，查询交易状态和历史。</p><hr><h2 id="接口定义" tabindex="-1">接口定义 <a class="header-anchor" href="#接口定义" aria-label="Permalink to &quot;接口定义&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ITransactionService {</span></span>
<span class="line"><span>  // 估算交易费用</span></span>
<span class="line"><span>  estimateFee(params: TransferParams): FeeEstimate</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 构建未签名交易</span></span>
<span class="line"><span>  buildTransaction(params: TransferParams): UnsignedTransaction</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 签名交易</span></span>
<span class="line"><span>  signTransaction(unsignedTx: UnsignedTransaction, privateKey: bytes): SignedTransaction</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 广播交易</span></span>
<span class="line"><span>  broadcastTransaction(signedTx: SignedTransaction): TransactionHash</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 查询交易状态</span></span>
<span class="line"><span>  getTransactionStatus(hash: TransactionHash): TransactionStatus</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 查询交易详情</span></span>
<span class="line"><span>  getTransaction(hash: TransactionHash): Transaction</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 查询交易历史</span></span>
<span class="line"><span>  getTransactionHistory(address: Address, options?: PaginationOptions): TransactionPage</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 订阅交易状态</span></span>
<span class="line"><span>  subscribeTransaction(hash: TransactionHash, callback: (status: TransactionStatus) =&gt; void): Unsubscribe</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="数据结构" tabindex="-1">数据结构 <a class="header-anchor" href="#数据结构" aria-label="Permalink to &quot;数据结构&quot;">​</a></h2><h3 id="transferparams" tabindex="-1">TransferParams <a class="header-anchor" href="#transferparams" aria-label="Permalink to &quot;TransferParams&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TransferParams {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Address           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 发送方地址</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Address             </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 接收方地址</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  amount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Amount          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 发送金额（使用 Amount 类型）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  tokenAddress</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Address  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 代币地址（原生代币为空）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  memo</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> string           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 备注（部分链支持）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 可选的费用覆盖</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  gasLimit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bigint</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  gasPrice</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bigint</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  maxFeePerGas</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bigint   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// EIP-1559</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  maxPriorityFeePerGas</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bigint</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><blockquote><p>关于 Amount 类型的详细信息，请参阅 <a href="./../../03-架构篇/08-Amount类型系统/">Amount 类型系统</a>。</p></blockquote><h3 id="feeestimate" tabindex="-1">FeeEstimate <a class="header-anchor" href="#feeestimate" aria-label="Permalink to &quot;FeeEstimate&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">FeeEstimate {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  slow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Fee               </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 慢速（~5分钟）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  standard</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Fee           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准（~1分钟）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  fast</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Fee               </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 快速（~15秒）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Fee {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  amount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Amount          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 费用金额（使用 Amount 类型）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  estimatedTime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: number   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 预估确认时间（秒）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  gasLimit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bigint</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  gasPrice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Amount</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="transactionstatus" tabindex="-1">TransactionStatus <a class="header-anchor" href="#transactionstatus" aria-label="Permalink to &quot;TransactionStatus&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TransactionStatus {</span></span>
<span class="line"><span>  status: &#39;pending&#39; | &#39;confirming&#39; | &#39;confirmed&#39; | &#39;failed&#39;</span></span>
<span class="line"><span>  confirmations: number</span></span>
<span class="line"><span>  requiredConfirmations: number</span></span>
<span class="line"><span>  error?: string          // 失败原因</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="transaction" tabindex="-1">Transaction <a class="header-anchor" href="#transaction" aria-label="Permalink to &quot;Transaction&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Transaction {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  hash</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: TransactionHash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Address</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Address</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  amount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Amount          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 交易金额（使用 Amount 类型）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  fee</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Amount             </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 手续费（使用 Amount 类型）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  status</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: TransactionStatus</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  timestamp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  blockNumber</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bigint</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  memo</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> string</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: TransactionType</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TransactionType </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;transfer&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;token-transfer&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;contract-call&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;stake&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;unstake&#39;</span></span></code></pre></div><hr><h2 id="交易流程" tabindex="-1">交易流程 <a class="header-anchor" href="#交易流程" aria-label="Permalink to &quot;交易流程&quot;">​</a></h2><h3 id="状态机" tabindex="-1">状态机 <a class="header-anchor" href="#状态机" aria-label="Permalink to &quot;状态机&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>          构建交易</span></span>
<span class="line"><span>              │</span></span>
<span class="line"><span>              ▼</span></span>
<span class="line"><span>      ┌───────────────┐</span></span>
<span class="line"><span>      │   Unsigned    │  ← 待签名</span></span>
<span class="line"><span>      └───────┬───────┘</span></span>
<span class="line"><span>              │ 签名</span></span>
<span class="line"><span>              ▼</span></span>
<span class="line"><span>      ┌───────────────┐</span></span>
<span class="line"><span>      │    Signed     │  ← 待广播</span></span>
<span class="line"><span>      └───────┬───────┘</span></span>
<span class="line"><span>              │ 广播</span></span>
<span class="line"><span>              ▼</span></span>
<span class="line"><span>      ┌───────────────┐</span></span>
<span class="line"><span>      │    Pending    │  ← 等待打包</span></span>
<span class="line"><span>      └───────┬───────┘</span></span>
<span class="line"><span>              │</span></span>
<span class="line"><span>      ┌───────┴───────┐</span></span>
<span class="line"><span>      ▼               ▼</span></span>
<span class="line"><span> ┌─────────┐    ┌─────────┐</span></span>
<span class="line"><span> │Confirming│   │ Failed  │</span></span>
<span class="line"><span> └────┬────┘    └─────────┘</span></span>
<span class="line"><span>      │ 达到确认数</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span> ┌─────────┐</span></span>
<span class="line"><span> │Confirmed│</span></span>
<span class="line"><span> └─────────┘</span></span></code></pre></div><h3 id="完整流程" tabindex="-1">完整流程 <a class="header-anchor" href="#完整流程" aria-label="Permalink to &quot;完整流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 用户输入转账参数</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>2. estimateFee() 获取费用选项</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>3. 用户确认费用</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>4. buildTransaction() 构建交易</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>5. 用户绘制图案解锁私钥</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>6. signTransaction() 签名</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>7. broadcastTransaction() 广播</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>8. subscribeTransaction() 等待确认</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>9. 显示结果</span></span></code></pre></div><hr><h2 id="方法详情" tabindex="-1">方法详情 <a class="header-anchor" href="#方法详情" aria-label="Permalink to &quot;方法详情&quot;">​</a></h2><h3 id="estimatefee" tabindex="-1">estimateFee <a class="header-anchor" href="#estimatefee" aria-label="Permalink to &quot;estimateFee&quot;">​</a></h3><p>估算交易费用，返回三个档位供用户选择。</p><p><strong>行为规范</strong>：</p><ul><li><strong>MUST</strong> 基于当前网络状态计算</li><li><strong>MUST</strong> 考虑代币转账的额外 gas</li><li><strong>SHOULD</strong> 留 20% 余量避免失败</li></ul><h3 id="buildtransaction" tabindex="-1">buildTransaction <a class="header-anchor" href="#buildtransaction" aria-label="Permalink to &quot;buildTransaction&quot;">​</a></h3><p>构建未签名交易。</p><p><strong>行为规范</strong>：</p><ul><li><strong>MUST</strong> 自动获取 nonce</li><li><strong>MUST</strong> 验证余额充足</li><li><strong>SHOULD</strong> 支持自定义 gas 设置</li></ul><h3 id="broadcasttransaction" tabindex="-1">broadcastTransaction <a class="header-anchor" href="#broadcasttransaction" aria-label="Permalink to &quot;broadcastTransaction&quot;">​</a></h3><p>将签名交易广播到网络。</p><p><strong>行为规范</strong>：</p><ul><li><strong>MUST</strong> 返回交易哈希</li><li><strong>SHOULD</strong> 检测交易是否已存在</li><li><strong>MUST</strong> 处理节点拒绝的情况</li></ul><hr><h2 id="错误码" tabindex="-1">错误码 <a class="header-anchor" href="#错误码" aria-label="Permalink to &quot;错误码&quot;">​</a></h2><table tabindex="0"><thead><tr><th>错误码</th><th>说明</th><th>用户提示</th></tr></thead><tbody><tr><td>INSUFFICIENT_BALANCE</td><td>余额不足</td><td>&quot;余额不足，请确保有足够的 {symbol}&quot;</td></tr><tr><td>INSUFFICIENT_FEE</td><td>手续费不足</td><td>&quot;需要至少 {amount} {symbol} 作为手续费&quot;</td></tr><tr><td>INVALID_RECIPIENT</td><td>收款地址无效</td><td>&quot;请输入正确的收款地址&quot;</td></tr><tr><td>NONCE_TOO_LOW</td><td>Nonce 冲突</td><td>&quot;交易冲突，请稍后重试&quot;</td></tr><tr><td>TRANSACTION_REJECTED</td><td>交易被拒绝</td><td>&quot;交易被网络拒绝：{reason}&quot;</td></tr><tr><td>TRANSACTION_TIMEOUT</td><td>交易超时</td><td>&quot;交易长时间未确认，请检查网络&quot;</td></tr><tr><td>GAS_TOO_LOW</td><td>Gas 不足</td><td>&quot;手续费设置过低，交易可能失败&quot;</td></tr></tbody></table><hr><h2 id="确认数要求" tabindex="-1">确认数要求 <a class="header-anchor" href="#确认数要求" aria-label="Permalink to &quot;确认数要求&quot;">​</a></h2><table tabindex="0"><thead><tr><th>链</th><th>建议确认数</th><th>原因</th></tr></thead><tbody><tr><td>Ethereum</td><td>12</td><td>区块重组可能性</td></tr><tr><td>BSC</td><td>15</td><td>出块快，需更多确认</td></tr><tr><td>Bitcoin</td><td>6</td><td>行业标准</td></tr><tr><td>BFM</td><td>1</td><td>共识机制保证</td></tr></tbody></table>`,45)])])}const E=a(p,[["render",e]]);export{o as __pageData,E as default};
