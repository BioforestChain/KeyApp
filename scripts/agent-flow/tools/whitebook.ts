/**
 * White Book Tools - Core implementation for both CLI and MCP
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT_DIR = process.cwd();
const WHITE_BOOK_DIR = join(ROOT_DIR, "docs/white-book");

export interface ChapterInfo {
  name: string;
  path: string;
  relativePath: string;
  indexPath?: string;
  subChapters: ChapterInfo[];
}

export interface TocResult {
  chapters: ChapterInfo[];
  formatted: string;
}

export interface ChapterContent {
  path: string;
  content: string;
  subFiles?: { name: string; content: string }[];
}

/**
 * Get chapters from directory
 */
export function getChapters(dir: string): ChapterInfo[] {
  if (!existsSync(dir)) return [];

  const items = readdirSync(dir)
    .filter((item) => !item.startsWith("."))
    .sort();

  const chapters: ChapterInfo[] = [];

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Check for entry files in order of priority
      const entryFiles = ["README.md", "00-Index.md", "index.md"];
      let indexPath: string | undefined;
      for (const entry of entryFiles) {
        const entryPath = join(fullPath, entry);
        if (existsSync(entryPath)) {
          indexPath = entryPath;
          break;
        }
      }

      const subChapters = getChapters(fullPath);

      chapters.push({
        name: item,
        path: fullPath,
        relativePath: relative(WHITE_BOOK_DIR, fullPath),
        indexPath,
        subChapters,
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

/**
 * Format TOC as string
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
 * Get white book table of contents
 */
export function getToc(): TocResult {
  const chapters = getChapters(WHITE_BOOK_DIR);
  const formatted = `# 白皮书目录结构\n\n${formatToc(chapters)}`;
  return { chapters, formatted };
}

/**
 * Read chapter content
 */
export function readChapter(chapterPath: string): ChapterContent {
  const fullPath = join(WHITE_BOOK_DIR, chapterPath);

  if (!existsSync(fullPath)) {
    throw new Error(`章节不存在: ${chapterPath}`);
  }

  const stat = statSync(fullPath);

  if (stat.isDirectory()) {
    // Check for entry files
    const entryFiles = ["README.md", "00-Index.md", "index.md"];
    let content = "";

    for (const entry of entryFiles) {
      const entryPath = join(fullPath, entry);
      if (existsSync(entryPath)) {
        content = readFileSync(entryPath, "utf-8");
        break;
      }
    }

    // Read sub-files
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

    return { path: chapterPath, content, subFiles };
  } else if (fullPath.endsWith(".md")) {
    return {
      path: chapterPath,
      content: readFileSync(fullPath, "utf-8"),
    };
  }

  throw new Error(`无效路径: ${chapterPath}`);
}

/**
 * Get knowledge map
 */
export function getKnowledgeMap(): string {
  return `# 知识地图

代码:
  src/stackflow/   → 导航配置、Activity (添加页面/Sheet/Modal)
  src/services/    → 服务层、Adapter 模式
  src/stores/      → TanStack Store 状态管理
  src/queries/     → TanStack Query 数据获取
  src/components/  → UI 组件
  src/i18n/        → 国际化

白皮书 (pnpm agent chapter <路径>):
  00-Manifesto/          → 愿景、技术栈、架构、工作流
  01-Kernel-Ref/         → 进程、窗口、沙箱
  02-Driver-Ref/         → 链驱动、Provider
  03-UI-Ref/             → 颜色、基础组件、复合组件
  10-Wallet-Guide/       → 钱包功能指南
  11-DApp-Guide/         → DApp 开发指南
  90-DevOps/             → 测试、发布、部署

外部文档:
  Stackflow: https://stackflow.so/llms-full.txt
  shadcn/ui: https://ui.shadcn.com/docs
  TanStack:  https://tanstack.com/query/latest
`;
}

/**
 * Search in white book
 */
export function searchWhiteBook(query: string): { path: string; line: number; text: string }[] {
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
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
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
  return results.slice(0, 50); // Limit results
}
