请你阅读这个文件夹的源代码: `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay` (Angular + @bnqkl/framework)
生成`/Users/kzf/Dev/bioforestChain/KeyApp/PDR.md`（即「Product Requirement Document」文件）

---

我们的最终目的是使用 shadcnui 来复刻这个 MobileApp。并引入先进的AI软件工程经验，来做全自动的项目管理、开发、维护、测试、部署等功能。
我需要你确保PRD.md已经完全涵盖了 mpay 应用的各种功能和细节，确保AI基于这份文件，配合原版mpay的源代码，可以使用shadcnui对项目原有的功能，进行完整的复刻。

---

PDR文件不该包含过多的软件工程技术细节吧，反而应该专注于“用户故事”，列出所有的故事主线和可能存在的支线、还有异常处理逻辑。
还要包含对于用户心智的考量（基于行业经验与用户画像），确保用户可以发自直觉地去使用这个软件。

---

构建 scripts/build.ts 脚本，实现github-CD，满足我们 web/dweb 两种平台的编译输出

1. web版本直接部署到gh-page，同时在releases页面给出一份zip
   - 我们的vite的baseUrl使用`./`，允许部署在`https://aaa.com/`下，也能部署在`https://aaa.com/bbb/ccc`
   - 我们的 gh-page 页面。最终域名应该是`https://???.github.io/???/`，我希望挂载在`https://???.github.io/???/webapp/`下
   - 提供一个简单的dweb-download页面`https://???.github.io/???/dweb/download.html`，用于下载dweb版本的软件，链接是：`dweb://install?url=https://latest-release-url.zip`
2. dweb版本则是进行打包推送，参考这个代码：/Users/kzf/Dev/GitHub/chain-services/scripts/x-build-project.mts
   - 这里进行了vite编译、进行plaoc打包、然后还能根据特定配置上传到特定的服务器进行存储
   - 参考代码实现打包上传，同时也在releases页面给出一份zip

---

我们的build.ts脚本所实现的持续集成功能，其实默认生成的是“beta”渠道版本：

