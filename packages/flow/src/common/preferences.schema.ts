/**
 * Preferences Schema Definition
 *
 * Zod-based schema definition for configuration.
 */

import { z } from "zod";

// =============================================================================
// Agent Config
// =============================================================================

export const AgentOptionsSchema = z
  .object({
    maxTokens: z.number().optional().describe("Maximum tokens"),
    temperature: z.number().min(0).max(2).optional().describe("Sampling temperature"),
    permissionMode: z
      .enum(["default", "acceptEdits", "bypassPermissions"])
      .optional()
      .describe("Permission mode"),
    maxTurns: z.number().optional().describe("Maximum conversation turns"),
  })
  .passthrough()
  .optional()
  .describe("Agent-specific options");

export const AgentConfigSchema = z
  .object({
    enabled: z.boolean().optional().default(true).describe("Enable this agent"),
    model: z.string().optional().describe("Model name"),
    options: AgentOptionsSchema,
  })
  .describe("Agent configuration");

// =============================================================================
// Retry Config
// =============================================================================

export const RetryConfigSchema = z
  .object({
    maxAttempts: z.number().min(1).max(10).optional().default(3).describe("Max retry attempts"),
    initialDelayMs: z.number().min(100).optional().default(1000).describe("Initial retry delay (ms)"),
    maxDelayMs: z.number().optional().default(30000).describe("Max retry delay (ms)"),
    backoffMultiplier: z.number().min(1).optional().default(2).describe("Backoff multiplier"),
    retryOn: z
      .array(z.enum(["timeout", "rate_limit", "server_error", "network_error"]))
      .optional()
      .default(["timeout", "rate_limit", "server_error", "network_error"])
      .describe("Error types to retry on"),
  })
  .describe("Retry configuration");

// =============================================================================
// Workflow Config
// =============================================================================

export const WorkflowConfigSchema = z
  .object({
    preferredAgent: z.string().optional().describe("Preferred agent for this workflow"),
    disabled: z.boolean().optional().default(false).describe("Disable this workflow"),
    options: z.record(z.string(), z.unknown()).optional().describe("Workflow-specific options"),
  })
  .describe("Workflow configuration");

// =============================================================================
// MCP Config
// =============================================================================

export const McpConfigSchema = z
  .object({
    disabled: z.boolean().optional().default(false).describe("Disable this MCP"),
    options: z.record(z.string(), z.unknown()).optional().describe("MCP-specific options"),
  })
  .describe("MCP configuration");

// =============================================================================
// AI Preferences
// =============================================================================

export const AiPreferencesSchema = z
  .object({
    defaultAgent: z.string().optional().default("claude-code").describe("Default AI agent"),
    agents: z.record(z.string(), AgentConfigSchema).optional().describe("Agent configurations"),
    fallbackChain: z
      .array(z.string())
      .optional()
      .default(["claude-code", "codex"])
      .describe("Agent fallback chain"),
    retry: RetryConfigSchema.optional(),
  })
  .describe("AI agent configuration");

// =============================================================================
// Root Preferences Schema
// =============================================================================

export const PreferencesSchema = z
  .object({
    $schema: z.string().optional().describe("JSON Schema reference"),
    ai: AiPreferencesSchema.optional(),
    workflows: z.record(z.string(), WorkflowConfigSchema).optional().describe("Workflow overrides"),
    mcps: z.record(z.string(), McpConfigSchema).optional().describe("MCP overrides"),
  })
  .describe("Flow preferences configuration");

// =============================================================================
// Type Exports
// =============================================================================

export type AgentOptions = z.infer<typeof AgentOptionsSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type RetryConfig = z.infer<typeof RetryConfigSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type McpConfig = z.infer<typeof McpConfigSchema>;
export type AiPreferences = z.infer<typeof AiPreferencesSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;

// =============================================================================
// JSON Schema Export
// =============================================================================

/**
 * Generate JSON Schema from Zod schema
 */
export function generateJsonSchema(): object {
  // Note: Requires zod-to-json-schema or manual conversion
  // This is a simplified version
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Flow Preferences",
    description: "Flow user preferences configuration",
    type: "object",
    properties: {
      ai: {
        type: "object",
        description: "AI agent configuration",
      },
      workflows: {
        type: "object",
        description: "Workflow overrides",
      },
      mcps: {
        type: "object",
        description: "MCP overrides",
      },
    },
  };
}
