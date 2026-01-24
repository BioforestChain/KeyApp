#!/usr/bin/env -S deno run -A
/**
 * Task Workflow - 任务管理 (Domain-Driven & Full-Lifecycle)
 *
 * 核心理念：AI 的计划即 Issue，AI 的执行即 PR。
 *
 * ## 工作流程
 *
 * ```
 * task start                    task submit
 *     │                              │
 *     ▼                              ▼
 * Issue + Branch + Worktree    Push + Ready PR
 * + Draft PR [skip ci]         (触发 CI)
 * ```
 *
 * ## 主要功能
 *
 * 1. **start**: 一键启动开发环境
 *    - 创建 GitHub Issue (根据 type 选择模板)
 *    - 创建 Git Branch + Worktree
 *    - 创建 Draft PR (带 [skip ci]，不触发 CI)
 *    - 支持 --list-labels 列出可用标签
 *    - 支持 --create-labels 自动创建缺失标签
 *
 * 2. **sync**: 同步进度到 Issue
 *    - 将本地 Todo/进度更新到 Issue Description
 *
 * 3. **submit**: 提交任务触发 CI
 *    - 推送代码 (不带 [skip ci]，触发 CI)
 *    - 标记 PR 为 Ready for Review
 *
 * ## 标签管理
 *
 * 标签在模块加载时从 GitHub 动态获取，支持：
 * - 按前缀分组显示 (type/, area/, etc.)
 * - 自动推断新标签颜色
 * - 创建前验证标签是否存在
 */

import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.ts";
import { str } from "../../../packages/flow/src/common/async-context.ts";
import {
  createIssue,
  createPr,
  createWorktree,
  pushWorktree,
  updateIssue,
  getLabels,
} from "../mcps/git-workflow.mcp.ts";
import { getRelatedChapters } from "../mcps/whitebook.mcp.ts";
import { join } from "jsr:@std/path";
import { exists } from "jsr:@std/fs";

// =============================================================================
// Constants
// =============================================================================

const WORKTREE_BASE = ".git-worktree";
const ENV_EXCLUDES = new Set([".env.example"]);

async function syncEnvFiles(root: string, worktreePath: string): Promise<string[]> {
  const copied: string[] = [];
  for await (const entry of Deno.readDir(root)) {
    if (!entry.isFile) continue;
    if (!entry.name.startsWith(".env")) continue;
    if (ENV_EXCLUDES.has(entry.name)) continue;

    const src = join(root, entry.name);
    const dest = join(worktreePath, entry.name);
    if (await exists(dest)) continue;

    await Deno.copyFile(src, dest);
    copied.push(entry.name);
  }
  return copied;
}

