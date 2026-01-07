/**
 * Roadmap Tools - GitHub Issues integration
 */

import { execSync } from "node:child_process";

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

/**
 * Fetch roadmap items from GitHub
 */
export function fetchRoadmap(release?: string): RoadmapItem[] {
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
      const normalizedRelease = release.toUpperCase();
      return items.filter((i) => i.release === normalizedRelease);
    }

    return items;
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return [];
  }
}

/**
 * Get roadmap statistics
 */
export function getRoadmapStats(release?: string): RoadmapStats {
  const items = fetchRoadmap(release);
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

/**
 * Format roadmap for display
 */
export function formatRoadmap(release?: string): string {
  const items = fetchRoadmap(release);
  const stats = getRoadmapStats(release);

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

/**
 * Get current tasks for readme
 */
export function getCurrentTasks(): string {
  const items = fetchRoadmap("V1");
  if (items.length === 0) return "";

  const inProgress = items.filter((i) => i.status === "In Progress");
  const todo = items.filter((i) => i.status === "Todo");
  const done = items.filter((i) => i.status === "Done");

  const lines: string[] = [
    `# 当前任务 (V1) ${done.length}/${items.length} done`,
    "",
  ];

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

  return lines.join("\n");
}
