/**
 * Meta MCP Server
 *
 * Provides workflow execution capability to AI agents.
 * - workflow(name, args): Execute any workflow
 * - reload(): Refresh workflow list
 *
 * Features:
 * - Auto-discovery: Scan directories to find workflows
 * - Hot reload: AI can call reload() to refresh
 */

import { spawn } from "node:child_process";
import {
  type AnyTypedTool,
  createMcpServer,
  defineTool,
  z,
} from "../common/mcp/base-mcp.js";
import { createScanner, type WorkflowItem } from "./lib/scanner.js";

// =============================================================================
// Types
// =============================================================================

export interface MetaMcpConfig {
  /** Directories to scan for workflows (order = priority) */
  directories: string[];
  /** Filter: only include these workflows */
  workflows?: string[];
  /** Additional tools to include */
  extraTools?: AnyTypedTool[];
  /** Server name */
  name?: string;
  /** Auto-start server */
  autoStart?: boolean;
}

// =============================================================================
// Workflow Discovery
// =============================================================================

async function scanWorkflows(directories: string[]): Promise<WorkflowItem[]> {
  const scanner = createScanner({ directories });
  const result = await scanner.scanWorkflows();
  return result.items;
}

function buildToolDescription(workflows: WorkflowItem[]): string {
  const workflowList = workflows
    .map((w) => `- ${w.name}: ${w.description}`)
    .join("\n");

  return `Execute a workflow by name with arguments.

## Usage
- Use \`--help\` to get detailed usage: workflow("agent", ["--help"])
- Pass arguments as string array

## Available Workflows
${workflowList || "(none)"}

## Examples
  workflow("agent", ["readme"])
  workflow("agent", ["chapter", "00-Manifesto"])
  workflow("agent", ["practice", "list"])`;
}

// =============================================================================
// Workflow Execution
// =============================================================================

interface ExecuteResult {
  success: boolean;
  output: string;
  exitCode: number;
}

async function executeWorkflow(
  workflows: WorkflowItem[],
  name: string,
  args: string[]
): Promise<ExecuteResult> {
  const workflow = workflows.find((w) => w.name === name);

  if (!workflow) {
    const available = workflows.map((w) => w.name).join(", ");
    return {
      success: false,
      output: `Unknown workflow: ${name}\nAvailable: ${available}`,
      exitCode: 1,
    };
  }

  // Execute workflow as subprocess
  return new Promise((resolve) => {
    const child = spawn("bun", [workflow.path, ...args], {
      stdio: ["inherit", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      const output = stdout + (stderr ? `\n[stderr]\n${stderr}` : "");
      resolve({
        success: code === 0,
        output: output || "(no output)",
        exitCode: code ?? 1,
      });
    });

    child.on("error", (err) => {
      resolve({
        success: false,
        output: `Error: ${err.message}`,
        exitCode: 1,
      });
    });
  });
}

// =============================================================================
// Tool Factory
// =============================================================================

function createWorkflowTool(
  directories: string[],
  filter?: string[]
): AnyTypedTool {
  let cachedWorkflows: WorkflowItem[] = [];
  let description = "Loading workflows...";

  // Initial scan
  scanWorkflows(directories).then((workflows) => {
    cachedWorkflows = filter
      ? workflows.filter((w) => filter.includes(w.name))
      : workflows;
    description = buildToolDescription(cachedWorkflows);
  });

  return defineTool({
    name: "workflow",
    description: "Execute a workflow by name. Call with --help for usage.",
    inputSchema: z.object({
      name: z.string().describe("Workflow name"),
      args: z.array(z.string()).default([]).describe("Arguments"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      output: z.string(),
      exitCode: z.number(),
    }),
    handler: async ({ name, args }) => {
      // Refresh cache if empty
      if (cachedWorkflows.length === 0) {
        cachedWorkflows = await scanWorkflows(directories);
        if (filter) {
          cachedWorkflows = cachedWorkflows.filter((w) => filter.includes(w.name));
        }
      }
      return executeWorkflow(cachedWorkflows, name, args);
    },
  });
}

function createReloadTool(
  directories: string[],
  filter?: string[],
  onReload?: (workflows: WorkflowItem[]) => void
): AnyTypedTool {
  return defineTool({
    name: "reload",
    description: "Refresh workflow list. Call after adding/removing workflow files.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      workflows: z.array(z.string()),
      count: z.number(),
    }),
    handler: async () => {
      let workflows = await scanWorkflows(directories);
      if (filter) {
        workflows = workflows.filter((w) => filter.includes(w.name));
      }
      onReload?.(workflows);
      return {
        success: true,
        workflows: workflows.map((w) => w.name),
        count: workflows.length,
      };
    },
  });
}

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
        })),
      };
    },
  });
}

// =============================================================================
// Build Meta MCP
// =============================================================================

/**
 * Build a Meta MCP server that exposes workflows as tools.
 *
 * @example
 * ```typescript
 * const meta = buildMetaMcp({
 *   directories: ['./scripts/agent-flow/workflows'],
 *   autoStart: true,
 * });
 * ```
 */
export function buildMetaMcp(config: MetaMcpConfig) {
  const {
    directories,
    workflows: workflowFilter,
    extraTools = [],
    name = "meta",
    autoStart = false,
  } = config;

  const workflowTool = createWorkflowTool(directories, workflowFilter);
  const reloadTool = createReloadTool(directories, workflowFilter);
  const listTool = createListTool(directories);

  const tools = [workflowTool, reloadTool, listTool, ...extraTools];

  const server = createMcpServer({
    name,
    version: "1.0.0",
    description: "Meta MCP - Workflow execution for AI agents",
    tools,
    autoStart,
  });

  return {
    server,
    tools,
    start: () => server.start(),
  };
}

// =============================================================================
// Export
// =============================================================================

export { createWorkflowTool, createReloadTool, createListTool, scanWorkflows };
