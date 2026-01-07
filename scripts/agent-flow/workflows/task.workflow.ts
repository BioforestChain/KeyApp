#!/usr/bin/env bun
/**
 * Task Workflow - 任务管理 (Domain-Driven & Full-Lifecycle)
 *
 * 核心理念：AI 的计划即 Issue，AI 的执行即 PR。
 *
 * 主要功能：
 * 1. start: 一键启动 (Issue -> Branch -> Worktree -> Draft PR)
 * 2. sync:  同步进度 (Local Todo -> Issue Body)
 * 3. submit: 提交任务 (Push -> Ready PR)
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.js";
import {
  createIssue,
  createPr,
  createWorktree,
  getWorktreeInfo,
  markPrReady,
  pushWorktree,
  updateIssue,
} from "../mcps/git-workflow.mcp.js";
import { getRelatedChapters } from "../mcps/whitebook.mcp.js";

// =============================================================================
// Constants
// =============================================================================

const WORKTREE_BASE = ".git-worktree";

// =============================================================================
// Templates
// =============================================================================

const TEMPLATES = {
  ui: (desc: string) => `## Goal (UI/UX)
${desc}

## Design Specs
- [ ] Responsive Design
- [ ] Dark Mode Support
- [ ] Storybook Stories
- [ ] Accessibility (A11y)

## Implementation
- [ ] Component Structure
- [ ] Props Definition
- [ ] Unit Tests`,

  service: (desc: string) => `## Goal (Service)
${desc}

## Schema Definition
- [ ] Define Service Meta (Schema-first)
- [ ] Define Input/Output Zod Schemas

## Implementation
- [ ] Web Implementation
- [ ] DWeb/Native Implementation (if needed)
- [ ] Mock Implementation
- [ ] Unit Tests`,

  page: (desc: string) => `## Goal (Page)
${desc}

## Navigation
- [ ] Route Configuration
- [ ] Deep Link Support

## View
- [ ] Layout Composition
- [ ] State Management (Query/Store)
- [ ] Error Boundary`,

  hybrid: (desc: string) => `## Goal
${desc}

## Tasks
- [ ] ...`,
};

// =============================================================================
// Subflows
// =============================================================================

/**
 * 启动任务
 * 1. 创建 Issue (根据 Type 选择模板和 Label)
 * 2. 创建分支 feat/issue-#ID
 * 3. 创建 Worktree
 * 4. 提交空 commit
 * 5. 创建 Draft PR
 */
const startWorkflow = defineWorkflow({
  name: "start",
  description: "启动新任务 (Issue -> Branch -> Worktree -> Draft PR)",
  args: {
    title: { type: "string", description: "任务标题", required: true },
    type: {
      type: "string",
      description: "任务类型 (ui|service|page|hybrid)",
      default: "hybrid",
    },
    description: { type: "string", description: "任务描述", required: false },
  },
  handler: async (args) => {
    const title = args.title || args._.join(" ");
    if (!title) {
      console.error("❌ 错误: 请提供任务标题");
      process.exit(1);
    }
    const type = (args.type || "hybrid") as keyof typeof TEMPLATES;
    const rawDesc = args.description || "Start development...";
    
    // 1. 组装 Description
    const template = TEMPLATES[type] || TEMPLATES.hybrid;
    const description = template(rawDesc);

    // 2. 准备 Labels
    const labels = [`type/${type}`];
    if (type === "ui") labels.push("area/frontend");
    if (type === "service") labels.push("area/core");

    console.log(`🚀 启动任务: ${title} [${type}]\n`);

    // 3. 上下文注入
    console.log("📚 推荐阅读白皮书章节:");
    const chapters = getRelatedChapters(type);
    chapters.forEach(ch => console.log(`   - ${ch}`));
    console.log("");

    // 4. 创建 Issue
    console.log("1️⃣  创建 GitHub Issue...");
    const { issueId, url: issueUrl } = await createIssue({
      title,
      body: description,
      labels,
    });
    console.log(`   ✅ Issue #${issueId} Created: ${issueUrl}`);

    // 5. 创建 Worktree
    console.log("\n2️⃣  创建 Worktree...");
    const worktreeName = `issue-${issueId}`;
    try {
      const { path, branch } = await createWorktree({
        name: worktreeName,
        baseBranch: "main",
      });
      console.log(`   ✅ Worktree Created: ${path}`);
      console.log(`   ✅ Branch Created: ${branch}`);

      // 6. 初始化提交 & 推送
      console.log("\n3️⃣  初始化 Git 环境...");
      await pushWorktree({
        path,
        message: `chore: start issue #${issueId}`,
      });

      // 7. 创建 Draft PR
      console.log("\n4️⃣  创建 Draft PR...");
      const { url: prUrl } = await createPr({
        title,
        body: `Closes #${issueId}\n\n${description}`,
        head: branch,
        base: "main",
        draft: true,
        labels,
      }); // Note: PR creation needs context, passed via cwd or explicit repo in MCP
      console.log(`   ✅ Draft PR Created: ${prUrl}`);

      console.log("\n✨ 任务环境已就绪！");
      console.log(`👉 请执行: cd ${path}`);
    } catch (error: any) {
      console.error(`❌ 失败: ${error.message}`);
      process.exit(1);
    }
  },
});

