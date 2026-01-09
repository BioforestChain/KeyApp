import{_ as s,c as t,o as n,ag as e}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"身份认证","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/08-Security-Ref/02-Authentication.md","filePath":"white-book/08-Security-Ref/02-Authentication.md"}'),l={name:"white-book/08-Security-Ref/02-Authentication.md"};function p(i,a,d,r,h,o){return n(),t("div",null,[...a[0]||(a[0]=[e(`<h1 id="身份认证" tabindex="-1">身份认证 <a class="header-anchor" href="#身份认证" aria-label="Permalink to &quot;身份认证&quot;">​</a></h1><blockquote><p>源码: <a href="https://github.com/BioforestChain/KeyApp/blob/main/src/services/auth/" target="_blank" rel="noreferrer"><code>src/services/auth/</code></a></p></blockquote><hr><h2 id="认证类型区分" tabindex="-1">认证类型区分 <a class="header-anchor" href="#认证类型区分" aria-label="Permalink to &quot;认证类型区分&quot;">​</a></h2><p>本应用涉及两种不同的认证概念，<strong>MUST</strong> 明确区分：</p><h3 id="钱包锁-wallet-lock" tabindex="-1">钱包锁 (Wallet Lock) <a class="header-anchor" href="#钱包锁-wallet-lock" aria-label="Permalink to &quot;钱包锁 (Wallet Lock)&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>说明</th></tr></thead><tbody><tr><td>作用域</td><td>本地应用层面</td></tr><tr><td>用途</td><td>加密存储在设备上的助记词/私钥</td></tr><tr><td>实现形式</td><td>九宫格图案锁 (3x3 Pattern Lock)</td></tr><tr><td>存储位置</td><td>不存储，仅用于派生加密密钥</td></tr><tr><td>是否必需</td><td>是（Web 适配器要求）</td></tr></tbody></table><h3 id="交易密码-二次签名-pay-password" tabindex="-1">交易密码 / 二次签名 (Pay Password) <a class="header-anchor" href="#交易密码-二次签名-pay-password" aria-label="Permalink to &quot;交易密码 / 二次签名 (Pay Password)&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>说明</th></tr></thead><tbody><tr><td>作用域</td><td>链上层面（仅 BioForest 链）</td></tr><tr><td>用途</td><td>交易的二次签名，防止私钥泄露后资产被盗</td></tr><tr><td>存储位置</td><td>链上存储 <code>secondPublicKey</code></td></tr><tr><td>是否可修改</td><td>否（链上不可变）</td></tr></tbody></table><h3 id="关系图" tabindex="-1">关系图 <a class="header-anchor" href="#关系图" aria-label="Permalink to &quot;关系图&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         用户视角                                │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  创建钱包 ──► 设置【钱包锁图案】──► 加密助记词存储到设备        │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  设置二次签名 ──► 设置【安全密码】──► 链上记录 secondPublicKey  │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  转账时:                                                        │</span></span>
<span class="line"><span>│    1. 绘制【钱包锁图案】解锁助记词                              │</span></span>
<span class="line"><span>│    2. 如有二次签名，还需输入【安全密码】                        │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="开发注意事项" tabindex="-1">开发注意事项 <a class="header-anchor" href="#开发注意事项" aria-label="Permalink to &quot;开发注意事项&quot;">​</a></h3><table tabindex="0"><thead><tr><th>约束级别</th><th>要求</th></tr></thead><tbody><tr><td><strong>MUST</strong></td><td>在 UI 中使用不同的术语区分两者</td></tr><tr><td><strong>MUST NOT</strong></td><td>混淆 <code>walletLock/patternKey</code> 和 <code>twoStepSecret</code> 变量命名</td></tr><tr><td><strong>SHOULD</strong></td><td>钱包锁使用图案锁组件，安全密码使用密码输入框</td></tr><tr><td><strong>SHOULD</strong></td><td>检查 <code>secondPublicKey</code> 存在时才请求安全密码</td></tr></tbody></table><hr><h2 id="认证方式对比" tabindex="-1">认证方式对比 <a class="header-anchor" href="#认证方式对比" aria-label="Permalink to &quot;认证方式对比&quot;">​</a></h2><table tabindex="0"><thead><tr><th>方式</th><th>场景</th><th>安全级别</th><th>便捷性</th></tr></thead><tbody><tr><td>图案锁</td><td>首次解锁、敏感操作</td><td>高</td><td>中</td></tr><tr><td>生物识别</td><td>日常解锁、快捷支付</td><td>高</td><td>高</td></tr></tbody></table><hr><h2 id="应用锁规范" tabindex="-1">应用锁规范 <a class="header-anchor" href="#应用锁规范" aria-label="Permalink to &quot;应用锁规范&quot;">​</a></h2><h3 id="锁定状态" tabindex="-1">锁定状态 <a class="header-anchor" href="#锁定状态" aria-label="Permalink to &quot;锁定状态&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LockState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  isLocked</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           // 当前锁定状态</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  isWalletLockEnabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否启用钱包锁</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  isBiometricEnabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 是否启用生物识别</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  lastUnlockTime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       // 上次解锁时间</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoLockTimeout</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 自动锁定时间（分钟）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="解锁流程" tabindex="-1">解锁流程 <a class="header-anchor" href="#解锁流程" aria-label="Permalink to &quot;解锁流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户打开应用</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>检查是否启用锁定</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 未启用 ──► 直接进入</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 已启用</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>    检查生物识别是否可用</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ├── 可用 ──► 提示指纹/面容解锁</span></span>
<span class="line"><span>         │            │</span></span>
<span class="line"><span>         │            ├── 成功 ──► 解锁</span></span>
<span class="line"><span>         │            │</span></span>
<span class="line"><span>         │            └── 失败 ──► 回退图案锁</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         └── 不可用 ──► 显示图案锁</span></span>
<span class="line"><span>                        │</span></span>
<span class="line"><span>                        ├── 正确 ──► 解锁</span></span>
<span class="line"><span>                        │</span></span>
<span class="line"><span>                        └── 错误 ──► 显示错误 + 重试</span></span></code></pre></div><hr><h2 id="自动锁定规范" tabindex="-1">自动锁定规范 <a class="header-anchor" href="#自动锁定规范" aria-label="Permalink to &quot;自动锁定规范&quot;">​</a></h2><h3 id="触发条件" tabindex="-1">触发条件 <a class="header-anchor" href="#触发条件" aria-label="Permalink to &quot;触发条件&quot;">​</a></h3><table tabindex="0"><thead><tr><th>条件</th><th>说明</th><th>可配置</th></tr></thead><tbody><tr><td>超时无操作</td><td>设定时间内无用户活动</td><td>是</td></tr><tr><td>应用切后台</td><td>应用进入后台</td><td>是</td></tr><tr><td>屏幕锁定</td><td>设备屏幕锁定</td><td>否</td></tr></tbody></table><h3 id="超时选项" tabindex="-1">超时选项 <a class="header-anchor" href="#超时选项" aria-label="Permalink to &quot;超时选项&quot;">​</a></h3><table tabindex="0"><thead><tr><th>选项</th><th>默认</th></tr></thead><tbody><tr><td>1 分钟</td><td></td></tr><tr><td>5 分钟</td><td>✓</td></tr><tr><td>15 分钟</td><td></td></tr><tr><td>30 分钟</td><td></td></tr><tr><td>从不</td><td></td></tr></tbody></table><h3 id="活动监听" tabindex="-1">活动监听 <a class="header-anchor" href="#活动监听" aria-label="Permalink to &quot;活动监听&quot;">​</a></h3><p>以下用户活动 <strong>SHOULD</strong> 重置超时计时器：</p><ul><li>触摸/点击事件</li><li>滚动事件</li><li>键盘输入</li><li>导航操作</li></ul><hr><h2 id="生物识别认证" tabindex="-1">生物识别认证 <a class="header-anchor" href="#生物识别认证" aria-label="Permalink to &quot;生物识别认证&quot;">​</a></h2><h3 id="支持类型" tabindex="-1">支持类型 <a class="header-anchor" href="#支持类型" aria-label="Permalink to &quot;支持类型&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类型</th><th>平台</th></tr></thead><tbody><tr><td>Touch ID</td><td>iOS</td></tr><tr><td>Face ID</td><td>iOS</td></tr><tr><td>Fingerprint</td><td>Android</td></tr></tbody></table><h3 id="启用流程" tabindex="-1">启用流程 <a class="header-anchor" href="#启用流程" aria-label="Permalink to &quot;启用流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户进入安全设置</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>开启&quot;生物识别解锁&quot;</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>验证钱包锁图案 ← 确保用户是钱包所有者</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 图案错误 ──► 显示错误</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 图案正确</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>    检查设备生物识别可用性</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ├── 不可用 ──► 显示提示</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         └── 可用</span></span>
<span class="line"><span>              │</span></span>
<span class="line"><span>              ▼</span></span>
<span class="line"><span>         验证生物识别</span></span>
<span class="line"><span>              │</span></span>
<span class="line"><span>              ├── 成功 ──► 启用功能</span></span>
<span class="line"><span>              │</span></span>
<span class="line"><span>              └── 失败 ──► 显示错误</span></span></code></pre></div><h3 id="认证要求" tabindex="-1">认证要求 <a class="header-anchor" href="#认证要求" aria-label="Permalink to &quot;认证要求&quot;">​</a></h3><table tabindex="0"><thead><tr><th>约束级别</th><th>要求</th></tr></thead><tbody><tr><td><strong>MUST</strong></td><td>启用前验证钱包锁图案</td></tr><tr><td><strong>MUST</strong></td><td>检查设备是否支持生物识别</td></tr><tr><td><strong>MUST</strong></td><td>提供回退到图案锁的选项</td></tr><tr><td><strong>SHOULD</strong></td><td>显示生物识别类型名称</td></tr><tr><td><strong>SHOULD</strong></td><td>记录启用状态到安全存储</td></tr></tbody></table><hr><h2 id="转账确认规范" tabindex="-1">转账确认规范 <a class="header-anchor" href="#转账确认规范" aria-label="Permalink to &quot;转账确认规范&quot;">​</a></h2><h3 id="确认层级" tabindex="-1">确认层级 <a class="header-anchor" href="#确认层级" aria-label="Permalink to &quot;确认层级&quot;">​</a></h3><table tabindex="0"><thead><tr><th>操作</th><th>认证要求</th></tr></thead><tbody><tr><td>查看余额</td><td>无需认证</td></tr><tr><td>查看地址</td><td>无需认证</td></tr><tr><td>小额转账</td><td>生物识别</td></tr><tr><td>大额转账</td><td>图案锁</td></tr><tr><td>查看助记词</td><td>图案锁</td></tr><tr><td>删除钱包</td><td>图案锁</td></tr></tbody></table><h3 id="确认流程" tabindex="-1">确认流程 <a class="header-anchor" href="#确认流程" aria-label="Permalink to &quot;确认流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户发起转账</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>判断金额级别</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 大额（&gt;阈值）──► 强制图案锁验证</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 小额</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>    检查生物识别是否启用</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ├── 已启用 ──► 生物识别验证</span></span>
<span class="line"><span>         │            │</span></span>
<span class="line"><span>         │            ├── 成功 ──► 执行转账</span></span>
<span class="line"><span>         │            │</span></span>
<span class="line"><span>         │            └── 失败 ──► 回退图案锁</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         └── 未启用 ──► 图案锁验证</span></span></code></pre></div><hr><h2 id="钱包锁验证-ui-模式" tabindex="-1">钱包锁验证 UI 模式 <a class="header-anchor" href="#钱包锁验证-ui-模式" aria-label="Permalink to &quot;钱包锁验证 UI 模式&quot;">​</a></h2><h3 id="页面级别验证-full-page" tabindex="-1">页面级别验证 (Full Page) <a class="header-anchor" href="#页面级别验证-full-page" aria-label="Permalink to &quot;页面级别验证 (Full Page)&quot;">​</a></h3><p><strong>适用场景：</strong></p><ul><li>验证是主要流程的一部分</li><li>验证后有后续操作需要在同一页面完成</li><li>需要更多上下文信息展示</li></ul><table tabindex="0"><thead><tr><th>页面</th><th>说明</th></tr></thead><tbody><tr><td>修改钱包锁</td><td>验证当前图案 → 设置新图案</td></tr><tr><td>查看助记词</td><td>验证后在页面内展示助记词</td></tr></tbody></table><h3 id="底部抽屉验证-bottom-sheet" tabindex="-1">底部抽屉验证 (Bottom Sheet) <a class="header-anchor" href="#底部抽屉验证-bottom-sheet" aria-label="Permalink to &quot;底部抽屉验证 (Bottom Sheet)&quot;">​</a></h3><p><strong>适用场景：</strong></p><ul><li>验证是即时确认</li><li>验证后立即执行操作并关闭</li><li>需要保持上下文</li></ul><table tabindex="0"><thead><tr><th>场景</th><th>说明</th></tr></thead><tbody><tr><td>转账确认</td><td>弹出验证后执行转账</td></tr><tr><td>删除钱包</td><td>确认删除操作</td></tr></tbody></table><h3 id="选择决策树" tabindex="-1">选择决策树 <a class="header-anchor" href="#选择决策树" aria-label="Permalink to &quot;选择决策树&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>需要钱包锁验证？</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>验证后是否有后续操作？</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 是 ──► 需要停留在页面操作？</span></span>
<span class="line"><span>    │         │</span></span>
<span class="line"><span>    │         ├── 是 ──► 使用【页面级别验证】</span></span>
<span class="line"><span>    │         │</span></span>
<span class="line"><span>    │         └── 否 ──► 使用【底部抽屉验证】</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 否（即时确认）──► 使用【底部抽屉验证】</span></span></code></pre></div><hr><h2 id="错误处理规范" tabindex="-1">错误处理规范 <a class="header-anchor" href="#错误处理规范" aria-label="Permalink to &quot;错误处理规范&quot;">​</a></h2><h3 id="认证错误" tabindex="-1">认证错误 <a class="header-anchor" href="#认证错误" aria-label="Permalink to &quot;认证错误&quot;">​</a></h3><table tabindex="0"><thead><tr><th>错误类型</th><th>处理方式</th></tr></thead><tbody><tr><td>图案错误</td><td>显示错误动画 + 清空输入</td></tr><tr><td>生物识别取消</td><td>显示图案锁</td></tr><tr><td>生物识别失败</td><td>提示重试或使用图案锁</td></tr><tr><td>生物识别锁定</td><td>强制使用图案锁</td></tr></tbody></table><h3 id="错误次数限制" tabindex="-1">错误次数限制 <a class="header-anchor" href="#错误次数限制" aria-label="Permalink to &quot;错误次数限制&quot;">​</a></h3><table tabindex="0"><thead><tr><th>约束级别</th><th>要求</th></tr></thead><tbody><tr><td><strong>SHOULD</strong></td><td>连续错误后增加延迟</td></tr><tr><td><strong>SHOULD</strong></td><td>错误次数过多时临时锁定</td></tr><tr><td><strong>MAY</strong></td><td>支持错误通知（邮件/推送）</td></tr></tbody></table><hr><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="./01-Key-Management.html">密钥管理</a></li><li><a href="./03-DWEB-Authorization.html">DWEB 授权</a></li><li><a href="./04-Security-Audit.html">安全审计</a></li></ul>`,66)])])}const k=s(l,[["render",p]]);export{b as __pageData,k as default};
