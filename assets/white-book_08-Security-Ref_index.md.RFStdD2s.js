import{_ as t,c as n,o as s,ag as e}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"📘 Book T4: The Security Reference (安全技术参考)","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/08-Security-Ref/index.md","filePath":"white-book/08-Security-Ref/README.md"}'),p={name:"white-book/08-Security-Ref/index.md"};function l(r,a,d,i,o,h){return s(),n("div",null,[...a[0]||(a[0]=[e(`<h1 id="📘-book-t4-the-security-reference-安全技术参考" tabindex="-1">📘 Book T4: The Security Reference (安全技术参考) <a class="header-anchor" href="#📘-book-t4-the-security-reference-安全技术参考" aria-label="Permalink to &quot;📘 Book T4: The Security Reference (安全技术参考)&quot;">​</a></h1><blockquote><p>定义密钥管理、身份认证、授权协议和安全审计规范</p></blockquote><h2 id="📖-目录" tabindex="-1">📖 目录 <a class="header-anchor" href="#📖-目录" aria-label="Permalink to &quot;📖 目录&quot;">​</a></h2><table tabindex="0"><thead><tr><th>文档</th><th>说明</th></tr></thead><tbody><tr><td><a href="./01-Key-Management.html">01-Key-Management</a></td><td>助记词生成、多链派生、加密存储</td></tr><tr><td><a href="./02-Authentication.html">02-Authentication</a></td><td>图案锁、生物识别、自动锁定</td></tr><tr><td><a href="./03-DWEB-Authorization.html">03-DWEB-Authorization</a></td><td>Plaoc 协议、地址授权、签名授权</td></tr><tr><td><a href="./04-Security-Audit.html">04-Security-Audit</a></td><td>审计清单、攻击防护、合规要求</td></tr><tr><td><a href="./05-CryptoBox-Authorization.html">05-CryptoBox-Authorization</a></td><td>Crypto Box 黑盒授权、Token 机制</td></tr></tbody></table><hr><h2 id="🎯-核心原则" tabindex="-1">🎯 核心原则 <a class="header-anchor" href="#🎯-核心原则" aria-label="Permalink to &quot;🎯 核心原则&quot;">​</a></h2><h3 id="_1-私钥永不离开设备" tabindex="-1">1. 私钥永不离开设备 <a class="header-anchor" href="#_1-私钥永不离开设备" aria-label="Permalink to &quot;1. 私钥永不离开设备&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    用户设备                          │</span></span>
<span class="line"><span>│  ┌─────────────┐    ┌─────────────┐                │</span></span>
<span class="line"><span>│  │  助记词加密  │    │  本地签名    │                │</span></span>
<span class="line"><span>│  │   存储      │───►│   交易      │───► 广播到链上  │</span></span>
<span class="line"><span>│  └─────────────┘    └─────────────┘                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>        ▲                                      │</span></span>
<span class="line"><span>        │         私钥永不上传                  │</span></span>
<span class="line"><span>        └──────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-分层安全模型" tabindex="-1">2. 分层安全模型 <a class="header-anchor" href="#_2-分层安全模型" aria-label="Permalink to &quot;2. 分层安全模型&quot;">​</a></h3><table tabindex="0"><thead><tr><th>层级</th><th>保护内容</th><th>机制</th></tr></thead><tbody><tr><td>存储层</td><td>加密的助记词</td><td>AES-256-GCM</td></tr><tr><td>认证层</td><td>解锁访问权限</td><td>图案锁 / 生物识别</td></tr><tr><td>确认层</td><td>敏感操作授权</td><td>二次验证</td></tr><tr><td>链上层</td><td>二次签名 (可选)</td><td>secondPublicKey</td></tr></tbody></table><h3 id="_3-行为约束级别" tabindex="-1">3. 行为约束级别 <a class="header-anchor" href="#_3-行为约束级别" aria-label="Permalink to &quot;3. 行为约束级别&quot;">​</a></h3><table tabindex="0"><thead><tr><th>级别</th><th>含义</th><th>示例</th></tr></thead><tbody><tr><td><strong>MUST</strong></td><td>必须遵守</td><td>私钥不上传服务器</td></tr><tr><td><strong>MUST NOT</strong></td><td>禁止行为</td><td>日志中记录助记词</td></tr><tr><td><strong>SHOULD</strong></td><td>建议遵守</td><td>使用后清除内存</td></tr><tr><td><strong>MAY</strong></td><td>可选实现</td><td>远程锁定功能</td></tr></tbody></table><hr><h2 id="🔐-安全架构" tabindex="-1">🔐 安全架构 <a class="header-anchor" href="#🔐-安全架构" aria-label="Permalink to &quot;🔐 安全架构&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户输入图案</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>┌─────────────┐</span></span>
<span class="line"><span>│ PBKDF2 派生 │ ← 100,000+ 迭代</span></span>
<span class="line"><span>└──────┬──────┘</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       ▼</span></span>
<span class="line"><span>┌─────────────┐</span></span>
<span class="line"><span>│ AES-256-GCM │ ← 解密助记词</span></span>
<span class="line"><span>└──────┬──────┘</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       ▼</span></span>
<span class="line"><span>┌─────────────┐</span></span>
<span class="line"><span>│ BIP39/BIP44 │ ← 派生私钥</span></span>
<span class="line"><span>└──────┬──────┘</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       ▼</span></span>
<span class="line"><span>┌─────────────┐</span></span>
<span class="line"><span>│   签名交易   │</span></span>
<span class="line"><span>└──────┬──────┘</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       ▼</span></span>
<span class="line"><span>┌─────────────┐</span></span>
<span class="line"><span>│ 清除内存     │ ← 立即清理敏感数据</span></span>
<span class="line"><span>└─────────────┘</span></span></code></pre></div><hr><h2 id="📊-安全指标" tabindex="-1">📊 安全指标 <a class="header-anchor" href="#📊-安全指标" aria-label="Permalink to &quot;📊 安全指标&quot;">​</a></h2><table tabindex="0"><thead><tr><th>指标</th><th>目标</th></tr></thead><tbody><tr><td>暴力破解耗时</td><td>&gt; 100 年 (图案 + PBKDF2)</td></tr><tr><td>密钥派生时间</td><td>&lt; 500ms</td></tr><tr><td>内存清理延迟</td><td>&lt; 100ms</td></tr><tr><td>认证失败锁定</td><td>10 次后锁定 24h</td></tr></tbody></table><hr><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="./../01-Kernel-Ref/README.html">Kernel Reference</a> - 运行时安全</li><li><a href="./../02-Driver-Ref/README.html">Driver Reference</a> - 链适配安全</li><li><a href="./../04-Platform-Ref/README.html">Platform Reference</a> - 平台安全能力</li></ul>`,21)])])}const u=t(p,[["render",l]]);export{b as __pageData,u as default};