1. 这是每次git-push到main分支就会自动触发的。
2. beta版本的网页版链接应该是 `https://???.github.io/???/webapp-beta/`
   1. 也就是说“stable”版本仍然在`https://???.github.io/???/webapp/`，这个我们可能需要从github-release找最近的一个stable版本
   2. 如果要生成“stable”，那么需要本地执行`pnpm gen:stable`，这个脚本默认是在本地执行：
      1. 它的目的是更新版本号，生成changelog，这是一个交互式的命令。
      2. 首先检查一下是否为提交的代码，如果有，那么询问用户是否要继续，如果不继续，那么就结束，等用户提交好代码。否则就继续下一步。
      3. 首先更新package.json的版本号，然后同步更新manifest.json的版本号；
      4. changelog会被写道 manifest.json 中，同时也会在我们的`CHANGELOG.md`的内容前方插入最新的版本内容
      5. 这里的changelog是AI主动生成的，它需要读取上一个changelog的git-commit-hash（可以写在package.json中，也可以写在CHANGELOG.md中，反正能读取出来就行），然后和当前的HEAD进行比较。这里的提示词的重点，生成的CHANGELOG是面向普通用户的，而不是程序员。
         1. 首先要列出新增了什么功能
         2. 然后列出有哪些破坏性更新
         3. 接着列出有哪些bug修复
         4. 这里面有一点要注意，开发的时候，前一个git-commit可能修复了A，然后下一个commit可能又撤回了A的修复。如果看到这样的变更，要尤为注意，我们的changelog重点在阐述“最终的变更”，而不是枯燥地讲述中间的过程
         5. 使用 [tanstack-ai](https://tanstack.com/ai/latest/docs/api/ai) 来实现我们的 CHANEGLOG 自动生成（返回结构化信息）
         6. 基于变更内容，我们还需要让AI判断要变更哪个版本号，通常来说，只是修复bug只需要变更小版本号；新增功能或者破坏性变更，那么更新中版本号，如果是是重大重构的工作，那么就需要变更大版本号
      6. 有了changelog和version，然后把相关文件做一个提交，然后首先会为当前的代码打上一个tag。然后推送github。
      7. 这种release-tag会引发CD。

---

1. 我们需要vitepress作为我们页面的骨架
2. 不论是stable还是beta，默认都应该从github-release下载，如果下载不到，那么就使用本地构建的
3. download页面可以下载各种渠道的版本，目前有4个：webapp-stable/webapp-beta/dwebapp-stable/dwebapp-beta

---

所以我现在需要执行什么命令，才能在docs页面上，用上webapp？

---

我怎么感觉，baseUrl 被锁定成 KeyApp了？

---

然后还有一个问题，就是因为这个webapp是部署在 ??/KeyApp/webapp/ 这样的路径下，好像和url路由冲突了：
我打开 http://127.0.0.1:29100/gh-pages/webapp/，然后做了一下跳转，页面URL就成了：http://127.0.0.1:29100/send，
虽然不影响使用，但是刷新后肯定就错了。要么就改成用hash，要么就支持相对路径

---

```
•  本地开发 pnpm docs:dev → base = /
•  CI 构建 pnpm build:all → base = /KeyApp/
```

你的这个建议我没看懂，为什么本地和CI构建不能一致？你这样固定的话，别人fork之后就得改脚本了呀？不能相对路径吗？

---

还有，请你帮我的vitepress的页面实现和build一样的效果，这里的关键应该在于build模式下，我们需要将代码解压搬迁过来，
我的意思是通过配置vitepress的配置文件，也能做到同样的效果，或者说，
这些脚本本来应该通过 [vite config](https://vitepress.dev/reference/site-config#vite) 来配置不是吗。

也就是说启动vitepress的前提，就是先 build。

我希望你好好梳理一下逻辑和流程，这里面有很多流程节点是可以简化的

---

不知道你自己试过没有，现在启动后，链接是 http://localhost:5200/ ，然后点击立即使用，跳转到 http://localhost:5200/webapp/ ，结果是404

---

你查询一下context7，看看有没有相关的文档吧

---

等一下，你修改了相对路径？你有没有想过，虽然github-page的url是 https://org.github.io/repo_name, 但是别人如果自己配置域名，你这个方案是通用的吗？
我们使用相对路径，有什么问题吗？你为什么要改掉它？

---

阅读项目核心文件了解代码结构。然后阅读 https://github.com/ChesterRa/cccc/blob/main/README.zh-CN.md ，创建 PROJECT.md 和 FOREMAN_TASK.md

---

请你为我的项目配置Oxlint，而不是eslint：https://oxc.rs/docs/guide/usage/linter.html

---

这个PROJECT.md 文件，我感觉不如直接把 `TDD.md > PDR.md > SERVICE-SPEC.md > mpay 原始代码` 这些文件和文件夹注明就好。

---

这个 FOREMAN_TASK.md 文件，因为是定时器，所以我希望针对一种闭环行为的一个检查，现在的内容还是有点太杂乱了。
当下我们这个阶段是在迁移mpay的核心功能的阶段，所以闭环应该围绕：和mpay的功能有哪些出入，然后形成openspec-change。

我们的项目和mpay项目最大的差异在于：KeyApp是一个AI驱动开发的应用，它是全自动开发的。
而AI开发项目最大的问题：面对复杂问题AI会产生信息混乱，需要人类进行干预和优化。
而本项目解决这个问题的核心方案，就是分层+测试+多AI互相监督

1. 分层+测试的目的是为了避免表面的一个BUG是来自底层的某个组件导致的，这会导致问题难以调试和发掘。因此我们在TDD.md和SERVICE-SPEC.md中已经强调说明了如何组织管理这个项目
   1. 因此我们的所有组件都需要有严格的storybook测试
   2. 我们的serivce同样也要有严格的单元测试
   3. 我们的page都有严格的e2e测试与截图验证
2. 多AI互相监督 就是我们目前引入的这个cccc工具，因为AI上下文幻觉与长度限制的问题，我们需要确保page开发的AI不是重新发明component，而是使用我们组件库的component、我们需要确保AI不是在为了解决某个问题而钻牛角尖，而忘了我们的根本目标、我们要确保AI经常为了完成某项指标，而做了一些刻意的操作来绕过指标
3. openspec的目的是避免AI在多轮工作（自动压缩上下文）的时候会丢失信息，同时也是为了确保多AI协作有一个统一的信息源头

---

我发现一个奇怪的问题，就是github-page明明是正常打开的：`https://bioforestchain.github.io/KeyApp`，但是打开的一瞬间，我都看到内容加载进来了，然后立刻跳转到404。我觉得跟路由配置有很大的关系。是不是因为我们用了相对路径去做编译的？但我之所以这样配置，目的是担心别人fork了项目，或者想在自己本地启动这个项目，能因为相对路径所以可以灵活将这个网站挂载到任何地方。但是好像路由不是很理解这个逻辑，路由好像是直接拿整个path去做判断的，不知道我说的对不对。

---

请将storybook挂在我们的gh-page中，并在首页提供入口

storybook有一些类型错误，但是 `pnpm typecheck` 检查不到

发现一个奇怪的问题，就是github-page明明是正常打开的：`https://bioforestchain.github.io/KeyApp`，但是打开的一瞬间，我都看到内容加载进来了，然后立刻跳转到404。我觉得跟路由配置有很大的关系。是不是因为我们用了相对路径去做编译的？但我之所以这样配置，目的是担心别人fork了项目，或者想在自己本地启动这个项目，能因为相对路径所以可以灵活将这个网站挂载到任何地方。但是好像路由不是很理解这个逻辑，路由好像是直接拿整个path去做判断的，不知道我说的对不对。

---

我们需要一种新的溢出滚动显示的组件，参考这个代码：`/Users/kzf/Dev/GitHub/jixoai-labs/openspecui/packages/web/src/components/path-marquee.tsx`。
请你参考这个代码，做成一个叫做 MarqueeText 的组件。这种组件可以用来渲染一些非常关键的不可省略的文本，比如 ChainName。实现这个组件之后，请将它用在该用的地方：完善我们的基础组件库。
完成后请你整理这次提案的相关代码并提交

---

TASK：实现shadcnui的升级

我升级了shadcnui，参考项目：/Users/kzf/Dev/bioforestChain/t/start-app

我需要你继续帮我升级：

1. 图标替换成 tabler ，我已经替换了少部分，你参考这继续完成剩下所有的替换，完成后移除lucide
2. 使用shadcnui的基础组件（`src/components/ui`）作为我们所有组件的基础（包括`src/components/common`组件）的基础
3. 完成 2 后，确定 baseui 完全替代 radix-ui 后，彻底移除 radix-ui
4. 阅读参考项目的代码，将它好的部分继续迁移到我们项目中。
5. 重新评估所有e2e的截图，注意现在很多e2e的截图不是移动端的尺寸，我们有限考虑移动端的场景。
6. 不断精进调整样式，直到可访问性最佳
7. 更新我们的代码以外的文件，确定shadcnui的升级彻底完成
8. 然后继续朝着我们的**短期核心目标**前进
   1. 特别关注目前主页底部4个tab的作用是什么？
   2. bioChain生态的用户能否用这个钱包完成基础的使用？

---

对于多语言的测试,我建议使用通用脚本来实现,这样能一劳永逸地可靠地分析出是否存在未翻译的内容,对此你有什么建议吗?先和我讨论

---

所有的页面,都需要以一种规范的方式引入 safe-area, 包括 top/left/right/bottom
目前看来, 我们基于PageHeader解决 safe-area-top 的问题,但远远不够.
safe-area不单单是浏览器的`env(safe-area-inset-<pos>)`这么简单, 还有考虑页面嵌套组件注入等因素带来的影响.

---

git-worktree: 更新我们的 AGENTS.md/CLAUDE.md/PROJECT.md/FOREMAN_TASK.md ,因为我们有了白皮书,可以完全替代 TDD.md/PDR.md/SERVICE-SPEC.md 这些旧版文件了.

1. 我需要你阅读旧版文件后,确定白皮书已经可以完全替代这些旧文件,并且更新.
2. 然后删除旧版文件
3. 更新AGENTS.md/CLAUDE.md/PROJECT.md/FOREMAN_TASK.md,确保新的文档指向我们的白皮书
4. 开发任何任务之前, 都需要首先更新白皮书, 然后再去撰写openspec展开具体工作

---

git-worktree: 我们 pr15 虽然解决了i18n的问题,但是我还是发现很多地方存在一些异常,比如:

1. 你可以搜索“a11y.tabTransfer”,这个页面好像用了错误的写法
2. 还有文件 `src/stackflow/components/TabBar.tsx`,这个tab页面是不是通过配置逃过的制裁?
3. 还有你可以检查`pnpm i18n:check`发现仍然存在很多问题

---

有些页面存在“假数据”, 对于假数据,除非我们主动使用mokeService,否则不应该使用.
mockService可以提供一整套的本地service, 提供各种mock数据, 用于开发和测试.我们甚至需要为mockService提供一些工具:包括接口+GUI
请你首先调查一下假数据的问题,做出统一的修复,并且在我们的白皮书中更新规范,确保后续的工作能遵循这个规范不要犯错.
然后我们考虑一下mockService, 它是我们进行调试的一个重要入口, 这个系统对外的任何操作, 都可以在这个mockService上捕获然后返回.

---

我来规范一下mock Service的“统一GUI”.

1. 使用一种统一的`export const mockMeta = defineMockMeta(...)`的方式进行导出
   - 这里要充分利用zod-v4来进行各种类型约束与编程, 目的是基于这些元信息来自动展示表单GUI
2. 统一GUI可以实时显示出各种mockService的请求调用
3. 统一GUI会提供一种“Debug工具栏”,如果打开,配合过滤器,可以实现拦截某个函数/请求,然后可以修改它的input或者output

---

我有更好的方案, 我们的services 中,其实都有一个 types.ts 的定义文件,它其实可以和我们的mockMeta进行融合.
我的意思是,我们的所有service定义,都可以完全重构:

1. 我们首先需要在types中完成对service的完整定义

```ts
export const xxxServiceMete = defineServiceMeta((s) =>
  s
    .method({ name: '', description: '', args: z.array([z.object({})]), output: z.object({}), async: false }) //
    .getset({ name: '', description: '', type: z.object({}), output: z.object({}) })
    .api({ name: '', description: '', input: z.object({}), output: z.object({}) }) // 一种类似method的“异步函数”
    .stream({ name: '', description: '', input: z.object({}), yield: z.object({}), return: z.object({}) }) // 一种可以订阅的事件流,可以理解成异步迭代器
    .build(),
);
```

2. 基于这份定义,我们再去实现 dweb/web/mock 三种平台

```ts
export const xxxService = xxxServiceMete.impl({
  // 根据类型推断,在这里完成所有的定义,这样可以确保三个平台始终一致被types约束
});
```

3. 再次基础上,再去实现我们的 mock,只需要从 xxxServiceMete 入手,我们引入一种“中间件”的设计模式:

```ts
xxxServiceMete.use((req, next) => {
  // service req: call/get/set/subscript/stream 等等
  return next();
});
```

---

我看你开发dweb的service很多时候用了TODO,其实dweb是web是web的超集,因此绝大部分时候都和web公用service.
相反的是,dweb平台有一些额外的的能力是web平台没有的. 那些才是web需要去模拟或者TODO的.

---

1. 你的界面结构设计理论上可以, 但是要考虑移动端, 响应式成 上下排列.
2. 拦截规则和我想的差不多,但是你这个“触发时机”我不是很理解,对于调用者来说好像没什么差别, 这里的关键是“动作类型”, 这里我的想法是“多选”,主要分为3类: 整体控制(延迟或者暂停)、输入控制(篡改值、固定值)、输出控制(篡改值、固定值、异常).
3. 拦截规则的动作类型,底层其实是一种“自定义编程”, 所以理论上能切换到一种“code”面板,看到“多选”后的代码. 但是目前我们不实现“自定义”代码,只是让用户看到生成的代码是什么
4. 你考虑了 object 生成表单,这个可以用在输入值和输出值的篡改; 同时你也要知道非 object也能生成这个表单,还有这个表单的复杂点在于“Array”类型, 还有一些特定的构造函数的值. 不论如何,在表单和代码面板一样重要,因为表单只能解决简单需求,复杂需求使用代码面板会更好

---

关于表单生成规则,你只考虑了大部分情况, 但是要考虑特殊情况,比如自定义构造函数: z.instanceof(MyCtor) ,这种情况也需要做一定的适配,因为这种构造函数我们是大概率不知道参数类型是什么,所以需要提供一个代码面板来支持编辑.还有非json类型的,比如 z.function ,需要传递回调函数.
这些复杂情况可能需要考虑将原始的输入作为一个“引用”. 我们在做篡改的时候,更多时候是在原本引用值的基础上做修改.
你再考虑一下UI要怎么设计

---

我的考虑是, 我们需要更加紧凑且简单的方式. 还记得chrome开发者工具的面板吗? 它提供了一种基于代码的断点,在断点上可以注入表达式.我们的输入控制和输出控制,本质上也算是一种“固定位置的断点”

---

我们现在需要逐步清理界面上的假数据, 开发真实的Service, 使得我们的项目向正式可用正式上线更进一步.
绝大部分工作从mpay项目搬迁代码即可.
我需要你查看我们的项目代码, 列出一份代办清单.

---

1. P0 - 转账功能 (核心功能)
   - 连接 BioforestTransactionService 到转账 UI
   - 实现真实的余额获取和转账提交
2. P0 - 交易历史 (核心功能)
   - 连接 BioforestTransactionService.getTransactionHistory()
   - 显示真实交易记录
3. P1 - 货币汇率
   - 完善 Frankfurter provider
   - 在 UI 中显示法币价值
4. P2 - UI/可访问性检查

---

1. 你需要充分参考mpay的代码, 我们目前还是在“搬迁”代码到新架构阶段
2. 不要迷信新架构的代码, 有任何怀疑, 就在 `.chat/`目录下留下留言md文件,我会去查阅,但并不意味着你需要停止. 你主要的目标就是实现mpay已有的功能, 这方面不用再过问
3. Open questions: 提案和实现通常可以一起; 主要先解决 BFM/原生币 的功能, 至于ETH等功能, 不及,但理论上应该是可以一起的, 而且这也能同时验证我们service都合理性

---

1. 我无法导入助记词,导致我无法测试转账
2. 从“Wallet Management”进入钱包详情, 我点击删除钱包, BottomSheet出来了, 然而BottomSheet中存在秘密输入框,这导致页面存在严重的抖动问题. 我不知道如何解释这个问题, 那种效果类似: BottomSheet背后的页面在重新进入, BottomSheet试图和它保持一个正确的定位, 每一帧都在重新计算一个正确的位置. 我怀疑是stackflow的问题? 请检查一下

等你修复了这些基本功能并合并到主分支,我再做验证（bfmeta 转账/历史/TransferTab）

---

1.  我还是没看到动画效果; 我是在首页这个钱包资产页面看我的数字的.
2.  字体仍然是加粗的;
3.  还有,既然你封装了 AnimatedNumber ,那么请你确保这个组件的可访问性,这点非常重要,现在我在可访问性面板看到的是 `image:10000.11465` 这样的效果.

---

梳理一下我们的工作, 然后按需多次提交, 接着开PR 合并到我们主分支.

---

还有你的 balanceRefreshTimes 方案, 我觉得太粗糙太简陋了, 我们的service中,没有“实时”更新的理念吗? 所有跟时间有关的service,都应该有推送更新的理念啊.
基于这个理念,页面会按需订阅,然后你再去做轮询,或者如果第三方接口支持订阅,那么就更好了

---

1. 同意,先编写白皮书,记录这些规范。
2. 然后将白皮书的roadmap独立拆分出来,在我们的AGENITS.md中将它标记成必读内容.未来我们将正式引入verssion驱动的roadmap+changelog
3. 你刚的两个PR都没有通过检查,无法合并到main请先确保合并到main分支了再开始工作

---

我看到我们现在的测试,很多时候还在依赖“明文”,这在我们这套架构中是非常不规范的, 我们的项目是国际化的, 因此必须警惕直接使用“文本搜索”来寻找页面上的元素, 最好的方案就是提供 `data-testid`.
请你先记录这个最佳实践规范到白皮书中,然后开始检查修复我们的e2e测试

---

我需要你编写一个 `scripts/agent-readme.ts` 脚本, 目的是为AI提供一个统一的输出所有必读项目内容.
照理来说,我们只需要一个 AGENTS.md 或者 CLADUE.md 即可,但是我们为了避免重复编写文档的问题. 我们首先必须正确归类我们的所有资料信息, 所以有了现在的白皮书, 同时我们的白皮书目录还是动态生成的.
所以我需要你编写这个脚本, 将我们的必读内容罗列出来, 让AI只需要执行一次这个脚本就可以一次性获得所有的资料.

---

开始之前,先和合并pr#38

任务一:
把现有的 `"e2e": "playwright test"` 改成 `"e2e:all": "playwright test",`.
然后编写一个脚本: `scripts/e2e.ts`, 用来作为`e2e`的入口, 其作用是:

1. 要求必须传递至少一个spec文件, 如果不传递会列出当前的可用的spec文件列表
2. 之所以要这做, 是因为现在文件越来越多了, 我们必须考虑这些编译、测试的时间成本.

任务二:
我们的CI/CD配置需要包含i18n的检查

任务三:
我计划引入 turborepo, 以提高我们的构建和测试速度.
请你专门开一个PR来完成这项任务: 首先让我们的 test/e2e/i18n 用上 turborepo ,看速度提升了多少.
然后再考虑引入 build

---

我配置了一台 self-hosted runner. 我们的github-actions可以试着用它:`runs-on: self-hosted`, 看看整体的速度会不会有所提升

---

这里有些任务在我的self-host的机器上理论上是可以跳过的,比如node/pnpm等环境的安装,但是因为我们有fallback,我想做的是
能不能针对我这台macos配置一套快速启动执行CICD的,我可以去把环境尽可能全面地准备好.我的目的是加速,然后如果这台macos下线了
再fallback成github自己的集群,去做pnpm-setup等准备工作

---

还有,为什么我刚才跟你说:去github-project创建任务,然后你生成我的issues并没有关联到我们的github-project.是`pnpm agent`
没有提供这个能力吗?还是说有提供,但是因为提示记同的问题导致你没有遵循?

---

警告1:

```
Stackflow - Some plugin overrides an "initialActivity" option. The "initialActivity" option you set to "MainTabsActivity" in the "stackflow" is ignored.
```

警告2:

```
[refreshBalance] No adapter for chain: bfchainv2
```

警告3:

```
An error occurred in the <SendPage> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.
```

---

接下来修复SendPage暴露出来的错误.

```
SyntaxError: Cannot convert 102531.02649070 to a BigInt (at use-send.logic.ts:38:19)
    at BigInt (<anonymous>)
    at canProceedToConfirm (use-send.logic.ts:38:19)
    at use-send.ts:121:12
    at updateMemo (react-dom-client.development.js:8795:19)
    at Object.useMemo (react-dom-client.development.js:26484:18)
    at exports.useMemo (react.development.js:1251:34)
    at useSend (use-send.ts:120:22)
    at SendPage (index.tsx:76:104)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:25904:20)
    at renderWithHooks (react-dom-client.development.js:7662:22)

The above error occurred in the <SendPage> component.

```

注意,这个问题说明了一些更加深层次的问题, 我们应该如何优化我们的接口甚至是架构的设计, 才能从长期根治这个问题: 我的意思是,如果一个小白来维护这个代码, 也能发自直觉地去解决这个问题.
我的想法是, 我们不应该直接使用 number|string 去表达我们的amount, 而应该有一种专门的构造函数 Amount, 它自带一些元数据, 例如精度, 单位等. 让我们整个项目都去依赖这个Amount对象去展开所有跟资金有关的计算与操作.

---

我希望的效果是更加彻底的:service接口提供的数据,只要涉及到金额都用Amount.理论上最好的效果就是amount在整个个上下文中去传递
只有需要显示成某种格式的时候才会调用amount的format/stringify去得到string|number,否则在内存中,程序看到的应该都是amount这个对象

`Amount.from` 只会发生在service内部和我们的component内部(比如amount-input返回的值就是Amount而不是string|number)

请你作为一个软件工程专家, 深入理解,然后给出一份工作任务

---

1. 你ci里面的这个 checks, 不能和 ci-fast/ci-standard 一样,给一个 checks-fast / checks-standard 吗?
2. 我们的cd是否也可以做和ci同样的优化?提供一个 cd-fast, 尽量充分利用我们本地的机器. 来提升速度

---

我试着做了bfchainv2网络的转账,发现了几个问题:

1. 转账确认时弹出的BottomSheet还是“好像”不是Stackflow的BottomSheet, 我觉得核心原因是我们的通用组件库中还是有 `src/components/layout/bottom-sheet.tsx`, 倒是一些残留的旧代码还在使用. 我个人建议的解决方案是:
   1. 将 `src/components/layout/bottom-sheet.tsx` 改成对 `@stackflow/plugin-basic-ui : BottomSheet,BottomSheetProps` 的包装导出, 好处是我们可以统一在这里做一些扩展和风格化的定制.
   2. 将项目中所有用到`@stackflow/plugin-basic-ui : BottomSheet`的地方,全部改成丛 `src/components/layout/bottom-sheet.tsx`去导入
   3. 将项目原本用到`src/components/layout/bottom-sheet.tsx`的地方,全部改成SheetActivity
   4. 目前所有的 SheetActivity 全部放在`src/stackflow/activities/sheets`这个地方,这是不好的, SheetActivity应该跟随页面或者业务走:
      1. 业务文件加使用`*Job`命名:如果多个页面共享了某个 SheetActivity ,那么说明它们有共同的业务,那么这个SheetActivity就应该跟随业务走;
      2. 页面文件夹和页面同名,使用`*Activity`命名
2. 同理 `src/components/ui/alert-dialog.tsx` 也是需要类似的改造:
   1. 我们需要`src/components/layout/modal.tsx`+`src/components/layout/alert-dialog.tsx`来提供统一的弹出层和弹窗
   2. 命名规范参考 SheetActivity
3. 我点击确认转账后,弹出一个密码确认框, 输入密码后,点击确认, 没反应, 交易也没有发起. 理论上应该发起交易,然后弹窗显示成后续的流程,比如签名、上链、成功或者失败. 像BioChain生态还有二次密码(字符密码)输入之后才能正确签名. 但是目前这些流程都没有,说明对于mpay 的相关代码还没有正确迁移,service相关的开发也不够完善,配套的e2e测试流程也不够完整.
4. 我的账号缺失是有交易的,但是交易列表页面却没有查询出我的交易.

---

我们现在的bioChain的转账一直无法正常工作, 为此我配置了一个测试账号: `.tmp/test-doc-for-bio-tran.md`

你需要实现的是:

1. 能查询出真正的交易往来
2. 能配置 bioChain 专属的支付密码
3. 能正确发起转账, 并且能正确查询出“最低手续费”
4. 在真实网络中使用测试账号完成测试并走通所有需求后, 完善对应的mockService
5. 在mockService基础上, 完成e2e的全流程测试(配套全流程截图). 这个非常非常重要

在开始之前,你可以询问我一些问题,等确定之后,就不能再询问我,你需要一直工作到所有任务完成,并且将所有的PR合并到主分支,并且对应的issues、project-task都清理完毕.
等到所有工作完成到可以正式上线的产品级别, 才能通知我进行验收.

---

我已经阅读了测试账号配置和现有代码。在开始之前,我需要确认以下几个关键问题:
需要确认的问题

1. BioForest Chain API
   - 当前rpcUrl配置是什么?(我需要知道正确的API地址)
   - API的交易查询格式是否有文档?(当前代码中的/wallet/{chainId}/transactions/query 是否正确)

2. 支付密码功能范围
   - "配置bioChain专属的支付密码"是指:
     A) 只需要在转账时验证已有的支付密码
     B) 还需要提供设置/修改支付密码的功能
