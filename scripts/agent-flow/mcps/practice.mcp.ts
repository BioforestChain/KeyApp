/**
 * Practice MCP - 最佳实践工具
 */

import { z } from "zod";
import { defineTool, createMcpServer } from "../../../packages/flow/src/common/mcp/base-mcp.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT_DIR = process.cwd();
const PRACTICE_FILE = join(ROOT_DIR, "docs/white-book/00-Manifesto/07-Best-Practices.md");

const DEFAULT_CONTENT = `# 最佳实践

1. 先阅读白皮书相关章节，再开始编码
2. 使用 TypeScript 严格模式，避免 any 类型
3. 所有组件必须有 Storybook story
4. 所有业务逻辑必须有单元测试
5. PR 描述使用 \`Closes #issue编号\` 自动关联任务
`;

// =============================================================================
// Internal Functions
// =============================================================================

function ensureFile(): void {
  if (!existsSync(PRACTICE_FILE)) {
    mkdirSync(dirname(PRACTICE_FILE), { recursive: true });
    writeFileSync(PRACTICE_FILE, DEFAULT_CONTENT, "utf-8");
  }
}

interface Practice {
  index: number;
  content: string;
}

function parsePractices(content: string): Practice[] {
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

function formatPractices(practices: Practice[]): string {
  return practices.length > 0
    ? `# 最佳实践\n\n${practices.map((p) => `${p.index}. ${p.content}`).join("\n")}`
    : "暂无最佳实践";
}

function savePractices(practices: Practice[]): void {
  const content = `# 最佳实践\n\n${practices.map((p) => `${p.index}. ${p.content}`).join("\n")}\n`;
  writeFileSync(PRACTICE_FILE, content, "utf-8");
}

// =============================================================================
// MCP Tools
// =============================================================================

export const list = defineTool({
  name: "practice_list",
  description: "列出所有最佳实践",
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async () => {
    ensureFile();
    const content = readFileSync(PRACTICE_FILE, "utf-8");
    const practices = parsePractices(content);
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const add = defineTool({
  name: "practice_add",
  description: "添加新的最佳实践",
  inputSchema: z.object({
    content: z.string().describe("最佳实践内容"),
  }),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async ({ content }) => {
    ensureFile();
    const fileContent = readFileSync(PRACTICE_FILE, "utf-8");
    const practices = parsePractices(fileContent);
    practices.push({ index: practices.length + 1, content });
    savePractices(practices);
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const remove = defineTool({
  name: "practice_remove",
  description: "删除最佳实践",
  inputSchema: z.object({
    target: z.string().describe("序号或内容关键词"),
  }),
  outputSchema: z.object({ formatted: z.string(), count: z.number() }),
  handler: async ({ target }) => {
    ensureFile();
    const fileContent = readFileSync(PRACTICE_FILE, "utf-8");
    let practices = parsePractices(fileContent);
    const index = parseInt(target, 10);

    if (!isNaN(index)) {
      practices = practices.filter((p) => p.index !== index);
    } else {
      practices = practices.filter((p) => !p.content.includes(target));
    }

    // Re-index
    practices = practices.map((p, i) => ({ ...p, index: i + 1 }));
    savePractices(practices);
    return { formatted: formatPractices(practices), count: practices.length };
  },
});

export const update = defineTool({
  name: "practice_update",
  description: "更新最佳实践",
  inputSchema: z.object({
    index: z.number().describe("序号"),
    content: z.string().describe("新内容"),
  }),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async ({ index, content }) => {
    ensureFile();
    const fileContent = readFileSync(PRACTICE_FILE, "utf-8");
    const practices = parsePractices(fileContent).map((p) =>
      p.index === index ? { ...p, content } : p
    );
    savePractices(practices);
    return { formatted: formatPractices(practices) };
  },
});

// =============================================================================
// Export all tools
// =============================================================================

export const tools = [list, add, remove, update];

// =============================================================================
// Standalone MCP Server
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  createMcpServer({
    name: "practice",
    description: "最佳实践工具",
    tools,
    autoStart: true,
  });
}
