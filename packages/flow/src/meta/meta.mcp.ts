#!/usr/bin/env bun
/**
 * Meta MCP Server
 *
 * Provides workflow execution capability to AI agents.
 * - workflow(name, args): Execute any workflow
 * - reload(): Refresh workflow list and return updated description
 * - buildMetaMcp(): Package workflows into an MCP server
 *
 * Features:
 * - Auto-refresh: Every 30s automatically rescan workflows
 * - Hot reload: AI agents can call reload() to manually refresh
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type AnyTypedTool,
  createMcpServer,
  defineTool,
  parseCliArgs,
  printMcpHelp,
  z,
} from "../common/mcp/base-mcp.js";

const MCP_NAME = "meta";

/** 自动刷新间隔（毫秒） */
const AUTO_REFRESH_INTERVAL_MS = 30_000;

// =============================================================================
// Paths
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default workflow directories (can be overridden)
const WORKFLOWS_DIR = join(__dirname, "../workflows");
const USER_WORKFLOWS_DIR = join(__dirname, "../user-workflows");

// =============================================================================
// Types
// =============================================================================

export interface WorkflowInfo {
  name: string;
  description: string;
  path: string;
  mode?: "ai" | "programmatic" | "multi";
  isUserOverride?: boolean;
}

export interface MetaMcpConfig {
  /** Directories to scan for workflows */
  directories?: string[];
  /** Workflows to include (default: all) */
  workflows?: string[];
  /** Additional tools to include */
  extraTools?: AnyTypedTool[];
  /** Server name (default: "meta") */
  name?: string;
  /** Auto-start server */
  autoStart?: boolean;
  /** Auto-refresh workflows every 30s (default: false) */
  autoRefresh?: boolean;
}

// =============================================================================
// Workflow Discovery
// =============================================================================

async function scanWorkflowsFromDir(
  dir: string
): Promise<Map<string, { path: string }>> {
  const result = new Map<string, { path: string }>();

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isFile() &&
        entry.name.endsWith(".workflow.ts") &&
        !entry.name.startsWith("_")
      ) {
        const name = entry.name.replace(".workflow.ts", "");
        result.set(name, { path: join(dir, entry.name) });
      }
    }
  } catch {
    // Directory may not exist
  }

  return result;
}

async function scanWorkflows(directories: string[]): Promise<WorkflowInfo[]> {
  // Scan all directories, later ones take priority
  const allWorkflows = new Map<string, { path: string; fromDir: number }>();

  for (let i = 0; i < directories.length; i++) {
    const dir = directories[i];
    const workflows = await scanWorkflowsFromDir(dir);
    for (const [name, info] of workflows) {
      allWorkflows.set(name, { ...info, fromDir: i });
    }
  }

  // Build workflow info list
  const workflows: WorkflowInfo[] = [];
  for (const [name, { path }] of allWorkflows) {
    const info = await getWorkflowInfo(path);
    workflows.push({
      name,
      path,
      ...info,
    });
  }

  return workflows.sort((a, b) => a.name.localeCompare(b.name));
}

async function getWorkflowInfo(
  filePath: string
): Promise<{ description: string; mode?: "ai" | "programmatic" | "multi" }> {
  // Try dynamic import first
  try {
    const module = await import(filePath);
    const workflow = module.workflow || module.default;
    if (workflow?.meta?.description) {
      // Detect mode based on content
      const content = await readFile(filePath, "utf-8");
      let mode: "ai" | "programmatic" | "multi" | undefined;

      const hasAi =
        content.includes("createAiQueryBuilder") ||
        content.includes("aiResume");
      const hasSubflows = content.includes("subflows:");
      const hasDirectCommands =
        content.includes("args._[0]") || content.includes("command ===");

      if (hasAi && hasDirectCommands) mode = "multi";
      else if (hasAi) mode = "ai";
      else if (hasSubflows || hasDirectCommands) mode = "programmatic";

      return { description: workflow.meta.description, mode };
    }
  } catch {
    // Ignore import errors
  }

  // Fallback to JSDoc extraction
  try {
    const content = await readFile(filePath, "utf-8");
    const match = content.match(/\/\*\*[\s\S]*?\*\s+([A-Z][^\n*]+)/);
    return { description: match?.[1]?.trim() || "(No description)" };
  } catch {
    return { description: "(No description)" };
  }
}

// =============================================================================
// Build Dynamic Tool Description
// =============================================================================

