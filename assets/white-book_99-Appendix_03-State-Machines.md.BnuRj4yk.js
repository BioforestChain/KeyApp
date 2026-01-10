import{_ as a,c as n,o as p,ag as i}from"./chunks/framework.B0we9iV-.js";const k=JSON.parse('{"title":"状态机规范","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/99-Appendix/03-State-Machines.md","filePath":"white-book/99-Appendix/03-State-Machines.md"}'),t={name:"white-book/99-Appendix/03-State-Machines.md"};function l(e,s,d,h,r,c){return p(),n("div",null,[...s[0]||(s[0]=[i(`<h1 id="状态机规范" tabindex="-1">状态机规范 <a class="header-anchor" href="#状态机规范" aria-label="Permalink to &quot;状态机规范&quot;">​</a></h1><blockquote><p>核心业务流程的完整状态机定义</p></blockquote><hr><h2 id="转账状态机" tabindex="-1">转账状态机 <a class="header-anchor" href="#转账状态机" aria-label="Permalink to &quot;转账状态机&quot;">​</a></h2><h3 id="状态定义" tabindex="-1">状态定义 <a class="header-anchor" href="#状态定义" aria-label="Permalink to &quot;状态定义&quot;">​</a></h3><table tabindex="0"><thead><tr><th>状态</th><th>说明</th><th>可转换到</th></tr></thead><tbody><tr><td>idle</td><td>初始状态</td><td>inputting</td></tr><tr><td>inputting</td><td>输入中</td><td>validating, idle</td></tr><tr><td>validating</td><td>验证中</td><td>confirming, inputting</td></tr><tr><td>confirming</td><td>等待确认</td><td>authenticating, inputting</td></tr><tr><td>authenticating</td><td>身份验证</td><td>signing, confirming</td></tr><tr><td>signing</td><td>签名中</td><td>broadcasting, failed</td></tr><tr><td>broadcasting</td><td>广播中</td><td>pending, failed</td></tr><tr><td>pending</td><td>等待确认</td><td>confirmed, failed</td></tr><tr><td>confirmed</td><td>已确认</td><td>idle</td></tr><tr><td>failed</td><td>失败</td><td>inputting, idle</td></tr></tbody></table><h3 id="状态转换图" tabindex="-1">状态转换图 <a class="header-anchor" href="#状态转换图" aria-label="Permalink to &quot;状态转换图&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>                                    ┌─────────┐</span></span>
<span class="line"><span>                                    │  idle   │</span></span>
<span class="line"><span>                                    └────┬────┘</span></span>
<span class="line"><span>                                         │ 开始转账</span></span>
<span class="line"><span>                                         ▼</span></span>
<span class="line"><span>                                    ┌─────────┐</span></span>
<span class="line"><span>                            ┌───────│inputting│◄───────┐</span></span>
<span class="line"><span>                            │       └────┬────┘        │</span></span>
<span class="line"><span>                            │ 取消       │ 提交        │ 修改</span></span>
<span class="line"><span>                            │            ▼             │</span></span>
<span class="line"><span>                            │       ┌──────────┐       │</span></span>
<span class="line"><span>                            │       │validating│───────┘</span></span>
<span class="line"><span>                            │       └────┬─────┘  验证失败</span></span>
<span class="line"><span>                            │            │ 验证通过</span></span>
<span class="line"><span>                            │            ▼</span></span>
<span class="line"><span>                            │       ┌──────────┐</span></span>
<span class="line"><span>                            │       │confirming│◄──────┐</span></span>
<span class="line"><span>                            │       └────┬─────┘       │</span></span>
<span class="line"><span>                            │            │ 确认        │ 取消认证</span></span>
<span class="line"><span>                            │            ▼             │</span></span>
<span class="line"><span>                            │       ┌──────────────┐   │</span></span>
<span class="line"><span>                            │       │authenticating│───┘</span></span>
<span class="line"><span>                            │       └──────┬───────┘</span></span>
<span class="line"><span>                            │              │ 认证成功</span></span>
<span class="line"><span>                            │              ▼</span></span>
<span class="line"><span>                            │       ┌─────────┐</span></span>
<span class="line"><span>                            │       │ signing │</span></span>
<span class="line"><span>                            │       └────┬────┘</span></span>
<span class="line"><span>                            │            │ 签名成功</span></span>
<span class="line"><span>                            │            ▼</span></span>
<span class="line"><span>                            │       ┌────────────┐</span></span>
<span class="line"><span>                            │       │broadcasting│</span></span>
<span class="line"><span>                            │       └─────┬──────┘</span></span>
<span class="line"><span>                            │             │ 广播成功</span></span>
<span class="line"><span>                            │             ▼</span></span>
<span class="line"><span>                            │       ┌─────────┐</span></span>
<span class="line"><span>                            │       │ pending │</span></span>
<span class="line"><span>                            │       └────┬────┘</span></span>
<span class="line"><span>                            │            │ 确认</span></span>
<span class="line"><span>                            ▼            ▼</span></span>
<span class="line"><span>                       ┌─────────┐  ┌─────────┐</span></span>
<span class="line"><span>                       │  idle   │◄─│confirmed│</span></span>
<span class="line"><span>                       └─────────┘  └─────────┘</span></span>
<span class="line"><span>                            ▲</span></span>
<span class="line"><span>                            │</span></span>
<span class="line"><span>                       ┌────┴────┐</span></span>
<span class="line"><span>                       │ failed  │◄── (任何步骤失败)</span></span>
<span class="line"><span>                       └─────────┘</span></span></code></pre></div><h3 id="状态数据" tabindex="-1">状态数据 <a class="header-anchor" href="#状态数据" aria-label="Permalink to &quot;状态数据&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TransferState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  status</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TransferStatus</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 输入数据</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  from</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Address</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  to</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Address</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  amount</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  chain</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChainId</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  memo</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 验证结果</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  validationErrors</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ValidationError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  estimatedFee</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Fee</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 交易数据</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  signedTx</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  txHash</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 确认数据</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  confirmations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  receipt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TxReceipt</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 错误</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  error</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppError</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="钱包创建状态机" tabindex="-1">钱包创建状态机 <a class="header-anchor" href="#钱包创建状态机" aria-label="Permalink to &quot;钱包创建状态机&quot;">​</a></h2><h3 id="状态定义-1" tabindex="-1">状态定义 <a class="header-anchor" href="#状态定义-1" aria-label="Permalink to &quot;状态定义&quot;">​</a></h3><table tabindex="0"><thead><tr><th>状态</th><th>说明</th></tr></thead><tbody><tr><td>idle</td><td>初始</td></tr><tr><td>settingPattern</td><td>设置图案</td></tr><tr><td>generatingMnemonic</td><td>生成助记词</td></tr><tr><td>showingMnemonic</td><td>显示助记词</td></tr><tr><td>verifyingMnemonic</td><td>验证助记词</td></tr><tr><td>derivingAddresses</td><td>派生地址</td></tr><tr><td>savingWallet</td><td>保存钱包</td></tr><tr><td>completed</td><td>完成</td></tr><tr><td>failed</td><td>失败</td></tr></tbody></table><h3 id="状态转换图-1" tabindex="-1">状态转换图 <a class="header-anchor" href="#状态转换图-1" aria-label="Permalink to &quot;状态转换图&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────┐</span></span>
<span class="line"><span>│  idle   │</span></span>
<span class="line"><span>└────┬────┘</span></span>
<span class="line"><span>     │ 开始创建</span></span>
<span class="line"><span>     ▼</span></span>
<span class="line"><span>┌──────────────┐</span></span>
<span class="line"><span>│settingPattern│</span></span>
<span class="line"><span>└──────┬───────┘</span></span>
<span class="line"><span>       │ 图案设置完成</span></span>
<span class="line"><span>       ▼</span></span>
<span class="line"><span>┌──────────────────┐</span></span>
<span class="line"><span>│generatingMnemonic│</span></span>
<span class="line"><span>└────────┬─────────┘</span></span>
<span class="line"><span>         │ 生成完成</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>┌───────────────┐</span></span>
<span class="line"><span>│showingMnemonic│</span></span>
<span class="line"><span>└───────┬───────┘</span></span>
<span class="line"><span>        │ 用户确认已备份</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>┌──────────────────┐</span></span>
<span class="line"><span>│verifyingMnemonic │◄────┐</span></span>
<span class="line"><span>└────────┬─────────┘     │</span></span>
<span class="line"><span>         │               │ 验证失败</span></span>
<span class="line"><span>         │ 验证成功      │</span></span>
<span class="line"><span>         ▼               │</span></span>
<span class="line"><span>┌──────────────────┐     │</span></span>
<span class="line"><span>│derivingAddresses │─────┘</span></span>
<span class="line"><span>└────────┬─────────┘</span></span>
<span class="line"><span>         │ 派生完成</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>┌─────────────┐</span></span>
<span class="line"><span>│savingWallet │</span></span>
<span class="line"><span>└──────┬──────┘</span></span>
<span class="line"><span>       │ 保存成功</span></span>
<span class="line"><span>       ▼</span></span>
<span class="line"><span>┌──────────┐</span></span>
<span class="line"><span>│completed │</span></span>
<span class="line"><span>└──────────┘</span></span></code></pre></div><hr><h2 id="dweb-授权状态机" tabindex="-1">DWEB 授权状态机 <a class="header-anchor" href="#dweb-授权状态机" aria-label="Permalink to &quot;DWEB 授权状态机&quot;">​</a></h2><h3 id="状态定义-2" tabindex="-1">状态定义 <a class="header-anchor" href="#状态定义-2" aria-label="Permalink to &quot;状态定义&quot;">​</a></h3><table tabindex="0"><thead><tr><th>状态</th><th>说明</th></tr></thead><tbody><tr><td>idle</td><td>空闲</td></tr><tr><td>receiving</td><td>接收请求</td></tr><tr><td>parsing</td><td>解析请求</td></tr><tr><td>showing</td><td>显示授权详情</td></tr><tr><td>authenticating</td><td>身份验证</td></tr><tr><td>signing</td><td>签名中</td></tr><tr><td>responding</td><td>返回结果</td></tr><tr><td>completed</td><td>完成</td></tr><tr><td>rejected</td><td>已拒绝</td></tr><tr><td>failed</td><td>失败</td></tr></tbody></table><h3 id="状态转换图-2" tabindex="-1">状态转换图 <a class="header-anchor" href="#状态转换图-2" aria-label="Permalink to &quot;状态转换图&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────┐</span></span>
<span class="line"><span>│  idle   │</span></span>
<span class="line"><span>└────┬────┘</span></span>
<span class="line"><span>     │ 收到授权请求</span></span>
<span class="line"><span>     ▼</span></span>
<span class="line"><span>┌───────────┐</span></span>
<span class="line"><span>│ receiving │</span></span>
<span class="line"><span>└─────┬─────┘</span></span>
<span class="line"><span>      │ 请求有效</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>┌──────────┐</span></span>
<span class="line"><span>│ parsing  │</span></span>
<span class="line"><span>└────┬─────┘</span></span>
<span class="line"><span>     │ 解析成功</span></span>
<span class="line"><span>     ▼</span></span>
<span class="line"><span>┌──────────┐</span></span>
<span class="line"><span>│ showing  │◄──────────────┐</span></span>
<span class="line"><span>└────┬─────┘               │</span></span>
<span class="line"><span>     │                     │</span></span>
<span class="line"><span>     ├── 用户拒绝 ──► rejected ──► idle</span></span>
<span class="line"><span>     │                     │</span></span>
<span class="line"><span>     └── 用户确认          │</span></span>
<span class="line"><span>         │                 │</span></span>
<span class="line"><span>         ▼                 │</span></span>
<span class="line"><span>┌───────────────┐          │</span></span>
<span class="line"><span>│authenticating │──────────┘ 认证失败</span></span>
<span class="line"><span>└───────┬───────┘</span></span>
<span class="line"><span>        │ 认证成功</span></span>
<span class="line"><span>        ▼</span></span>
<span class="line"><span>┌──────────┐</span></span>
<span class="line"><span>│ signing  │</span></span>
<span class="line"><span>└────┬─────┘</span></span>
<span class="line"><span>     │ 签名成功</span></span>
<span class="line"><span>     ▼</span></span>
<span class="line"><span>┌────────────┐</span></span>
<span class="line"><span>│ responding │</span></span>
<span class="line"><span>└─────┬──────┘</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>┌───────────┐</span></span>
<span class="line"><span>│ completed │──► idle</span></span>
<span class="line"><span>└───────────┘</span></span></code></pre></div><hr><h2 id="应用锁状态机" tabindex="-1">应用锁状态机 <a class="header-anchor" href="#应用锁状态机" aria-label="Permalink to &quot;应用锁状态机&quot;">​</a></h2><h3 id="状态定义-3" tabindex="-1">状态定义 <a class="header-anchor" href="#状态定义-3" aria-label="Permalink to &quot;状态定义&quot;">​</a></h3><table tabindex="0"><thead><tr><th>状态</th><th>说明</th></tr></thead><tbody><tr><td>locked</td><td>已锁定</td></tr><tr><td>unlocking</td><td>解锁中</td></tr><tr><td>unlocked</td><td>已解锁</td></tr><tr><td>locking</td><td>锁定中</td></tr></tbody></table><h3 id="状态转换" tabindex="-1">状态转换 <a class="header-anchor" href="#状态转换" aria-label="Permalink to &quot;状态转换&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────┐                    ┌───────────┐</span></span>
<span class="line"><span>│  locked  │◄───── 超时/手动 ────│  unlocked │</span></span>
<span class="line"><span>└────┬─────┘                    └─────┬─────┘</span></span>
<span class="line"><span>     │                                │</span></span>
<span class="line"><span>     │ 开始解锁                        │</span></span>
<span class="line"><span>     ▼                                │</span></span>
<span class="line"><span>┌───────────┐                         │</span></span>
<span class="line"><span>│ unlocking │                         │</span></span>
<span class="line"><span>└─────┬─────┘                         │</span></span>
<span class="line"><span>      │                               │</span></span>
<span class="line"><span>      ├── 成功 ──────────────────────►│</span></span>
<span class="line"><span>      │                               │</span></span>
<span class="line"><span>      └── 失败 ──► locked             │</span></span>
<span class="line"><span>                                      │</span></span>
<span class="line"><span>                                      ▼</span></span>
<span class="line"><span>                               ┌──────────┐</span></span>
<span class="line"><span>                               │ locking  │</span></span>
<span class="line"><span>                               └────┬─────┘</span></span>
<span class="line"><span>                                    │</span></span>
<span class="line"><span>                                    ▼</span></span>
<span class="line"><span>                               ┌──────────┐</span></span>
<span class="line"><span>                               │  locked  │</span></span>
<span class="line"><span>                               └──────────┘</span></span></code></pre></div><h3 id="锁定触发条件" tabindex="-1">锁定触发条件 <a class="header-anchor" href="#锁定触发条件" aria-label="Permalink to &quot;锁定触发条件&quot;">​</a></h3><table tabindex="0"><thead><tr><th>条件</th><th>优先级</th></tr></thead><tbody><tr><td>用户手动锁定</td><td>最高</td></tr><tr><td>应用切后台 N 秒</td><td>高</td></tr><tr><td>无操作超时</td><td>中</td></tr><tr><td>屏幕锁定</td><td>中</td></tr></tbody></table><hr><h2 id="网络状态机" tabindex="-1">网络状态机 <a class="header-anchor" href="#网络状态机" aria-label="Permalink to &quot;网络状态机&quot;">​</a></h2><h3 id="状态转换-1" tabindex="-1">状态转换 <a class="header-anchor" href="#状态转换-1" aria-label="Permalink to &quot;状态转换&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────┐     连接成功     ┌──────────┐</span></span>
<span class="line"><span>│ offline │ ──────────────► │  online  │</span></span>
<span class="line"><span>└────┬────┘                 └────┬─────┘</span></span>
<span class="line"><span>     ▲                           │</span></span>
<span class="line"><span>     │                           │ 连接断开</span></span>
<span class="line"><span>     │         ┌─────────┐       │</span></span>
<span class="line"><span>     └─────────│ degraded│◄──────┘</span></span>
<span class="line"><span>               └────┬────┘</span></span>
<span class="line"><span>                    │ 完全断开</span></span>
<span class="line"><span>                    ▼</span></span>
<span class="line"><span>               ┌─────────┐</span></span>
<span class="line"><span>               │ offline │</span></span>
<span class="line"><span>               └─────────┘</span></span></code></pre></div><h3 id="状态影响" tabindex="-1">状态影响 <a class="header-anchor" href="#状态影响" aria-label="Permalink to &quot;状态影响&quot;">​</a></h3><table tabindex="0"><thead><tr><th>状态</th><th>可用功能</th><th>UI 提示</th></tr></thead><tbody><tr><td>online</td><td>全部</td><td>无</td></tr><tr><td>degraded</td><td>大部分</td><td>警告条</td></tr><tr><td>offline</td><td>离线功能</td><td>离线横幅</td></tr></tbody></table><hr><h2 id="状态机实现规范" tabindex="-1">状态机实现规范 <a class="header-anchor" href="#状态机实现规范" aria-label="Permalink to &quot;状态机实现规范&quot;">​</a></h2><h3 id="must" tabindex="-1">MUST <a class="header-anchor" href="#must" aria-label="Permalink to &quot;MUST&quot;">​</a></h3><ul><li>每个状态有明确的入口和出口条件</li><li>状态转换是原子操作</li><li>每次转换记录日志</li><li>处理所有可能的状态转换</li></ul><h3 id="should" tabindex="-1">SHOULD <a class="header-anchor" href="#should" aria-label="Permalink to &quot;SHOULD&quot;">​</a></h3><ul><li>状态变化触发 UI 更新</li><li>支持状态持久化（如需要）</li><li>提供状态查询 API</li></ul><h3 id="may" tabindex="-1">MAY <a class="header-anchor" href="#may" aria-label="Permalink to &quot;MAY&quot;">​</a></h3><ul><li>实现状态回退</li><li>支持状态快照和恢复</li></ul><hr><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="./04-Edge-Cases.html">Edge Cases</a> - 边界条件</li><li><a href="./../08-Security-Ref/README.html">Security Reference</a> - 安全状态</li></ul>`,47)])])}const g=a(t,[["render",l]]);export{k as __pageData,g as default};