3. 最低手续费 API
   - SDK中有 getTransferTransactionMinFee 方法,但需要确认这个返回的是真正的链上最低手续费还是固定值?
   - 是否需要调用链上API获取实时手续费?
4. e2e 测试方案
   - e2e测试是使用 mock模拟还是需要连接测试网?
   - 截图需要覆盖哪些场景?(我建议:发起转账、输入支付额密码、确认、成功/失败结果)
5. 其他测试账号
   - 测试账号中提到"其它测试账号:(请你自己创建)",我需要创建第二二个账号用于接收测试转账吗?
   - 测试网上是否可以获取测试币?

请确认以上问题,我将根据你的答复制定完整的实施计划关并一次性完成所有工作。

---

- 1.1. 你自己不是一直在用吗?就是https://walletapi.bffmeta.info,这个没错,所有bioChain都用这个 https://vwalletapi.bfmeta.info就行了
- 1.2 你应该自己去查阅mpay的代码,那是一个正式的产品,有很多你需要的答案,问我是问不完的
- 2. 不是钱包的密码,是bioChain自己有一个"二次签名",我们称它为支付密码,设置二次签名是需要发起一笔链上的交易才能设置可我者修改的mpay代码中应该有一些答案,或者 sign-util这个包也会有一些相关的API
- 3. 用SDK提供的,它是根据体积和交易类型去计算的, 用户当然可以去修改成更高的
- 4. e2e测试使用 mock 模拟,但前提是你已经走通了真实的“所有功能”,你才能写出正确的mock
- 5. 是的你自己用我们现有的这些代码自己去创建, 然后从我给你的测试账号里面去接受转账, 转来转去来形成交易, 同时也要测试交易能否正常被订阅刷新. 你可能无法使用浏览器,但是你可以用临时的 playwright 脚本去做这些测试去做验证. 我给你的都是真实的网络真实的权益,但是并不多, 但也足够你测试数几百次了.

