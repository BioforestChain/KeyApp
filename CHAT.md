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

---

我需要你强化提示词:

1. 建议把提示词改成英文.
2. 目前的流程里面没有关于 openspec 的命令, 我要的效果是:
   1. worktree 提供工作目录
   2. white-book 提供项目记忆(长期记忆)
   3. openspec 提供短期记忆(工作计划)
   4. github-project 提供记忆的综合管理, 并行能力(多任务协同进行、项目管理)
3. 但是目前既然没有openspec ,而且 github-project 也提供了一定的spec管理能力, 我的想法是,把openspec的规范和github-project做深度的融合.
   1. 首先你要知道 openspec 提供了三种核心工具: spec(新增一个提案)、apply(开始提案工作)、archive(提案归档)
   2. 我要你把 openspec 的工作逻辑理解清楚,请你参考 https://github.com/Fission-AI/OpenSpec/ 源代码
   3. 我们最终的效果,应该是用 github-issues + github-project-task 来承载 OpenSpec 的文件(比如spec文件、tasks文件、design文件等等),
      请你深入了解后,给出一份计划

---

我要的效果是这样的工作流:

1. 用户(我或者另一个AI、或者是社区的某个普通人或者贡献者)先提出一个问题或者需求
2. AI 和我讨论之后,一遍调查代码和白皮书,一边按需询问用户,最终明确了要需求
3. 然后AI做好计划+撰写白皮书,和用户确认后开始工作(并不确认就回到步骤2)
   - 用户主要看的是白皮书的变更内容, 因为工作计划涉及到一些细节的东西, 用户可能对此并不熟悉.
   - 当然像我这类核心贡献者还是会看具体的工作计划.
4. AI开始编程, 这个期间可能遇到一些意料之外的问题, 需要回去找用户进一步发起讨论, 根据结果进一步对计划做出补充和调整
5. AI完成任务, 提交PR, 如果检查通过等待用户进行验收审核. 如果检查不通过就继续
6. 用户验收通过, AI讲PR合并到main分支. 结束这轮工作

我的疑问是, github-project/issues 如何渗入这个流程中, 为这个流程提供“状态”存储, 从而实现一个无状态AI可以在任意一个步骤去恢复, 并延续工作

---

开始一个新任务: 实现完整的二维码扫描功能.
要求:

1. 高性能高可用的实现
   - 充分利用多线程, 或者WebGPU 等新特性
2. mock需要支持将单张图片,或者视频,或者多张图片作为输入流来处理
   - 本质是将内容绘制到canvas中, 封装一个 Native级别的组件,来让扫描能获取到帧信息进行处理
3. 需要可靠性测试: 生成二维码, 然后对二维码做一些处理, 配合mock来验证可用性

---

优化名片 的样式,然后使用 snapdom 来实现DOM的截图下载
https://snapdom.dev/
注意按需导入, 导入和生成截图需要时间,这个时间内下载按钮处于loading状态

---

我们需要一种开源的头像生成器, 来完善我们的联系人头像功能

---

新任务: 阅读白皮书中关于“暗色模式”的内容, 查阅源码,调查文档, 得出一份更加健全的“暗色模式”最佳实践规范, 然后践行它:

1. 使用oxlint插件来开发一些检查工具
2. 完善白皮书
3. 修复所有页面的暗色模式最佳实践
4. 将规范带到 CI 检查,更新相关的工作流提示词

---

合并tabs中的“首页”、“钱包”、“转账”三个页面.

1. “转账”页面主要展示的是一个交易列表页面
2. “钱包”页面主要展示的是钱包列表页面

把这两个页面合并到“首页”中,并统一称为“钱包”:

做两层Tab:

1. 钱包卡片 是一个tab,能滑动切换不同的钱包
   1. 这里钱包的样式要能模拟“卡片”的风格,并且有炫酷的效果, 有立体精致的质感, 最好能跟随重力传感器运动和运动, 运动还能有不同角度的反光
   2. 能展开钱包列表, 整理钱包的顺序
   3. 每个钱包还能自定义主题色, 直接影响我们的primary颜色
      - 这需要对globals.css做重构优化, 将和primary颜色有关的颜色(比如chart、sidebar-primary 等改成 color-mix)
   4. 这里还能有设置入口,能对单个钱包进行设置:也就是我们的`/wallet/*`页面
2. 下方是当前钱包的信息, 两个tab `[资产]  [交易]`

---

