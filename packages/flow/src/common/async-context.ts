/**
 * AsyncContext - AsyncLocalStorage-based async context management
 *
 * Uses Node.js AsyncLocalStorage to pass context through async call chains
 * without explicit parameter passing.
 *
 * Usage:
 * ```typescript
 * await PreferencesContext.run(preferences, async () => {
 *   const prefs = PreferencesContext.current();
 * });
 * ```
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type { Preferences } from "./preferences.schema.ts";

// =============================================================================
// Generic AsyncContext
// =============================================================================

/**
 * Generic async context wrapper
 */
export class AsyncContext<T> {
  private storage: AsyncLocalStorage<T>;
  private name: string;

  constructor(name: string) {
    this.storage = new AsyncLocalStorage<T>();
    this.name = name;
  }

  /**
   * Run function within specified context
   */
  run<R>(value: T, fn: () => R): R {
    return this.storage.run(value, fn);
  }

  /**
   * Get current context value
   * @throws If not running in context
   */
  current(): T {
    const value = this.storage.getStore();
    if (value === undefined) {
      throw new Error(
        `${this.name}: Not running in context. Use ${this.name}.run() to establish context.`
      );
    }
    return value;
  }

  /**
   * Get current context value, or undefined if not in context
   */
  tryGet(): T | undefined {
    return this.storage.getStore();
  }

  /**
   * Get current context value, or default if not in context
   */
  getOrDefault(defaultValue: T): T {
    return this.storage.getStore() ?? defaultValue;
  }

  /**
   * Check if running in context
   */
  isInContext(): boolean {
    return this.storage.getStore() !== undefined;
  }
}

// =============================================================================
// Preferences Context
// =============================================================================

/**
 * Async context for preferences
 */
export const PreferencesContext = new AsyncContext<Preferences>(
  "PreferencesContext"
);

// =============================================================================
// Runtime Context (MCP vs CLI)
// =============================================================================

export type RuntimeMode = "mcp" | "cli";

export interface RuntimeInfo {
  mode: RuntimeMode;
}

/**
 * Async context for runtime mode
 */
export const RuntimeContext = new AsyncContext<RuntimeInfo>("RuntimeContext");

/**
 * Get current runtime mode, defaults to "cli"
 */
export function getRuntimeMode(): RuntimeMode {
  return RuntimeContext.tryGet()?.mode ?? "cli";
}

/**
 * Check if running in MCP mode
 */
export function isMcpMode(): boolean {
  return getRuntimeMode() === "mcp";
}

/**
 * Check if running in CLI mode
 */
export function isCliMode(): boolean {
  return getRuntimeMode() === "cli";
}

/**
 * Run function within specified runtime mode
 */
export function withRuntimeMode<R>(mode: RuntimeMode, fn: () => R): R {
  return RuntimeContext.run({ mode }, fn);
}

// =============================================================================
// Scenario Formatting (mode-aware)
// =============================================================================

export interface Scenario {
  when: string;
  args?: string[];
}

/**
 * Format scenarios based on current runtime mode
 * - MCP: `when → use("workflow", ["arg1", "arg2"])`
 * - CLI: `when:\n  workflow arg1 arg2`
 */
export function formatScenarios(
  workflowName: string,
  scenarios: Scenario[]
): string {
  const mode = getRuntimeMode();
  
  if (mode === "mcp") {
    return scenarios
      .map((s) => `- ${s.when} → use("${workflowName}", ${JSON.stringify(s.args ?? [])})`)
      .join("\n");
  } else {
    return scenarios
      .map((s) => `  ${s.when}:\n    ${workflowName} ${s.args?.join(" ") ?? ""}`)
      .join("\n");
  }
}

/**
 * Format a key-value data section
 * - MCP: compact inline format
 * - CLI: indented list format
 */
export function formatDataSection(
  title: string,
  items: Array<{ name: string; description?: string; color?: string }>
): string {
  const mode = getRuntimeMode();
  
  if (mode === "mcp") {
    // Compact format for MCP
    return `${title}: ${items.map((i) => i.name).join(", ")}`;
  } else {
    // Detailed format for CLI
    const lines = [`${title}:`];
    for (const item of items) {
      const parts = [item.name];
      if (item.color) parts.push(`#${item.color}`);
      if (item.description) parts.push(`- ${item.description}`);
      lines.push(`  ${parts.join(" ")}`);
    }
    return lines.join("\n");
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Run function within preferences context
 */
export async function withPreferences<R>(fn: () => R | Promise<R>): Promise<R> {
  const { loadPreferences } = await import("./preferences.ts");
  const prefs = await loadPreferences();
  return PreferencesContext.run(prefs, fn);
}

/**
 * Get current AI config from context
 */
export function getCurrentAiConfig() {
  const prefs = PreferencesContext.tryGet();
  return prefs?.ai;
}

/**
 * Get preferred agent for workflow from context
 */
export function getContextPreferredAgent(workflowName?: string): string {
  const prefs = PreferencesContext.tryGet();
  if (!prefs) return "claude-code";

  if (workflowName && prefs.workflows?.[workflowName]?.preferredAgent) {
    return prefs.workflows[workflowName].preferredAgent!;
  }

  return prefs.ai?.defaultAgent ?? "claude-code";
}

/**
 * Check if workflow is disabled in context
 */
export function isContextWorkflowDisabled(workflowName: string): boolean {
  const prefs = PreferencesContext.tryGet();
  return prefs?.workflows?.[workflowName]?.disabled === true;
}

/**
 * Check if MCP is disabled in context
 */
export function isContextMcpDisabled(mcpName: string): boolean {
  const prefs = PreferencesContext.tryGet();
  return prefs?.mcps?.[mcpName]?.disabled === true;
}

/**
 * Get fallback chain from context
 */
export function getContextFallbackChain(): string[] {
  const prefs = PreferencesContext.tryGet();
  return prefs?.ai?.fallbackChain ?? ["claude-code", "codex"];
}

/**
 * Get agent config from context
 */
export function getContextAgentConfig(agentName: string) {
  const prefs = PreferencesContext.tryGet();
  return prefs?.ai?.agents?.[agentName];
}

/**
 * Get retry config from context
 */
export function getContextRetryConfig() {
  const prefs = PreferencesContext.tryGet();
  const retry = prefs?.ai?.retry;
  return {
    maxAttempts: retry?.maxAttempts ?? 3,
    initialDelayMs: retry?.initialDelayMs ?? 1000,
    maxDelayMs: retry?.maxDelayMs ?? 30000,
    backoffMultiplier: retry?.backoffMultiplier ?? 2,
    retryOn: retry?.retryOn ??
      ["timeout", "rate_limit", "server_error", "network_error"],
  };
}

/**
 * Get workflow config from context
 */
export function getContextWorkflowConfig<T = Record<string, unknown>>(
  workflowName: string
): T | undefined {
  const prefs = PreferencesContext.tryGet();
  const workflowConfig = prefs?.workflows?.[workflowName];
  if (!workflowConfig) return undefined;

  const config = (workflowConfig as Record<string, unknown>).config;
  return (config ?? workflowConfig) as T;
}