---

区块链通常情况下,底层的轮询是依靠“高度”去触发更新的, 我们目前是各个services自己去轮询. 这本身没问题, 但是会因为考虑轮询的成本,所以要控制在30s一次.

我的意思是. 我们不排除个别区块链可能存在一些特殊的机制: 比如还没出块,但是返回的交易列表中可能存在一些“队列中”的数据.
但是不论如何, 至少在 bioChain的api是很普通的,返回的就是已经上链的数据.

因此我们可以对bioChain对订阅做优化:

1. 我们统一轮询“lastBlock”接口,10s甚至5s一次,甚至我们可以智能一点,根据前面几个区块的出块时间, 预测出出块时间.
   - 核心算法我已经实现在 `.tmp/yuce.ts` 中, 你需要的是将它对接到我们项目中:
   1. 配置一套基于indexedDB的存储服务, 并运行在Worker中
   2. 实现一套 通用的预测service
   3. bioChain的区块Service, 内置配置一套能实现 bioChain 出块预测的虚拟数据生成器, 基于获取创世区块和最近的一个区块, 来模拟生成200条数据, 能实现对接预测service(第一次创建发现如果没有数据, 那么虚拟数据生成器工作, 然后导入这些虚拟数据)
2. 当lastBlock的signature 发生变化(注意不是height, 考虑分叉问题可能高度没变, 但是签名是唯一的肯定会变)bioChain相关的订阅也就能去更新了:比如可以去加载最新的余额、最新的交易列表

