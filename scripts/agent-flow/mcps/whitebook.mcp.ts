/**
 * White Book MCP - 白皮书相关工具
 */

import { z } from "zod";
import { defineTool, createMcpServer } from "../../../packages/flow/src/common/mcp/base-mcp.js";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT_DIR = process.cwd();
const WHITE_BOOK_DIR = join(ROOT_DIR, "docs/white-book");

// =============================================================================
// Internal Functions
// =============================================================================

interface ChapterInfo {
  name: string;
  path: string;
  relativePath: string;
  indexPath?: string;
  subChapters: ChapterInfo[];
}

function getChapters(dir: string): ChapterInfo[] {
  if (!existsSync(dir)) return [];

  const items = readdirSync(dir)
    .filter((item) => !item.startsWith("."))
    .sort();

  const chapters: ChapterInfo[] = [];

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const entryFiles = ["README.md", "00-Index.md", "index.md"];
      let indexPath: string | undefined;
      for (const entry of entryFiles) {
        const entryPath = join(fullPath, entry);
        if (existsSync(entryPath)) {
          indexPath = entryPath;
          break;
        }
      }

      chapters.push({
        name: item,
        path: fullPath,
        relativePath: relative(WHITE_BOOK_DIR, fullPath),
        indexPath,
        subChapters: getChapters(fullPath),
      });
    } else if (
      item.endsWith(".md") &&
      !["index.md", "README.md", "00-Index.md"].includes(item)
    ) {
      chapters.push({
        name: item.replace(".md", ""),
        path: fullPath,
        relativePath: relative(WHITE_BOOK_DIR, fullPath),
        subChapters: [],
      });
    }
  }

  return chapters;
}

function formatToc(chapters: ChapterInfo[], indent = 0): string {
  const lines: string[] = [];
  for (const chapter of chapters) {
    const prefix = "  ".repeat(indent);
    lines.push(`${prefix}- ${chapter.name} (${chapter.relativePath})`);
    if (chapter.subChapters.length > 0) {
      lines.push(formatToc(chapter.subChapters, indent + 1));
    }
  }
  return lines.join("\n");
}

// =============================================================================
// MCP Tools
// =============================================================================

export const toc = defineTool({
  name: "whitebook_toc",
  description: "获取白皮书目录结构",
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async () => {
    const chapters = getChapters(WHITE_BOOK_DIR);
    return { formatted: `# 白皮书目录结构\n\n${formatToc(chapters)}` };
  },
});

export const chapter = defineTool({
  name: "whitebook_chapter",
  description: "读取白皮书章节内容",
  inputSchema: z.object({
    path: z.string().describe("章节路径"),
  }),
  outputSchema: z.object({
    content: z.string(),
    subFiles: z.array(z.object({ name: z.string(), content: z.string() })).optional(),
  }),
  handler: async ({ path: chapterPath }) => {
    const fullPath = join(WHITE_BOOK_DIR, chapterPath);

    if (!existsSync(fullPath)) {
      throw new Error(`章节不存在: ${chapterPath}`);
    }

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const entryFiles = ["README.md", "00-Index.md", "index.md"];
      let content = "";

      for (const entry of entryFiles) {
        const entryPath = join(fullPath, entry);
        if (existsSync(entryPath)) {
          content = readFileSync(entryPath, "utf-8");
          break;
        }
      }

      const subFiles = readdirSync(fullPath)
        .filter((f) => f.endsWith(".md") && !["index.md", "README.md", "00-Index.md"].includes(f))
        .sort()
        .map((f) => ({
          name: f.replace(".md", ""),
          content: readFileSync(join(fullPath, f), "utf-8"),
        }));

      return { content, subFiles };
    } else if (fullPath.endsWith(".md")) {
      return { content: readFileSync(fullPath, "utf-8") };
    }

    throw new Error(`无效路径: ${chapterPath}`);
  },
});

export const search = defineTool({
  name: "whitebook_search",
  description: "在白皮书中搜索内容",
  inputSchema: z.object({
    query: z.string().describe("搜索关键词"),
  }),
  outputSchema: z.object({
    results: z.array(z.object({ path: z.string(), line: z.number(), text: z.string() })),
    count: z.number(),
  }),
  handler: async ({ query }) => {
    const results: { path: string; line: number; text: string }[] = [];
    const lowerQuery = query.toLowerCase();

    function searchDir(dir: string) {
      if (!existsSync(dir)) return;
      const items = readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        if (stat.isDirectory() && !item.startsWith(".")) {
          searchDir(fullPath);
        } else if (item.endsWith(".md")) {
          const content = readFileSync(fullPath, "utf-8");
          content.split("\n").forEach((line, idx) => {
            if (line.toLowerCase().includes(lowerQuery)) {
              results.push({
                path: relative(WHITE_BOOK_DIR, fullPath),
                line: idx + 1,
                text: line.trim().slice(0, 100),
              });
            }
          });
        }
      }
    }

    searchDir(WHITE_BOOK_DIR);
    return { results: results.slice(0, 50), count: Math.min(results.length, 50) };
  },
});

export const knowledgeMap = defineTool({
  name: "whitebook_knowledge_map",
  description: "获取知识地图",
  inputSchema: z.object({}),
  outputSchema: z.object({ content: z.string() }),
  handler: async () => ({
    content: `# 知识地图

代码:
  src/stackflow/   → 导航配置、Activity
  src/services/    → 服务层、Adapter 模式
  src/stores/      → TanStack Store 状态管理
  src/queries/     → TanStack Query 数据获取
  src/components/  → UI 组件
  src/i18n/        → 国际化

白皮书:
  00-Manifesto/    → 愿景、技术栈、架构
  01-Kernel-Ref/   → 进程、窗口、沙箱
  02-Driver-Ref/   → 链驱动、Provider
  03-UI-Ref/       → 颜色、组件
  10-Wallet-Guide/ → 钱包功能
  90-DevOps/       → 测试、发布`,
  }),
});

// =============================================================================
// Export all tools
// =============================================================================

export const tools = [toc, chapter, search, knowledgeMap];

// =============================================================================
// Standalone MCP Server
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  createMcpServer({
    name: "whitebook",
    description: "白皮书工具",
    tools,
    autoStart: true,
  });
}
