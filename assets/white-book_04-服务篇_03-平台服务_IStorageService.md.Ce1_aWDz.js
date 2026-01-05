import{_ as s,c as n,o as t,ag as e}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"IStorageService 安全存储服务","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/04-服务篇/03-平台服务/IStorageService.md","filePath":"white-book/04-服务篇/03-平台服务/IStorageService.md"}'),l={name:"white-book/04-服务篇/03-平台服务/IStorageService.md"};function p(i,a,d,r,o,c){return t(),n("div",null,[...a[0]||(a[0]=[e(`<h1 id="istorageservice-安全存储服务" tabindex="-1">IStorageService 安全存储服务 <a class="header-anchor" href="#istorageservice-安全存储服务" aria-label="Permalink to &quot;IStorageService 安全存储服务&quot;">​</a></h1><blockquote><p>加密的本地数据存储</p></blockquote><hr><h2 id="职责" tabindex="-1">职责 <a class="header-anchor" href="#职责" aria-label="Permalink to &quot;职责&quot;">​</a></h2><p>安全地存储敏感数据（如加密后的助记词、用户偏好）。</p><hr><h2 id="接口定义" tabindex="-1">接口定义 <a class="header-anchor" href="#接口定义" aria-label="Permalink to &quot;接口定义&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IStorageService {</span></span>
<span class="line"><span>  // 存储数据</span></span>
<span class="line"><span>  setItem(key: string, value: string): void</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 读取数据</span></span>
<span class="line"><span>  getItem(key: string): string | null</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 删除数据</span></span>
<span class="line"><span>  removeItem(key: string): void</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 检查是否存在</span></span>
<span class="line"><span>  hasItem(key: string): boolean</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 获取所有键</span></span>
<span class="line"><span>  getAllKeys(): string[]</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 清空所有数据</span></span>
<span class="line"><span>  clear(): void</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="存储分区" tabindex="-1">存储分区 <a class="header-anchor" href="#存储分区" aria-label="Permalink to &quot;存储分区&quot;">​</a></h2><h3 id="按敏感度分区" tabindex="-1">按敏感度分区 <a class="header-anchor" href="#按敏感度分区" aria-label="Permalink to &quot;按敏感度分区&quot;">​</a></h3><table tabindex="0"><thead><tr><th>分区</th><th>前缀</th><th>加密</th><th>内容</th></tr></thead><tbody><tr><td>secure</td><td><code>sec_</code></td><td>是</td><td>加密的助记词、私钥</td></tr><tr><td>private</td><td><code>prv_</code></td><td>否</td><td>用户偏好、设置</td></tr><tr><td>cache</td><td><code>cch_</code></td><td>否</td><td>临时缓存</td></tr></tbody></table><h3 id="存储键命名" tabindex="-1">存储键命名 <a class="header-anchor" href="#存储键命名" aria-label="Permalink to &quot;存储键命名&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{分区前缀}{模块}_{键名}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>示例：</span></span>
<span class="line"><span>sec_wallet_encrypted_mnemonic</span></span>
<span class="line"><span>prv_settings_language</span></span>
<span class="line"><span>cch_balance_0x1234</span></span></code></pre></div><hr><h2 id="安全要求" tabindex="-1">安全要求 <a class="header-anchor" href="#安全要求" aria-label="Permalink to &quot;安全要求&quot;">​</a></h2><h3 id="加密存储" tabindex="-1">加密存储 <a class="header-anchor" href="#加密存储" aria-label="Permalink to &quot;加密存储&quot;">​</a></h3><p>对于 secure 分区：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>存储流程：</span></span>
<span class="line"><span>plaintext → AES-256-GCM 加密 → Base64 编码 → 存储</span></span>
<span class="line"><span></span></span>
<span class="line"><span>读取流程：</span></span>
<span class="line"><span>存储值 → Base64 解码 → AES-256-GCM 解密 → plaintext</span></span></code></pre></div><h3 id="加密密钥管理" tabindex="-1">加密密钥管理 <a class="header-anchor" href="#加密密钥管理" aria-label="Permalink to &quot;加密密钥管理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户图案锁</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼ PBKDF2 (100,000 iterations)</span></span>
<span class="line"><span>派生密钥 (256 bits)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>AES-256-GCM 加密数据</span></span></code></pre></div><h3 id="密钥派生参数" tabindex="-1">密钥派生参数 <a class="header-anchor" href="#密钥派生参数" aria-label="Permalink to &quot;密钥派生参数&quot;">​</a></h3><table tabindex="0"><thead><tr><th>参数</th><th>值</th></tr></thead><tbody><tr><td>算法</td><td>PBKDF2</td></tr><tr><td>哈希</td><td>SHA-256</td></tr><tr><td>迭代次数</td><td>100,000</td></tr><tr><td>输出长度</td><td>256 bits</td></tr><tr><td>盐</td><td>随机 16 bytes，存储在 <code>sec_crypto_salt</code></td></tr></tbody></table><hr><h2 id="数据持久化" tabindex="-1">数据持久化 <a class="header-anchor" href="#数据持久化" aria-label="Permalink to &quot;数据持久化&quot;">​</a></h2><h3 id="存储位置" tabindex="-1">存储位置 <a class="header-anchor" href="#存储位置" aria-label="Permalink to &quot;存储位置&quot;">​</a></h3><table tabindex="0"><thead><tr><th>平台</th><th>存储方式</th></tr></thead><tbody><tr><td>Web</td><td>IndexedDB</td></tr><tr><td>DWEB</td><td>Plaoc Secure Storage</td></tr></tbody></table><h3 id="同步策略" tabindex="-1">同步策略 <a class="header-anchor" href="#同步策略" aria-label="Permalink to &quot;同步策略&quot;">​</a></h3><ul><li><strong>MUST</strong> 写入后立即持久化</li><li><strong>MUST NOT</strong> 依赖内存缓存</li><li><strong>SHOULD</strong> 写入失败时抛出异常</li></ul><hr><h2 id="错误处理" tabindex="-1">错误处理 <a class="header-anchor" href="#错误处理" aria-label="Permalink to &quot;错误处理&quot;">​</a></h2><table tabindex="0"><thead><tr><th>错误</th><th>说明</th><th>处理</th></tr></thead><tbody><tr><td>STORAGE_FULL</td><td>存储空间满</td><td>清理缓存</td></tr><tr><td>QUOTA_EXCEEDED</td><td>超出配额</td><td>清理缓存</td></tr><tr><td>DECRYPT_FAILED</td><td>解密失败</td><td>图案错误或数据损坏</td></tr><tr><td>KEY_NOT_FOUND</td><td>键不存在</td><td>返回 null</td></tr></tbody></table><hr><h2 id="数据迁移" tabindex="-1">数据迁移 <a class="header-anchor" href="#数据迁移" aria-label="Permalink to &quot;数据迁移&quot;">​</a></h2><h3 id="版本升级" tabindex="-1">版本升级 <a class="header-anchor" href="#版本升级" aria-label="Permalink to &quot;版本升级&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>存储数据版本号：prv_storage_version</span></span>
<span class="line"><span></span></span>
<span class="line"><span>迁移流程：</span></span>
<span class="line"><span>1. 读取当前版本</span></span>
<span class="line"><span>2. 如果版本 &lt; 目标版本</span></span>
<span class="line"><span>3. 执行迁移函数</span></span>
<span class="line"><span>4. 更新版本号</span></span></code></pre></div><h3 id="迁移示例" tabindex="-1">迁移示例 <a class="header-anchor" href="#迁移示例" aria-label="Permalink to &quot;迁移示例&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>v1 → v2: </span></span>
<span class="line"><span>  - 重命名 wallet_data → sec_wallet_encrypted_mnemonic</span></span>
<span class="line"><span>  - 删除 deprecated_key</span></span></code></pre></div><hr><h2 id="安全审计点" tabindex="-1">安全审计点 <a class="header-anchor" href="#安全审计点" aria-label="Permalink to &quot;安全审计点&quot;">​</a></h2><ul><li>[ ] 敏感数据使用 secure 分区</li><li>[ ] 加密密钥不明文存储</li><li>[ ] 清理数据时覆写内存</li><li>[ ] 不在日志中输出存储内容</li><li>[ ] 导出功能需要身份验证</li></ul>`,41)])])}const u=s(l,[["render",p]]);export{b as __pageData,u as default};