---

1. #102 还未合并
2. 转账还未通过
3. 目前这个版本的交易列表还是没有加载出来
   - 之前有一次开发过程中有成果加载出来交易列表,但是样式存在严重的问题, 字体的粗细、颜色 都不符合规范
4. 设置支付密码还未测试, 同时也还未测试设置支付密码之后的转账

---

1. `pnpm agent` 的多种功能,需要改进成通过“子命令”的方式来开启
2. 新增一个子命令`worktree`:
   1. create:就是到.git-worktree创建工作空间, 这里创建出来后,要顺便执行依赖安装,还有把我们的`.env.local`文件复制到新工作空间中
   2. delete:就是删除.git-worktree创建出来的某个工作空间中, 删除之前要使用gh命令检查一下分支是否有对应的pr,pr有没有合并. 如果检查有问题应该停止, 除非`--force`
   3. list:列出创建的工作空间,同时附带branch、pr+status 等信息
3. 更新 `pnpm agent` 相关的工作流的提示词

---

在 新增钱包/导入钱包 的最后一步,应该默认提供一个“选择区块链网络”, 这是一个二级结构:

1. 第一级是“技术选择”,第二级是具体的网络选择
2. 比如用户可以勾选 “生物链林”,等于批量勾选了“BFChainV2”、“BFMeta”、“CCChain”等等, 同理“ETH”、“Tron”等等也是如此. 我们这里默认勾选“生物链林”

