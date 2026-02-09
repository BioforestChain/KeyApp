#!/usr/bin/env -S deno run -A --unstable-sloppy-imports
/**
 * Onboarding Workflow - 新上下文入口
 *
 * AI 启动新上下文时的第一个 workflow，提供项目概览和当前任务。
 */

import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.ts";
import { formatPractices, listPractices } from "../mcps/practice.mcp.ts";
import { getCurrentSummary } from "../mcps/roadmap.mcp.ts";
import { formatToc, getChapter, getKnowledgeMap, getToc } from "../mcps/whitebook.mcp.ts";

const ACTION_STATUS_GUIDE_PATH = "09-i18n-Ref/03-Action-Status-Copy.md";

// =============================================================================
// Subflows
// =============================================================================

const defaultWorkflow = defineWorkflow({
  name: "default",
  description: "显示完整入门信息（最佳实践、知识地图、当前任务）",
  handler: async () => {
    console.log(`# KeyApp AI 开发入门

## 最佳实践
${formatPractices(listPractices())}

## 开工前必读（状态/错误文案）
- ${ACTION_STATUS_GUIDE_PATH}
- 核心要求：
  - 文案必须区分阶段（签名 / 广播 / 上链确认）
  - UI 不得直接透出 error.message
  - 变更需配套最小回归测试

## 知识地图
${getKnowledgeMap()}

## 当前任务
${getCurrentSummary() || "(无进行中任务)"}

## 开发原则
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
  description: "快速查看最佳实践和当前任务",
  handler: async () => {
    console.log(`# 快速入门

${formatPractices(listPractices())}

## 开工前必读（状态/错误文案）
- ${ACTION_STATUS_GUIDE_PATH}

${getCurrentSummary() || "## 当前无进行中任务"}
`);
  },
});

const tocWorkflow = defineWorkflow({
  name: "toc",
  description: "查看白皮书目录结构",
  handler: async () => {
    console.log(`# 白皮书目录\n\n${formatToc(getToc())}`);
  },
});

const chapterWorkflow = defineWorkflow({
  name: "chapter",
  description: "阅读白皮书章节内容",
  args: {
    path: { type: "string", description: "章节路径", required: false },
  },
  handler: async (args) => {
    const chapterPath = args.path || args._[0];
    if (!chapterPath) {
      console.error("错误: 请指定章节路径");
      Deno.exit(1);
    }

    try {
      const result = getChapter(chapterPath);
      console.log(`# ${chapterPath}\n`);
      console.log(result.content);

      if (result.subFiles?.length) {
        for (const sub of result.subFiles) {
          console.log(`\n---\n\n## ${sub.name}\n`);
          console.log(sub.content);
        }
      }
    } catch (error) {
      console.error(`错误: ${error instanceof Error ? error.message : error}`);
      Deno.exit(1);
    }
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "onboarding",
  description: "新上下文入门 - 了解项目结构、最佳实践和当前任务",
  version: "1.1.0",
  subflows: [defaultWorkflow, quickWorkflow, tocWorkflow, chapterWorkflow],
  examples: [
    ["onboarding", "显示完整入门信息"],
    ["onboarding quick", "快速查看"],
    ["onboarding toc", "白皮书目录"],
    ["onboarding chapter 00-Manifesto", "阅读章节"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

if (import.meta.main) {
  workflow.run();
}
