/**
 * Roadmap MCP - GitHub Issues 工具
 */

import { z } from "zod";
import { defineTool, createMcpServer } from "../../../packages/flow/src/common/mcp/base-mcp.js";
import { execSync } from "node:child_process";

// =============================================================================
// Internal Types & Functions
// =============================================================================

interface RoadmapItem {
  issueNumber: number;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  release?: string;
  assignees: string[];
  labels: string[];
  url: string;
}

interface RoadmapStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  progress: number;
}

function fetchItems(release?: string): RoadmapItem[] {
  try {
    const cmd = `gh issue list --repo BioforestChain/KeyApp --state all --limit 200 --json number,title,state,labels,assignees,url`;
    const result = execSync(cmd, { encoding: "utf-8" });
    const issues = JSON.parse(result);

    const items: RoadmapItem[] = issues.map((issue: any) => {
      const labels = issue.labels?.map((l: any) => l.name) || [];
      const releaseLabel = labels.find((l: string) => l.startsWith("roadmap:"));
      const itemRelease = releaseLabel?.replace("roadmap:", "").toUpperCase();

      let status: "Todo" | "In Progress" | "Done" = "Todo";
      if (issue.state === "CLOSED") {
        status = "Done";
      } else if (labels.includes("in-progress")) {
        status = "In Progress";
      }

      return {
        issueNumber: issue.number,
        title: issue.title,
        status,
        release: itemRelease,
        assignees: issue.assignees?.map((a: any) => a.login) || [],
        labels,
        url: issue.url,
      };
    });

    if (release) {
      return items.filter((i) => i.release === release.toUpperCase());
    }
    return items;
  } catch {
    return [];
  }
}

function calcStats(items: RoadmapItem[]): RoadmapStats {
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

function formatItems(items: RoadmapItem[], release?: string): string {
  const stats = calcStats(items);
  if (items.length === 0) {
    return release ? `No items found for ${release}` : "No roadmap items found";
  }

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
    for (const item of todo) {
      lines.push(`- #${item.issueNumber} ${item.title}`);
    }
    lines.push("");
  }

  if (done.length > 0) {
    lines.push("## Done");
    for (const item of done.slice(0, 10)) {
      lines.push(`- #${item.issueNumber} ${item.title}`);
    }
    if (done.length > 10) {
      lines.push(`  ... and ${done.length - 10} more`);
    }
  }

  return lines.join("\n");
}

// =============================================================================
// MCP Tools
// =============================================================================

export const list = defineTool({
  name: "roadmap_list",
  description: "获取 Roadmap 任务列表",
  inputSchema: z.object({
    release: z.string().optional().describe("版本号，如 V1, V2"),
  }),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async ({ release }) => {
    const items = fetchItems(release);
    return { formatted: formatItems(items, release) };
  },
});

export const stats = defineTool({
  name: "roadmap_stats",
  description: "获取 Roadmap 统计信息",
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
  handler: async ({ release }) => {
    const items = fetchItems(release);
    return calcStats(items);
  },
});

export const current = defineTool({
  name: "roadmap_current",
  description: "获取当前版本任务摘要",
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async () => {
    const items = fetchItems("V1");
    if (items.length === 0) return { formatted: "" };

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
      for (const t of todo.slice(0, 5)) {
        lines.push(`  #${t.issueNumber} ${t.title}`);
      }
    }

    return { formatted: lines.join("\n") };
  },
});

// =============================================================================
// Export all tools
// =============================================================================

export const tools = [list, stats, current];

// =============================================================================
// Standalone MCP Server
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  createMcpServer({
    name: "roadmap",
    description: "Roadmap 工具",
    tools,
    autoStart: true,
  });
}
