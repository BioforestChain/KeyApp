#!/usr/bin/env bun
/**
 * Roadmap MCP - GitHub Roadmap 工具集
 *
 * 从 GitHub Issues 获取项目 Roadmap 信息。
 */

import { execSync } from "node:child_process";
import { z } from "zod";
import { createMcpServer, defineTool } from "../../../packages/flow/src/common/mcp/base-mcp.js";

// =============================================================================
// Types
// =============================================================================

export interface RoadmapItem {
  issueNumber: number;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  release?: string;
  assignees: string[];
  labels: string[];
  url: string;
}

export interface RoadmapStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  progress: number;
}

// =============================================================================
// Pure Functions (供 workflows 调用)
// =============================================================================

export function fetchRoadmapItems(release?: string): RoadmapItem[] {
  try {
    const cmd = `gh issue list --repo BioforestChain/KeyApp --state all --limit 200 --json number,title,state,labels,assignees,url`;
    const issues = JSON.parse(execSync(cmd, { encoding: "utf-8" }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: RoadmapItem[] = issues.map((issue: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const labels = issue.labels?.map((l: any) => l.name) || [];
      const releaseLabel = labels.find((l: string) => l.startsWith("roadmap:"));
      const itemRelease = releaseLabel?.replace("roadmap:", "").toUpperCase();

      let status: "Todo" | "In Progress" | "Done" = "Todo";
      if (issue.state === "CLOSED") status = "Done";
      else if (labels.includes("in-progress")) status = "In Progress";

      return {
        issueNumber: issue.number,
        title: issue.title,
        status,
        release: itemRelease,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignees: issue.assignees?.map((a: any) => a.login) || [],
        labels,
        url: issue.url,
      };
    });

    return release ? items.filter((i) => i.release === release.toUpperCase()) : items;
  } catch {
    return [];
  }
}

export function calcStats(items: RoadmapItem[]): RoadmapStats {
  const done = items.filter((i) => i.status === "Done").length;
  const inProgress = items.filter((i) => i.status === "In Progress").length;
  const todo = items.filter((i) => i.status === "Todo").length;
  return {
    total: items.length,
    done,
    inProgress,
    todo,
    progress: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
  };
}

export function formatRoadmapItems(items: RoadmapItem[], release?: string): string {
  const stats = calcStats(items);
  if (items.length === 0) return release ? `No items found for ${release}` : "No roadmap items found";

  const lines: string[] = [
    `# Roadmap${release ? ` (${release})` : ""}`,
    `Progress: ${stats.done}/${stats.total} (${stats.progress}%)`,
    "",
  ];

  const inProgress = items.filter((i) => i.status === "In Progress");
  const todo = items.filter((i) => i.status === "Todo");
  const done = items.filter((i) => i.status === "Done");

  if (inProgress.length > 0) {
    lines.push("## In Progress");
    for (const item of inProgress) {
      const assignees = item.assignees.length ? ` @${item.assignees.join(",")}` : "";
      lines.push(`- #${item.issueNumber} ${item.title}${assignees}`);
    }
    lines.push("");
  }

  if (todo.length > 0) {
    lines.push("## Todo");
    for (const item of todo) lines.push(`- #${item.issueNumber} ${item.title}`);
    lines.push("");
  }

  if (done.length > 0) {
    lines.push("## Done");
    for (const item of done.slice(0, 10)) lines.push(`- #${item.issueNumber} ${item.title}`);
    if (done.length > 10) lines.push(`  ... and ${done.length - 10} more`);
  }

  return lines.join("\n");
}

export function getCurrentSummary(): string {
  const items = fetchRoadmapItems("V1");
  if (items.length === 0) return "";

  const stats = calcStats(items);
  const inProgress = items.filter((i) => i.status === "In Progress");
  const todo = items.filter((i) => i.status === "Todo");

  const lines: string[] = [`# 当前任务 (V1) ${stats.done}/${stats.total} done`, ""];

  if (inProgress.length > 0) {
    lines.push("进行中:");
    for (const t of inProgress) {
      const assignees = t.assignees.length ? ` @${t.assignees.join(",")}` : "";
      lines.push(`  #${t.issueNumber} ${t.title}${assignees}`);
    }
  }

  if (todo.length > 0) {
    lines.push("待领取:");
    for (const t of todo.slice(0, 5)) lines.push(`  #${t.issueNumber} ${t.title}`);
    if (todo.length > 5) lines.push(`  ... and ${todo.length - 5} more`);
  }

  return lines.join("\n");
}

// =============================================================================
// MCP Tools
// =============================================================================

export const listTool = defineTool({
  name: "roadmap_list",
  description: "获取 Roadmap 任务列表，可按版本筛选。",
  inputSchema: z.object({
    release: z.string().optional().describe("版本号，如 V1, V2"),
  }),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async ({ release }) => ({ formatted: formatRoadmapItems(fetchRoadmapItems(release), release) }),
});

export const statsTool = defineTool({
  name: "roadmap_stats",
  description: "获取 Roadmap 进度统计。",
  inputSchema: z.object({
    release: z.string().optional().describe("版本号"),
  }),
  outputSchema: z.object({
    total: z.number(),
    done: z.number(),
    inProgress: z.number(),
    todo: z.number(),
    progress: z.number(),
  }),
  handler: async ({ release }) => calcStats(fetchRoadmapItems(release)),
});

export const currentTool = defineTool({
  name: "roadmap_current",
  description: "获取当前版本 (V1) 任务摘要。",
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async () => ({ formatted: getCurrentSummary() }),
});

// =============================================================================
// Export
// =============================================================================

export const tools = [listTool, statsTool, currentTool];

// =============================================================================
// Standalone MCP Server
// =============================================================================

const isMain = process.argv[1]?.endsWith("roadmap.mcp.ts") || process.argv[1]?.endsWith("roadmap.mcp.js");

if (isMain) {
  createMcpServer({
    name: "roadmap",
    description: "Roadmap 工具集 - GitHub Issues 任务管理",
    tools,
    autoStart: true,
  });
}
