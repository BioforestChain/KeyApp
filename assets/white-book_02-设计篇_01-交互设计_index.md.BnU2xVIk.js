import{_ as s,c as n,o as p,ag as l}from"./chunks/framework.B0we9iV-.js";const u=JSON.parse('{"title":"第四章：交互设计","description":"","frontmatter":{},"headers":[],"relativePath":"white-book/02-设计篇/01-交互设计/index.md","filePath":"white-book/02-设计篇/01-交互设计/index.md"}'),e={name:"white-book/02-设计篇/01-交互设计/index.md"};function i(t,a,c,o,d,h){return p(),n("div",null,[...a[0]||(a[0]=[l(`<h1 id="第四章-交互设计" tabindex="-1">第四章：交互设计 <a class="header-anchor" href="#第四章-交互设计" aria-label="Permalink to &quot;第四章：交互设计&quot;">​</a></h1><blockquote><p>定义信息架构、导航流程和页面结构</p></blockquote><hr><h2 id="_4-1-信息架构" tabindex="-1">4.1 信息架构 <a class="header-anchor" href="#_4-1-信息架构" aria-label="Permalink to &quot;4.1 信息架构&quot;">​</a></h2><h3 id="一级架构" tabindex="-1">一级架构 <a class="header-anchor" href="#一级架构" aria-label="Permalink to &quot;一级架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BFM Pay</span></span>
<span class="line"><span>├── 首页 (Home)           ← 默认落地页</span></span>
<span class="line"><span>│   ├── 钱包卡片</span></span>
<span class="line"><span>│   ├── 快捷操作</span></span>
<span class="line"><span>│   └── 资产列表</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── 历史 (History)</span></span>
<span class="line"><span>│   └── 交易记录列表</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>└── 设置 (Settings)</span></span>
<span class="line"><span>    ├── 钱包管理</span></span>
<span class="line"><span>    ├── 安全设置</span></span>
<span class="line"><span>    ├── 偏好设置</span></span>
<span class="line"><span>    └── 关于</span></span></code></pre></div><h3 id="二级页面" tabindex="-1">二级页面 <a class="header-anchor" href="#二级页面" aria-label="Permalink to &quot;二级页面&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>首页延伸</span></span>
<span class="line"><span>├── 发送 (Send)</span></span>
<span class="line"><span>├── 收款 (Receive)</span></span>
<span class="line"><span>├── 铸造 (Mint)</span></span>
<span class="line"><span>├── 代币详情 (Token Detail)</span></span>
<span class="line"><span>└── 钱包详情 (Wallet Detail)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>设置延伸</span></span>
<span class="line"><span>├── 钱包列表 (Wallet List)</span></span>
<span class="line"><span>├── 创建钱包 (Create Wallet)</span></span>
<span class="line"><span>├── 导入钱包 (Import Wallet)</span></span>
<span class="line"><span>├── 地址簿 (Address Book)</span></span>
<span class="line"><span>├── 语言设置 (Language)</span></span>
<span class="line"><span>├── 货币设置 (Currency)</span></span>
<span class="line"><span>├── 链配置 (Chain Config)</span></span>
<span class="line"><span>└── 应用锁 (App Lock)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>授权相关</span></span>
<span class="line"><span>├── 地址授权 (Authorize Address)</span></span>
<span class="line"><span>└── 签名授权 (Authorize Signature)</span></span></code></pre></div><hr><h2 id="_4-2-导航模式" tabindex="-1">4.2 导航模式 <a class="header-anchor" href="#_4-2-导航模式" aria-label="Permalink to &quot;4.2 导航模式&quot;">​</a></h2><h3 id="底部-tab-导航" tabindex="-1">底部 Tab 导航 <a class="header-anchor" href="#底部-tab-导航" aria-label="Permalink to &quot;底部 Tab 导航&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│           页面内容区域               │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│   🏠        📜         ⚙️          │</span></span>
<span class="line"><span>│  首页      历史       设置          │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><p><strong>设计决策</strong>：</p><ul><li>3 个 Tab，保持简洁</li><li>首页为默认选中</li><li>Tab 图标 + 文字，便于识别</li></ul><h3 id="栈式导航-stackflow" tabindex="-1">栈式导航 (Stackflow) <a class="header-anchor" href="#栈式导航-stackflow" aria-label="Permalink to &quot;栈式导航 (Stackflow)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>                    push</span></span>
<span class="line"><span>首页 ────────────────────► 发送页面</span></span>
<span class="line"><span>                    pop</span></span>
<span class="line"><span>首页 ◄────────────────────  发送页面</span></span></code></pre></div><p><strong>特点</strong>：</p><ul><li>原生 App 体验</li><li>支持手势返回</li><li>保留页面状态</li></ul><h3 id="底部弹窗-bottom-sheet" tabindex="-1">底部弹窗 (Bottom Sheet) <a class="header-anchor" href="#底部弹窗-bottom-sheet" aria-label="Permalink to &quot;底部弹窗 (Bottom Sheet)&quot;">​</a></h3><p><strong>使用场景</strong>：</p><ul><li>选择器（钱包、链、代币）</li><li>确认框（转账确认）</li><li>操作菜单</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│           页面内容                   │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ← 拖动条</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│         选择链                       │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ ◉ Ethereum                    │ │</span></span>
<span class="line"><span>│  │ ○ BSC                         │ │</span></span>
<span class="line"><span>│  │ ○ Tron                        │ │</span></span>
<span class="line"><span>│  │ ○ BFMeta                      │ │</span></span>
<span class="line"><span>│  └───────────────────────────────┘ │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_4-3-页面结构模板" tabindex="-1">4.3 页面结构模板 <a class="header-anchor" href="#_4-3-页面结构模板" aria-label="Permalink to &quot;4.3 页面结构模板&quot;">​</a></h2><h3 id="标准页面结构" tabindex="-1">标准页面结构 <a class="header-anchor" href="#标准页面结构" aria-label="Permalink to &quot;标准页面结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  ← 返回    页面标题      [操作按钮]  │  ← App Bar</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│           主要内容区域               │  ← Content</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│         [主要操作按钮]               │  ← Footer (可选)</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="表单页面结构" tabindex="-1">表单页面结构 <a class="header-anchor" href="#表单页面结构" aria-label="Permalink to &quot;表单页面结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  ← 返回    发送                      │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│  标签                                │</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ 输入框                         │ │</span></span>
<span class="line"><span>│  └───────────────────────────────┘ │</span></span>
<span class="line"><span>│  提示或错误信息                      │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│  标签                                │</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ 输入框                         │ │</span></span>
<span class="line"><span>│  └───────────────────────────────┘ │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │         确认发送               │ │</span></span>
<span class="line"><span>│  └───────────────────────────────┘ │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="列表页面结构" tabindex="-1">列表页面结构 <a class="header-anchor" href="#列表页面结构" aria-label="Permalink to &quot;列表页面结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  ← 返回    交易历史                  │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ 🔍 搜索                        │ │</span></span>
<span class="line"><span>│  └───────────────────────────────┘ │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  今天                                │</span></span>
<span class="line"><span>│  ├── 交易记录 1                      │</span></span>
<span class="line"><span>│  ├── 交易记录 2                      │</span></span>
<span class="line"><span>│  昨天                                │</span></span>
<span class="line"><span>│  ├── 交易记录 3                      │</span></span>
<span class="line"><span>│  └── ...                            │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_4-4-核心流程设计" tabindex="-1">4.4 核心流程设计 <a class="header-anchor" href="#_4-4-核心流程设计" aria-label="Permalink to &quot;4.4 核心流程设计&quot;">​</a></h2><h3 id="创建钱包流程" tabindex="-1">创建钱包流程 <a class="header-anchor" href="#创建钱包流程" aria-label="Permalink to &quot;创建钱包流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐</span></span>
<span class="line"><span>│ 设置钱包锁│───►│生成助记词│───►│验证助记词│───►│ 创建成功 │</span></span>
<span class="line"><span>└─────────┘    └─────────┘    └─────────┘    └─────────┘</span></span>
<span class="line"><span>     │              │              │</span></span>
<span class="line"><span>     ▼              ▼              ▼</span></span>
<span class="line"><span>  图案确认      显示/隐藏      3词验证</span></span></code></pre></div><p><strong>步骤指示器</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  ●────────○────────○</span></span>
<span class="line"><span> 图案      备份      验证</span></span></code></pre></div><h3 id="转账流程" tabindex="-1">转账流程 <a class="header-anchor" href="#转账流程" aria-label="Permalink to &quot;转账流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐</span></span>
<span class="line"><span>│ 输入信息 │───►│ 确认详情 │───►│ 验证钱包锁│───►│ 发送成功 │</span></span>
<span class="line"><span>└─────────┘    └─────────┘    └─────────┘    └─────────┘</span></span>
<span class="line"><span>     │              │              │</span></span>
<span class="line"><span>     ▼              ▼              ▼</span></span>
<span class="line"><span> 地址+金额     显示手续费     图案/指纹</span></span></code></pre></div><h3 id="dweb-授权流程" tabindex="-1">DWEB 授权流程 <a class="header-anchor" href="#dweb-授权流程" aria-label="Permalink to &quot;DWEB 授权流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  DApp 请求              钱包响应</span></span>
<span class="line"><span>      │                    │</span></span>
<span class="line"><span>      ▼                    │</span></span>
<span class="line"><span>┌───────────┐              │</span></span>
<span class="line"><span>│ getAddress│──────────────┼──► 弹出授权页</span></span>
<span class="line"><span>└───────────┘              │         │</span></span>
<span class="line"><span>                           │         ▼</span></span>
<span class="line"><span>                           │    选择授权范围</span></span>
<span class="line"><span>                           │         │</span></span>
<span class="line"><span>                           │         ▼</span></span>
<span class="line"><span>                           │    验证钱包锁确认</span></span>
<span class="line"><span>                           │         │</span></span>
<span class="line"><span>                           ◄─────────┘</span></span>
<span class="line"><span>                         返回地址数据</span></span></code></pre></div><hr><h2 id="_4-5-手势交互" tabindex="-1">4.5 手势交互 <a class="header-anchor" href="#_4-5-手势交互" aria-label="Permalink to &quot;4.5 手势交互&quot;">​</a></h2><h3 id="支持的手势" tabindex="-1">支持的手势 <a class="header-anchor" href="#支持的手势" aria-label="Permalink to &quot;支持的手势&quot;">​</a></h3><table tabindex="0"><thead><tr><th>手势</th><th>场景</th><th>行为</th></tr></thead><tbody><tr><td>左滑返回</td><td>所有次级页面</td><td>返回上一页</td></tr><tr><td>下拉刷新</td><td>首页、列表页</td><td>刷新数据</td></tr><tr><td>下滑关闭</td><td>底部弹窗</td><td>关闭弹窗</td></tr><tr><td>长按</td><td>地址文本</td><td>复制地址</td></tr><tr><td>双击</td><td>金额输入框</td><td>填入最大值</td></tr></tbody></table><h3 id="手势反馈" tabindex="-1">手势反馈 <a class="header-anchor" href="#手势反馈" aria-label="Permalink to &quot;手势反馈&quot;">​</a></h3><ul><li>滑动时有视觉位移</li><li>刷新时显示加载指示器</li><li>操作完成有触觉反馈（DWEB）</li></ul><hr><h2 id="_4-6-加载状态设计" tabindex="-1">4.6 加载状态设计 <a class="header-anchor" href="#_4-6-加载状态设计" aria-label="Permalink to &quot;4.6 加载状态设计&quot;">​</a></h2><h3 id="页面加载" tabindex="-1">页面加载 <a class="header-anchor" href="#页面加载" aria-label="Permalink to &quot;页面加载&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  ← 返回    代币详情                  │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│         ┌─────────────┐            │</span></span>
<span class="line"><span>│         │   ◠ ◡ ◠    │            │</span></span>
<span class="line"><span>│         │   加载中... │            │</span></span>
<span class="line"><span>│         └─────────────┘            │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="骨架屏" tabindex="-1">骨架屏 <a class="header-anchor" href="#骨架屏" aria-label="Permalink to &quot;骨架屏&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  ████████    ████                   │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ ████████████████████████████  │ │</span></span>
<span class="line"><span>│  │ ████████  ░░░░░░░░░░░░░░░░░░  │ │</span></span>
<span class="line"><span>│  └───────────────────────────────┘ │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│  ████ ░░░░░░░░░░   ████ ░░░░░░░░░  │</span></span>
<span class="line"><span>│  ████ ░░░░░░░░░░   ████ ░░░░░░░░░  │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="操作中状态" tabindex="-1">操作中状态 <a class="header-anchor" href="#操作中状态" aria-label="Permalink to &quot;操作中状态&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌───────────────────────────────────┐</span></span>
<span class="line"><span>│                                   │</span></span>
<span class="line"><span>│         ◠ ◡ ◠                    │</span></span>
<span class="line"><span>│                                   │</span></span>
<span class="line"><span>│       交易发送中...               │</span></span>
<span class="line"><span>│                                   │</span></span>
<span class="line"><span>│    请勿关闭页面                    │</span></span>
<span class="line"><span>│                                   │</span></span>
<span class="line"><span>└───────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_4-7-错误状态设计" tabindex="-1">4.7 错误状态设计 <a class="header-anchor" href="#_4-7-错误状态设计" aria-label="Permalink to &quot;4.7 错误状态设计&quot;">​</a></h2><h3 id="空状态" tabindex="-1">空状态 <a class="header-anchor" href="#空状态" aria-label="Permalink to &quot;空状态&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│           📭                        │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│        暂无交易记录                  │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│   完成您的第一笔转账后              │</span></span>
<span class="line"><span>│   交易记录将显示在这里              │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="网络错误" tabindex="-1">网络错误 <a class="header-anchor" href="#网络错误" aria-label="Permalink to &quot;网络错误&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│           📡                        │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│        网络连接失败                  │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│   请检查网络后重试                   │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>│       [重试]                        │</span></span>
<span class="line"><span>│                                     │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="表单错误" tabindex="-1">表单错误 <a class="header-anchor" href="#表单错误" aria-label="Permalink to &quot;表单错误&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  收款地址</span></span>
<span class="line"><span>  ┌───────────────────────────────┐</span></span>
<span class="line"><span>  │ 0x71C7656...                  │</span></span>
<span class="line"><span>  └───────────────────────────────┘</span></span>
<span class="line"><span>  ⚠️ 地址格式不正确</span></span></code></pre></div><hr><h2 id="本章小结" tabindex="-1">本章小结 <a class="header-anchor" href="#本章小结" aria-label="Permalink to &quot;本章小结&quot;">​</a></h2><ul><li>信息架构分 3 个一级入口，层级清晰</li><li>导航采用底部 Tab + 栈式导航 + 底部弹窗</li><li>页面结构有标准模板，保持一致性</li><li>核心流程设计注重用户引导</li><li>加载和错误状态设计完善</li></ul><hr><h2 id="下一章" tabindex="-1">下一章 <a class="header-anchor" href="#下一章" aria-label="Permalink to &quot;下一章&quot;">​</a></h2><p>继续阅读 <a href="./../02-视觉设计/">第五章：视觉设计</a>，了解视觉系统和品牌风格。</p>`,68)])])}const b=s(e,[["render",i]]);export{u as __pageData,b as default};