async function ensurePnpmInstall(path: string) {
  const nodeModules = join(path, "node_modules");
  if (await exists(nodeModules)) {
    console.log("   ℹ️  node_modules 已存在，跳过 pnpm install");
    return;
  }

  const command = new Deno.Command("pnpm", {
    args: ["install"],
    cwd: path,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const { code } = await command.output();
  if (code !== 0) {
    throw new Error("pnpm install failed");
  }
}

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
  description: str`启动新任务 (Issue + Worktree + Draft PR，不触发 CI)

## When to Use
- 启动服务开发 → ${str.scenarios(["--type", "service", "--title", "Feature"])}
- 列出可用标签 → ${str.scenarios(["--list-labels"])}
- 自动创建标签 → ${str.scenarios(["--type", "ui", "--create-labels"])}`,
  args: {
    title: { type: "string", description: "任务标题", required: false },
    type: {
      type: "string",
      description: "任务类型 (ui|service|page|hybrid)",
      default: "hybrid",
    },
    description: { type: "string", description: "任务描述", required: false },
    "create-labels": {
      type: "boolean",
      description: "自动创建不存在的标签",
      default: false,
    },
    "list-labels": {
      type: "boolean",
      description: "列出所有可用标签",
      default: false,
    },
  },
  handler: async (args) => {
    // Handle --list-labels flag
    if (args["list-labels"]) {
      const { labels } = await getLabels({ refresh: true });
      console.log("📋 可用标签列表:\n");
      const grouped = new Map<string, typeof labels>();
      for (const label of labels) {
        const prefix = label.name.includes("/") ? label.name.split("/")[0] : "other";
        if (!grouped.has(prefix)) grouped.set(prefix, []);
        grouped.get(prefix)!.push(label);
      }
      for (const [prefix, items] of grouped) {
        console.log(`  [${prefix}]`);
        for (const item of items) {
          console.log(`    - ${item.name} (#${item.color})${item.description ? ` - ${item.description}` : ""}`);
        }
      }
      return;
    }

    const title = args.title || args._.join(" ");
    if (!title) {
      console.error("❌ 错误: 请提供任务标题");
      Deno.exit(1);
    }
    const type = (args.type || "hybrid") as keyof typeof TEMPLATES;
    const rawDesc = args.description || "Start development...";
    const createLabels = args["create-labels"] as boolean;
    
    // 1. 组装 Description
    const template = TEMPLATES[type] || TEMPLATES.hybrid;
    const description = template(rawDesc);

    // 2. 准备 Labels
    const labels = [`type/${type}`];
    if (type === "ui") labels.push("area/frontend");
    if (type === "service") labels.push("area/core");

    console.log(`🚀 启动任务: ${title} [${type}]\n`);
    console.log(`🏷️  标签: ${labels.join(", ")}${createLabels ? " (自动创建)" : ""}\n`);

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
      createLabels,
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

      // 6. 初始化提交 & 推送 (skip CI for draft)
      console.log("\n3️⃣  初始化 Git 环境...");
      await pushWorktree({
        path,
        message: `chore: start issue #${issueId} [skip ci]`,
      });

      // 7. 同步 env 与安装依赖
      console.log("\n4️⃣  同步开发环境...");
      const copiedEnv = await syncEnvFiles(Deno.cwd(), path);
      if (copiedEnv.length > 0) {
        console.log(`   ✅ 已同步 env 文件: ${copiedEnv.join(", ")}`);
      } else {
        console.log("   ℹ️  未发现可同步的 env 文件");
      }
      console.log("   🔧 安装依赖...");
      await ensurePnpmInstall(path);

      // 8. 创建 Draft PR
      console.log("\n5️⃣  创建 Draft PR...");
      const { url: prUrl } = await createPr({
        title,
        body: `Closes #${issueId}\n\n${description}`,
        head: branch,
        base: "main",
        draft: true,
        labels,
        createLabels,
      }); 
      console.log(`   ✅ Draft PR Created: ${prUrl}`);

      console.log("\n✨ 任务环境已就绪！");
      console.log(`👉 请执行: cd ${path}`);
    } catch (error: any) {
      console.error(`❌ 失败: ${error.message}`);
      Deno.exit(1);
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
    const wt = getCurrentWorktreeInfo();
    if (!wt || !wt.issueId) {
      console.error("❌ 错误: 必须在 issue worktree 中运行");
      Deno.exit(1);
    }

    const content = args.content || args._.join(" ");
    if (!content) {
      console.error("❌ 错误: 请提供同步内容");
      Deno.exit(1);
    }

    console.log(`🔄 同步进度到 Issue #${wt.issueId}...`);
    
    await updateIssue({
      issueId: wt.issueId,
      body: content,
    });
    
    console.log("✅ 同步完成");
  },
});

/**
 * 提交任务
 * Push 代码 (触发 CI) -> 标记 PR 为 Ready
 */
const submitWorkflow = defineWorkflow({
  name: "submit",
  description: "提交任务并触发 CI (Push + Ready PR)",
  handler: async () => {
    const wt = getCurrentWorktreeInfo();
    if (!wt || !wt.path) {
      console.error("❌ 错误: 必须在 worktree 中运行");
      Deno.exit(1);
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
      console.log("⚠️  提示: 请手动确认 PR 状态或使用 `gh pr ready`");
    }

    console.log("\n✨ 提交完成，等待 Review！");
  },
});

// =============================================================================
// Internal Helpers
// =============================================================================

function getCurrentWorktreeInfo() {
  const cwd = Deno.cwd();
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
    ['task start --type service --title "New Feature" --create-labels', "启动任务并自动创建缺失标签"],
    ['task start --list-labels', "列出所有可用标签"],
    ['task sync "- [x] Step 1"', "同步进度"],
    ["task submit", "提交任务"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

if (import.meta.main) {
  workflow.run();
}
