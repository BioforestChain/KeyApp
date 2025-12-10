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
