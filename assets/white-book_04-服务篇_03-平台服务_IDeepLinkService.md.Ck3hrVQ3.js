import{_ as n,c as s,o as e,ag as t}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"IDeepLinkService 深度链接服务","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/04-服务篇/03-平台服务/IDeepLinkService.md","filePath":"white-book/04-服务篇/03-平台服务/IDeepLinkService.md"}'),p={name:"white-book/04-服务篇/03-平台服务/IDeepLinkService.md"};function l(i,a,d,r,c,o){return e(),s("div",null,[...a[0]||(a[0]=[t(`<h1 id="ideeplinkservice-深度链接服务" tabindex="-1">IDeepLinkService 深度链接服务 <a class="header-anchor" href="#ideeplinkservice-深度链接服务" aria-label="Permalink to &quot;IDeepLinkService 深度链接服务&quot;">​</a></h1><blockquote><p>处理外部应用发起的链接请求</p></blockquote><hr><h2 id="职责" tabindex="-1">职责 <a class="header-anchor" href="#职责" aria-label="Permalink to &quot;职责&quot;">​</a></h2><p>处理来自外部应用（如 DWEB 应用）的链接请求，实现跨应用交互。</p><hr><h2 id="接口定义" tabindex="-1">接口定义 <a class="header-anchor" href="#接口定义" aria-label="Permalink to &quot;接口定义&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IDeepLinkService {</span></span>
<span class="line"><span>  // 注册链接处理器</span></span>
<span class="line"><span>  register(handler: DeepLinkHandler): Unsubscribe</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 解析链接</span></span>
<span class="line"><span>  parse(url: string): DeepLinkData | null</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 生成链接</span></span>
<span class="line"><span>  generate(data: DeepLinkData): string</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 获取启动链接（如果有）</span></span>
<span class="line"><span>  getInitialLink(): string | null</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="数据结构" tabindex="-1">数据结构 <a class="header-anchor" href="#数据结构" aria-label="Permalink to &quot;数据结构&quot;">​</a></h2><h3 id="deeplinkdata" tabindex="-1">DeepLinkData <a class="header-anchor" href="#deeplinkdata" aria-label="Permalink to &quot;DeepLinkData&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DeepLinkData {</span></span>
<span class="line"><span>  action: DeepLinkAction</span></span>
<span class="line"><span>  params: Record&lt;string, string&gt;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>DeepLinkAction =</span></span>
<span class="line"><span>  | &#39;transfer&#39;              // 发起转账</span></span>
<span class="line"><span>  | &#39;authorize-address&#39;     // 地址授权</span></span>
<span class="line"><span>  | &#39;authorize-signature&#39;   // 签名授权</span></span>
<span class="line"><span>  | &#39;import&#39;                // 导入钱包</span></span>
<span class="line"><span>  | &#39;connect&#39;               // 连接请求</span></span></code></pre></div><h3 id="deeplinkhandler" tabindex="-1">DeepLinkHandler <a class="header-anchor" href="#deeplinkhandler" aria-label="Permalink to &quot;DeepLinkHandler&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type DeepLinkHandler = (data: DeepLinkData) =&gt; void</span></span>
<span class="line"><span>type Unsubscribe = () =&gt; void</span></span></code></pre></div><hr><h2 id="url-格式" tabindex="-1">URL 格式 <a class="header-anchor" href="#url-格式" aria-label="Permalink to &quot;URL 格式&quot;">​</a></h2><h3 id="协议" tabindex="-1">协议 <a class="header-anchor" href="#协议" aria-label="Permalink to &quot;协议&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>bfmpay://{action}?{params}</span></span></code></pre></div><h3 id="转账链接" tabindex="-1">转账链接 <a class="header-anchor" href="#转账链接" aria-label="Permalink to &quot;转账链接&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>bfmpay://transfer?</span></span>
<span class="line"><span>  to={address}&amp;</span></span>
<span class="line"><span>  amount={amount}&amp;</span></span>
<span class="line"><span>  token={token_address}&amp;</span></span>
<span class="line"><span>  chain={chain_id}&amp;</span></span>
<span class="line"><span>  memo={memo}</span></span></code></pre></div><p><strong>参数说明</strong>：</p><table tabindex="0"><thead><tr><th>参数</th><th>必需</th><th>说明</th></tr></thead><tbody><tr><td>to</td><td>Y</td><td>收款地址</td></tr><tr><td>amount</td><td>N</td><td>金额（最小单位）</td></tr><tr><td>token</td><td>N</td><td>代币地址（原生币为空）</td></tr><tr><td>chain</td><td>N</td><td>链 ID</td></tr><tr><td>memo</td><td>N</td><td>备注</td></tr></tbody></table><h3 id="地址授权链接" tabindex="-1">地址授权链接 <a class="header-anchor" href="#地址授权链接" aria-label="Permalink to &quot;地址授权链接&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>bfmpay://authorize/address?</span></span>
<span class="line"><span>  app={app_id}&amp;</span></span>
<span class="line"><span>  callback={callback_url}&amp;</span></span>
<span class="line"><span>  chain={chain_id}&amp;</span></span>
<span class="line"><span>  nonce={nonce}</span></span></code></pre></div><p><strong>参数说明</strong>：</p><table tabindex="0"><thead><tr><th>参数</th><th>必需</th><th>说明</th></tr></thead><tbody><tr><td>app</td><td>Y</td><td>请求应用标识</td></tr><tr><td>callback</td><td>Y</td><td>授权结果回调 URL</td></tr><tr><td>chain</td><td>N</td><td>指定链（空则用户选择）</td></tr><tr><td>nonce</td><td>Y</td><td>一次性随机数</td></tr></tbody></table><h3 id="签名授权链接" tabindex="-1">签名授权链接 <a class="header-anchor" href="#签名授权链接" aria-label="Permalink to &quot;签名授权链接&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>bfmpay://authorize/signature?</span></span>
<span class="line"><span>  app={app_id}&amp;</span></span>
<span class="line"><span>  callback={callback_url}&amp;</span></span>
<span class="line"><span>  message={message}&amp;</span></span>
<span class="line"><span>  type={sign_type}</span></span></code></pre></div><p><strong>参数说明</strong>：</p><table tabindex="0"><thead><tr><th>参数</th><th>必需</th><th>说明</th></tr></thead><tbody><tr><td>app</td><td>Y</td><td>请求应用标识</td></tr><tr><td>callback</td><td>Y</td><td>签名结果回调 URL</td></tr><tr><td>message</td><td>Y</td><td>待签名消息（Base64）</td></tr><tr><td>type</td><td>N</td><td>签名类型：personal/typed</td></tr></tbody></table><hr><h2 id="处理流程" tabindex="-1">处理流程 <a class="header-anchor" href="#处理流程" aria-label="Permalink to &quot;处理流程&quot;">​</a></h2><h3 id="接收链接" tabindex="-1">接收链接 <a class="header-anchor" href="#接收链接" aria-label="Permalink to &quot;接收链接&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>外部应用调用 DeepLink</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>应用被唤起（或已在前台）</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>parse() 解析链接</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ 解析失败 → 显示错误</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ 成功</span></span>
<span class="line"><span>调用注册的 handler</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>根据 action 导航到对应页面</span></span></code></pre></div><h3 id="授权流程" tabindex="-1">授权流程 <a class="header-anchor" href="#授权流程" aria-label="Permalink to &quot;授权流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 收到授权链接</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>2. 跳转授权确认页面</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>3. 用户确认/拒绝</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ 拒绝 → callback 返回错误</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ 确认</span></span>
<span class="line"><span>4. 执行签名/获取地址</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>5. callback 返回结果</span></span></code></pre></div><hr><h2 id="安全要求" tabindex="-1">安全要求 <a class="header-anchor" href="#安全要求" aria-label="Permalink to &quot;安全要求&quot;">​</a></h2><h3 id="授权请求验证" tabindex="-1">授权请求验证 <a class="header-anchor" href="#授权请求验证" aria-label="Permalink to &quot;授权请求验证&quot;">​</a></h3><ul><li><strong>MUST</strong> 显示请求来源（app 标识）</li><li><strong>MUST</strong> 显示请求内容（地址/签名消息）</li><li><strong>MUST</strong> 要求用户明确确认</li><li><strong>SHOULD</strong> 记录授权历史</li></ul><h3 id="回调-url-验证" tabindex="-1">回调 URL 验证 <a class="header-anchor" href="#回调-url-验证" aria-label="Permalink to &quot;回调 URL 验证&quot;">​</a></h3><ul><li><strong>MUST</strong> 验证 callback URL 格式</li><li><strong>SHOULD</strong> 检查 callback 域名白名单</li><li><strong>MUST NOT</strong> 在回调中包含敏感信息</li></ul><h3 id="nonce-防重放" tabindex="-1">nonce 防重放 <a class="header-anchor" href="#nonce-防重放" aria-label="Permalink to &quot;nonce 防重放&quot;">​</a></h3><ul><li><strong>MUST</strong> 验证 nonce 未被使用</li><li><strong>MUST</strong> 使用后标记 nonce 失效</li><li>nonce 有效期建议 5 分钟</li></ul><hr><h2 id="错误处理" tabindex="-1">错误处理 <a class="header-anchor" href="#错误处理" aria-label="Permalink to &quot;错误处理&quot;">​</a></h2><table tabindex="0"><thead><tr><th>错误</th><th>说明</th><th>回调内容</th></tr></thead><tbody><tr><td>INVALID_URL</td><td>URL 格式错误</td><td>-</td></tr><tr><td>UNKNOWN_ACTION</td><td>不支持的操作</td><td>-</td></tr><tr><td>USER_REJECTED</td><td>用户拒绝</td><td><code>error=rejected</code></td></tr><tr><td>INVALID_CHAIN</td><td>不支持的链</td><td><code>error=invalid_chain</code></td></tr><tr><td>TIMEOUT</td><td>操作超时</td><td><code>error=timeout</code></td></tr></tbody></table><hr><h2 id="平台实现" tabindex="-1">平台实现 <a class="header-anchor" href="#平台实现" aria-label="Permalink to &quot;平台实现&quot;">​</a></h2><h3 id="web" tabindex="-1">Web <a class="header-anchor" href="#web" aria-label="Permalink to &quot;Web&quot;">​</a></h3><ul><li>使用 URL hash 路由</li><li>监听 <code>hashchange</code> 事件</li><li>初始链接从 <code>location.hash</code> 获取</li></ul><h3 id="dweb-plaoc" tabindex="-1">DWEB (Plaoc) <a class="header-anchor" href="#dweb-plaoc" aria-label="Permalink to &quot;DWEB (Plaoc)&quot;">​</a></h3><ul><li>使用 Plaoc DeepLink API</li><li>监听 <code>plaoc.onDeepLink</code> 事件</li><li>支持应用间直接调用</li></ul>`,53)])])}const u=n(p,[["render",l]]);export{b as __pageData,u as default};
