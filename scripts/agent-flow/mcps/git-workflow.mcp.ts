#!/usr/bin/env -S deno run -A --unstable-sloppy-imports
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
} from "../../../packages/flow/src/common/mcp/base-mcp.ts";

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
// Pure Functions (Exports)
// =============================================================================

export async function createIssue(args: { title: string; body: string; labels?: string[]; assignee?: string }) {
  const { title, body, labels, assignee = "@me" } = args;
  const labelFlag = labels ? labels.map(l => `--label "${l}"`).join(" ") : "";
  const assigneeFlag = assignee ? `--assignee "${assignee}"` : "";
  const safeBody = body.replace(/"/g, '\\"');
  
  const url = exec(`gh issue create --repo ${REPO} --title "${title}" --body "${safeBody}" ${labelFlag} ${assigneeFlag}`);
  const issueId = url.split("/").pop() || "";
  return { issueId, url };
}

export async function updateIssue(args: { issueId: string; body?: string; state?: "open" | "closed"; labels?: string[] }) {
  const { issueId, body, state, labels } = args;
  let flags = [];
  if (body) flags.push(`--body "${body.replace(/"/g, '\\"')}"`);
  if (state) flags.push(`--state "${state}"`);
  if (labels) labels.forEach(l => flags.push(`--add-label "${l}"`));
  
  if (flags.length > 0) {
    exec(`gh issue edit ${issueId} --repo ${REPO} ${flags.join(" ")}`);
  }
  return { success: true };
}

export async function createPr(args: { title: string; body: string; head: string; base?: string; draft?: boolean; labels?: string[] }) {
  const { title, body, head, base = "main", draft = true, labels } = args;
  const draftFlag = draft ? "--draft" : "";
  const labelFlag = labels ? labels.map(l => `--label "${l}"`).join(" ") : "";
  
  const url = exec(`gh pr create --repo ${REPO} ${draftFlag} --title "${title}" --body "${body.replace(/"/g, '\\"')}" --base "${base}" --head "${head}" ${labelFlag}`);
  const prNumber = url.split("/").pop() || "";
  return { prNumber, url };
}

export async function markPrReady(args: { prNumber: string }) {
  exec(`gh pr ready ${args.prNumber} --repo ${REPO}`);
  return { success: true };
}

export async function createWorktree(args: { name: string; baseBranch?: string }) {
  const { name, baseBranch = "main" } = args;
  const branchName = `feat/${name}`;
  const worktreePath = `${WORKTREE_BASE}/${name}`;
  
  if (existsSync(worktreePath)) {
    throw new Error(`Worktree ${worktreePath} already exists`);
  }
  
  exec(`git worktree add -b ${branchName} ${worktreePath} ${baseBranch}`);
  return { path: worktreePath, branch: branchName };
}

export async function pushWorktree(args: { path: string; message?: string }) {
  const { path, message = "chore: update" } = args;
  const status = safeExec("git status --porcelain", path);
  if (status) {
    exec("git add -A", path);
    exec(`git commit -m "${message}"`, path);
  }
  const branch = exec("git branch --show-current", path);
  exec(`git push -u origin ${branch}`, path);
  return { success: true };
}

export async function getWorktreeInfo(cwd: string = Deno.cwd()) {
  if (cwd.includes(WORKTREE_BASE)) {
    const match = cwd.match(new RegExp(`${WORKTREE_BASE}/([^/]+)`));
    if (match) {
      const name = match[1];
      const issueMatch = name.match(/issue-(\d+)/);
      return {
        name,
        path: cwd, // Assuming we are in the root of the worktree or deeper
        issueId: issueMatch ? issueMatch[1] : null,
      };
    }
  }
  return null;
}

// =============================================================================
// MCP Tools (Wrappers)
// =============================================================================

const createIssueTool = defineTool({
  name: "github_issue_create",
  description: "创建 GitHub Issue",
  inputSchema: z.object({
    title: z.string(),
    body: z.string(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
  }),
  outputSchema: z.object({ issueId: z.string(), url: z.string() }),
  handler: createIssue,
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
  handler: updateIssue,
});

const createPrTool = defineTool({
  name: "github_pr_create",
  description: "创建 Pull Request",
  inputSchema: z.object({
    title: z.string(),
    body: z.string(),
    head: z.string(),
    base: z.string().optional(),
    draft: z.boolean().optional(),
    labels: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({ prNumber: z.string(), url: z.string() }),
  handler: createPr,
});

const markPrReadyTool = defineTool({
  name: "github_pr_ready",
  description: "将 Draft PR 标记为 Ready",
  inputSchema: z.object({ prNumber: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  handler: markPrReady,
});

const createWorktreeTool = defineTool({
  name: "git_worktree_create",
  description: "创建 Git Worktree 和分支",
  inputSchema: z.object({ name: z.string(), baseBranch: z.string().optional() }),
  outputSchema: z.object({ path: z.string(), branch: z.string() }),
  handler: createWorktree,
});

const pushWorktreeTool = defineTool({
  name: "git_worktree_push",
  description: "提交并推送当前 Worktree 的更改",
  inputSchema: z.object({ path: z.string(), message: z.string().optional() }),
  outputSchema: z.object({ success: z.boolean() }),
  handler: pushWorktree,
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

// const isMain = import.meta.main; // Deno
// if (isMain) { ... }
// For now, assume this is mostly imported.
