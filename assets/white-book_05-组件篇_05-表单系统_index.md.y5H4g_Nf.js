import{_ as t,c as p,o as l,ag as s,j as a}from"./chunks/framework.B0we9iV-.js";const b=JSON.parse('{"title":"第十六章：表单规范","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/05-组件篇/05-表单系统/index.md","filePath":"white-book/05-组件篇/05-表单系统/index.md"}'),e={name:"white-book/05-组件篇/05-表单系统/index.md"};function i(d,n,r,o,h,c){return l(),p("div",null,[...n[0]||(n[0]=[s(`<h1 id="第十六章-表单规范" tabindex="-1">第十六章：表单规范 <a class="header-anchor" href="#第十六章-表单规范" aria-label="Permalink to &quot;第十六章：表单规范&quot;">​</a></h1><blockquote><p>定义表单的状态管理、验证和反馈规范</p></blockquote><hr><h2 id="_16-1-表单状态机" tabindex="-1">16.1 表单状态机 <a class="header-anchor" href="#_16-1-表单状态机" aria-label="Permalink to &quot;16.1 表单状态机&quot;">​</a></h2><h3 id="整体状态" tabindex="-1">整体状态 <a class="header-anchor" href="#整体状态" aria-label="Permalink to &quot;整体状态&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>                          ┌─────────────┐</span></span>
<span class="line"><span>                          │   Pristine  │  ← 初始状态，未修改</span></span>
<span class="line"><span>                          └──────┬──────┘</span></span>
<span class="line"><span>                                 │ 用户输入</span></span>
<span class="line"><span>                                 ▼</span></span>
<span class="line"><span>                          ┌─────────────┐</span></span>
<span class="line"><span>          ┌──────────────►│    Dirty    │  ← 已修改</span></span>
<span class="line"><span>          │               └──────┬──────┘</span></span>
<span class="line"><span>          │                      │ 失去焦点或提交</span></span>
<span class="line"><span>          │                      ▼</span></span>
<span class="line"><span>          │               ┌─────────────┐</span></span>
<span class="line"><span>          │  修改   ┌─────│  Validating │  ← 验证中</span></span>
<span class="line"><span>          │         │     └──────┬──────┘</span></span>
<span class="line"><span>          │         │            │</span></span>
<span class="line"><span>          │         │     ┌──────┴──────┐</span></span>
<span class="line"><span>          │         │     ▼             ▼</span></span>
<span class="line"><span>          │         │ ┌───────┐    ┌─────────┐</span></span>
<span class="line"><span>          │         │ │ Valid │    │ Invalid │</span></span>
<span class="line"><span>          │         │ └───┬───┘    └────┬────┘</span></span>
<span class="line"><span>          │         │     │             │</span></span>
<span class="line"><span>          │         │     │ 提交        │ 修改</span></span>
<span class="line"><span>          │         │     ▼             │</span></span>
<span class="line"><span>          │         │ ┌───────────┐     │</span></span>
<span class="line"><span>          │         │ │Submitting │     │</span></span>
<span class="line"><span>          │         │ └─────┬─────┘     │</span></span>
<span class="line"><span>          │         │       │           │</span></span>
<span class="line"><span>          │         │ ┌─────┴─────┐     │</span></span>
<span class="line"><span>          │         │ ▼           ▼     │</span></span>
<span class="line"><span>          │         │ Success   Error   │</span></span>
<span class="line"><span>          │         │   │         │     │</span></span>
<span class="line"><span>          └─────────┴───┴─────────┴─────┘</span></span></code></pre></div><h3 id="字段级状态" tabindex="-1">字段级状态 <a class="header-anchor" href="#字段级状态" aria-label="Permalink to &quot;字段级状态&quot;">​</a></h3><p>每个表单字段 <strong>MUST</strong> 维护以下状态：</p><table tabindex="0"><thead><tr><th>状态</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>value</td><td>any</td><td>当前值</td></tr><tr><td>touched</td><td>boolean</td><td>是否被触摸过（获得过焦点）</td></tr><tr><td>dirty</td><td>boolean</td><td>值是否被修改过</td></tr><tr><td>validating</td><td>boolean</td><td>是否正在验证</td></tr><tr><td>errors</td><td>string[]</td><td>验证错误列表</td></tr></tbody></table><hr><h2 id="_16-2-验证规范" tabindex="-1">16.2 验证规范 <a class="header-anchor" href="#_16-2-验证规范" aria-label="Permalink to &quot;16.2 验证规范&quot;">​</a></h2><h3 id="验证时机" tabindex="-1">验证时机 <a class="header-anchor" href="#验证时机" aria-label="Permalink to &quot;验证时机&quot;">​</a></h3><table tabindex="0"><thead><tr><th>时机</th><th>触发条件</th><th>适用场景</th></tr></thead><tbody><tr><td>onChange</td><td>值变化时</td><td>即时反馈的字段</td></tr><tr><td>onBlur</td><td>失去焦点时</td><td>大多数字段的默认行为</td></tr><tr><td>onSubmit</td><td>提交时</td><td>最终校验</td></tr></tbody></table><p><strong>默认策略</strong>：</p><ol><li><strong>首次验证</strong>：onBlur（用户离开字段时）</li><li><strong>后续验证</strong>：onChange（已有错误时即时更新）</li><li><strong>最终验证</strong>：onSubmit（提交前完整校验）</li></ol><h3 id="验证类型" tabindex="-1">验证类型 <a class="header-anchor" href="#验证类型" aria-label="Permalink to &quot;验证类型&quot;">​</a></h3><h4 id="同步验证" tabindex="-1">同步验证 <a class="header-anchor" href="#同步验证" aria-label="Permalink to &quot;同步验证&quot;">​</a></h4><p>立即返回结果，用于：</p><ul><li>必填检查</li><li>格式检查（邮箱、数字等）</li><li>长度限制</li><li>正则匹配</li></ul><h4 id="异步验证" tabindex="-1">异步验证 <a class="header-anchor" href="#异步验证" aria-label="Permalink to &quot;异步验证&quot;">​</a></h4><p>需要网络请求，用于：</p><ul><li>地址格式验证（调用链服务）</li><li>余额检查</li><li>重复检查</li></ul><p><strong>异步验证规范</strong>：</p><ol><li><strong>MUST</strong> 显示验证中状态</li><li><strong>MUST</strong> 支持防抖（建议 300-500ms）</li><li><strong>MUST</strong> 取消过期请求</li><li><strong>SHOULD</strong> 验证中禁用提交按钮</li></ol><hr><h2 id="_16-3-核心表单规范" tabindex="-1">16.3 核心表单规范 <a class="header-anchor" href="#_16-3-核心表单规范" aria-label="Permalink to &quot;16.3 核心表单规范&quot;">​</a></h2><h3 id="_16-3-1-转账表单" tabindex="-1">16.3.1 转账表单 <a class="header-anchor" href="#_16-3-1-转账表单" aria-label="Permalink to &quot;16.3.1 转账表单&quot;">​</a></h3><p><strong>字段定义</strong>：</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>必填</th><th>验证规则</th></tr></thead><tbody><tr><td>toAddress</td><td>string</td><td>Y</td><td>非空 + 地址格式（异步）</td></tr><tr><td>amount</td><td>string</td><td>Y</td><td>非空 + 正数 + 余额检查（异步）</td></tr><tr><td>memo</td><td>string</td><td>N</td><td>最大 24 字符</td></tr></tbody></table><p><strong>状态机</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    TransferForm                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  State                                                   │</span></span>
<span class="line"><span>│  ├─ step: &#39;input&#39; | &#39;confirm&#39; | &#39;result&#39;                │</span></span>
<span class="line"><span>│  ├─ toAddress: { value, errors, validating }            │</span></span>
<span class="line"><span>│  ├─ amount: { value, errors, validating }               │</span></span>
<span class="line"><span>│  └─ memo: { value, errors }                             │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Transitions                                             │</span></span>
<span class="line"><span>│  ├─ input → confirm : 所有字段 valid                    │</span></span>
<span class="line"><span>│  ├─ confirm → input : 用户返回编辑                      │</span></span>
<span class="line"><span>│  ├─ confirm → result : 提交成功或失败                   │</span></span>
<span class="line"><span>│  └─ result → input : 用户重新发起                       │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>验证流程</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户输入地址</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>同步验证：非空</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ├─ 失败 → 显示&quot;请输入收款地址&quot;</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>异步验证（500ms 防抖）：调用 isValidAddress(address, chainId)</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ├─ 验证中 → 显示加载指示器</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ├─ 失败 → 显示&quot;地址格式不正确&quot;</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>      ▼</span></span>
<span class="line"><span>验证通过 → 清除错误</span></span></code></pre></div><hr><h3 id="_16-3-2-创建钱包表单" tabindex="-1">16.3.2 创建钱包表单 <a class="header-anchor" href="#_16-3-2-创建钱包表单" aria-label="Permalink to &quot;16.3.2 创建钱包表单&quot;">​</a></h3><p><strong>多步骤流程</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Step 1: 设置钱包锁（图案）</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Step 2: 展示助记词</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Step 3: 验证助记词</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Step 4: 选择区块链网络</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Complete: 创建成功</span></span></code></pre></div><p><strong>Step 1 字段</strong>：</p><table tabindex="0"><thead><tr><th>字段</th><th>验证规则</th></tr></thead><tbody><tr><td>patternLock</td><td>最少连接 4 个点</td></tr></tbody></table><p><strong>Step 3 验证</strong>：</p><p>随机选择 3 个位置，用户输入对应单词：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>请输入第 3 个单词：[输入框]</span></span>
<span class="line"><span>请输入第 7 个单词：[输入框]</span></span>
<span class="line"><span>请输入第 11 个单词：[输入框]</span></span></code></pre></div><p>验证规则：输入值 <strong>MUST</strong> 与对应位置的单词完全匹配</p><hr><h3 id="_16-3-3-导入钱包表单" tabindex="-1">16.3.3 导入钱包表单 <a class="header-anchor" href="#_16-3-3-导入钱包表单" aria-label="Permalink to &quot;16.3.3 导入钱包表单&quot;">​</a></h3><p><strong>字段定义</strong>：</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>验证规则</th></tr></thead><tbody><tr><td>secretInput</td><td>string</td><td>非空</td></tr><tr><td>secretType</td><td>enum</td><td>自动检测：mnemonic / privateKey / arbitrary</td></tr><tr><td>patternLock</td><td>string</td><td>最少连接 4 个点</td></tr></tbody></table><p><strong>多步骤流程</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Step 1: 输入助记词</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Step 2: 设置钱包锁（图案）</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Step 3: 选择区块链网络</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Complete: 导入成功</span></span></code></pre></div><p><strong>secretType 检测规则</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>输入内容</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─ 12/15/18/21/24 个空格分隔的单词 → mnemonic</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─ 0x 开头 + 64 个十六进制字符 → privateKey</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─ 64 个十六进制字符 → privateKey</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └─ 其他 → arbitrary（BFM 特殊密钥）</span></span></code></pre></div><p><strong>BFM 任意密钥说明</strong>：</p><p>BFM 链支持任意字符串作为密钥，不限于标准助记词格式。</p><ul><li><strong>MUST</strong> 使用多行文本输入框</li><li><strong>SHOULD</strong> 提示用户这是 BFM 特有功能</li></ul><hr><h2 id="_16-4-错误反馈规范" tabindex="-1">16.4 错误反馈规范 <a class="header-anchor" href="#_16-4-错误反馈规范" aria-label="Permalink to &quot;16.4 错误反馈规范&quot;">​</a></h2><h3 id="错误显示位置" tabindex="-1">错误显示位置 <a class="header-anchor" href="#错误显示位置" aria-label="Permalink to &quot;错误显示位置&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────┐</span></span>
<span class="line"><span>│ 标签名                     [必填] │</span></span>
<span class="line"><span>├─────────────────────────────────┤</span></span>
<span class="line"><span>│ [输入框]                         │  ← 输入区域</span></span>
<span class="line"><span>├─────────────────────────────────┤</span></span>
<span class="line"><span>│ ⚠ 错误信息                       │  ← 紧邻输入框下方</span></span>
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><h3 id="错误样式" tabindex="-1">错误样式 <a class="header-anchor" href="#错误样式" aria-label="Permalink to &quot;错误样式&quot;">​</a></h3><table tabindex="0"><thead><tr><th>元素</th><th>正常状态</th><th>错误状态</th></tr></thead><tbody><tr><td>输入框边框</td><td>中性色</td><td>红色（destructive）</td></tr><tr><td>错误文本</td><td>隐藏</td><td>红色小字</td></tr><tr><td>标签</td><td>中性色</td><td>红色（可选）</td></tr></tbody></table><h3 id="错误信息文案规范" tabindex="-1">错误信息文案规范 <a class="header-anchor" href="#错误信息文案规范" aria-label="Permalink to &quot;错误信息文案规范&quot;">​</a></h3>`,61),a("table",{tabindex:"0"},[a("thead",null,[a("tr",null,[a("th",null,"类型"),a("th",null,"格式"),a("th",null,"示例")])]),a("tbody",null,[a("tr",null,[a("td",null,"必填"),a("td",{字段名:""},"请输入"),a("td",null,"请输入收款地址")]),a("tr",null,[a("td",null,"格式"),a("td",null,"{字段名}格式不正确"),a("td",null,"地址格式不正确")]),a("tr",null,[a("td",null,"范围"),a("td",null,"{字段名}必须在 X 到 Y 之间"),a("td",null,"金额必须大于 0")]),a("tr",null,[a("td",null,"异步"),a("td",{具体原因:""}),a("td",null,"余额不足")])])],-1),s('<hr><h2 id="_16-5-表单提交规范" tabindex="-1">16.5 表单提交规范 <a class="header-anchor" href="#_16-5-表单提交规范" aria-label="Permalink to &quot;16.5 表单提交规范&quot;">​</a></h2><h3 id="提交按钮状态" tabindex="-1">提交按钮状态 <a class="header-anchor" href="#提交按钮状态" aria-label="Permalink to &quot;提交按钮状态&quot;">​</a></h3><table tabindex="0"><thead><tr><th>状态</th><th>条件</th><th>按钮显示</th></tr></thead><tbody><tr><td>disabled</td><td>有必填字段为空 或 有验证错误</td><td>禁用态</td></tr><tr><td>enabled</td><td>所有字段 valid</td><td>正常态</td></tr><tr><td>loading</td><td>正在提交</td><td>加载态 + &quot;提交中...&quot;</td></tr></tbody></table><h3 id="提交结果处理" tabindex="-1">提交结果处理 <a class="header-anchor" href="#提交结果处理" aria-label="Permalink to &quot;提交结果处理&quot;">​</a></h3><p><strong>成功</strong>：</p><ol><li>显示成功反馈（Toast 或 页面）</li><li>清空表单 或 导航到结果页</li></ol><p><strong>失败</strong>：</p><ol><li>显示错误信息（具体原因）</li><li>保留表单数据</li><li>提供重试选项</li></ol><hr><h2 id="_16-6-表单可访问性" tabindex="-1">16.6 表单可访问性 <a class="header-anchor" href="#_16-6-表单可访问性" aria-label="Permalink to &quot;16.6 表单可访问性&quot;">​</a></h2><h3 id="标签关联" tabindex="-1">标签关联 <a class="header-anchor" href="#标签关联" aria-label="Permalink to &quot;标签关联&quot;">​</a></h3><ul><li><strong>MUST</strong> 每个输入框有关联的 label</li><li><strong>MUST</strong> 使用 for/id 或嵌套关联</li></ul><h3 id="错误通知" tabindex="-1">错误通知 <a class="header-anchor" href="#错误通知" aria-label="Permalink to &quot;错误通知&quot;">​</a></h3><ul><li><strong>MUST</strong> 错误信息通过 aria-describedby 关联到输入框</li><li><strong>SHOULD</strong> 使用 aria-live 通知屏幕阅读器</li></ul><h3 id="焦点管理" tabindex="-1">焦点管理 <a class="header-anchor" href="#焦点管理" aria-label="Permalink to &quot;焦点管理&quot;">​</a></h3><ul><li><strong>MUST</strong> 验证失败时焦点移至第一个错误字段</li><li><strong>MUST</strong> 多步骤表单切换时焦点移至新步骤第一个输入</li></ul><hr><h2 id="本章小结" tabindex="-1">本章小结 <a class="header-anchor" href="#本章小结" aria-label="Permalink to &quot;本章小结&quot;">​</a></h2><ul><li>表单有完整的状态机定义</li><li>验证分同步/异步，遵循防抖策略</li><li>核心表单（转账、创建钱包、导入钱包）有详细规范</li><li>错误反馈遵循一致的位置和样式规范</li><li>提交按钮状态与表单状态联动</li></ul><hr><h2 id="下一章" tabindex="-1">下一章 <a class="header-anchor" href="#下一章" aria-label="Permalink to &quot;下一章&quot;">​</a></h2><p>继续阅读 <a href="./../06-交互规范/">第十七章：交互规范</a>。</p>',23)])])}const g=t(e,[["render",i]]);export{b as __pageData,g as default};
