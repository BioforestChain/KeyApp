#!/usr/bin/env bun
/**
 * Task Workflow - 任务管理
 *
 * 管理开发任务的完整生命周期：领取 Issue、创建 worktree、提交 PR。
 */

import { execSync } from "node:child_process";
import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.js";
import { getCurrentSummary } from "../mcps/roadmap.mcp.js";

// =============================================================================
// Helpers
// =============================================================================

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

function getCurrentWorktree(): string | null {
  const cwd = process.cwd();
  if (cwd.includes(".git-worktree/")) {
    const match = cwd.match(/\.git-worktree\/([^/]+)/);
    return match ? match[1] : null;
  }
  return null;
}

// =============================================================================
// Subflows
// =============================================================================

const currentWorkflow = defineWorkflow({
  name: "current",
  description: "查看当前任务和 worktree 状态",
  handler: async () => {
    const worktree = getCurrentWorktree();
    const branch = exec("git branch --show-current");

    console.log("# 当前状态\n");

    if (worktree) {
      console.log(`Worktree: ${worktree}`);
      console.log(`Branch: ${branch}`);
      console.log(`Path: ${process.cwd()}\n`);
    } else {
      console.log("⚠️  当前不在 worktree 中");
      console.log("所有开发工作必须在 .git-worktree/ 中进行\n");
    }

    const summary = getCurrentSummary();
    if (summary) console.log(summary);
  },
});

const claimWorkflow = defineWorkflow({
  name: "claim",
  description: "领取 GitHub Issue 并分配给自己",
  args: {
    issue: { type: "string", description: "Issue 编号", required: false },
  },
  handler: async (args) => {
    const issueNum = args.issue || args._[0];
    if (!issueNum) {
      console.error("错误: 请指定 Issue 编号");
      process.exit(1);
    }

    console.log(`# 领取 Issue #${issueNum}\n`);

    try {
      const issueJson = exec(
        `gh issue view ${issueNum} --repo BioforestChain/KeyApp --json title,body,labels`
      );
      const issue = JSON.parse(issueJson);
      console.log(`标题: ${issue.title}`);
      console.log(`标签: ${issue.labels?.map((l: { name: string }) => l.name).join(", ") || "(无)"}\n`);

      exec(`gh issue edit ${issueNum} --repo BioforestChain/KeyApp --add-assignee @me`);
      console.log("✓ 已分配给你\n");

      console.log("## 下一步");
      console.log(`1. 创建 worktree: task worktree create issue-${issueNum}`);
      console.log(`2. 进入目录: cd .git-worktree/issue-${issueNum}`);
      console.log(`3. 安装依赖: pnpm install`);
      console.log(`4. 开发完成后: task pr`);
    } catch (error) {
      console.error(`错误: 无法获取 Issue #${issueNum}`);
      process.exit(1);
    }
  },
});

const worktreeWorkflow = defineWorkflow({
  name: "worktree",
  description: "管理 git worktree (list/create/delete)",
  args: {
    action: { type: "string", description: "操作类型", required: false },
    name: { type: "string", description: "worktree 名称", required: false },
    branch: { type: "string", description: "分支名", required: false },
  },
  handler: async (args) => {
    const action = args.action || args._[0] || "list";
    const name = args.name || args._[1];
    const branch = args.branch || (name ? `feat/${name}` : undefined);

    switch (action) {
      case "list":
        console.log("# Git Worktrees\n");
        console.log(exec("git worktree list") || "(无 worktree)");
        break;

      case "create":
        if (!name) {
          console.error("错误: 请指定 worktree 名称");
          process.exit(1);
        }
        console.log(`# 创建 Worktree: ${name}\n`);
        try {
          exec(`git worktree add -b ${branch} .git-worktree/${name} main`);
          console.log(`✓ 已创建: .git-worktree/${name}`);
          console.log(`✓ 分支: ${branch}`);
          console.log(`\n下一步: cd .git-worktree/${name} && pnpm install`);
        } catch {
          console.error("错误: 创建失败");
          process.exit(1);
        }
        break;

      case "delete":
        if (!name) {
          console.error("错误: 请指定 worktree 名称");
          process.exit(1);
        }
        try {
          exec(`git worktree remove .git-worktree/${name}`);
          console.log(`✓ 已删除: .git-worktree/${name}`);
        } catch {
          console.error("错误: 删除失败");
          process.exit(1);
        }
        break;

      default:
        console.error(`未知操作: ${action}`);
        process.exit(1);
    }
  },
});

const prWorkflow = defineWorkflow({
  name: "pr",
  description: "创建 Pull Request",
  args: {
    title: { type: "string", alias: "t", description: "PR 标题", required: false },
    body: { type: "string", alias: "b", description: "PR 描述", required: false },
  },
  handler: async (args) => {
    const worktree = getCurrentWorktree();
    if (!worktree) {
      console.error("错误: 必须在 worktree 中创建 PR");
      process.exit(1);
    }

    const branch = exec("git branch --show-current");
    console.log(`# 创建 Pull Request\n`);
    console.log(`Worktree: ${worktree}`);
    console.log(`Branch: ${branch}\n`);

    const status = exec("git status --porcelain");
    if (status) {
      console.log("## 未提交的更改\n" + status);
      console.log("\n⚠️  请先提交所有更改");
      process.exit(1);
    }

    console.log("推送分支...");
    exec(`git push -u origin ${branch}`);
    console.log("✓ 已推送\n");

    const issueMatch = worktree.match(/issue-(\d+)/);
    const issueNum = issueMatch ? issueMatch[1] : null;
    const title = args.title || exec("git log -1 --format=%s");
    const body = args.body || (issueNum ? `Closes #${issueNum}` : "");

    try {
      const prUrl = exec(`gh pr create --title "${title}" --body "${body}" --base main`);
      console.log(`✓ PR 已创建: ${prUrl}`);
    } catch {
      console.error("错误: 创建 PR 失败");
      process.exit(1);
    }
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "task",
  description: "任务管理 - 领取 Issue、创建 worktree、提交 PR",
  version: "1.0.0",
  subflows: [currentWorkflow, claimWorkflow, worktreeWorkflow, prWorkflow],
  examples: [
    ["task current", "查看当前状态"],
    ["task claim 123", "领取 Issue #123"],
    ["task worktree create issue-123", "创建 worktree"],
    ["task worktree list", "列出所有 worktree"],
    ["task pr", "创建 Pull Request"],
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
