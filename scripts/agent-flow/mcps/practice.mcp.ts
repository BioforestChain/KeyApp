#!/usr/bin/env bun
/**
 * Practice MCP - 最佳实践管理工具集
 *
 * 管理项目的最佳实践列表，存储在 docs/white-book/00-Manifesto/07-Best-Practices.md。
 * AI 在开发过程中发现的可复用规律应及时添加到最佳实践中。
 *
 * 工具列表:
 * - list: 列出所有最佳实践
 * - add: 添加新实践
 * - remove: 删除实践
 * - update: 更新实践内容
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";
import {
  createMcpServer,
  defineTool,
} from "../../../packages/flow/src/common/mcp/base-mcp.js";

// =============================================================================
// Constants
// =============================================================================

const ROOT_DIR = process.cwd();
const PRACTICE_FILE = join(
  ROOT_DIR,
  "docs/white-book/00-Manifesto/07-Best-Practices.md"
);

const DEFAULT_CONTENT = `# 最佳实践

1. 先阅读白皮书相关章节，再开始编码
2. 使用 TypeScript 严格模式，避免 any 类型
3. 所有组件必须有 Storybook story
4. 所有业务逻辑必须有单元测试
5. PR 描述使用 \`Closes #issue编号\` 自动关联任务
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

/**
 * 确保最佳实践文件存在
 */
export function ensurePracticeFile(): void {
  if (!existsSync(PRACTICE_FILE)) {
    mkdirSync(dirname(PRACTICE_FILE), { recursive: true });
    writeFileSync(PRACTICE_FILE, DEFAULT_CONTENT, "utf-8");
  }
}

/**
 * 解析最佳实践列表
 */
export function parsePractices(content: string): Practice[] {
  const practices: Practice[] = [];
  let index = 0;
  for (const line of content.split("\n")) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      practices.push({ index: ++index, content: match[1] });
    }
  }
  return practices;
}

/**
 * 格式化最佳实践为 Markdown
 */
export function formatPractices(practices: Practice[]): string {
  return practices.length > 0
    ? `# 最佳实践\n\n${practices.map((p) => `${p.index}. ${p.content}`).join("\n")}`
    : "暂无最佳实践";
}

/**
 * 获取所有最佳实践
 */
export function listPractices(): Practice[] {
  ensurePracticeFile();
  const content = readFileSync(PRACTICE_FILE, "utf-8");
  return parsePractices(content);
}

/**
 * 添加最佳实践
 */
export function addPractice(practiceContent: string): Practice[] {
  ensurePracticeFile();
  const content = readFileSync(PRACTICE_FILE, "utf-8");
  const practices = parsePractices(content);
  practices.push({ index: practices.length + 1, content: practiceContent });
  savePractices(practices);
  return practices;
}

/**
 * 删除最佳实践
 */
export function removePractice(target: string | number): Practice[] {
  ensurePracticeFile();
  const content = readFileSync(PRACTICE_FILE, "utf-8");
  let practices = parsePractices(content);

  if (typeof target === "number") {
    practices = practices.filter((p) => p.index !== target);
  } else {
    const index = parseInt(target, 10);
    if (!isNaN(index)) {
      practices = practices.filter((p) => p.index !== index);
    } else {
      practices = practices.filter((p) => !p.content.includes(target));
    }
  }

  // Re-index
  practices = practices.map((p, i) => ({ ...p, index: i + 1 }));
  savePractices(practices);
  return practices;
}

/**
 * 更新最佳实践
 */
export function updatePractice(index: number, newContent: string): Practice[] {
  ensurePracticeFile();
  const content = readFileSync(PRACTICE_FILE, "utf-8");
  const practices = parsePractices(content).map((p) =>
    p.index === index ? { ...p, content: newContent } : p
  );
  savePractices(practices);
  return practices;
}

// =============================================================================
// Internal Helpers
// =============================================================================

function savePractices(practices: Practice[]): void {
  const content = `# 最佳实践\n\n${practices.map((p) => `${p.index}. ${p.content}`).join("\n")}\n`;
  writeFileSync(PRACTICE_FILE, content, "utf-8");
}

// =============================================================================
// MCP Tools
// =============================================================================

export const listTool = defineTool({
  name: "practice_list",
  description: `列出所有最佳实践。

返回当前项目的最佳实践列表，这些是开发过程中总结的可复用规律。
开始开发前应先查看最佳实践，避免重复踩坑。`,
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async () => {
    const practices = listPractices();
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const addTool = defineTool({
  name: "practice_add",
  description: `添加新的最佳实践。

当发现可复用的开发规律时，应及时添加到最佳实践中。
例如："使用 useSuspenseQuery 替代 useQuery 以简化加载状态处理"`,
  inputSchema: z.object({
    content: z.string().describe("最佳实践内容，简洁明了"),
  }),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async ({ content }) => {
    const practices = addPractice(content);
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const removeTool = defineTool({
  name: "practice_remove",
  description: `删除最佳实践。

参数:
- target: 序号（如 "3"）或内容关键词

当某条实践过时或不再适用时删除。`,
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
  description: `更新最佳实践内容。

参数:
- index: 要更新的序号
- content: 新内容

当需要修正或完善某条实践时使用。`,
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

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("practice.mcp.ts") ||
    process.argv[1].endsWith("practice.mcp.js"));

if (isMain) {
  createMcpServer({
    name: "practice",
    description: `最佳实践管理工具集

管理项目开发中总结的可复用规律。存储在白皮书 00-Manifesto/07-Best-Practices.md。

提供以下工具:
- practice_list: 列出所有实践
- practice_add: 添加新实践
- practice_remove: 删除实践
- practice_update: 更新实践`,
    tools,
    autoStart: true,
  });
}
