import{_ as s,c as n,o as t,ag as p}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"数据迁移篇","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/09-部署篇/03-数据迁移/index.md","filePath":"white-book/09-部署篇/03-数据迁移/index.md"}'),e={name:"white-book/09-部署篇/03-数据迁移/index.md"};function l(i,a,d,r,c,o){return t(),n("div",null,[...a[0]||(a[0]=[p(`<h1 id="数据迁移篇" tabindex="-1">数据迁移篇 <a class="header-anchor" href="#数据迁移篇" aria-label="Permalink to &quot;数据迁移篇&quot;">​</a></h1><blockquote><p>定义版本升级时的数据迁移策略和向后兼容规范</p></blockquote><hr><h2 id="版本化存储" tabindex="-1">版本化存储 <a class="header-anchor" href="#版本化存储" aria-label="Permalink to &quot;版本化存储&quot;">​</a></h2><h3 id="存储结构" tabindex="-1">存储结构 <a class="header-anchor" href="#存储结构" aria-label="Permalink to &quot;存储结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>StorageSchema {</span></span>
<span class="line"><span>  version: number        // Schema 版本号</span></span>
<span class="line"><span>  data: object           // 业务数据</span></span>
<span class="line"><span>  migratedAt?: number    // 迁移时间</span></span>
<span class="line"><span>  previousVersion?: number  // 迁移前版本</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="版本命名规则" tabindex="-1">版本命名规则 <a class="header-anchor" href="#版本命名规则" aria-label="Permalink to &quot;版本命名规则&quot;">​</a></h3><table tabindex="0"><thead><tr><th>版本类型</th><th>变更类型</th><th>是否需迁移</th></tr></thead><tbody><tr><td>Major (X.0)</td><td>结构性变更</td><td>是</td></tr><tr><td>Minor (x.Y)</td><td>新增字段</td><td>可能</td></tr><tr><td>Patch (x.y.Z)</td><td>修复/优化</td><td>否</td></tr></tbody></table><hr><h2 id="迁移架构" tabindex="-1">迁移架构 <a class="header-anchor" href="#迁移架构" aria-label="Permalink to &quot;迁移架构&quot;">​</a></h2><h3 id="迁移流程" tabindex="-1">迁移流程 <a class="header-anchor" href="#迁移流程" aria-label="Permalink to &quot;迁移流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>应用启动</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>读取存储版本号</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 版本相同 ──► 正常启动</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 版本不同</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>    获取迁移路径</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ▼</span></span>
<span class="line"><span>    依次执行迁移函数</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         ├── 成功 ──► 更新版本号 ──► 正常启动</span></span>
<span class="line"><span>         │</span></span>
<span class="line"><span>         └── 失败 ──► 回滚 ──► 显示错误</span></span></code></pre></div><h3 id="迁移管理器接口" tabindex="-1">迁移管理器接口 <a class="header-anchor" href="#迁移管理器接口" aria-label="Permalink to &quot;迁移管理器接口&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IMigrationManager {</span></span>
<span class="line"><span>  // 获取当前存储版本</span></span>
<span class="line"><span>  getCurrentVersion(): number</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 获取目标版本</span></span>
<span class="line"><span>  getTargetVersion(): number</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 执行迁移</span></span>
<span class="line"><span>  migrate(): Promise&lt;MigrationResult&gt;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 回滚到指定版本</span></span>
<span class="line"><span>  rollback(version: number): Promise&lt;void&gt;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 注册迁移函数</span></span>
<span class="line"><span>  registerMigration(migration: Migration): void</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Migration {</span></span>
<span class="line"><span>  fromVersion: number</span></span>
<span class="line"><span>  toVersion: number</span></span>
<span class="line"><span>  up: (data: any) =&gt; Promise&lt;any&gt;    // 升级</span></span>
<span class="line"><span>  down: (data: any) =&gt; Promise&lt;any&gt;  // 降级</span></span>
<span class="line"><span>  description: string</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MigrationResult {</span></span>
<span class="line"><span>  success: boolean</span></span>
<span class="line"><span>  fromVersion: number</span></span>
<span class="line"><span>  toVersion: number</span></span>
<span class="line"><span>  migrationsRun: number</span></span>
<span class="line"><span>  error?: Error</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="迁移策略" tabindex="-1">迁移策略 <a class="header-anchor" href="#迁移策略" aria-label="Permalink to &quot;迁移策略&quot;">​</a></h2><h3 id="增量迁移" tabindex="-1">增量迁移 <a class="header-anchor" href="#增量迁移" aria-label="Permalink to &quot;增量迁移&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>v1 ──► v2 ──► v3 ──► v4</span></span>
<span class="line"><span>     m1    m2    m3</span></span>
<span class="line"><span></span></span>
<span class="line"><span>从 v1 到 v4 需依次执行: m1 → m2 → m3</span></span></code></pre></div><p><strong>规范要求：</strong></p><ul><li><strong>MUST</strong> 支持从任意旧版本迁移到最新版本</li><li><strong>MUST</strong> 迁移函数幂等（重复执行结果相同）</li><li><strong>SHOULD</strong> 每个迁移函数只做一件事</li></ul><h3 id="迁移超时" tabindex="-1">迁移超时 <a class="header-anchor" href="#迁移超时" aria-label="Permalink to &quot;迁移超时&quot;">​</a></h3><table tabindex="0"><thead><tr><th>数据量级</th><th>超时时间</th></tr></thead><tbody><tr><td>&lt; 100 条</td><td>5s</td></tr><tr><td>100-1000 条</td><td>30s</td></tr><tr><td>&gt; 1000 条</td><td>60s</td></tr></tbody></table><h3 id="迁移进度" tabindex="-1">迁移进度 <a class="header-anchor" href="#迁移进度" aria-label="Permalink to &quot;迁移进度&quot;">​</a></h3><p>大数据量迁移 <strong>SHOULD</strong> 显示进度：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│         正在更新数据...              │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│  ████████████░░░░░░░░  60%         │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│  请勿关闭应用                        │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="数据备份" tabindex="-1">数据备份 <a class="header-anchor" href="#数据备份" aria-label="Permalink to &quot;数据备份&quot;">​</a></h2><h3 id="备份时机" tabindex="-1">备份时机 <a class="header-anchor" href="#备份时机" aria-label="Permalink to &quot;备份时机&quot;">​</a></h3><table tabindex="0"><thead><tr><th>时机</th><th>动作</th></tr></thead><tbody><tr><td>迁移前</td><td>自动备份当前数据</td></tr><tr><td>用户手动</td><td>导出到文件</td></tr><tr><td>定期</td><td>后台静默备份</td></tr></tbody></table><h3 id="备份数据结构" tabindex="-1">备份数据结构 <a class="header-anchor" href="#备份数据结构" aria-label="Permalink to &quot;备份数据结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Backup {</span></span>
<span class="line"><span>  version: number</span></span>
<span class="line"><span>  timestamp: number</span></span>
<span class="line"><span>  data: EncryptedData</span></span>
<span class="line"><span>  checksum: string</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="备份存储" tabindex="-1">备份存储 <a class="header-anchor" href="#备份存储" aria-label="Permalink to &quot;备份存储&quot;">​</a></h3><table tabindex="0"><thead><tr><th>存储位置</th><th>用途</th><th>保留策略</th></tr></thead><tbody><tr><td>本地存储</td><td>迁移回滚</td><td>保留最近 3 个版本</td></tr><tr><td>用户导出</td><td>手动恢复</td><td>用户管理</td></tr></tbody></table><hr><h2 id="schema-变更规范" tabindex="-1">Schema 变更规范 <a class="header-anchor" href="#schema-变更规范" aria-label="Permalink to &quot;Schema 变更规范&quot;">​</a></h2><h3 id="向后兼容变更-无需迁移" tabindex="-1">向后兼容变更（无需迁移） <a class="header-anchor" href="#向后兼容变更-无需迁移" aria-label="Permalink to &quot;向后兼容变更（无需迁移）&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变更类型</th><th>示例</th></tr></thead><tbody><tr><td>新增可选字段</td><td>添加 <code>nickname?: string</code></td></tr><tr><td>放宽类型约束</td><td><code>string</code> → <code>string | null</code></td></tr><tr><td>新增枚举值</td><td>添加新的链类型</td></tr></tbody></table><h3 id="需要迁移的变更" tabindex="-1">需要迁移的变更 <a class="header-anchor" href="#需要迁移的变更" aria-label="Permalink to &quot;需要迁移的变更&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变更类型</th><th>示例</th><th>迁移方式</th></tr></thead><tbody><tr><td>字段重命名</td><td><code>addr</code> → <code>address</code></td><td>复制并删除旧字段</td></tr><tr><td>字段类型变更</td><td><code>string</code> → <code>number</code></td><td>类型转换</td></tr><tr><td>结构重组</td><td>扁平 → 嵌套</td><td>重新组织</td></tr><tr><td>删除字段</td><td>移除 <code>deprecated</code></td><td>清理旧字段</td></tr><tr><td>新增必填字段</td><td>添加 <code>createdAt</code></td><td>设置默认值</td></tr></tbody></table><hr><h2 id="迁移示例" tabindex="-1">迁移示例 <a class="header-anchor" href="#迁移示例" aria-label="Permalink to &quot;迁移示例&quot;">​</a></h2><h3 id="示例-1-字段重命名" tabindex="-1">示例 1: 字段重命名 <a class="header-anchor" href="#示例-1-字段重命名" aria-label="Permalink to &quot;示例 1: 字段重命名&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// v1 → v2: wallets.addr → wallets.address</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Migration {</span></span>
<span class="line"><span>  fromVersion: 1,</span></span>
<span class="line"><span>  toVersion: 2,</span></span>
<span class="line"><span>  description: &#39;重命名 addr 为 address&#39;,</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  up: async (data) =&gt; {</span></span>
<span class="line"><span>    data.wallets = data.wallets.map(w =&gt; ({</span></span>
<span class="line"><span>      ...w,</span></span>
<span class="line"><span>      address: w.addr,</span></span>
<span class="line"><span>      addr: undefined  // 删除旧字段</span></span>
<span class="line"><span>    }))</span></span>
<span class="line"><span>    return data</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  down: async (data) =&gt; {</span></span>
<span class="line"><span>    data.wallets = data.wallets.map(w =&gt; ({</span></span>
<span class="line"><span>      ...w,</span></span>
<span class="line"><span>      addr: w.address,</span></span>
<span class="line"><span>      address: undefined</span></span>
<span class="line"><span>    }))</span></span>
<span class="line"><span>    return data</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="示例-2-结构重组" tabindex="-1">示例 2: 结构重组 <a class="header-anchor" href="#示例-2-结构重组" aria-label="Permalink to &quot;示例 2: 结构重组&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// v2 → v3: 扁平结构 → 嵌套结构</span></span>
<span class="line"><span>// { walletId, ethAddress, btcAddress } </span></span>
<span class="line"><span>// → { walletId, addresses: { eth, btc } }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Migration {</span></span>
<span class="line"><span>  fromVersion: 2,</span></span>
<span class="line"><span>  toVersion: 3,</span></span>
<span class="line"><span>  description: &#39;地址改为嵌套结构&#39;,</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  up: async (data) =&gt; {</span></span>
<span class="line"><span>    data.wallets = data.wallets.map(w =&gt; ({</span></span>
<span class="line"><span>      walletId: w.walletId,</span></span>
<span class="line"><span>      addresses: {</span></span>
<span class="line"><span>        eth: w.ethAddress,</span></span>
<span class="line"><span>        btc: w.btcAddress</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }))</span></span>
<span class="line"><span>    return data</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="示例-3-新增必填字段" tabindex="-1">示例 3: 新增必填字段 <a class="header-anchor" href="#示例-3-新增必填字段" aria-label="Permalink to &quot;示例 3: 新增必填字段&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// v3 → v4: 新增 createdAt 必填字段</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Migration {</span></span>
<span class="line"><span>  fromVersion: 3,</span></span>
<span class="line"><span>  toVersion: 4,</span></span>
<span class="line"><span>  description: &#39;添加创建时间字段&#39;,</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  up: async (data) =&gt; {</span></span>
<span class="line"><span>    const now = Date.now()</span></span>
<span class="line"><span>    data.wallets = data.wallets.map(w =&gt; ({</span></span>
<span class="line"><span>      ...w,</span></span>
<span class="line"><span>      createdAt: w.createdAt || now  // 默认值</span></span>
<span class="line"><span>    }))</span></span>
<span class="line"><span>    return data</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="错误处理" tabindex="-1">错误处理 <a class="header-anchor" href="#错误处理" aria-label="Permalink to &quot;错误处理&quot;">​</a></h2><h3 id="迁移失败处理" tabindex="-1">迁移失败处理 <a class="header-anchor" href="#迁移失败处理" aria-label="Permalink to &quot;迁移失败处理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>迁移失败</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>记录错误日志</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>尝试回滚</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 回滚成功 ──► 恢复旧版本数据</span></span>
<span class="line"><span>    │               │</span></span>
<span class="line"><span>    │               ▼</span></span>
<span class="line"><span>    │          显示&quot;更新失败，请重试&quot;</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 回滚失败 ──► 从备份恢复</span></span>
<span class="line"><span>                    │</span></span>
<span class="line"><span>                    ├── 恢复成功 ──► 显示&quot;已恢复&quot;</span></span>
<span class="line"><span>                    │</span></span>
<span class="line"><span>                    └── 恢复失败 ──► 显示&quot;数据损坏&quot;</span></span>
<span class="line"><span>                                    │</span></span>
<span class="line"><span>                                    ▼</span></span>
<span class="line"><span>                              引导重新导入钱包</span></span></code></pre></div><h3 id="错误类型" tabindex="-1">错误类型 <a class="header-anchor" href="#错误类型" aria-label="Permalink to &quot;错误类型&quot;">​</a></h3><table tabindex="0"><thead><tr><th>错误</th><th>处理方式</th></tr></thead><tbody><tr><td>迁移函数异常</td><td>回滚到迁移前</td></tr><tr><td>数据格式不匹配</td><td>尝试修复或跳过</td></tr><tr><td>存储空间不足</td><td>提示清理空间</td></tr><tr><td>超时</td><td>允许重试</td></tr></tbody></table><hr><h2 id="测试规范" tabindex="-1">测试规范 <a class="header-anchor" href="#测试规范" aria-label="Permalink to &quot;测试规范&quot;">​</a></h2><h3 id="迁移测试要求" tabindex="-1">迁移测试要求 <a class="header-anchor" href="#迁移测试要求" aria-label="Permalink to &quot;迁移测试要求&quot;">​</a></h3><table tabindex="0"><thead><tr><th>测试项</th><th>说明</th></tr></thead><tbody><tr><td>正向迁移</td><td>v(n) → v(n+1)</td></tr><tr><td>跨版本迁移</td><td>v1 → v(latest)</td></tr><tr><td>回滚测试</td><td>v(n+1) → v(n)</td></tr><tr><td>边界数据</td><td>空数据、极大数据</td></tr><tr><td>损坏数据</td><td>格式错误、缺失字段</td></tr></tbody></table><h3 id="测试数据准备" tabindex="-1">测试数据准备 <a class="header-anchor" href="#测试数据准备" aria-label="Permalink to &quot;测试数据准备&quot;">​</a></h3><ul><li><strong>MUST</strong> 为每个历史版本准备测试数据</li><li><strong>MUST</strong> 包含边界情况数据</li><li><strong>SHOULD</strong> 包含真实用户数据脱敏样本</li></ul><hr><h2 id="版本兼容矩阵" tabindex="-1">版本兼容矩阵 <a class="header-anchor" href="#版本兼容矩阵" aria-label="Permalink to &quot;版本兼容矩阵&quot;">​</a></h2><h3 id="支持的迁移路径" tabindex="-1">支持的迁移路径 <a class="header-anchor" href="#支持的迁移路径" aria-label="Permalink to &quot;支持的迁移路径&quot;">​</a></h3><table tabindex="0"><thead><tr><th>起始版本</th><th>目标版本</th><th>支持</th></tr></thead><tbody><tr><td>v1</td><td>v2+</td><td>✓</td></tr><tr><td>v2</td><td>v3+</td><td>✓</td></tr><tr><td>...</td><td>latest</td><td>✓</td></tr></tbody></table><h3 id="不再支持的版本" tabindex="-1">不再支持的版本 <a class="header-anchor" href="#不再支持的版本" aria-label="Permalink to &quot;不再支持的版本&quot;">​</a></h3><table tabindex="0"><thead><tr><th>版本</th><th>废弃日期</th><th>处理方式</th></tr></thead><tbody><tr><td>v0.x</td><td>2024-01</td><td>提示重新导入</td></tr></tbody></table><hr><h2 id="本章小结" tabindex="-1">本章小结 <a class="header-anchor" href="#本章小结" aria-label="Permalink to &quot;本章小结&quot;">​</a></h2><ul><li>所有存储数据必须带版本号</li><li>支持从任意旧版本增量迁移</li><li>迁移前自动备份，失败可回滚</li><li>每个迁移函数独立、幂等、可逆</li><li>完整的迁移测试覆盖</li></ul>`,68)])])}const u=s(e,[["render",l]]);export{b as __pageData,u as default};
