/**
 * Common path constants for the flow module
 *
 * Runtime-agnostic path utilities supporting Node.js/Bun.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Base directory: package root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PACKAGE_ROOT = dirname(dirname(__dirname)); // packages/flow

// Main directories (relative to project using this package)
export const DEFAULT_MCPS_DIR = "mcps";
export const DEFAULT_WORKFLOWS_DIR = "workflows";
export const DEFAULT_USER_DIR = "user";

// User directories
export const DEFAULT_USER_WORKFLOWS_DIR = join(DEFAULT_USER_DIR, "workflows");
export const DEFAULT_USER_MCPS_DIR = join(DEFAULT_USER_DIR, "mcps");
export const DEFAULT_USER_PROMPTS_DIR = join(DEFAULT_USER_DIR, "prompts");

// =============================================================================
// Runtime Detection
// =============================================================================

export type Runtime = "node" | "bun" | "deno" | "unknown";

export function detectRuntime(): Runtime {
  // @ts-expect-error Bun global
  if (typeof Bun !== "undefined") return "bun";
  // @ts-expect-error Deno global
  if (typeof Deno !== "undefined") return "deno";
  if (typeof process !== "undefined" && process.versions?.node) return "node";
  return "unknown";
}

// =============================================================================
// Path Configuration
// =============================================================================

export interface PathConfig {
  /** Root directory of the project */
  root: string;
  /** MCPs directory */
  mcps: string;
  /** Workflows directory */
  workflows: string;
  /** User configuration directory */
  user: string;
  /** User workflows directory */
  userWorkflows: string;
  /** User MCPs directory */
  userMcps: string;
  /** User prompts directory */
  userPrompts: string;
}

let currentConfig: PathConfig | null = null;

/**
 * Initialize path configuration
 */
export function initPaths(root: string): PathConfig {
  currentConfig = {
    root,
    mcps: join(root, DEFAULT_MCPS_DIR),
    workflows: join(root, DEFAULT_WORKFLOWS_DIR),
    user: join(root, DEFAULT_USER_DIR),
    userWorkflows: join(root, DEFAULT_USER_WORKFLOWS_DIR),
    userMcps: join(root, DEFAULT_USER_MCPS_DIR),
    userPrompts: join(root, DEFAULT_USER_PROMPTS_DIR),
  };
  return currentConfig;
}

/**
 * Get current path configuration
 */
export function getPaths(): PathConfig {
  if (!currentConfig) {
    // Default to current working directory
    return initPaths(process.cwd());
  }
  return currentConfig;
}

/**
 * Get MCP file path by name
 */
export function getMcpPath(name: string): string {
  const paths = getPaths();
  return join(paths.mcps, `${name}.mcp.ts`);
}

/**
 * Get workflow file path by name
 */
export function getWorkflowPath(name: string): string {
  const paths = getPaths();
  return join(paths.workflows, `${name}.workflow.ts`);
}

// =============================================================================
// MCP Server Config Types
// =============================================================================

export type McpServerConfig =
  | {
      type?: "stdio";
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  | { type: "http"; url: string; headers?: Record<string, string> }
  | { type: "sse"; url: string; headers?: Record<string, string> };
