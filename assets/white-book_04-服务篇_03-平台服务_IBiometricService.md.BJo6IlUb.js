import{_ as s,c as n,o as t,ag as e}from"./chunks/framework.B0we9iV-.js";const u=JSON.parse('{"title":"IBiometricService 生物识别服务","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/04-服务篇/03-平台服务/IBiometricService.md","filePath":"white-book/04-服务篇/03-平台服务/IBiometricService.md"}'),p={name:"white-book/04-服务篇/03-平台服务/IBiometricService.md"};function i(l,a,o,r,d,c){return t(),n("div",null,[...a[0]||(a[0]=[e(`<h1 id="ibiometricservice-生物识别服务" tabindex="-1">IBiometricService 生物识别服务 <a class="header-anchor" href="#ibiometricservice-生物识别服务" aria-label="Permalink to &quot;IBiometricService 生物识别服务&quot;">​</a></h1><blockquote><p>指纹/面部识别认证</p></blockquote><hr><h2 id="职责" tabindex="-1">职责 <a class="header-anchor" href="#职责" aria-label="Permalink to &quot;职责&quot;">​</a></h2><p>提供生物识别认证能力，用于应用解锁和交易确认。</p><hr><h2 id="接口定义" tabindex="-1">接口定义 <a class="header-anchor" href="#接口定义" aria-label="Permalink to &quot;接口定义&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IBiometricService {</span></span>
<span class="line"><span>  // 检查设备是否支持生物识别</span></span>
<span class="line"><span>  isSupported(): boolean</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 检查用户是否已注册生物识别</span></span>
<span class="line"><span>  isEnrolled(): boolean</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 获取可用的生物识别类型</span></span>
<span class="line"><span>  getAvailableTypes(): BiometricType[]</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 执行认证</span></span>
<span class="line"><span>  authenticate(options: AuthOptions): AuthResult</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="数据结构" tabindex="-1">数据结构 <a class="header-anchor" href="#数据结构" aria-label="Permalink to &quot;数据结构&quot;">​</a></h2><h3 id="biometrictype" tabindex="-1">BiometricType <a class="header-anchor" href="#biometrictype" aria-label="Permalink to &quot;BiometricType&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BiometricType = &#39;fingerprint&#39; | &#39;face&#39; | &#39;iris&#39;</span></span></code></pre></div><h3 id="authoptions" tabindex="-1">AuthOptions <a class="header-anchor" href="#authoptions" aria-label="Permalink to &quot;AuthOptions&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AuthOptions {</span></span>
<span class="line"><span>  reason: string              // 显示给用户的认证原因</span></span>
<span class="line"><span>  title?: string              // 弹窗标题</span></span>
<span class="line"><span>  fallbackEnabled: boolean    // 是否允许回退到图案锁</span></span>
<span class="line"><span>  timeout?: number            // 超时时间（秒），默认 30</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="authresult" tabindex="-1">AuthResult <a class="header-anchor" href="#authresult" aria-label="Permalink to &quot;AuthResult&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AuthResult {</span></span>
<span class="line"><span>  success: boolean</span></span>
<span class="line"><span>  method?: BiometricType | &#39;pattern&#39;</span></span>
<span class="line"><span>  error?: BiometricError</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>BiometricError = </span></span>
<span class="line"><span>  | &#39;NOT_SUPPORTED&#39;           // 设备不支持</span></span>
<span class="line"><span>  | &#39;NOT_ENROLLED&#39;            // 用户未设置</span></span>
<span class="line"><span>  | &#39;LOCKOUT&#39;                 // 尝试次数过多</span></span>
<span class="line"><span>  | &#39;LOCKOUT_PERMANENT&#39;       // 永久锁定</span></span>
<span class="line"><span>  | &#39;USER_CANCEL&#39;             // 用户取消</span></span>
<span class="line"><span>  | &#39;SYSTEM_CANCEL&#39;           // 系统取消</span></span>
<span class="line"><span>  | &#39;TIMEOUT&#39;                 // 超时</span></span>
<span class="line"><span>  | &#39;FALLBACK&#39;                // 用户选择图案锁</span></span></code></pre></div><hr><h2 id="使用流程" tabindex="-1">使用流程 <a class="header-anchor" href="#使用流程" aria-label="Permalink to &quot;使用流程&quot;">​</a></h2><h3 id="启用生物识别" tabindex="-1">启用生物识别 <a class="header-anchor" href="#启用生物识别" aria-label="Permalink to &quot;启用生物识别&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 检查 isSupported()</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ false → 隐藏生物识别选项</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ true</span></span>
<span class="line"><span>2. 检查 isEnrolled()</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ false → 引导用户到系统设置</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ true</span></span>
<span class="line"><span>3. 执行 authenticate() 验证身份</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ 失败 → 提示错误</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ 成功</span></span>
<span class="line"><span>4. 存储&quot;已启用生物识别&quot;标记</span></span></code></pre></div><h3 id="解锁应用" tabindex="-1">解锁应用 <a class="header-anchor" href="#解锁应用" aria-label="Permalink to &quot;解锁应用&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 检查用户是否启用了生物识别</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ 否 → 显示图案锁</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ 是</span></span>
<span class="line"><span>2. 自动弹出 authenticate()</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ 成功 → 解锁</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├─ 用户取消 → 显示图案锁</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ▼ 错误</span></span>
<span class="line"><span>3. 根据错误类型处理</span></span></code></pre></div><hr><h2 id="错误处理" tabindex="-1">错误处理 <a class="header-anchor" href="#错误处理" aria-label="Permalink to &quot;错误处理&quot;">​</a></h2><table tabindex="0"><thead><tr><th>错误</th><th>用户提示</th><th>后续操作</th></tr></thead><tbody><tr><td>NOT_SUPPORTED</td><td>&quot;您的设备不支持生物识别&quot;</td><td>隐藏选项</td></tr><tr><td>NOT_ENROLLED</td><td>&quot;请先在系统设置中注册指纹/面容&quot;</td><td>跳转设置</td></tr><tr><td>LOCKOUT</td><td>&quot;尝试次数过多，请稍后重试&quot;</td><td>等待解锁</td></tr><tr><td>LOCKOUT_PERMANENT</td><td>&quot;生物识别已锁定，请使用图案锁&quot;</td><td>仅图案锁</td></tr><tr><td>USER_CANCEL</td><td>-</td><td>显示图案锁</td></tr><tr><td>TIMEOUT</td><td>&quot;认证超时&quot;</td><td>允许重试</td></tr></tbody></table><hr><h2 id="reason-文案规范" tabindex="-1">reason 文案规范 <a class="header-anchor" href="#reason-文案规范" aria-label="Permalink to &quot;reason 文案规范&quot;">​</a></h2><table tabindex="0"><thead><tr><th>场景</th><th>reason</th></tr></thead><tbody><tr><td>解锁应用</td><td>&quot;验证身份以解锁 BFM Pay&quot;</td></tr><tr><td>确认转账</td><td>&quot;验证身份以确认转账&quot;</td></tr><tr><td>查看助记词</td><td>&quot;验证身份以查看助记词&quot;</td></tr><tr><td>启用生物识别</td><td>&quot;验证身份以启用生物识别&quot;</td></tr></tbody></table><hr><h2 id="安全要求" tabindex="-1">安全要求 <a class="header-anchor" href="#安全要求" aria-label="Permalink to &quot;安全要求&quot;">​</a></h2><table tabindex="0"><thead><tr><th>要求</th><th>说明</th></tr></thead><tbody><tr><td>不存储生物特征</td><td>仅使用系统 API</td></tr><tr><td>有图案锁回退</td><td>生物识别失败时可用图案锁</td></tr><tr><td>超时限制</td><td>最长等待 30 秒</td></tr><tr><td>失败次数限制</td><td>遵循系统策略</td></tr></tbody></table><hr><h2 id="平台实现" tabindex="-1">平台实现 <a class="header-anchor" href="#平台实现" aria-label="Permalink to &quot;平台实现&quot;">​</a></h2><h3 id="web-webauthn" tabindex="-1">Web (WebAuthn) <a class="header-anchor" href="#web-webauthn" aria-label="Permalink to &quot;Web (WebAuthn)&quot;">​</a></h3><ul><li>使用 <code>PublicKeyCredential</code> API</li><li>创建凭证时绑定到域名</li><li><strong>限制</strong>：需要 HTTPS</li></ul><h3 id="dweb-plaoc" tabindex="-1">DWEB (Plaoc) <a class="header-anchor" href="#dweb-plaoc" aria-label="Permalink to &quot;DWEB (Plaoc)&quot;">​</a></h3><ul><li>使用 <code>plaoc.biometric</code> API</li><li>直接调用系统生物识别</li><li>支持指纹和面容</li></ul>`,37)])])}const b=s(p,[["render",i]]);export{u as __pageData,b as default};