否则现在进来就默认是 ETH, 会令新手用户困惑.

这个勾选其实类似于“收藏”的功能:
我们现在的网络切换列表不算多但也不少,但未来还会更长,所以这个列表其实应该是类似一个可以搜索的列表,顶部是用户收藏的链.

---

1. 我建议你统一找一下所有 chainId 的引用,我不知道你这个 chainId 是什么概念, 是chainName?magic? 总之我觉得很奇怪, 是遗留问题吗?
2. 之前发生的问题如果重复发生, 那么大概率是 sdk 的封装不到位, 或者你有封装却没有去正确使用它.
3. 不论如何, 以上都是我们这次巨大变更残留下来的问题, 我们需要在完成所有的基础工作(流程走通了)之后, 好好整理一下我们的代码, 提高它们的质量, 做好封装、做好重复利用

---

tansfer页面的交易列表样式存在严重的问题, 字体的粗细、颜色 都不符合规范、交易类型对应的中文也不对. 比如“设置安全密码”, 被显示成“质押”

---

我们的“内部SDK”,要封装出一套“订阅”接口,并作为我们的基本规范来使用
我看你很多时候哦还是在直接使用我们内部的bio-sdk来开发界面上的功能,这和我们之前预设的不一样,sdk是用来开发我们的chain-adapter的才对,
然后我们的chain-adapter应该要提供各种“use\*”的hook,来提供实时订阅的功能.

