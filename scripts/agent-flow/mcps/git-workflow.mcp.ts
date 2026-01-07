#!/usr/bin/env bun
/**
 * Git Workflow MCP - GitHub & Git 操作封装
 * 
 * 提供原子化的 Git/GitHub 操作工具，供 workflow 调用。
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  createMcpServer,
  defineTool,
} from "../../../packages/flow/src/common/mcp/base-mcp.js";

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
    // stdio: 'pipe' to capture output, 'ignore' stderr unless error
    return execSync(cmd, { encoding: "utf-8", cwd, stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error: any) {
    const stderr = error.stderr ? error.stderr.toString() : "";
    throw new Error(`Command failed: ${cmd}\n${stderr}`);
  }
}

function safeExec(cmd: string, cwd?: string): string | null {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd, stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

// =============================================================================
// Tools
// =============================================================================

const createIssueTool = defineTool({
  name: "github_issue_create",
  description: "创建 GitHub Issue",
  inputSchema: z.object({
    title: z.string(),
    body: z.string(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional().default("@me"),
  }),
  outputSchema: z.object({
    issueId: z.string(),
    url: z.string(),
  }),
  handler: async ({ title, body, labels, assignee }) => {
    const labelFlag = labels ? labels.map(l => `--label "${l}"`).join(" ") : "";
    const assigneeFlag = assignee ? `--assignee "${assignee}"` : "";
    
    // Escape quotes in body
    const safeBody = body.replace(/"/g, '\\"');
    
    const url = exec(`gh issue create --repo ${REPO} --title "${title}" --body "${safeBody}" ${labelFlag} ${assigneeFlag}`);
    const issueId = url.split("/").pop() || "";
    
    return { issueId, url };
  },
});

const updateIssueTool = defineTool({
  name: "github_issue_update",
  description: "更新 GitHub Issue",
  inputSchema: z.object({
    issueId: z.string(),
    body: z.string().optional(),
    state: z.enum(["open", "closed"]).optional(),
    labels: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  handler: async ({ issueId, body, state, labels }) => {
    let flags = [];
    if (body) flags.push(`--body "${body.replace(/"/g, '\\"')}"`);
    if (state) flags.push(`--state "${state}"`);
    if (labels) labels.forEach(l => flags.push(`--add-label "${l}"`));
    
    if (flags.length === 0) return { success: true };
    
    exec(`gh issue edit ${issueId} --repo ${REPO} ${flags.join(" ")}`);
    return { success: true };
  },
});

const createPrTool = defineTool({
  name: "github_pr_create",
  description: "创建 Pull Request",
  inputSchema: z.object({
    title: z.string(),
    body: z.string(),
    head: z.string(),
    base: z.string().default("main"),
    draft: z.boolean().default(true),
    labels: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    prNumber: z.string(),
    url: z.string(),
  }),
  handler: async ({ title, body, head, base, draft, labels }, cwd) => { // cwd needed context
    // Determine working directory: either passed explicitly or current cwd
    // Note: MCP tools don't receive cwd automatically unless passed, 
    // but here we assume exec runs in project root unless we're in a worktree.
    // For PR creation, we typically need to be in the repo or specify repo.
    // Since we use `gh ... --repo ${REPO}`, path matters less BUT head branch must be pushed.
    
    const draftFlag = draft ? "--draft" : "";
    const labelFlag = labels ? labels.map(l => `--label "${l}"`).join(" ") : "";
    
    const url = exec(`gh pr create --repo ${REPO} ${draftFlag} --title "${title}" --body "${body.replace(/"/g, '\\"')}" --base "${base}" --head "${head}" ${labelFlag}`);
    const prNumber = url.split("/").pop() || "";
    
    return { prNumber, url };
  },
});

const markPrReadyTool = defineTool({
  name: "github_pr_ready",
  description: "将 Draft PR 标记为 Ready",
  inputSchema: z.object({
    prNumber: z.string(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  handler: async ({ prNumber }) => {
    exec(`gh pr ready ${prNumber} --repo ${REPO}`);
    return { success: true };
  },
});

const createWorktreeTool = defineTool({
  name: "git_worktree_create",
  description: "创建 Git Worktree 和分支",
  inputSchema: z.object({
    name: z.string(),
    baseBranch: z.string().default("main"),
  }),
  outputSchema: z.object({
    path: z.string(),
    branch: z.string(),
  }),
  handler: async ({ name, baseBranch }) => {
    const branchName = `feat/${name}`;
    const worktreePath = `${WORKTREE_BASE}/${name}`;
    
    if (existsSync(worktreePath)) {
      throw new Error(`Worktree ${worktreePath} already exists`);
    }
    
    exec(`git worktree add -b ${branchName} ${worktreePath} ${baseBranch}`);
    
    return { path: worktreePath, branch: branchName };
  },
});

const pushWorktreeTool = defineTool({
  name: "git_worktree_push",
  description: "提交并推送当前 Worktree 的更改",
  inputSchema: z.object({
    path: z.string().describe("Worktree 绝对路径或相对路径"),
    message: z.string().optional().default("chore: update"),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  handler: async ({ path, message }) => {
    // 1. Check status
    const status = safeExec("git status --porcelain", path);
    if (status) {
      exec("git add -A", path);
      exec(`git commit -m "${message}"`, path);
    }
    
    // 2. Push
    const branch = exec("git branch --show-current", path);
    exec(`git push -u origin ${branch}`, path);
    
    return { success: true };
  },
});

// =============================================================================
// Export
// =============================================================================

export const tools = [
  createIssueTool,
  updateIssueTool,
  createPrTool,
  markPrReadyTool,
  createWorktreeTool,
  pushWorktreeTool,
];

// =============================================================================
// Standalone Server
// =============================================================================

const isMain = process.argv[1]?.endsWith("git-workflow.mcp.ts") || process.argv[1]?.endsWith("git-workflow.mcp.js");

if (isMain) {
  createMcpServer({
    name: "git-workflow",
    description: "Git & GitHub Workflow Tools",
    tools,
    autoStart: true,
  });
}
