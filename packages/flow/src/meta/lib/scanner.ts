/**
 * Flow Scanner - 扫描目录发现 workflows 和 MCPs
 *
 * 特性：
 * - 自定义目录数组，按顺序合并（前面覆盖后面）
 * - 自动提取描述、工具名、依赖
 *
 * Usage:
 *   const scanner = createScanner({
 *     directories: ['./scripts/agent-flow', './packages/flow/builtin'],
 *   });
 *   const workflows = await scanner.scanWorkflows();
 *   const mcps = await scanner.scanMcps();
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";

// =============================================================================
// Types
// =============================================================================

export interface ScannedItem {
  name: string;
  path: string;
  filename: string;
  directory: string;
  description: string;
}

export interface WorkflowItem extends ScannedItem {
  mcpDependencies: string[];
}

export interface McpItem extends ScannedItem {
  tools: string[];
}

export interface ScanResult<T> {
  items: T[];
  byDirectory: Map<string, T[]>;
}

export interface ScannerConfig {
  /** 目录数组，按顺序扫描，前面的覆盖后面的同名项 */
  directories: string[];
}

// =============================================================================
// Extraction Functions
// =============================================================================

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readFileContent(path: string): Promise<string> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return "";
  }
}

export async function extractDescription(filePath: string): Promise<string> {
  const content = await readFileContent(filePath);
  // Match first line of JSDoc: /** Description */
  const match = content.match(/\/\*\*[\s\S]*?\*\s+([A-Z][^\n*]+)/);
  return match?.[1]?.trim() || "(No description)";
}

export async function extractMcpDependencies(filePath: string): Promise<string[]> {
  const content = await readFileContent(filePath);
  const deps: string[] = [];
  // Match imports from mcps or mcp__ tool calls
  for (const m of content.matchAll(/mcps\/([a-z][a-z0-9-]*)\.mcp|mcp__([a-z][a-z0-9-]*)__/gi)) {
    const name = m[1] || m[2];
    if (name && !deps.includes(name)) deps.push(name);
  }
  return deps;
}

export async function extractMcpTools(filePath: string): Promise<string[]> {
  const content = await readFileContent(filePath);
  const matches = content.matchAll(
    /(?:defineTool|defineSimpleTool)\s*\(\s*\{[^}]*name:\s*["']([a-z_][a-z0-9_]*)["']/gi
  );
  return [...matches].map((m) => m[1]);
}

// =============================================================================
// Core Scanner
// =============================================================================

async function scanDirectory(dir: string, suffix: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(suffix)) {
        files.push(join(dir, entry.name));
      }
      // 递归扫描子目录
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        const subFiles = await scanDirectory(join(dir, entry.name), suffix);
        files.push(...subFiles);
      }
    }
  } catch {
    // Directory may not exist
  }
  return files;
}

async function scanAndMerge<T extends ScannedItem>(
  directories: string[],
  suffix: string,
  extractor: (path: string, dir: string) => Promise<T>
): Promise<ScanResult<T>> {
  const merged = new Map<string, T>();
  const byDirectory = new Map<string, T[]>();

  // 按顺序扫描，前面的目录优先
  for (const dir of directories) {
    if (!(await fileExists(dir))) continue;

    const files = await scanDirectory(dir, suffix);
    const items: T[] = [];

    for (const filePath of files) {
      const item = await extractor(filePath, dir);

      // 只有未被前面目录覆盖的才加入
      if (!merged.has(item.name)) {
        merged.set(item.name, item);
      }
      items.push(item);
    }

    byDirectory.set(dir, items);
  }

  return {
    items: Array.from(merged.values()),
    byDirectory,
  };
}

// =============================================================================
// Scanner Factory
// =============================================================================

export function createScanner(config: ScannerConfig) {
  const { directories } = config;

  return {
    /**
     * 扫描所有 workflow 文件
     */
    async scanWorkflows(): Promise<ScanResult<WorkflowItem>> {
      return scanAndMerge(directories, ".workflow.ts", async (path, dir) => ({
        name: basename(path, ".workflow.ts"),
        path,
        filename: basename(path),
        directory: dir,
        description: await extractDescription(path),
        mcpDependencies: await extractMcpDependencies(path),
      }));
    },

    /**
     * 扫描所有 MCP 文件
     */
    async scanMcps(): Promise<ScanResult<McpItem>> {
      return scanAndMerge(directories, ".mcp.ts", async (path, dir) => ({
        name: basename(path, ".mcp.ts"),
        path,
        filename: basename(path),
        directory: dir,
        description: await extractDescription(path),
        tools: await extractMcpTools(path),
      }));
    },

    /**
     * 获取完整清单
     */
    async getInventory() {
      const [workflows, mcps] = await Promise.all([
        this.scanWorkflows(),
        this.scanMcps(),
      ]);

      // 构建 MCP 被引用关系
      const mcpRefs = new Map<string, string[]>();
      for (const mcp of mcps.items) {
        mcpRefs.set(mcp.name, []);
      }
      for (const wf of workflows.items) {
        for (const dep of wf.mcpDependencies) {
          const refs = mcpRefs.get(dep);
          if (refs) refs.push(wf.name);
        }
      }

      return {
        workflows: workflows.items,
        mcps: mcps.items.map((m) => ({
          ...m,
          referencedBy: mcpRefs.get(m.name) || [],
        })),
        stats: {
          workflowCount: workflows.items.length,
          mcpCount: mcps.items.length,
          directories: directories.length,
        },
      };
    },
  };
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * 快速扫描单个目录
 */
export async function scanWorkflowsIn(dir: string): Promise<WorkflowItem[]> {
  const scanner = createScanner({ directories: [dir] });
  const result = await scanner.scanWorkflows();
  return result.items;
}

export async function scanMcpsIn(dir: string): Promise<McpItem[]> {
  const scanner = createScanner({ directories: [dir] });
  const result = await scanner.scanMcps();
  return result.items;
}