```md
区块链通常情况下,底层的轮询是依靠“高度”去触发更新的, 我们目前是各个services自己去轮询. 这本身没问题, 但是会因为考虑轮询的成本,所以要控制在30s一次.

我的意思是. 我们不排除个别区块链可能存在一些特殊的机制: 比如还没出块,但是返回的交易列表中可能存在一些“队列中”的数据.
但是不论如何, 至少在 bioChain的api是很普通的,返回的就是已经上链的数据.

因此我们可以对bioChain对订阅做优化:

1. 我们统一轮询“lastBlock”接口, 5s甚至2s一次, 未来我们可以更加智能, 但是目前可以用这种暴力轮询的方式.
2. 当lastBlock的signature 发生变化(注意不是height, 考虑分叉问题可能高度没变, 但是签名是唯一的肯定会变)bioChain相关的订阅也就能去更新了:比如可以去加载最新的余额、最新的交易列表
```

---

关于统一轮询“lastBlock”接口我们可以升级更智能: 根据前面几个区块的出块时间, 预测出出块时间.

- 核心算法我已经实现在 `.tmp/yuce.ts` 中, 你需要的是将它对接到我们项目中:

1. 配置一套基于indexedDB的存储服务, 并运行在Worker中
2. 实现一套通用的预测service
3. bioChain的区块Service, 内置配置一套能实现 bioChain 出块预测的虚拟数据生成器, 基于创世区块中时间信息高度信息和最近的一个区块的时间信息高度信息, 来模拟生成200条数据, 能实现对接预测service(第一次创建发现如果没有数据, 那么虚拟数据生成器工作, 然后导入这些虚拟数据),随着时间地推移, 我们会不断提供真实的数据. 来提高预测准确度
4. 注意,不同的链网络都是不一样的预测器
5. `use*`现在将只是使用我们service提供的订阅功能,而不是自己去轮询更新了,我们的service内置一整套实时监听的能力

---

只有正式产品的console需要被移除,另外其实我不建议不直接移除所有的console,我们应该有一个logger-provider,来实现按需打印内容.  
但这是未来的任务,你可以记录到 github-project-task中.

还有,我刚才手动运行了你最后做的那个e2e, 有问题: 最后的带字符密码的转账, 先点击确认后,
并没有出现“广播成功”、“上链成功”的卡片,反而是在安全密码输入的地方显示了:“转账失败”