async function buildToolDescription(
  directories: string[],
  filter?: string[]
): Promise<string> {
  let workflows = await scanWorkflows(directories);

  if (filter && filter.length > 0) {
    workflows = workflows.filter((w) => filter.includes(w.name));
  }

  const workflowList = workflows
    .map((w) => {
      const tags: string[] = [];
      if (w.mode) tags.push(w.mode);
      if (w.isUserOverride) tags.push("user");
      const tagStr = tags.length > 0 ? ` [${tags.join(", ")}]` : "";
      return `- ${w.name}: ${w.description}${tagStr}`;
    })
    .join("\n");

  return `Execute a workflow by name with arguments.

## Usage
- Use \`--help\` to get detailed usage: workflow("research", ["--help"])
- Most AI-driven workflows support \`--resume\` for session continuation

## Available Workflows
${workflowList || "(none)"}

## Examples
  workflow("agent", ["readme"])
  workflow("agent", ["chapter", "00-必读"])
  workflow("agent", ["practice", "list"])`;
}

// =============================================================================
// Workflow Execution
// =============================================================================

/** Workflow module interface */
interface WorkflowModule {
  workflow?: {
    run: (argv: string[]) => Promise<void>;
    execute: (args: Record<string, unknown>) => Promise<void>;
    meta: { name: string; description: string };
  };
}

/** Custom exit error for capturing process.exit calls */
class ExitError extends Error {
  constructor(public code: number) {
    super(`Process exited with code ${code}`);
    this.name = "ExitError";
  }
}

/** Capture console output during execution */
function captureConsole(): {
  getOutput: () => string;
  restore: () => void;
} {
  const output: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  console.error = (...args: unknown[]) => {
    output.push("[stderr] " + args.map(String).join(" "));
  };
  console.warn = (...args: unknown[]) => {
    output.push("[warn] " + args.map(String).join(" "));
  };

  return {
    getOutput: () => output.join("\n"),
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    },
  };
}

/** Execute workflow by importing module and calling run() */
async function executeWorkflow(
  directories: string[],
  name: string,
  args: string[]
): Promise<{ success: boolean; output: string; exitCode: number }> {
  const workflows = await scanWorkflows(directories);
  const workflowInfo = workflows.find((w) => w.name === name);

  if (!workflowInfo) {
    const available = workflows.map((w) => w.name).join(", ");
    return {
      success: false,
      output: `Unknown workflow: ${name}\nAvailable: ${available}`,
      exitCode: 1,
    };
  }

  // Capture console output
  const capture = captureConsole();

  // Override process.exit temporarily
  const originalExit = process.exit;
  let exitCode = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process as any).exit = (code?: number) => {
    exitCode = code ?? 0;
    throw new ExitError(exitCode);
  };

  try {
    // Dynamic import the workflow module
    const module = (await import(workflowInfo.path)) as WorkflowModule;
    const workflow = module.workflow;

    if (!workflow) {
      return {
        success: false,
        output: `Workflow module does not export 'workflow': ${name}`,
        exitCode: 1,
      };
    }

    // Execute with args
    await workflow.run(args);

    return {
      success: true,
      output: capture.getOutput() || "(no output)",
      exitCode: 0,
    };
  } catch (error) {
    if (error instanceof ExitError) {
      return {
        success: error.code === 0,
        output: capture.getOutput() || "(no output)",
        exitCode: error.code,
      };
    }

    // Other errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const output = capture.getOutput();

    return {
      success: false,
      output: output
        ? `${output}\n\nError: ${errorMessage}`
        : `Error: ${errorMessage}`,
      exitCode: 1,
    };
  } finally {
    capture.restore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process as any).exit = originalExit;
  }
}

// =============================================================================
// Tool Definition Factory
// =============================================================================

async function createWorkflowTool(
  directories: string[],
  filter?: string[]
): Promise<AnyTypedTool> {
  const description = await buildToolDescription(directories, filter);

  return defineTool({
    name: "workflow",
    description,
    inputSchema: z.object({
      name: z
        .string()
        .describe("Workflow name (e.g., 'agent', 'research', 'memory')"),
      args: z
        .array(z.string())
        .default([])
        .describe("Arguments to pass to the workflow"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      output: z.string(),
      exitCode: z.number(),
    }),
    handler: async ({ name, args }) =>
      await executeWorkflow(directories, name, args),
  });
}

/**
 * 创建 reload 工具
 *
 * 用于 AI Agent 主动刷新 workflow 列表
 */
function createReloadTool(
  directories: string[],
  filter?: string[],
  refreshCallback?: () => Promise<string>
): AnyTypedTool {
  return defineTool({
    name: "reload",
    description:
      "Refresh the workflow list. Call this to get the latest available workflows after adding/removing workflow files.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      description: z.string().describe("Updated workflow tool description"),
      refreshedAt: z.string().describe("ISO timestamp of refresh"),
    }),
    handler: async () => {
      const description = refreshCallback
        ? await refreshCallback()
        : await buildToolDescription(directories, filter);
      return {
        success: true,
        description,
        refreshedAt: new Date().toISOString(),
      };
    },
  });
}

