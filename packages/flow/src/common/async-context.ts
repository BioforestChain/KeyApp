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
 * Supports both sync and async functions
 */
export function withRuntimeMode<R>(mode: RuntimeMode, fn: () => R): R {
  return RuntimeContext.run({ mode }, fn);
}

/**
 * Run async function within specified runtime mode
 * Use this for async functions to ensure context is preserved
 */
export async function withRuntimeModeAsync<R>(
  mode: RuntimeMode,
  fn: () => Promise<R>
): Promise<R> {
  return RuntimeContext.run({ mode }, fn);
}

// =============================================================================
// Workflow Name Context
// =============================================================================

/**
 * Async context for current workflow name (used by str template)
 */
export const WorkflowNameContext = new AsyncContext<string>("WorkflowNameContext");

/**
 * Get current workflow name from context
 */
export function getWorkflowName(): string {
  return WorkflowNameContext.tryGet() ?? "workflow";
}

// =============================================================================
// str`` Template Literal (mode-aware string builder)
// =============================================================================

/**
 * str`` tagged template literal for mode-aware description generation.
 * 
 * Returns `() => Promise<string>` - an async function that resolves the template.
 * 
 * Values can be:
 * - Static values (strings, numbers) - inserted directly
 * - Functions `() => string | Promise<string>` - called and result inserted
 * 
 * @example
 * ```ts
 * const description = str`
 * Task management workflow.
 * 
 * ## When to Use
 * - Start new task → ${str.scenarios(["start", "--type", "service"])}
 * - List labels → ${str.scenarios(["start", "--list-labels"])}
 * 
 * ${str.data("Labels", labels)}
 * `;
 * ```
 */
export function str(
  strings: TemplateStringsArray,
  ...values: unknown[]
): () => Promise<string> {
  return async () => {
    const parts: string[] = [];
    for (let i = 0; i < strings.length; i++) {
      parts.push(strings[i]);
      if (i < values.length) {
        const value = values[i];
        if (typeof value === "function") {
          const result = (value as () => unknown)();
          parts.push(String(result instanceof Promise ? await result : result));
        } else {
          parts.push(String(value ?? ""));
        }
      }
    }
    return parts.join("");
  };
}

/**
 * Format a single scenario (command example) based on runtime mode.
 * Workflow name is obtained from WorkflowNameContext.
 * 
 * Returns `() => string` - a function that generates the formatted string.
 * 
 * - MCP: `use("workflow", ["arg1", "arg2"])`
 * - CLI: `workflow arg1 arg2`
 */
str.scenarios = (args: string[]): (() => string) => {
  return () => {
    const workflowName = getWorkflowName();
    const mode = getRuntimeMode();
    
    if (mode === "mcp") {
      return `use("${workflowName}", ${JSON.stringify(args)})`;
    } else {
      return `${workflowName} ${args.join(" ")}`;
    }
  };
};

/**
 * Format a data section (e.g., labels list) based on runtime mode.
 * 
 * Returns `() => string` - a function that generates the formatted string.
 * 
 * - MCP: `Title: item1, item2, item3`
 * - CLI: `Title:\n  item1 - description\n  item2 - description`
 */
str.data = (
  title: string,
  items: Array<{ name: string; description?: string; color?: string }>
): (() => string) => {
  return () => {
    const mode = getRuntimeMode();
    
    if (mode === "mcp") {
      return `${title}: ${items.map((i) => i.name).join(", ")}`;
    } else {
      const lines = [`${title}:`];
      for (const item of items) {
        const parts = [`  ${item.name}`];
        if (item.color) parts.push(`(#${item.color})`);
        if (item.description) parts.push(`- ${item.description}`);
        lines.push(parts.join(" "));
      }
      return lines.join("\n");
    }
  };
};

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
