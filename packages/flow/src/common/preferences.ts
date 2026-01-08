/**
 * Preferences Management
 *
 * Load and manage user preferences.
 *
 * Supports two config formats (by priority):
 * 1. user/preferences.ts - TypeScript config
 * 2. user/preferences.json - JSON config
 *
 * Features:
 * - Hot reload with polling
 * - Graceful degradation
 */

import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { getPaths } from "./paths.ts";
import type {
  AgentConfig,
  AgentOptions,
  AiPreferences,
  McpConfig,
  Preferences,
  RetryConfig,
  WorkflowConfig,
} from "./preferences.schema.ts";

// =============================================================================
// Types (re-export from schema)
// =============================================================================

export type {
  AgentConfig,
  AgentOptions,
  AiPreferences,
  McpConfig,
  Preferences,
  RetryConfig,
  WorkflowConfig,
};

// =============================================================================
// Constants
// =============================================================================

const POLL_INTERVAL_MS = 10_000;
const RETRY_INTERVAL_MS = 3_000;

// =============================================================================
// Default Configuration
// =============================================================================

export const DEFAULT_PREFERENCES: Preferences = {
  ai: {
    defaultAgent: "claude-code",
    agents: {
      "claude-code": {
        enabled: true,
        model: "claude-sonnet-4-20250514",
        options: {},
      },
      codex: {
        enabled: true,
        model: "codex-mini",
        options: {},
      },
    },
    fallbackChain: ["claude-code", "codex"],
    retry: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      retryOn: ["timeout", "rate_limit", "server_error", "network_error"],
    },
  },
  workflows: {},
  mcps: {},
};

// =============================================================================
// Internal State
// =============================================================================

let cachedPreferences: Preferences | null = null;
let pollingAbortController: AbortController | null = null;
let isPollingActive = false;

type PreferencesChangeListener = (prefs: Preferences) => void;
const changeListeners: Set<PreferencesChangeListener> = new Set();

// =============================================================================
// Utilities
// =============================================================================

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }
  return result;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

// =============================================================================
// Loading Logic
// =============================================================================

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function loadFromTs(path: string): Promise<Preferences | null> {
  if (!(await fileExists(path))) return null;

  try {
    // Dynamic import with cache busting
    const url = `file://${path}?t=${Date.now()}`;
    const module = await import(url);
    return module.default ?? module;
  } catch {
    return null;
  }
}

