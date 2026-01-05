import{_ as n,c as s,o as t,ag as p}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"第十一章：服务架构","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/04-服务篇/01-服务架构/index.md","filePath":"white-book/04-服务篇/01-服务架构/index.md"}'),e={name:"white-book/04-服务篇/01-服务架构/index.md"};function l(i,a,d,r,c,h){return t(),s("div",null,[...a[0]||(a[0]=[p(`<h1 id="第十一章-服务架构" tabindex="-1">第十一章：服务架构 <a class="header-anchor" href="#第十一章-服务架构" aria-label="Permalink to &quot;第十一章：服务架构&quot;">​</a></h1><blockquote><p>定义应用与区块链交互的架构模式</p></blockquote><hr><h2 id="_11-1-架构概述" tabindex="-1">11.1 架构概述 <a class="header-anchor" href="#_11-1-架构概述" aria-label="Permalink to &quot;11.1 架构概述&quot;">​</a></h2><p>BFM Pay 需要支持多条区块链，每条链有不同的协议和 API。服务层的职责是提供<strong>统一的抽象接口</strong>，屏蔽底层差异。</p><h3 id="核心问题" tabindex="-1">核心问题 <a class="header-anchor" href="#核心问题" aria-label="Permalink to &quot;核心问题&quot;">​</a></h3><table tabindex="0"><thead><tr><th>问题</th><th>解决方案</th></tr></thead><tbody><tr><td>链协议差异（EVM vs UTXO vs BFM）</td><td>适配器模式</td></tr><tr><td>能力差异（有的链支持质押，有的不支持）</td><td>可选接口</td></tr><tr><td>运行环境差异（Web vs DWEB）</td><td>平台服务抽象</td></tr><tr><td>类型安全</td><td>强类型接口定义</td></tr></tbody></table><hr><h2 id="_11-2-分层架构" tabindex="-1">11.2 分层架构 <a class="header-anchor" href="#_11-2-分层架构" aria-label="Permalink to &quot;11.2 分层架构&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    UI Layer                              │</span></span>
<span class="line"><span>│               (页面、组件、用户交互)                       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                  Application Layer                       │</span></span>
<span class="line"><span>│            (用例、业务逻辑、状态管理)                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                   Service Layer                          │  ← 本章重点</span></span>
<span class="line"><span>│        (统一接口、适配器注册、服务发现)                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                  Adapter Layer                           │</span></span>
<span class="line"><span>│      (EVM Adapter, BFM Adapter, Bitcoin Adapter...)     │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                  Provider Layer                          │</span></span>
<span class="line"><span>│              (RPC Client, REST API, SDK)                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="层级职责" tabindex="-1">层级职责 <a class="header-anchor" href="#层级职责" aria-label="Permalink to &quot;层级职责&quot;">​</a></h3><table tabindex="0"><thead><tr><th>层级</th><th>职责</th><th>依赖方向</th></tr></thead><tbody><tr><td>UI Layer</td><td>渲染界面、响应用户操作</td><td>向下</td></tr><tr><td>Application Layer</td><td>协调业务逻辑</td><td>向下</td></tr><tr><td>Service Layer</td><td>提供统一接口、管理适配器</td><td>向下</td></tr><tr><td>Adapter Layer</td><td>实现特定链的接口</td><td>向下</td></tr><tr><td>Provider Layer</td><td>与链节点/API 通信</td><td>外部</td></tr></tbody></table><hr><h2 id="_11-3-适配器模式" tabindex="-1">11.3 适配器模式 <a class="header-anchor" href="#_11-3-适配器模式" aria-label="Permalink to &quot;11.3 适配器模式&quot;">​</a></h2><h3 id="核心概念" tabindex="-1">核心概念 <a class="header-anchor" href="#核心概念" aria-label="Permalink to &quot;核心概念&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────┐</span></span>
<span class="line"><span>│  IChainAdapter  │  ← 统一接口</span></span>
<span class="line"><span>└────────┬────────┘</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>    ┌────┴────┐</span></span>
<span class="line"><span>    │         │</span></span>
<span class="line"><span>    ▼         ▼</span></span>
<span class="line"><span>┌───────┐ ┌───────┐</span></span>
<span class="line"><span>│  EVM  │ │  BFM  │  ← 具体实现</span></span>
<span class="line"><span>│Adapter│ │Adapter│</span></span>
<span class="line"><span>└───────┘ └───────┘</span></span></code></pre></div><h3 id="适配器接口" tabindex="-1">适配器接口 <a class="header-anchor" href="#适配器接口" aria-label="Permalink to &quot;适配器接口&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IChainAdapter {</span></span>
<span class="line"><span>  // 链标识</span></span>
<span class="line"><span>  chainId: string</span></span>
<span class="line"><span>  chainType: &#39;evm&#39; | &#39;bfm&#39; | &#39;utxo&#39; | &#39;solana&#39;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 必需服务</span></span>
<span class="line"><span>  identity: IIdentityService</span></span>
<span class="line"><span>  asset: IAssetService</span></span>
<span class="line"><span>  transaction: ITransactionService</span></span>
<span class="line"><span>  chain: IChainService</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 可选服务（不支持时返回 null）</span></span>
<span class="line"><span>  staking: IStakingService | null</span></span>
<span class="line"><span>  nft: INFTService | null</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 生命周期</span></span>
<span class="line"><span>  initialize(): Promise&lt;void&gt;</span></span>
<span class="line"><span>  dispose(): void</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="服务可选性" tabindex="-1">服务可选性 <a class="header-anchor" href="#服务可选性" aria-label="Permalink to &quot;服务可选性&quot;">​</a></h3><p>适配器 <strong>MUST</strong> 实现所有必需服务，<strong>MAY</strong> 实现可选服务：</p><table tabindex="0"><thead><tr><th>服务</th><th>EVM</th><th>BFM</th><th>Bitcoin</th></tr></thead><tbody><tr><td>identity</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>asset</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>transaction</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>chain</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>staking</td><td>✗</td><td>✓</td><td>✗</td></tr><tr><td>nft</td><td>✓</td><td>✗</td><td>✗</td></tr></tbody></table><hr><h2 id="_11-4-注册中心" tabindex="-1">11.4 注册中心 <a class="header-anchor" href="#_11-4-注册中心" aria-label="Permalink to &quot;11.4 注册中心&quot;">​</a></h2><h3 id="职责" tabindex="-1">职责 <a class="header-anchor" href="#职责" aria-label="Permalink to &quot;职责&quot;">​</a></h3><ul><li>注册适配器</li><li>根据 chainId 查找适配器</li><li>管理适配器生命周期</li></ul><h3 id="接口定义" tabindex="-1">接口定义 <a class="header-anchor" href="#接口定义" aria-label="Permalink to &quot;接口定义&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IAdapterRegistry {</span></span>
<span class="line"><span>  // 注册适配器工厂</span></span>
<span class="line"><span>  register(chainType: string, factory: AdapterFactory): void</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 获取适配器（不存在则创建）</span></span>
<span class="line"><span>  getAdapter(chainId: string): IChainAdapter</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 检查是否支持</span></span>
<span class="line"><span>  isSupported(chainId: string): boolean</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 列出所有支持的链</span></span>
<span class="line"><span>  listSupported(): ChainInfo[]</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 清理</span></span>
<span class="line"><span>  disposeAll(): void</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type AdapterFactory = (chainConfig: ChainConfig) =&gt; IChainAdapter</span></span></code></pre></div><h3 id="使用模式" tabindex="-1">使用模式 <a class="header-anchor" href="#使用模式" aria-label="Permalink to &quot;使用模式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 伪代码示例</span></span>
<span class="line"><span>registry = getAdapterRegistry()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 获取 BFM 主网适配器</span></span>
<span class="line"><span>adapter = registry.getAdapter(&#39;bfm-mainnet&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用服务</span></span>
<span class="line"><span>balance = await adapter.asset.getNativeBalance(address)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 检查可选服务</span></span>
<span class="line"><span>if (adapter.staking != null) {</span></span>
<span class="line"><span>  stakingInfo = await adapter.staking.getStakingInfo(address)</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_11-5-服务发现" tabindex="-1">11.5 服务发现 <a class="header-anchor" href="#_11-5-服务发现" aria-label="Permalink to &quot;11.5 服务发现&quot;">​</a></h2><h3 id="能力查询" tabindex="-1">能力查询 <a class="header-anchor" href="#能力查询" aria-label="Permalink to &quot;能力查询&quot;">​</a></h3><p>应用层在使用服务前 <strong>SHOULD</strong> 检查能力：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 检查链是否支持质押</span></span>
<span class="line"><span>function canStake(chainId: string): boolean {</span></span>
<span class="line"><span>  adapter = registry.getAdapter(chainId)</span></span>
<span class="line"><span>  return adapter.staking != null</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 根据能力显示/隐藏 UI</span></span>
<span class="line"><span>if (canStake(currentChain)) {</span></span>
<span class="line"><span>  showStakingButton()</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="功能降级" tabindex="-1">功能降级 <a class="header-anchor" href="#功能降级" aria-label="Permalink to &quot;功能降级&quot;">​</a></h3><p>当可选功能不可用时，应用层 <strong>MUST</strong> 优雅降级：</p><table tabindex="0"><thead><tr><th>场景</th><th>处理方式</th></tr></thead><tbody><tr><td>质押服务不可用</td><td>隐藏质押入口</td></tr><tr><td>NFT 服务不可用</td><td>隐藏 NFT 标签页</td></tr><tr><td>网络暂时不可用</td><td>显示缓存数据 + 提示</td></tr></tbody></table><hr><h2 id="_11-6-依赖注入" tabindex="-1">11.6 依赖注入 <a class="header-anchor" href="#_11-6-依赖注入" aria-label="Permalink to &quot;11.6 依赖注入&quot;">​</a></h2><h3 id="原则" tabindex="-1">原则 <a class="header-anchor" href="#原则" aria-label="Permalink to &quot;原则&quot;">​</a></h3><ul><li>服务通过接口引用，不直接依赖具体实现</li><li>适配器通过注册中心获取，不硬编码</li><li>测试时可替换为 Mock 实现</li></ul><h3 id="依赖图" tabindex="-1">依赖图 <a class="header-anchor" href="#依赖图" aria-label="Permalink to &quot;依赖图&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────┐     ┌─────────────────┐</span></span>
<span class="line"><span>│  TransferUseCase  │ ────► │ ITransactionService │</span></span>
<span class="line"><span>└─────────────┘     └─────────────────┘</span></span>
<span class="line"><span>       │                      ▲</span></span>
<span class="line"><span>       │                      │ implements</span></span>
<span class="line"><span>       ▼                      │</span></span>
<span class="line"><span>┌─────────────────┐    ┌─────────────────┐</span></span>
<span class="line"><span>│ IAdapterRegistry │ ──► │ EvmTxService    │</span></span>
<span class="line"><span>└─────────────────┘    └─────────────────┘</span></span></code></pre></div><hr><h2 id="_11-7-错误处理策略" tabindex="-1">11.7 错误处理策略 <a class="header-anchor" href="#_11-7-错误处理策略" aria-label="Permalink to &quot;11.7 错误处理策略&quot;">​</a></h2><h3 id="错误传播" tabindex="-1">错误传播 <a class="header-anchor" href="#错误传播" aria-label="Permalink to &quot;错误传播&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Provider Layer</span></span>
<span class="line"><span>      │ RpcError</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>Adapter Layer</span></span>
<span class="line"><span>      │ → 转换为 ChainServiceError</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>Service Layer</span></span>
<span class="line"><span>      │ → 添加上下文信息</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>Application Layer</span></span>
<span class="line"><span>      │ → 决定重试/展示/上报</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>UI Layer</span></span>
<span class="line"><span>      │ → 显示用户友好的错误信息</span></span></code></pre></div><h3 id="重试策略" tabindex="-1">重试策略 <a class="header-anchor" href="#重试策略" aria-label="Permalink to &quot;重试策略&quot;">​</a></h3><table tabindex="0"><thead><tr><th>错误类型</th><th>策略</th></tr></thead><tbody><tr><td>网络超时</td><td>自动重试，最多 3 次，指数退避</td></tr><tr><td>节点限流</td><td>切换备用节点</td></tr><tr><td>交易 nonce 冲突</td><td>重新获取 nonce 后重试</td></tr><tr><td>余额不足</td><td>不重试，提示用户</td></tr></tbody></table><hr><h2 id="_11-8-缓存策略" tabindex="-1">11.8 缓存策略 <a class="header-anchor" href="#_11-8-缓存策略" aria-label="Permalink to &quot;11.8 缓存策略&quot;">​</a></h2><h3 id="缓存层级" tabindex="-1">缓存层级 <a class="header-anchor" href="#缓存层级" aria-label="Permalink to &quot;缓存层级&quot;">​</a></h3><table tabindex="0"><thead><tr><th>层级</th><th>数据</th><th>有效期</th></tr></thead><tbody><tr><td>内存缓存</td><td>链信息、代币元数据</td><td>应用生命周期</td></tr><tr><td>本地存储</td><td>交易历史、用户设置</td><td>持久化</td></tr><tr><td>无缓存</td><td>余额、nonce</td><td>实时查询</td></tr></tbody></table><h3 id="缓存失效" tabindex="-1">缓存失效 <a class="header-anchor" href="#缓存失效" aria-label="Permalink to &quot;缓存失效&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件</th><th>失效范围</th></tr></thead><tbody><tr><td>发送交易成功</td><td>当前地址的余额</td></tr><tr><td>区块确认</td><td>pending 交易状态</td></tr><tr><td>用户切换链</td><td>当前链的所有缓存</td></tr></tbody></table><hr><h2 id="本章小结" tabindex="-1">本章小结 <a class="header-anchor" href="#本章小结" aria-label="Permalink to &quot;本章小结&quot;">​</a></h2><ul><li>服务层采用适配器模式支持多链</li><li>注册中心管理适配器的创建和查找</li><li>服务分为必需和可选两类</li><li>应用层通过能力查询实现功能降级</li><li>错误处理和缓存策略明确定义</li></ul><hr><h2 id="下一章" tabindex="-1">下一章 <a class="header-anchor" href="#下一章" aria-label="Permalink to &quot;下一章&quot;">​</a></h2><p>继续阅读 <a href="./../02-链服务/">第十二章：链服务接口</a>。</p>`,61)])])}const u=n(e,[["render",l]]);export{b as __pageData,u as default};