1. 卡片参考这个[DEMO代码](https://codepen.io/jh3y/pen/EaVNNxa) 我要这里的“防伪效果”. 就是使用每个链的 logo 转化成无色后去做图形平铺, 显示炫光来实现防伪的效果
2. 重力感应要轻微的, touch也可以影响卡片, 二者可以叠加
3. 建议引入 swiper, 达到最好的效果

---

1. 优化一下 getThemeHueForWallet 相关的一些上层函数, 直接破坏性更新: 强制添加一个 themeHue 属性. 确保wallet默认要有这个属性. 不要随机生成, 利用钱包的助记词去做稳定. 但是在创建、导入的过程中,可以修改,并预览我们的钱包卡片.
2. 在设置页面, 新增一个按钮: 清空应用数据. 点击弹出警告(stackflow 的 Modal). 点击就清理localStorage/sessionStorage/indexedDB的所有数据

---

对于清理应用数据的功能, 改版:在设置页面, 新增一个入口“存储空间”, 进去后显示一个存储配额的信息:“基于navigator.storage.estimate()”
然后再提供一个清理数据的按钮

---

因为indexedDB被open后存在占用的问题,导致清理数据会一直卡着.
所以我们需要有一个专门的清理页面 clear.html, 跳转到这个页面(基于baseUri), 然后这个页面执行清理作用.
完成之后在跳回 baseUri

---

首页钱包的左上角的按钮要始终显示, 否则没办法添加钱包.

---

做theme选择的时候,除了几个预设的color.还有一个点要注意:

1. 预设的color必须和当前已有的wallet的hub做规避.用一种趋避算法来改变我们随机的权重.可以理解成把360中颜色改成一个len=360的数组,这个数组有对应的命中权重。我大概这个意思,具体实现你可以自己思考
   - 注意 ,第一个颜色, 不随机, 是用这个 助记词/密钥 hash出来的颜色
2. 仍然需要提供一个完整的色条,可以让用户随意拖拽选择颜色,精度可以到0.1
3. 这个卡片和最终完成后的卡片样式并不完全一样
4. 我发现恢复钱包,缺少选择链网络这个步骤。应该在完成链网络选择之后,来到这个theme变更器这里,这样就能看到地址了.卡片的样式就能保持一直了

---

这个页面可以和钱包详情页(`/wallet/`)进行深度融合. 变成一个新版的“钱包详情页”.

1. 这个页面有一个特性, 就是有两个模式: 一种是 edit-mode, 另一种是 default-mode
2. edit-mode 就是用在 创建/导入 到最后一步, 这一步只能编辑钱包的名称, 只能修改钱包的配色. 并且配色选择器自动展开
3. default-mode 就是卡片的右上角,点击“设置”按钮进入后的模式, 这时候会看到 卡片, 同时还能看到三个按钮: 编辑、导出助记词、删除

---

1. 路由要做出修改,因为两个页面进行了融合.
2. 相关的e2e测试要进行整改.
3. 最后检查旧版的文件要清理干净
4. 因为是重构,不考虑向下兼容,会有大量破坏性更新,要做好全面的测试和检查

---

1. 这个页面不再需要展示 所有的链地址. 而点击 卡片的链选择器,要和首页一样,出现BottomSheet选择器. 检查这个选择器中的地址显示是不是没有AddressDisplay组件?
2. 这个页面的编辑模式就是通过点击“编辑”按钮来实现的

---

1. create.tsx 和 recover.tsx 顶部的steps进度条,最后一步渲染成彩虹, 用来代表最后一步 WalletConfig 是在做风格化. 也意味着到这步已经成功了. 激活状态意味着采用缓慢流动
2. ThemeConfig的确定按钮, 的 --primary-hue 跟着试试变动的 themeHub 一起设置
3. BUG:ThemeConfig的卡片看不到chain的logo水印

---

issues:

1. 目前KeyApp只对接了bio生态的接口,还没对接其它Web3生态的接口
2. 对于bio生态的对接,只正确对接了bfmeta的, 其它的链有点错误.具体查看 `/Users/kzf/Dev/bioforestChain/legacy-apps/libs/wallet-base/services/wallet/*/`

tasks:

1. 先完成bio生态的所有链的对接
2. 再完成 binance/bitcoin/ethereum/tron 的对接

---

我想到一个方案,这个效果,如果纯粹使用canvas来实现,其实是很简单的,因为它其实就是绘制一些纹理,然后做滤镜叠力.
并且这些叠加在原生的canvas中都已经支持.把所有的成本控制在一个canvas中.

前期我们可以用最简单的方案:canvas进行实现。
等我验收好效果了,我们还可以做两种优化:

1. offscreenCanvas,这个现代浏览器已经全面支持
2. CSS PaintingAPI,这个目前只有Chromium内核支持,它比offscreenCanvas更加轻量,并且能完美适配我们要的效果.理论上也会更加省电

---

很好, 原本的省电模式那些优化项还在吗?  
还有什么低成本高收益的优化方案?

1. 能否引入动态刷新? 就是参数没变化的情况下, raf可以跳过重绘, 你有做吗?
2. BUG: 频繁的WalletConfigActivity会引发创建、销毁, 有时候就创建不出来了? 底层可能有一些冲突问题.

有了动态刷新,我们就能引入"摩擦力"的理念了.
在移动设备上,我们监听了传感器去同步卡片的效果。
摩擦力的概念就是:要做到如果一段时间低运动(放在桌上3s传感器仍然会接收到微弱的桌面抖动,但是非常微弱)那么就进入静止阶段. 此时过滤掉轻微的抖动.
直到比较大的抖动,会进入滑动摩擦的阶段,这时候是灵敏的. 和目前完全实时的效果一样.
当然,我们还响应了手势,所以手的触摸也会打破静止阶段.

这里对于“微弱”的判定,我个人的建议是:取决于我们特效的算法, 你可以参考我们的算法,如果可能的光影运动超过了10pt(只是一个例子), 那么就算打破静止阶段.

---

现在要开发一套基于iframe的小程序. 入口也是在底部tab中, 就叫做“生态”. 图标用 IconBrandMiniprogram

1. 需要一套小程序开发使用的 sdk, 参考 web3 的 dapp 标准
   - 包含 client-sdk 以及 server-provider, KeyApp 本身就是 server-provider, 提供了授权地址信息、交易签名、发起转账等基本功能
   - dapp 用的是 `window.ethereum`, bio生态的, 则是用 `window.bio` 来作为 client-sdk-api, 同时仍然需要提供一套ts-sdk,来提供类型安全的开发体验
2. mpay之前有做过类似的能力, 但是基于 dweb(power by dweb-browser) 提供的基座, 你可以参考它的代码, 未来同样要将这个 server-provider 提供给 dweb, 这样 dweb-browser 生态的应用,不需要iframe也可以和KeyApp沟通.
3. 前期需要通过内置的两个小程序来验证技术的可行性
   1. 同样在这个仓库里面开发，直接通过编译发布到 public 文件夹
   2. 需要在设置中提供一个“小程序可信源”，这是一种订阅技术。目前就通过一个 public/生态.json 来提供本地这两个小程序。这意味着需要一种基于 json 的订阅标准，可以将多个源混合在一起展示在“生态”页面中
4. 小程序一：一键传送
   - 本质就是用用bio生态的账号,进行某种认证签名,然后再提供bio生态的另外一个地址, 这个小程序的后端会将前者的资产转移到后者上
   - SDK需要一种的能力,来选择当前地址.
   - SDK需要一种“WalletPicker”的能力,来选择“另外一个地址”.
   - SDK需要提供签名能力
5. 小程序二：锻造
   - 本质就是用户用eth的账号向某个地址转账, 然后生成bio生态的token,到他的bio生态的地址中

目前首要的任务是把这个小程序的架构相关的任务启动. 写好白皮书、做好任务计划、搭建项目、搭建前端DEMO与各种测试、完善自动化脚本和流程

---

1. 生态页面的滑动方向有问题, 现在是从左往右滑动切换到“我的”, 手势反了
2. “发现”页面的“推荐”栏, 横向滑动会导致事件冒泡, 触发“发现/我的”切换
3. 发现页面的应用,点击后应该是打开应用详情,而不是进入应用

---

我们的 KeyApp 的vite.config.ts 中要同步启动我们的”所有内置应用“:
dev模式的工作原理是:

1. 通过findPort技术,找到可用的随机端口
2. 用这个端口启动我们所有的内置的 miniapps
3. 拦截 public/ecosystem.json, 篡改其中的`miniapps/{APPNAME}`的所有链接

同理你可以推理出build模式的工作原理.
我不知道你是否有做完整的build脚本,你可以考虑一下我的方案.

---

1. 关于 ecosystemStore “可信源”, 它的管理方式应该是参考 SSR 的订阅原理, 设置页面可以配置多个可信源头, 然后我们将在本地获取缓存这些源的数据到本地. 注意,目前对于“订阅源”的支持还非常简单, 只是做了非常简单的全部列出, 其实应该只做部分列出, 然后在列出的列表中, 为每一项打分: 推荐分(官方评分)、热门分(社区评分). 二者综合分作为“精选”. 然后还可以提供一个“特定的搜索接口”, 可以用来搜索 “订阅列表” 意外的应用.
2. 直接补齐 bio_signTransaction, 准确来说应该还包含 createTransation, sign只是createTransation的其中一步. 这些是必要的,不可偷懒的
3. appId 最新命名规范为 `xxx.xx.xx...`, 这必须和官网保持“相对一致”,比如“my-app.domain.com”,那么appId就必须是`com.domain.my-app`,之所以要这样,是避免appId的盗取和覆盖问题.
   - 但是要完成这点, 必须去下载 https://github.com/daangn/stackflow/tree/main/extensions/plugin-history-sync 源代码, 我们需要在我们自己的 `packages/plugin-navigation-sync` 中维护自己的版本, 其中的改进就是: 使用`npm:urlpattern-polyfill`替代`npm:url-pattern`,因为后者已经不再维护,还有`npm:react18-use`理论上也可以废除.
   - 另外之所以我要自己维护, 目的是为了未来能升级成使用。navigation-api 来作为底层支持
4. 关于build,统一在KeyApp的vite.config.ts中直接完成工作闭环, 使用插件系统来实现.

---

1. 评分综合分 可以基于日期来进行动态加权,比如第一天是 15/85, 第二天是 30/70, 用+15(一个常量)的方式进行循环,也就是 15,30,45,60,75,90,5,20,35...
2. 远程搜索协议返回的内容可以是`{version:string,data:MiniappManifest[]}`,确保返回数据的结构版本一致. 另外,固定搜索只能用 GET. 配置方法类似浏览器中配置搜索引擎的格式`http://www.bing.com/search?q=%s`
3. appId 校验策略 可以宽容,对于不合法的,做警告并跳过就好.

---

我们已经有PR了, 你可以提交, 然后看看CI是否正常.
然后同时继续以下的工作(根据图片修复):

1. 08-multi-wallet-picker, walletMiniCard没有看到 chainIcon, 这是预期之中吗?
2. 13-permission-request, 我看到“测试小程序”,图标也是临时的,这是符合预期的吗? 如果是e2e测试, 应该是使用真实的miniapps数据才对,也就是我们内置的miniapp才对
3. authorize-chain-selector-network 是残留的图片吗?
4. authorize-wallet-selector-main 地址授权中,这里有正确是用WalletSelector吗?
5. 17-miniapp-detail-permissions 显示了页面详情,这里存在markdown内容的渲染,需要支持,但是请使用最保守的支持, 要剔除不安全的外部内容、剔除图片、视频、链接等信息
6. forge 和 teleport 虽然可以使用我们自己的keyapp的组件库,但是作为miniapp应该尽量充分炫酷, 使用 aceternity ui 的组件优化页面, 当然, 这些本身是“功能小程序”,在满足功能的同时,把界面做炫酷,把动画做炫酷,是非常有意义的.

工作过程中, 充分利用e2e: 编写测试来获得截图. 查看截图来来获得客观的认知. 基于客观的认知推进工作

---

1. “生态” 页面,请记住最后tab,应用重启后能默认选中最后的tab
2. 同样的, 当前钱包的 themeHub 也要默认记住, 用用重启后从 localStorage中读取themeHub立刻应用, 然后才是从加载的当前钱包中应用themeHub.

---

# TODO

---

forge 和 teleport 虽然可以使用我们自己的keyapp的组件库,但是作为miniapp应该尽量充分炫酷, 使用 aceternity ui 的组件优化页面, 当然, 这些本身是“功能小程序”,在满足功能的同时,把界面做炫酷,把动画做炫酷,是非常有意义的.

这两个小程序的原始需求是:

```md
4. 小程序一：一键传送
   - 本质就是用用bio生态的账号,进行某种认证签名,然后再提供bio生态的另外一个地址, 这个小程序的后端会将前者的资产转移到后者上
   - SDK需要一种的能力,来选择当前地址.
   - SDK需要一种“WalletPicker”的能力,来选择“另外一个地址”.
   - SDK需要提供签名能力
5. 小程序二：锻造
   - 本质就是用户用eth的账号向某个地址转账, 然后生成bio生态的token,到他的bio生态的地址中
```

目前的问题:

1. 现在forge页面是报错的,你做类型检查看一下.一键传送的效果也非常糟糕.
2. 样式的留白、布局排版、字体大小, 都有非常多的改进空间.

注意事项:

1. 如果要看效果,直接运行e2e测试来获得截图, 截图不够就补充e2e测试. 然后基于截图去分析
2. 默认情况下,你只能修改miniapps文件夹下的文件. 对于其它文件的权限是 readonly. 如果有需要, 必须和我请示

---

我们需要彻底重构“发现/我的”:

1. “生态/发现” 页面,现在是类似于“IOS”的“负一屏”, 顶部这个带search的bigHeader只属于“发现”页面, 因为是“负一屏”,所以仍然可以左右滑动来切换
2. “生态/我的” 页面请把它用最严苛的标准去实现IOS桌面的模拟, 最好是IOS-26, 包括长按菜单(右键菜单)的效果. 目前的效果非常粗糙,样式也很一般.
3. “生态/我的” 顶部, 有一个“搜索框”,点击就是直接滑动到“负一屏”,也就是发现页面, 并自动聚焦顶部的搜索输入框
4. 底部的Tab按钮,现在会跟随“发现/我的”两个页面的切换而切换,如果是“我的”,那么图标换成“IconBrandMiniprogram”,文字还是“生态”不变

---

我需要你提供一份标准的 miniapp-start-template 项目,把它放在 packages 文件夹下, 并提供cli来做到快速创建一个miniapp的模板, 提供丰富的 cli-options 来实现定制化, 特别是要绑定 shadcnui-create: 例如: `pnpm dlx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=mira&baseColor=neutral&theme=neutral&iconLibrary=hugeicons&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=vite" --template vite`

可变参数:

- style:
  - Vega: The classic shadcn/ui look. Clean, neutral, and familiar.
  - Nova: Reduced padding and margins. for compact layouts.
  - Maia: Soft and rounded, with generous spacing.
  - Lyra: Boxy and sharp. Pairs well with mono fonts.
  - Mira: Compact. Made for dense interfaces.
- baseColor:
  - Neutral
  - Stone
  - Zinc
  - Gray
- theme:
  - Neutral
  - Amber
  - Blue
  - Cyan
  - Emerald
  - Fuchsia
  - Green
  - Indigo
  - Lime
  - Orange
  - Pink
- Icon Library:
  - Lucide
  - Tabler Icons
  - Hugelcons
  - Phosphor Icons
- font:
  - Inter: Designers love packing quirky glyphs into test phrases.
  - Noto Sans: Designers love packing quirky glyphs into test phrases.
  - Nunito Sans: Designers love packing quirky glyphs into test phrases.
  - Figtree: Designers love packing quirky glyphs into test phrases.
- radius:
  - Default
  - None
  - Small
  - Medium
  - Large
- Menu Accent
  - Subtle
  - Bold
- template
  - start: TanStack Start
  - vite

完成后, 更新白皮书

---

基于我们的gen-icon工具,为create-miniapp提供 logo处理功能. 并在项目中提供logo更新脚本.

默认配置 启动屏幕,启动屏幕不是应用内的,是我们keyapp提供的. 检查keyapp是否提供这个功能,白皮书是否有介绍
另外,create-miniapp是否默认提供了 zh/en 两种国际化语言?  
是否有默认提供storybook+vite可以进行真实DOM测试的实例脚本?  
是否有默认提供e2e测试与截图生成、管理、检查标准?  
是否有默认提供vitest测试的实例?  
是否有默认提供oxlint和配套对应的插件

---

新开一个worktree进行工作:
这是之前已经完成的一个pr:

```md
现在要开发一套基于iframe的小程序. 入口也是在底部tab中, 就叫做“生态”.

1. 需要一套小程序开发使用的 sdk, 参考 web3 的 dapp 标准
   - 包含 client-sdk 以及 server-provider, KeyApp 本身就是 server-provider, 提供了授权地址信息、交易签名、发起转账等基本功能
   - dapp 用的是 `window.ethereum`, bio生态的, 则是用 `window.bio` 来作为 client-sdk-api, 同时仍然需要提供一套ts-sdk,来提供类型安全的开发体验
2. mpay之前有做过类似的能力, 但是基于 dweb(power by dweb-browser) 提供的基座, 你可以参考它的代码, 未来同样要将这个 server-provider 提供给 dweb, 这样 dweb-browser 生态的应用,不需要iframe也可以和KeyApp沟通.
3. 前期需要通过内置的两个小程序来验证技术的可行性
   1. 同样在这个仓库里面开发，直接通过编译发布到 public 文件夹
   2. 需要在设置中提供一个“小程序可信源”，这是一种订阅技术。目前就通过一个 public/生态.json 来提供本地这两个小程序。这意味着需要一种基于 json 的订阅标准，可以将多个源混合在一起展示在“生态”页面中
4. 小程序一：一键传送
   - 本质就是用用bio生态的账号,进行某种认证签名,然后再提供bio生态的另外一个地址, 这个小程序的后端会将前者的资产转移到后者上
   - SDK需要一种的能力,来选择当前地址.
   - SDK需要一种“WalletPicker”的能力,来选择“另外一个地址”.
   - SDK需要提供签名能力
5. 小程序二：锻造
   - 本质就是用户用eth的账号向某个地址转账, 然后生成bio生态的token,到他的bio生态的地址中

目前首要的任务是把这个小程序的架构相关的任务启动. 写好白皮书、做好任务计划、搭建项目、搭建前端DEMO与各种测试、完善自动化脚本和流程
```

以上pr已经完成,接下来,我们需要开始正式对接这两个小程序的后端.

---

具体的信息需要阅读文件: (会话 2025年12月29日.pdf)[/Users/kzf/Dev/bioforestChain/KeyApp/.chat/会话 2025年12月29日.pdf]

我需要你调查会话中的资料,然后生成两篇独立的research文档,也是放在.chat目录下,客观地记录调查结果.
research资料的目的是确保能分别完成这两个小程序的后端功能对接.

另外调查过程中如果遇到什么问题,也将问题记录到research文档中,我会替你去向后端提供商进一步咨询这些问题.

持续调查,直到两篇research文档全部完成.

---

我们会同时开启两个AI在两个独立的worktree中分别工作,
你是其中一个AI,你的任务是《一键传送》,阅读[接口报告](.chat/research-miniapp-一键传送-backend.md),开始完成 minapps/teleport

---

我们会同时开启两个AI在两个独立的worktree中分别工作,
你是其中一个AI,你的任务是《锻造》,阅读[接口报告](.chat/research-miniapp-锻造-backend.md),开始完成 minapps/forge

---

worktree new task:

1. 修复小程序的启动屏幕: 现在不是立刻显示
   1. 将启动屏幕封装成独立的组件,并进行 单元测试、真实DOM测试、集成测试
   2. 将小程序的“桌面”的渲染方案提供给启动屏,因为这种方案更加柔和,不会出现一大片的色块,而是将颜色作为光晕,所以效果更容易令人接受
2. 优化小程序启动的动画效果: 模拟macos应用启动立刻全屏化的特效
   1. 不再使用Stackflow的Activity去展示小程序, 而是使用在我们的“生态页”的“发现|我的”这两个Tab页后,增加一个“应用堆栈”
   2. “应用堆栈”如果没有激活的应用,那么是不能滑动过去(Slider滑动),属于禁用状态. 当我们打开小程序,那么它有了应用,就可以使用了.
   3. 此时的“启动特效层”是两层:
      1. 底层是生态Tab页的Slider滑动
      2. 顶层是“特效层”:“我的”页中的应用图标本身是一个popover元素,然后这图标会被“窗口化”,也就是和我们的“小程序窗口”做一个“平滑变换”,参考IOS的动画曲线
      3. 注意:这里的关键是,“小程序窗口”其实并不在“应用堆栈”这个DOM中,而始终是一种popover的状态,始终是绝对定位,“应用堆栈”更多只是作为一个背景板
   4. “小程序窗口”顶部不再有“应用栏,而是在右上角顶部,会有一个悬浮的“胶囊”,存放两个按钮:“多功能按钮(默认IconDots,授权等动作会切换成其它图标)|关闭(IconCircleDot)”
      1. 胶囊需要渲染在安全区域中所以要避开.
      2. 所以我们提供的小程序ctx,需要额外再传递safeAreaInsets信息.
   5. 点击“关闭(IconCircleDot)”,这时候会“反转启动特效”:
      1. 底层是生态Tab页的Slider滑动,回到“我的”
      2. 顶层的“特效层”,是“小程序窗口”经过“平滑变换”,变回成“小程序图标”
   6. 注意,底部的“生态Tab按钮”要切换图标, 使用 IconAppWindowFilled 这个图标
   7. 背景板其实就是“我的”页面的“墙纸”,这里有一个关键的改动:使用swiperjs的Parallax技术,让这个墙纸在三个页面(发现|我的|应用堆栈)中共享
3. 点击“生态Tab按钮”的效果是:如果未激活,那么跳转到生态Tab页面;如果已激活:
   1. 如果在“发现”,那么切换到“我的”
   2. 如果在“应用堆栈”,那么切换到“我的”
   3. 如果在“我的”,保持不动
   4. 这三个图标使用Silder进行封装:可以通过滑动来进行切换, 它本质上是“生态Tab页”的“同步滑动指示器”, 划出的图标透明度要淡化成0,划入则是渐显成1
   5. 我要的效果就是当前这种“普通图标”的效果,默认情况下只看到当前Slider对应的图标,生态Page的Slider在滑动的时候,把这个Page滑动进度同步到我们指示器的滑动进度上,
      反之,在指示器上滑动,进度同样可以同步给Page滑动进度. 这是一个双向绑定. swiperjs可能没提供这样的内置双向绑定的能力,
      如果你调查过确实没内置这个功能,那么注意:你需要监听pointerdown/up来区分是当前的滑动是否是用户的动作,从而决定同步的方向.
4. 如果在“应用堆栈”,在“生态Tab按钮”向上滑动,可以将目前已经打开的应用全部堆叠展示出来,进入类似IOS那种层叠效果,用户可以通过左右滑动切(Slider),向上滑动关闭应用

---

两种动画路径：

1. icon->window-with-splash
2. icon->window

这两种动画路径是不一样的：

1.  icon->window-with-splash 动画过程中，icon 与 splash.icon 是属于 sharedElement 的关系。而 window.bounding 一开始是 icon.bounding，然后目标是 desktop.bounding
2.  icon->window 动画过程中，icon 和 window 是属于 sharedElement 的关系

---

正确的逻辑和做法是：

1. 应用启动了，那么这时候应该是 stack 这个 slide 页面要先生成。因为它是应用启动后，最后的容器
2. 确定 stack-slide 到 DOM-tree 中了，那么这时候，需要去获得这个stack-slide的 rect，因为它是我们最终要动画的目的地
3. icon 从 staic-popover 模式进入 show-popover 模式（popover 的 top-layer 且 position: fixed），window 也准备好，也处于 show-popover 模式
4. 在开始使用 flip 技术开始计算之前，需要了解一个问题：
   1. icon 是一个正方形，window 则是一个长方形
   2. 如果我们只是简单地进行 transform，那么虽然效果是平滑的，但是会导致一种拉伸或者压缩的效果
   3. 所以我们的解决方案是，不论是 icon 还是 window，它们本身首先是一个 popover，同时也是一个容器，下文我们定义为 popover-container，容器存放着内容使用`object-fit: cover`的方式来充满容器，这样做的目的，是确保避免出现拉伸或者压缩的副作用，下文我们将这个内容定义为 popover-inner
   4. 因此我们的动画过程中，不是直接transform，而是直接通过修改 icon 还是 window 的 width/height/borderradius 来做效果
   5. 而 popover-inner，则是锁死 flip 计算好的的尺寸，然后通过 transform 来进行缩放。
   6. 也就是说 icon-inner 就是最开始的那个小尺寸，window-inner 就是最终的大尺寸，二者通过 transform-scale 来强制进行对齐
5. 理解了这个 popover-container+inner 的原理之后，我们再来看 flip 动画要如何做：
   1. 首先是icon->window-with-splash这个效果（基于 FLIP 的原理来解释）：
      1. First：icon-container 的层级需要比window-container高，所以先进行，也就是说最开始 window-container 是在 icon-container 下面的
      2. First：window-container 的 bg 固定是 theme-color，但是 window 的 rect 和 borderradius 是和 icon-container 一致的。
      3. First：window-splash 与 window-inner 同级，所以不受 window-inner 缩放的影响。因此 window-container 结构是：`[window-inner, splashBackground, splashIcon]`
      4. First：window-inner 的 rect 和 desktop 的 rect 一致，然后需要基于 `object-fit: cover`的原理，将自己 scale 到 width/height 刚好等于 window-container 的尺寸，居中放置在 window-container 的中心位置。
      5. First：splashBackground 和 window-inner 类似，一样的cover算法，将自己 scale 到 width/height 刚好等于 window-container 的尺寸，居中放置在 window-container 的中心位置。
      6. First：icon-inner 也要基于`object-fit: cover`的原理，计算出最终 splashIcon 的 rect 尺寸下自己的 width/height 对应的 scale。因为是小放大，所以可能会失真，但是没关系，因为它的透明度也会减低，所以符合预期
      - Last：TODO，你来推理。
   2. 其次是 icon->window 这个效果（基于 FLIP 的原理来解释）：
      - First:TODO ，你来推理。
      - Last:TODO ，你来推理。
6. window 也是用原生 Popover（popover="manual" + showPopover()）来当 window-container。这里的关键是，在动画结束后，它应该是变成 static-position 的状态
7. 最最最关键的点在于：需要将 animation 的进度和 swiper 的动画进度绑定在一起。这是什么概念呢：如果我滑动“指示器”来回到“我的”页面，结果就是，动画会跟着手势走。
   1. 也就是说 animation 始终不会自动 play，而是全程被 swiper 的状态带着走
   2. 也就是说，我可以通过控制“指示器”，来实现完全“跟手”的动画效果，我可以用滑动来做到将 window 缩回到 icon 上。
   3. 我说的这些你不用刻意去实现，只要做好单向绑定，就可以实现我说的这些效果。
   4. 这个技术的重点在于，在动画进度 =0% 的时候，icon-popover 仍然是 static-popover ，并且 window-popover 处于 display:none，只有动画开始之后的下一帧（无限接近于 0%），才是 fixed-popover
   5. 同理，反过来，在动画进度 =100% 的时候，window-popover 会被强制锁定成 static-popover，否则无限接近于 100% 的阶段，它都是 fixed-popover
   6. 如果通过指示器回到我的页面，我们会看到的效果是，window-popover会从static-popover进入fixed-popover状态，然后慢慢缩放会 icon-popover，直到 swiper 滑动结束，这时候 icon-popover 从 fixed-popover 进入到 static-popover，然后 window-popover 的 DOM 从页面上被进入 display:none。这里很容易忽视的一点是，如果这时候我点击了另外一个小程序的 icon，那么发生的事情会是：原先的 animation 与 swiper 解除关联，因为它不再是“激活的小程序”，而是被刚刚被点击的小程序的 icon 所关联了。
   7. 为了确保你理解了，我问你一个问题：如果我点击了“小程序胶囊的关闭按钮”，那么需要如何实现“关闭”的特效？

---

应该统一依赖于"动画结束"事件,现在不是已经有动画结束时间吗?
我觉得我们runtime应该定义一些"生命周期",然后由 react来触发这些生命周期。这样 runtime自己基于生命周期来行开发。而不是依赖setTimeout、requestAnimationFrame。不过, requestAnimationFrame会特殊一点,但理论上应该尽可能使用生命周期,只有在特定情况下才需要依赖raf。
理解源代码,按照我的设想,给出你的计划.

---

永远不要在代码中硬编码DEFAULT_RPC_URLS，但是我允许你将 default-chains.json 从 public 迁移到 src 目录下，然后你可以通过 import 的方式引入这个文件，将 json 通过编译技术硬编码到最终的 bundle 中。
但意味着原本依赖 fetch-json-url 的相关代码也要更改。但好处是启动更快、体验会更好。

---

请深入调查核心原因，从架构师的角度出发，分析是不是架构出了问题？
从高级工程师的角度出发，分析是不是残留代码导致的问题？
从测试工程师的角度出发，分析是不是测试没有覆盖到位导致的问题？
从产品经理的角度出发，是不是流程设计不合理，简洁导致了架构代码或者工程代码出现了不可靠的问题？

---

将 WalletTab 中的下半部分：关于某个地址某个网络中的资产列表和交易列表，封装成一套组件。我要在 stories 中看到这套组件，并绑定真实的 chainProvider。
提供两个 stories 测试，一个是 `bfmeta:bCfAynSAKhzgKLi3BXyuh5k22GctLR72j` ；一个是 `eth:bCfAynSAKhzgKLi3BXyuh5k22GctLR72j`
我要确保能看到真实的数据。
