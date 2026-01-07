#!/usr/bin/env bun
/**
 * Onboarding Workflow - 新上下文入口
 *
 * AI 启动新上下文时的第一个 workflow，提供项目概览和当前任务。
 * 替代原来的 `pnpm agent readme`。
 *
 * 子命令:
 * - (default): 显示完整入门信息
 * - quick: 快速查看当前任务
 * - chapter <path>: 阅读白皮书章节
 */

import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.js";
import {
  formatPractices,
  listPractices,
} from "../mcps/practice.mcp.js";
import { getCurrentSummary } from "../mcps/roadmap.mcp.js";
import {
  formatToc,
  getChapter,
  getKnowledgeMap,
  getToc,
} from "../mcps/whitebook.mcp.js";

// =============================================================================
// Subflows
// =============================================================================

const defaultWorkflow = defineWorkflow({
  name: "default",
  description: "显示完整入门信息",
  handler: async () => {
    console.log(`# KeyApp AI 开发入门

## 最佳实践
${formatPractices(listPractices())}

## 知识地图
${getKnowledgeMap()}

## 当前任务
${getCurrentSummary() || "(无进行中任务)"}

## 常用命令

### 查阅文档
workflow("onboarding", ["chapter", "00-Manifesto"])  # 阅读章节
workflow("onboarding", ["toc"])                      # 查看目录

### 任务管理
workflow("task", ["claim", "123"])    # 领取 Issue #123
workflow("task", ["worktree"])        # 创建 worktree
workflow("task", ["pr"])              # 创建 PR

### 开发工作流
workflow("component", ["create", "Button"])     # 创建组件
workflow("service", ["create", "WalletService"]) # 创建服务

## 原则
1. 白皮书是唯一权威来源
2. 所有代码在 .git-worktree/ 中开发
3. 组件必须有 Storybook story
4. 业务逻辑必须有单元测试
5. 合并前必须告知 worktree 路径并获得确认
`);
  },
});

const quickWorkflow = defineWorkflow({
  name: "quick",
  description: "快速查看当前任务",
  handler: async () => {
    const summary = getCurrentSummary();
    const practices = formatPractices(listPractices());

    console.log(`# 快速入门

${practices}

${summary || "## 当前无进行中任务\n\n使用 workflow(\"task\", [\"claim\", \"<issue#>\"]) 领取任务"}
`);
  },
});

const tocWorkflow = defineWorkflow({
  name: "toc",
  description: "查看白皮书目录",
  handler: async () => {
    const chapters = getToc();
    console.log(`# 白皮书目录\n\n${formatToc(chapters)}`);
  },
});

const chapterWorkflow = defineWorkflow({
  name: "chapter",
  description: "阅读白皮书章节",
  args: {
    path: {
      type: "string",
      description: "章节路径",
      required: false,
    },
  },
  handler: async (args) => {
    const chapterPath = args.path || args._[0];
    if (!chapterPath) {
      console.error("错误: 请指定章节路径");
      console.error("用法: onboarding chapter <path>");
      console.error("示例: onboarding chapter 00-Manifesto");
      process.exit(1);
    }

    try {
      const result = getChapter(chapterPath);
      console.log(`# ${chapterPath}\n`);
      console.log(result.content);

      if (result.subFiles && result.subFiles.length > 0) {
        for (const sub of result.subFiles) {
          console.log(`\n---\n\n## ${sub.name}\n`);
          console.log(sub.content);
        }
      }
    } catch (error) {
      console.error(`错误: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "onboarding",
  description: `新上下文入门 - 了解项目结构和当前任务

这是 AI 启动新上下文时应该首先调用的 workflow。

子命令:
- (无参数): 显示完整入门信息（最佳实践、知识地图、当前任务）
- quick: 快速查看（最佳实践 + 当前任务）
- toc: 白皮书目录
- chapter <path>: 阅读章节内容

示例:
  workflow("onboarding", [])
  workflow("onboarding", ["quick"])
  workflow("onboarding", ["chapter", "00-Manifesto"])`,
  version: "1.0.0",
  subflows: [defaultWorkflow, quickWorkflow, tocWorkflow, chapterWorkflow],
});

// =============================================================================
// Auto-start
// =============================================================================

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("onboarding.workflow.ts") ||
    process.argv[1].endsWith("onboarding.workflow.js"));

if (isMain) {
  workflow.run();
}
