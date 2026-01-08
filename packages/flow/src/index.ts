/**
 * @biochain/flow - MCP Server & Workflow Framework
 *
 * Provides unified CLI + MCP capabilities for AI-assisted development.
 */

// MCP
export {
  createMcpServer,
  createResource,
  definePrompt,
  defineSimpleTool,
  defineTool,
  imageContent,
  parseCliArgs,
  printMcpHelp,
  textContent,
  z,
  zodToJsonSchema,
  type AnyMcpPromptTemplate,
  type AnyTypedTool,
  type CliArgs,
  type ImageContent,
  type McpContent,
  type McpPromptTemplate,
  type McpResource,
  type McpServerConfig,
  type McpServerWrapper,
  type PromptConfig,
  type TextContent,
  type ToolConfig,
  type ToolResult,
  type TransportMode,
  type TypedTool,
  type ZodRawShape,
} from "./common/mcp/base-mcp.ts";

// Workflow
export {
  createRouter,
  defineWorkflow,
  getModuleDir,
  type ArgConfig,
  type ArgType,
  type ParsedArgs,
  type SubflowDef,
  type Workflow,
  type WorkflowConfig,
  type WorkflowContext,
  type WorkflowMeta,
} from "./common/workflow/base-workflow.ts";

// Context
export {
  AsyncContext,
  getCurrentAiConfig,
  getContextAgentConfig,
  getContextFallbackChain,
  getContextPreferredAgent,
  getContextRetryConfig,
  getContextWorkflowConfig,
  isContextMcpDisabled,
  isContextWorkflowDisabled,
  PreferencesContext,
  withPreferences,
} from "./common/async-context.ts";

// Preferences
export {
  clearPreferencesCache,
  DEFAULT_PREFERENCES,
  getAgentConfig,
  getFallbackChain,
  getFirstAvailableAgent,
  getMcpOptions,
  getPreferredAgent,
  getPreferences,
  getRetryConfig,
  getWorkflowOptions,
  isAgentEnabled,
  isMcpDisabled,
  isPolling,
  isWorkflowDisabled,
  loadPreferences,
  offPreferencesChange,
  onPreferencesChange,
  startPolling,
  stopPolling,
  withRetry,
  type AgentConfig,
  type AgentOptions,
  type AiPreferences,
  type McpConfig,
  type Preferences,
  type RetryableError,
  type RetryConfig,
  type WorkflowConfig as PreferencesWorkflowConfig,
} from "./common/preferences.ts";

// Preferences Schema
export {
  AgentConfigSchema,
  AgentOptionsSchema,
  AiPreferencesSchema,
  generateJsonSchema,
  McpConfigSchema,
  PreferencesSchema,
  RetryConfigSchema,
  WorkflowConfigSchema,
} from "./common/preferences.schema.ts";

// Paths
export {
  DEFAULT_MCPS_DIR,
  DEFAULT_USER_DIR,
  DEFAULT_USER_MCPS_DIR,
  DEFAULT_USER_PROMPTS_DIR,
  DEFAULT_USER_WORKFLOWS_DIR,
  DEFAULT_WORKFLOWS_DIR,
  detectRuntime,
  getMcpPath,
  getPaths,
  getWorkflowPath,
  initPaths,
  PACKAGE_ROOT,
  type McpServerConfig as PathMcpServerConfig,
  type PathConfig,
  type Runtime,
} from "./common/paths.ts";

// Scanner
export {
  createScanner,
  extractDescription,
  extractMcpDependencies,
  extractMcpTools,
  scanMcpsIn,
  scanWorkflowsIn,
  type McpItem,
  type ScannerConfig,
  type ScanResult,
  type ScannedItem,
  type WorkflowItem,
} from "./meta/lib/scanner.ts";

// Meta MCP
export {
  buildMetaMcp,
  createListTool,
  createReloadTool,
  createWorkflowTool,
  scanWorkflows,
  type MetaMcpConfig,
} from "./meta/meta.mcp.ts";
