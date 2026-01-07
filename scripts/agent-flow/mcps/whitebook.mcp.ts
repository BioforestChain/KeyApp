#!/usr/bin/env bun
/**
 * Whitebook MCP - 白皮书读写工具集
 *
 * 提供白皮书的查阅、搜索、知识地图等原子操作。
 * 被 workflows 组合调用，也可独立作为 MCP 服务器运行。
 *
 * 工具列表:
 * - toc: 获取白皮书目录结构
 * - chapter: 读取指定章节内容
 * - search: 全文搜索
 * - knowledge_map: 获取代码与文档的知识地图
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import {
  createMcpServer,
  defineTool,
} from "../../../packages/flow/src/common/mcp/base-mcp.js";

// =============================================================================
// Constants
// =============================================================================

const ROOT_DIR = process.cwd();
const WHITE_BOOK_DIR = join(ROOT_DIR, "docs/white-book");

// =============================================================================
// Types
// =============================================================================

export interface ChapterInfo {
  name: string;
  path: string;
  relativePath: string;
  indexPath?: string;
  subChapters: ChapterInfo[];
}

export interface SearchResult {
  path: string;
  line: number;
  text: string;
}

export interface ChapterContent {
  content: string;
  subFiles?: Array<{ name: string; content: string }>;
}

// =============================================================================
// Pure Functions (供 workflows 调用)
// =============================================================================

/**
 * 获取白皮书目录结构
 */
export function getToc(): ChapterInfo[] {
  return getChaptersRecursive(WHITE_BOOK_DIR);
}

/**
 * 格式化目录为可读文本
 */
export function formatToc(chapters: ChapterInfo[], indent = 0): string {
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

/**
 * 读取章节内容
 */
export function getChapter(chapterPath: string): ChapterContent {
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
      .filter(
        (f) =>
          f.endsWith(".md") &&
          !["index.md", "README.md", "00-Index.md"].includes(f)
      )
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
}

/**
 * 搜索白皮书内容
 */
export function searchContent(query: string, limit = 50): SearchResult[] {
  const results: SearchResult[] = [];
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
  return results.slice(0, limit);
}

/**
 * 获取知识地图
 */
export function getKnowledgeMap(): string {
  return `# 知识地图

## 代码结构
- src/stackflow/   → 导航配置、Activity、Sheet
- src/services/    → 服务层、Adapter 模式
- src/stores/      → TanStack Store 状态管理
- src/queries/     → TanStack Query 数据获取
- src/components/  → UI 组件（shadcn/ui）
- src/i18n/        → 国际化

## 白皮书章节
- 00-Manifesto/    → 愿景、技术栈、架构、最佳实践
- 01-Kernel-Ref/   → 进程、窗口、沙箱
- 02-Driver-Ref/   → 链驱动、Provider
- 03-UI-Ref/       → 颜色、组件规范
- 10-Wallet-Guide/ → 钱包功能指南
- 90-DevOps/       → 测试、发布、CI/CD

## 必读章节
1. 00-Manifesto/01-Vision.md - 项目愿景
2. 00-Manifesto/02-Tech-Stack.md - 技术栈
3. 00-Manifesto/07-Best-Practices.md - 最佳实践`;
}

// =============================================================================
// Internal Helpers
// =============================================================================

function getChaptersRecursive(dir: string): ChapterInfo[] {
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
        subChapters: getChaptersRecursive(fullPath),
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

// =============================================================================
// MCP Tools
// =============================================================================

export const tocTool = defineTool({
  name: "whitebook_toc",
  description: `获取白皮书完整目录结构。

返回所有章节的树形结构，包括：
- 章节名称和相对路径
- 子章节层级

用于了解白皮书整体结构，决定阅读哪些章节。`,
  inputSchema: z.object({}),
  outputSchema: z.object({ formatted: z.string() }),
  handler: async () => {
    const chapters = getToc();
    return { formatted: `# 白皮书目录结构\n\n${formatToc(chapters)}` };
  },
});

export const chapterTool = defineTool({
  name: "whitebook_chapter",
  description: `读取白皮书指定章节的完整内容。

参数:
- path: 章节路径（如 "00-Manifesto" 或 "00-Manifesto/01-Vision.md"）

如果是目录，返回索引文件和所有子文件内容。
如果是文件，返回文件内容。`,
  inputSchema: z.object({
    path: z.string().describe("章节路径，如 '00-Manifesto' 或 '00-Manifesto/01-Vision.md'"),
  }),
  outputSchema: z.object({
    content: z.string(),
    subFiles: z
      .array(z.object({ name: z.string(), content: z.string() }))
      .optional(),
  }),
  handler: async ({ path }) => getChapter(path),
});

export const searchTool = defineTool({
  name: "whitebook_search",
  description: `在白皮书中全文搜索。

参数:
- query: 搜索关键词

返回匹配的文件路径、行号和上下文文本（最多 50 条）。
用于快速定位相关内容。`,
  inputSchema: z.object({
    query: z.string().describe("搜索关键词"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({ path: z.string(), line: z.number(), text: z.string() })
    ),
    count: z.number(),
  }),
  handler: async ({ query }) => {
    const results = searchContent(query);
    return { results, count: results.length };
  },
});

export const knowledgeMapTool = defineTool({
  name: "whitebook_knowledge_map",
  description: `获取项目知识地图。

返回代码目录结构和白皮书章节的对应关系，帮助快速定位：
- 代码在哪里
- 文档在哪里
- 必读章节有哪些`,
  inputSchema: z.object({}),
  outputSchema: z.object({ content: z.string() }),
  handler: async () => ({ content: getKnowledgeMap() }),
});

// =============================================================================
// Export
// =============================================================================

export const tools = [tocTool, chapterTool, searchTool, knowledgeMapTool];

// =============================================================================
// Standalone MCP Server
// =============================================================================

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("whitebook.mcp.ts") ||
    process.argv[1].endsWith("whitebook.mcp.js"));

if (isMain) {
  createMcpServer({
    name: "whitebook",
    description: `白皮书工具集 - 查阅 KeyApp 技术文档

提供以下工具:
- whitebook_toc: 获取目录结构
- whitebook_chapter: 读取章节内容
- whitebook_search: 全文搜索
- whitebook_knowledge_map: 代码与文档对照图`,
    tools,
    autoStart: true,
  });
}
