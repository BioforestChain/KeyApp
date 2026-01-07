#!/usr/bin/env bun
/**
 * Task Workflow - 任务管理工作流
 *
 * 管理开发任务的完整生命周期：领取 Issue、创建 worktree、提交 PR。
 *
 * 子命令:
 * - current: 查看当前任务
 * - claim <issue#>: 领取 Issue
 * - worktree: 创建/管理 worktree
 * - pr: 创建 Pull Request
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
      console.log("⚠️  当前不在 worktree 中\n");
      console.log("所有开发工作必须在 .git-worktree/ 中进行。");
      console.log('使用 workflow("task", ["worktree", "create", "<name>"]) 创建\n');
    }

    const summary = getCurrentSummary();
    if (summary) {
      console.log(summary);
    }
  },
});

const claimWorkflow = defineWorkflow({
  name: "claim",
  description: "领取 GitHub Issue",
  args: {
    issue: {
      type: "string",
      description: "Issue 编号",
      required: false,
    },
  },
  handler: async (args) => {
    const issueNum = args.issue || args._[0];
    if (!issueNum) {
      console.error("错误: 请指定 Issue 编号");
      console.error("用法: task claim <issue#>");
      process.exit(1);
    }

    console.log(`# 领取 Issue #${issueNum}\n`);

    // 获取 Issue 信息
    try {
      const issueJson = exec(
        `gh issue view ${issueNum} --repo BioforestChain/KeyApp --json title,body,labels`
      );
      const issue = JSON.parse(issueJson);
      console.log(`标题: ${issue.title}`);
      console.log(`标签: ${issue.labels?.map((l: { name: string }) => l.name).join(", ") || "(无)"}\n`);

      // 自动分配
      exec(`gh issue edit ${issueNum} --repo BioforestChain/KeyApp --add-assignee @me`);
      console.log("✓ 已分配给你\n");

      // 建议下一步
      console.log("## 下一步\n");
      console.log(`1. 创建 worktree:`);
      console.log(`   workflow("task", ["worktree", "create", "issue-${issueNum}"])\n`);
      console.log(`2. 进入 worktree 目录:`);
      console.log(`   cd .git-worktree/issue-${issueNum}\n`);
      console.log(`3. 开始开发，完成后创建 PR:`);
      console.log(`   workflow("task", ["pr"])`);
    } catch (error) {
      console.error(`错误: 无法获取 Issue #${issueNum}`);
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  },
});

const worktreeWorkflow = defineWorkflow({
  name: "worktree",
  description: "管理 git worktree",
  args: {
    action: {
      type: "string",
      description: "操作: list, create, delete",
      required: false,
    },
    name: {
      type: "string",
      description: "worktree 名称",
      required: false,
    },
    branch: {
      type: "string",
      description: "分支名（默认 feat/<name>）",
      required: false,
    },
  },
  handler: async (args) => {
    const action = args.action || args._[0] || "list";
    const name = args.name || args._[1];
    const branch = args.branch || (name ? `feat/${name}` : undefined);

    switch (action) {
      case "list": {
        console.log("# Git Worktrees\n");
        const list = exec("git worktree list");
        console.log(list || "(无 worktree)");
        break;
      }

      case "create": {
        if (!name) {
          console.error("错误: 请指定 worktree 名称");
          console.error("用法: task worktree create <name> [--branch <branch>]");
          process.exit(1);
        }

        const worktreePath = `.git-worktree/${name}`;
        console.log(`# 创建 Worktree: ${name}\n`);

        try {
          // 创建分支和 worktree
          exec(`git worktree add -b ${branch} ${worktreePath} main`);
          console.log(`✓ 已创建 worktree: ${worktreePath}`);
          console.log(`✓ 分支: ${branch}`);
          console.log(`\n## 下一步\n`);
          console.log(`cd ${worktreePath}`);
          console.log(`pnpm install`);
        } catch (error) {
          console.error("错误: 创建 worktree 失败");
          console.error(error instanceof Error ? error.message : error);
          process.exit(1);
        }
        break;
      }

      case "delete": {
        if (!name) {
          console.error("错误: 请指定 worktree 名称");
          process.exit(1);
        }

        const worktreePath = `.git-worktree/${name}`;
        console.log(`# 删除 Worktree: ${name}\n`);

        try {
          exec(`git worktree remove ${worktreePath}`);
          console.log(`✓ 已删除 worktree: ${worktreePath}`);
        } catch (error) {
          console.error("错误: 删除 worktree 失败");
          console.error(error instanceof Error ? error.message : error);
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`未知操作: ${action}`);
        console.error("可用操作: list, create, delete");
        process.exit(1);
    }
  },
});

const prWorkflow = defineWorkflow({
  name: "pr",
  description: "创建 Pull Request",
  args: {
    title: {
      type: "string",
      alias: "t",
      description: "PR 标题",
      required: false,
    },
    body: {
      type: "string",
      alias: "b",
      description: "PR 描述",
      required: false,
    },
  },
  handler: async (args) => {
    const worktree = getCurrentWorktree();

    if (!worktree) {
      console.error("错误: 必须在 worktree 中创建 PR");
      console.error("当前目录: " + process.cwd());
      process.exit(1);
    }

    console.log(`# 创建 Pull Request\n`);
    console.log(`Worktree: ${worktree}`);

    const branch = exec("git branch --show-current");
    console.log(`Branch: ${branch}\n`);

    // 检查是否有未提交的更改
    const status = exec("git status --porcelain");
    if (status) {
      console.log("## 未提交的更改\n");
      console.log(status);
      console.log("\n⚠️  请先提交所有更改后再创建 PR\n");
      process.exit(1);
    }

    // 推送分支
    console.log("推送分支...");
    try {
      exec(`git push -u origin ${branch}`);
      console.log("✓ 分支已推送\n");
    } catch {
      console.error("错误: 推送失败");
      process.exit(1);
    }

    // 提取 Issue 编号
    const issueMatch = worktree.match(/issue-(\d+)/);
    const issueNum = issueMatch ? issueMatch[1] : null;

    // 生成 PR 信息
    const title = args.title || exec("git log -1 --format=%s");
    const body = args.body || (issueNum ? `Closes #${issueNum}` : "");

    console.log("## PR 信息\n");
    console.log(`标题: ${title}`);
    console.log(`描述: ${body}\n`);

    // 创建 PR
    try {
      const prUrl = exec(
        `gh pr create --title "${title}" --body "${body}" --base main`
      );
      console.log(`✓ PR 已创建: ${prUrl}`);
    } catch (error) {
      console.error("错误: 创建 PR 失败");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "task",
  description: `任务管理 - 领取 Issue、创建 worktree、提交 PR

管理开发任务的完整生命周期。

子命令:
- current: 查看当前任务和 worktree 状态
- claim <issue#>: 领取 GitHub Issue
- worktree [list|create|delete] <name>: 管理 git worktree
- pr: 创建 Pull Request

典型工作流:
1. workflow("task", ["claim", "123"])
2. workflow("task", ["worktree", "create", "issue-123"])
3. cd .git-worktree/issue-123 && pnpm install
4. 开发...
5. workflow("task", ["pr"])`,
  version: "1.0.0",
  subflows: [currentWorkflow, claimWorkflow, worktreeWorkflow, prWorkflow],
});

// =============================================================================
// Auto-start
// =============================================================================

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("task.workflow.ts") ||
    process.argv[1].endsWith("task.workflow.js"));

if (isMain) {
  workflow.run();
}