async function loadFromJson(path: string): Promise<Preferences | null> {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function loadConfigOnce(): Promise<Preferences> {
  const paths = getPaths();
  const tsPath = join(paths.user, "preferences.ts");
  const jsonPath = join(paths.user, "preferences.json");

  // Try TypeScript first
  const tsConfig = await loadFromTs(tsPath);
  if (tsConfig) {
    return deepMerge(DEFAULT_PREFERENCES, tsConfig);
  }

  // Fall back to JSON
  const jsonConfig = await loadFromJson(jsonPath);
  if (jsonConfig) {
    return deepMerge(DEFAULT_PREFERENCES, jsonConfig);
  }

  return { ...DEFAULT_PREFERENCES };
}

function notifyListeners(prefs: Preferences): void {
  for (const listener of changeListeners) {
    try {
      listener(prefs);
    } catch (e) {
      console.error("[preferences] Listener error:", e);
    }
  }
}

// =============================================================================
// Polling Logic
// =============================================================================

export function startPolling(): void {
  if (isPollingActive) return;

  isPollingActive = true;
  pollingAbortController = new AbortController();
  const signal = pollingAbortController.signal;

  (async () => {
    while (!signal.aborted) {
      while (!signal.aborted) {
        try {
          const newPrefs = await loadConfigOnce();
          const changed = JSON.stringify(cachedPreferences) !== JSON.stringify(newPrefs);
          cachedPreferences = newPrefs;

          if (changed) {
            notifyListeners(newPrefs);
          }
          break;
        } catch (e) {
          console.error("[preferences] Load failed, retrying in 3s:", e);
          try {
            await sleep(RETRY_INTERVAL_MS, signal);
          } catch {
            return;
          }
        }
      }

      try {
        await sleep(POLL_INTERVAL_MS, signal);
      } catch {
        return;
      }
    }
  })();
}

export function stopPolling(): void {
  if (!isPollingActive) return;

  pollingAbortController?.abort();
  pollingAbortController = null;
  isPollingActive = false;
}

export function isPolling(): boolean {
  return isPollingActive;
}

// =============================================================================
// Public API
// =============================================================================

export async function loadPreferences(forceReload = false): Promise<Preferences> {
  if (cachedPreferences && !forceReload) {
    return cachedPreferences;
  }

  cachedPreferences = await loadConfigOnce();
  return cachedPreferences;
}

export function getPreferences(): Preferences {
  if (!cachedPreferences) {
    throw new Error("Preferences not loaded. Call loadPreferences() first.");
  }
  return cachedPreferences;
}

export function clearPreferencesCache(): void {
  cachedPreferences = null;
}

export function onPreferencesChange(listener: PreferencesChangeListener): void {
  changeListeners.add(listener);
}

export function offPreferencesChange(listener: PreferencesChangeListener): void {
  changeListeners.delete(listener);
}

// =============================================================================
// Helper Functions
// =============================================================================

export async function getPreferredAgent(workflowName?: string): Promise<string> {
  const prefs = await loadPreferences();

  if (workflowName && prefs.workflows?.[workflowName]?.preferredAgent) {
    return prefs.workflows[workflowName].preferredAgent!;
  }

  return prefs.ai?.defaultAgent ?? "claude-code";
}

export async function getAgentConfig(agentName: string): Promise<AgentConfig | undefined> {
  const prefs = await loadPreferences();
  return prefs.ai?.agents?.[agentName];
}

export async function getFallbackChain(): Promise<string[]> {
  const prefs = await loadPreferences();
  return prefs.ai?.fallbackChain ?? ["claude-code", "codex"];
}

export async function getRetryConfig(): Promise<{
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryOn: Array<"timeout" | "rate_limit" | "server_error" | "network_error">;
}> {
  const prefs = await loadPreferences();
  const userRetry = prefs.ai?.retry;
  return {
    maxAttempts: userRetry?.maxAttempts ?? 3,
    initialDelayMs: userRetry?.initialDelayMs ?? 1000,
    maxDelayMs: userRetry?.maxDelayMs ?? 30000,
    backoffMultiplier: userRetry?.backoffMultiplier ?? 2,
    retryOn: userRetry?.retryOn ?? ["timeout", "rate_limit", "server_error", "network_error"],
  };
}

export async function isAgentEnabled(agentName: string): Promise<boolean> {
  const config = await getAgentConfig(agentName);
  return config?.enabled !== false;
}

export async function getFirstAvailableAgent(): Promise<string | null> {
  const chain = await getFallbackChain();
  for (const agent of chain) {
    if (await isAgentEnabled(agent)) {
      return agent;
    }
  }
  return null;
}

export async function isWorkflowDisabled(workflowName: string): Promise<boolean> {
  const prefs = await loadPreferences();
  return prefs.workflows?.[workflowName]?.disabled === true;
}

export async function isMcpDisabled(mcpName: string): Promise<boolean> {
  const prefs = await loadPreferences();
  return prefs.mcps?.[mcpName]?.disabled === true;
}

export async function getWorkflowOptions(workflowName: string): Promise<Record<string, unknown>> {
  const prefs = await loadPreferences();
  return prefs.workflows?.[workflowName]?.options || {};
}

export async function getMcpOptions(mcpName: string): Promise<Record<string, unknown>> {
  const prefs = await loadPreferences();
  return prefs.mcps?.[mcpName]?.options || {};
}

// =============================================================================
// Retry Helper
// =============================================================================

export type RetryableError = "timeout" | "rate_limit" | "server_error" | "network_error";

export async function withRetry<T>(
  fn: () => Promise<T>,
  errorType: RetryableError = "network_error"
): Promise<T> {
  const config = await getRetryConfig();

  if (!config.retryOn?.includes(errorType)) {
    return fn();
  }

  let lastError: Error | undefined;
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxAttempts - 1) {
        const delay = Math.min(
          config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelayMs
        );
        console.error(`[retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("All retry attempts failed");
}