/**
 * 创建 list 工具
 */
function createListTool(directories: string[]): AnyTypedTool {
  return defineTool({
    name: "list",
    description: "List all available workflows",
    inputSchema: z.object({}),
    outputSchema: z.object({
      workflows: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          path: z.string(),
          mode: z.string().optional(),
        })
      ),
    }),
    handler: async () => {
      const workflows = await scanWorkflows(directories);
      return {
        workflows: workflows.map((w) => ({
          name: w.name,
          description: w.description,
          path: w.path,
          mode: w.mode,
        })),
      };
    },
  });
}

// =============================================================================
// buildMetaMcp - Package Workflows into MCP
// =============================================================================

/**
 * Build a Meta MCP server that exposes workflows as tools.
 *
 * This enables AI agents to:
 * 1. Execute workflows via the `workflow` tool
 * 2. Call `reload` to refresh the workflow list
 * 3. Chain workflows together
 * 4. Make decisions about which workflow to run
 *
 * Features:
 * - Auto-refresh: Every 30s automatically rescan workflows (when autoRefresh=true)
 * - Hot reload: AI agents can call reload() to manually refresh
 *
 * @example
 * ```typescript
 * // Build and start:
 * const meta = await buildMetaMcp({
 *   directories: ['./scripts/agent-flow/workflows'],
 *   autoStart: true,
 *   autoRefresh: true,
 * });
 * ```
 */
export async function buildMetaMcp(config: MetaMcpConfig = {}) {
  const {
    directories = [WORKFLOWS_DIR, USER_WORKFLOWS_DIR],
    workflows: workflowFilter,
    extraTools = [],
    name = MCP_NAME,
    autoStart = false,
    autoRefresh = false,
  } = config;

  // 刷新回调函数
  const refreshWorkflows = async (): Promise<string> => {
    return await buildToolDescription(directories, workflowFilter);
  };

  const workflowTool = await createWorkflowTool(directories, workflowFilter);
  const reloadTool = createReloadTool(directories, workflowFilter, refreshWorkflows);
  const tools = [workflowTool, reloadTool, ...extraTools];

  const server = createMcpServer({
    name,
    version: "1.0.0",
    description: "Meta MCP - Workflow execution for AI agents",
    tools,
    autoStart,
  });

  // 自动刷新控制
  let autoRefreshAbortController: AbortController | null = null;

  const startAutoRefresh = () => {
    if (autoRefreshAbortController) return;

    autoRefreshAbortController = new AbortController();
    const signal = autoRefreshAbortController.signal;

    (async () => {
      while (!signal.aborted) {
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, AUTO_REFRESH_INTERVAL_MS);
            signal.addEventListener("abort", () => {
              clearTimeout(timeout);
              reject(new DOMException("Aborted", "AbortError"));
            });
          });

          if (!signal.aborted) {
            await refreshWorkflows();
            console.error(
              `[meta.mcp] Auto-refreshed workflows at ${new Date().toISOString()}`
            );
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") {
            return;
          }
          console.error("[meta.mcp] Auto-refresh error:", e);
        }
      }
    })();
  };

  const stopAutoRefresh = () => {
    autoRefreshAbortController?.abort();
    autoRefreshAbortController = null;
  };

  // 如果配置了自动刷新，立即启动
  if (autoRefresh) {
    startAutoRefresh();
  }

  return {
    server,
    tools,
    start: () => server.start(),
    startAutoRefresh,
    stopAutoRefresh,
    refresh: refreshWorkflows,
  };
}

// =============================================================================
// CLI Entry Point
// =============================================================================

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("meta.mcp.ts") ||
    process.argv[1].endsWith("meta.mcp.js"));

if (isMain) {
  const args = parseCliArgs();
  if (args.help) {
    printMcpHelp(
      MCP_NAME,
      "Meta MCP Server - Workflow Execution for AI Agents"
    );
    process.exit(0);
  }

  // 构建并启动 MCP 服务器（启用自动刷新）
  const { server, startAutoRefresh } = await buildMetaMcp({
    autoStart: false,
    autoRefresh: true,
  });

  // 启动自动刷新
  startAutoRefresh();

  server.start();
}

// =============================================================================
// Exports
// =============================================================================

export {
  buildToolDescription,
  createWorkflowTool,
  createReloadTool,
  executeWorkflow,
  scanWorkflows,
};