还有,把所有的“支付密码”, 改成“安全密码”. 注意,要和“钱包密码”区分开来, 钱包密码统一改成“钱包锁”, 动作叫做: “解锁钱包”

---

bioChain的钱包的安全密码是这样的工作的:

1. 你在进入这个钱包的时候, 就应该去根据交易类型, 去查询是否有设置过“安全密码”: 注意,这本质上是一个“订阅行为”,订阅查询最后一条“设置安全密码的交易记录”
2. 你需要拿到这里面的 “安全密码公钥”, 这意味着后续的所有交易签名的面板弹出的时候,都需要判断是否存在这个“安全密码公钥”,如果有,就需要用户输入“安全密码”
3. 基于“安全密码公钥”, 可以实时检测“安全密码”是否输入正确, 正确了才能做下一步: “签名交易”

---

把“钱包锁”改成是一个九宫格的连线输入而不是密码框输入,这样就不会出现“请输入钱包锁”这种文字了,而是“请设置钱包锁”.
要求至少连接4个点. 请你做这个组件的时候,尽量做好可访问性的支持,它本质其实就是一堆 checkbox, 只不过被渲染成九宫格,然后用滑动手势的方式来勾选这些checkbox. 当然我只是跟你解释这个可访问性的本质是什么.
具体的开发请你根据最好的使用提体验来做.
这个改动可能会比较大.

---

底部的“分享”功能,点击了应该复制的是一个url,现在只是复制了hash.
我们需要在我们的 `default-chains.json`的`explorer` 字段中新增:`queryTx`和`queryAddress`
比如我们的bfmeta网络的交易详情的浏览器链接应该是:
queryTx:`https://tracker.bfmeta.org/#/info/event-details/:signature`
queryAddress:`https://tracker.bfmeta.org/#/info/address-details/:address`
queryBlock:`https://tracker.bfmeta.org/#/info/block-details/:height`

---

需要完善我们的测试, 并发对中文英文两种同时进行测试, 从而避免AI开发的时候可能会忘记最佳实践, 直接在测试中使用了当前的语言环境去写测试.
使用双语测试可以有效检测出这类问题.

---

1. 导入钱包页面也要有 钱包锁的流程,目前没有
2. 导入钱包页面的返回不是返回,而是直接导航到首页,请你检查一下是否还有其它类似的问题, 统一修复
3. 目前设置页没有对应的的“启用网络”的功能,应该在钱包管理下面加一个 管理页面的入口吧

---

1. `Unknown route: /settings/wallet-chains` 说明你自己e2e测试都没通过.
2. 这个问题仍然没有修复:“使用WalletLock做验证的时候: 第一次输入错误的手势, 此时应该显示红色错误信息,然后过一会儿重置状态,让用户重新输入.”

---

1. send页面,要能显示当前账户的地址(发送者地址)
2. 钱包锁的修改要支持两种方案: 一种就是现在这种输入旧版密码, 一种是直接输入助记词

---

1. 点击网络手续费,都应该要能进行修改, 比如字符的确认面板, 或者设置安全密码的面板 ,都会展示“最低网络手续费”.
2. “设置安全密码的面板”中,会有一行小字:“BioForest Chain” ,这里应该换成“链”的图标+“地址”
3. mpay中有一整套关于链的图标,我们需要一整套统一的方案来渲染它

---

1. FeeEdit 功能建议使用Modal(stackflow 的 Modal ), 我们需要提供一种 PromptModal/FormModal(基于Modal,提供数据回传能力) 来支持这种能力
2. 我们的AddressDisplay组件是否支持chainName/chainIcon? 可以考虑优化AddressDisplay,或者在AddressDisplay的基础上封装出一种新的 复合组件
3. “链 SVG 图标系统” ,这里要和我们的“default-chains.json”进行关联, 从这个 default-chains.json 中来提供链图标, 然后进入 到我们的 service 体系中. 一定不可以将图标和我们的 service 进行强关联耦合.
   - 请到这里文件夹`/Users/kzf/Dev/bioforestChain/legacy-apps/apps/btg-meta/src/components/icon/assets/images` 来复制图标.
   - 这些是 Token图标, 在bio生态中, chainIcon就是使用 main-token 的 icon. mainToken 就是你 配置文件中的 symbol 字段
   1. 请你梳理这些图标的命名, 使得更好管理, 或者用文件夹进行重新归类
   2. 我们有了chainIcon,还需要有tokenIcon或者叫做symbolIcon, 同样的逻辑进行改造:升级配置文件(不用枚举所有token的图标,只需要给一个文件夹路径即可), 升级组件, 提供`Context+Provider`
   3. tokenIcon要有一个fallbackUrl的能力,我们默认在本地 public 文件夹中提供了一些知名的流行的token,但是也需要提供一个网络版本的链接:`"https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/{chain_short_name}/icon-{TOKEN_NAME}.png"`
      - 这些图标是来自我们自己维护的github仓库的目录: https://github.com/BFChainMeta/fonts-cdn/tree/main/src/meta-icon
      - 有了这个图标库+fallback机制,我们可以不更新APP的情况下,尝试从网络获取图标, 如果还是没有才进一步fallback成代码生成的样式

---

我发现有一些情况下, i18n的key会指向一个不存在的key,导致界面渲染出非正常文本.
目前的`i18n:check`检查不出这种问题, 有什么建议吗?

---

使用 yargs 统一重构 `pnpm agent`和子命令
