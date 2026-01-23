#!/usr/bin/env bun
/**
 * Practice MCP - 最佳实践管理工具集
 *
 * 管理项目的最佳实践列表，存储在白皮书 00-Manifesto/07-Best-Practices.md。
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";
import { createMcpServer, defineTool } from "../../../packages/flow/src/common/mcp/base-mcp.ts";

// =============================================================================
// Constants
// =============================================================================

const ROOT_DIR = process.cwd();
const PRACTICE_FILE = join(ROOT_DIR, "docs/white-book/00-Manifesto/07-Best-Practices.md");

const DEFAULT_CONTENT = `# 最佳实践

> 由 \`pnpm agent practice\` 维护。

## 列表

- ❌ Radix Dialog / position:fixed → ✅ Stackflow BottomSheet/Modal
- ❌ React Router → ✅ Stackflow push/pop/replace
- ❌ 复制 mpay 代码 → ✅ 理解后用 React/TS 重写
- ❌ 明文选择器 → ✅ data-testid
- ❌ 安装新 UI 库 → ✅ shadcn/ui（已集成）
`;

// =============================================================================
// Types
// =============================================================================

export interface Practice {
  index: number;
  content: string;
}

// =============================================================================
// Pure Functions (供 workflows 调用)
// =============================================================================

export function ensurePracticeFile(): void {
  if (!existsSync(PRACTICE_FILE)) {
    mkdirSync(dirname(PRACTICE_FILE), { recursive: true });
    writeFileSync(PRACTICE_FILE, DEFAULT_CONTENT, "utf-8");
  }
}

export function parsePractices(content: string): Practice[] {
  const practices: Practice[] = [];
  let index = 0;
  for (const line of content.split("\n")) {
    // 支持 `- xxx` 格式（原版）和 `1. xxx` 格式
    const match = line.match(/^-\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/);
    if (match) practices.push({ index: ++index, content: match[1] });
  }
  return practices;
}

export function formatPractices(practices: Practice[]): string {
  return practices.length > 0
    ? `# 最佳实践\n\n${practices.map((p) => `- ${p.content}`).join("\n")}`
    : "暂无最佳实践";
}

export function listPractices(): Practice[] {
  ensurePracticeFile();
  return parsePractices(readFileSync(PRACTICE_FILE, "utf-8"));
}

export function addPractice(practiceContent: string): Practice[] {
  ensurePracticeFile();
  const practices = parsePractices(readFileSync(PRACTICE_FILE, "utf-8"));
  practices.push({ index: practices.length + 1, content: practiceContent });
  savePractices(practices);
  return practices;
}

export function removePractice(target: string | number): Practice[] {
  ensurePracticeFile();
  let practices = parsePractices(readFileSync(PRACTICE_FILE, "utf-8"));
  const index = typeof target === "number" ? target : parseInt(target, 10);
  
  if (!isNaN(index)) {
    practices = practices.filter((p) => p.index !== index);
  } else {
    practices = practices.filter((p) => !p.content.includes(String(target)));
  }

  practices = practices.map((p, i) => ({ ...p, index: i + 1 }));
  savePractices(practices);
  return practices;
}

export function updatePractice(index: number, newContent: string): Practice[] {
  ensurePracticeFile();
  const practices = parsePractices(readFileSync(PRACTICE_FILE, "utf-8")).map((p) =>
    p.index === index ? { ...p, content: newContent } : p
  );
  savePractices(practices);
  return practices;
}

function savePractices(practices: Practice[]): void {
  const content = `# 最佳实践

> 由 \`pnpm agent practice\` 维护。

## 列表

${practices.map((p) => `- ${p.content}`).join("\n")}
`;
  writeFileSync(PRACTICE_FILE, content, "utf-8");
}

// =============================================================================
// MCP Tools
// =============================================================================

export const listTool = defineTool({
  name: "practice_list",
  description: "列出所有最佳实践。",
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async () => {
    const practices = listPractices();
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const addTool = defineTool({
  name: "practice_add",
  description: "添加新的最佳实践。",
  inputSchema: z.object({
    content: z.string().describe("最佳实践内容"),
  }),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async ({ content }) => {
    const practices = addPractice(content);
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const removeTool = defineTool({
  name: "practice_remove",
  description: "删除最佳实践，通过序号或内容关键词匹配。",
  inputSchema: z.object({
    target: z.string().describe("序号或内容关键词"),
  }),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async ({ target }) => {
    const practices = removePractice(target);
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const updateTool = defineTool({
  name: "practice_update",
  description: "更新指定序号的最佳实践内容。",
  inputSchema: z.object({
    index: z.number().describe("序号"),
    content: z.string().describe("新内容"),
  }),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async ({ index, content }) => {
    const practices = updatePractice(index, content);
    return { formatted: formatPractices(practices) };
  },
});

// =============================================================================
// Export
// =============================================================================

export const tools = [listTool, addTool, removeTool, updateTool];

// =============================================================================
// Standalone MCP Server
// =============================================================================

const isMain = process.argv[1]?.endsWith("practice.mcp.ts") || process.argv[1]?.endsWith("practice.mcp.js");

if (isMain) {
  createMcpServer({
    name: "practice",
    description: "最佳实践管理工具集",
    tools,
    autoStart: true,
  });
}
