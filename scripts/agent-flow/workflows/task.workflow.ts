#!/usr/bin/env bun
/**
 * Task Workflow - 任务管理 (Issue-Driven & PR-First)
 *
 * 核心理念：AI 的计划即 Issue，AI 的执行即 PR。
 *
 * 主要功能：
 * 1. start: 一键启动 (Issue -> Branch -> Worktree -> Draft PR)
 * 2. sync:  同步进度 (Local Todo -> Issue Body)
 * 3. submit: 提交任务 (Push -> Ready PR)
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.js";

// =============================================================================
// Constants
// =============================================================================

const REPO = "BioforestChain/KeyApp";
const WORKTREE_BASE = ".git-worktree";

// =============================================================================
// Helpers
// =============================================================================

function exec(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd }).trim();
  } catch (error) {
    throw new Error(`Command failed: ${cmd}\n${error}`);
  }
}

function safeExec(cmd: string, cwd?: string): string | null {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd, stdio: ["pipe", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function getCurrentWorktree(): { name: string; path: string; issueId: string | null } | null {
  const cwd = process.cwd();
  if (cwd.includes(WORKTREE_BASE)) {
    const match = cwd.match(new RegExp(`${WORKTREE_BASE}/([^/]+)`));
    if (match) {
      const name = match[1];
      const issueMatch = name.match(/issue-(\d+)/);
      return {
        name,
        path: join(process.cwd().split(WORKTREE_BASE)[0], WORKTREE_BASE, name),
        issueId: issueMatch ? issueMatch[1] : null,
      };
    }
  }
  return null;
}

// =============================================================================
// Subflows
// =============================================================================

/**
 * 启动任务
 * 1. 创建 Issue
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
    description: { type: "string", description: "任务描述 (支持 Markdown)", required: false },
  },
  handler: async (args) => {
    const title = args.title || args._.join(" ");
    if (!title) {
      console.error("❌ 错误: 请提供任务标题");
      process.exit(1);
    }
    const description = args.description || "Start development...";

    console.log(`🚀 启动任务: ${title}\n`);

    // 1. 创建 Issue
    console.log("1️⃣  创建 GitHub Issue...");
    const issueUrl = exec(`gh issue create --repo ${REPO} --title "${title}" --body "${description}" --assignee @me`);
    const issueId = issueUrl.split("/").pop();
    console.log(`   ✅ Issue #${issueId} Created: ${issueUrl}`);

    // 2. 准备命名
    const branchName = `feat/issue-${issueId}`;
    const worktreeName = `issue-${issueId}`;
    const worktreePath = `${WORKTREE_BASE}/${worktreeName}`;

    // 3. 检查是否存在
    if (existsSync(worktreePath)) {
      console.error(`❌ 错误: Worktree ${worktreePath} 已存在`);
      process.exit(1);
    }

    // 4. 创建 Worktree 和分支
    console.log("\n2️⃣  创建 Worktree 和分支...");
    exec(`git worktree add -b ${branchName} ${worktreePath} main`);
    console.log(`   ✅ Worktree Created: ${worktreePath}`);

    // 5. 初始化提交 (为了开 PR)
    console.log("\n3️⃣  初始化提交...");
    exec(`git commit --allow-empty -m "chore: start issue #${issueId}"`, worktreePath);
    
    // 6. 推送分支
    console.log("\n4️⃣  推送分支...");
    exec(`git push -u origin ${branchName}`, worktreePath);

    // 7. 创建 Draft PR
    console.log("\n5️⃣  创建 Draft PR...");
    try {
      const prUrl = exec(
        `gh pr create --repo ${REPO} --draft --title "${title}" --body "Closes #${issueId}\n\n## Plan\n${description}" --base main --head ${branchName}`,
        worktreePath
      );
      console.log(`   ✅ Draft PR Created: ${prUrl}`);
    } catch (e) {
      console.warn("   ⚠️  创建 PR 失败 (可能已存在)，请手动检查");
    }

    console.log("\n✨ 任务环境已就绪！");
    console.log(`👉 请执行: cd ${worktreePath}`);
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
    const wt = getCurrentWorktree();
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
    
    // 获取当前 PR 链接，保留在 body 中
    const prList = safeExec(`gh pr list --head feat/issue-${wt.issueId} --json url --jq '.[0].url'`, wt.path);
    const prLink = prList ? `\n\nPR: ${prList}` : "";

    const newBody = `${content}${prLink}`;
    exec(`gh issue edit ${wt.issueId} --repo ${REPO} --body "${newBody}"`);
    
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
    const wt = getCurrentWorktree();
    if (!wt) {
      console.error("❌ 错误: 必须在 worktree 中运行");
      process.exit(1);
    }

    console.log("🚀 提交任务...\n");

    // 1. 检查未提交更改
    const status = safeExec("git status --porcelain", wt.path);
    if (status) {
      console.error("❌ 错误: 有未提交的更改，请先 commit");
      console.log(status);
      process.exit(1);
    }

    // 2. 推送代码
    console.log("1️⃣  推送代码...");
    exec("git push", wt.path);

    // 3. 标记 PR 为 Ready
    if (wt.issueId) {
      console.log("\n2️⃣  更新 PR 状态...");
      try {
        const prList = safeExec(`gh pr list --head feat/issue-${wt.issueId} --json number --jq '.[0].number'`, wt.path);
        if (prList) {
          exec(`gh pr ready ${prList} --repo ${REPO}`);
          console.log(`   ✅ PR #${prList} marked as ready for review`);
        } else {
          console.warn("   ⚠️  未找到关联 PR");
        }
      } catch (e) {
        console.warn("   ⚠️  更新 PR 状态失败");
      }
    }

    console.log("\n✨ 提交完成，等待 Review！");
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "task",
  description: "任务管理 (Issue-Driven & PR-First)",
  version: "2.0.0",
  subflows: [startWorkflow, syncWorkflow, submitWorkflow],
  examples: [
    ['task start --title "Refactor Login" --description "- [ ] Step 1"', "启动新任务"],
    ['task sync "- [x] Step 1\n- [ ] Step 2"', "同步进度到 Issue"],
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