/**
 * 同步进度
 * 将本地进度/计划同步到 Issue Description
 */
const syncWorkflow = defineWorkflow({
  name: "sync",
  description: "同步进度到 Issue (更新 Issue Description)",
  args: {
    content: { type: "string", description: "新的任务列表/进度 (Markdown)", required: true },
  },
  handler: async (args) => {
    // 获取当前 Worktree 信息
    // Note: getWorktreeInfo 暂未封装到 git-workflow.mcp，这里复用逻辑或需要新增工具
    // 为保持简单，这里假设在 worktree 目录下运行
    const wt = getCurrentWorktreeInfo();
    if (!wt || !wt.issueId) {
      console.error("❌ 错误: 必须在 issue worktree 中运行");
      process.exit(1);
    }

    const content = args.content || args._.join(" ");
    if (!content) {
      console.error("❌ 错误: 请提供同步内容");
      process.exit(1);
    }

    console.log(`🔄 同步进度到 Issue #${wt.issueId}...`);
    
    // 这里简单追加 PR 链接的逻辑可以在 MCP 中处理，或者由用户保证 content 完整性
    await updateIssue({
      issueId: wt.issueId,
      body: content,
    });
    
    console.log("✅ 同步完成");
  },
});

/**
 * 提交任务
 * Push 代码 -> 标记 PR 为 Ready
 */
const submitWorkflow = defineWorkflow({
  name: "submit",
  description: "提交任务 (Push -> Ready PR)",
  handler: async () => {
    const wt = getCurrentWorktreeInfo();
    if (!wt || !wt.path) {
      console.error("❌ 错误: 必须在 worktree 中运行");
      process.exit(1);
    }

    console.log("🚀 提交任务...\n");

    // 1. 推送代码
    console.log("1️⃣  推送代码...");
    await pushWorktree({
      path: wt.path,
      message: "feat: complete implementation", // 默认消息，实际应由开发者 commit
    });

    // 2. 标记 PR 为 Ready
    if (wt.issueId) {
      console.log("\n2️⃣  更新 PR 状态...");
      // 需要先找到 PR 号，这里简化逻辑，假设 PR 已关联 Issue
      // 实际生产中可能需要 `github_pr_find` 工具
      // 临时方案：让用户手动确认或假设 PR 存在
      console.log("⚠️  提示: 请手动确认 PR 状态或使用 `gh pr ready`");
      // await markPrReady({ prNumber: "..." }); 
    }

    console.log("\n✨ 提交完成，等待 Review！");
  },
});

// =============================================================================
// Internal Helpers (Temporary until full MCP coverage)
// =============================================================================

function getCurrentWorktreeInfo() {
  const cwd = process.cwd();
  if (cwd.includes(WORKTREE_BASE)) {
    const match = cwd.match(new RegExp(`${WORKTREE_BASE}/([^/]+)`));
    if (match) {
      const name = match[1];
      const issueMatch = name.match(/issue-(\d+)/);
      return {
        name,
        path: cwd, // Simplification
        issueId: issueMatch ? issueMatch[1] : null,
      };
    }
  }
  return null;
}

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "task",
  description: "任务管理 (Domain-Driven & Full-Lifecycle)",
  version: "3.0.0",
  subflows: [startWorkflow, syncWorkflow, submitWorkflow],
  examples: [
    ['task start --type ui --title "Button Component"', "启动 UI 任务"],
    ['task start --type service --title "Auth Service"', "启动服务任务"],
    ['task sync "- [x] Step 1"', "同步进度"],
    ["task submit", "提交任务"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

const isMain =
  process.argv[1]?.endsWith("task.workflow.ts") ||
  process.argv[1]?.endsWith("task.workflow.js");

if (isMain) {
  workflow.run();
}
