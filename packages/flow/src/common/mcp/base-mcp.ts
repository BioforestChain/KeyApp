/**
 * Base MCP Server Framework
 *
 * Features:
 * - Type-safe input/output with Zod schemas
 * - Tools exportable as callable functions
 * - Auto-start with `autoStart: true`
 * - Multi-transport support: stdio (default), sse, http via --transport=<mode>
 *
 * Usage:
 *   // Define a tool
 *   export const myTool = defineTool({
 *     name: "my_tool",
 *     description: "...",
 *     inputSchema: z.object({ query: z.string() }),
 *     outputSchema: z.object({ result: z.string() }),
 *     handler: async (input) => ({ result: "..." })
 *   });
 *
 *   // Create and auto-start server
 *   createMcpServer({
 *     name: "my-mcp",
 *     tools: [myTool],
 *     autoStart: true
 *   });
 *
 *   // Direct programmatic call (works even without server running)
 *   const result = await myTool.call({ query: "test" });
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  ImageContent,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { z, type ZodSchema, type ZodType } from "zod";

// Re-export zod for convenience
export { z } from "zod";
export type { ImageContent, TextContent };

// =============================================================================
// Types
// =============================================================================

/** Transport mode */
export type TransportMode = "stdio" | "sse" | "http";

/** Content types for MCP responses */
export type McpContent = TextContent | ImageContent;

/** Tool handler result */
export interface ToolResult<TOutput> {
  data: TOutput;
  isError?: boolean;
}

/** Tool definition configuration */
export interface ToolConfig<
  TInput extends ZodSchema = ZodSchema,
  TOutput extends ZodSchema = ZodSchema,
> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  handler: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
}

/** A typed MCP tool with callable function */
export interface TypedTool<
  TInput extends ZodSchema = ZodSchema,
  TOutput extends ZodSchema = ZodSchema,
> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  /** Direct function call - works without MCP server */
  call: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
  /** Raw handler function */
  handler: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
  /** Internal: MCP handler that returns content array */
  _mcpHandler: (
    input: unknown,
  ) => Promise<{ content: McpContent[]; isError?: boolean }>;
}

/** Base tool type for arrays (type-erased for compatibility) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTypedTool = TypedTool<any, any>;

/** Server configuration */
export interface McpServerConfig {
  name: string;
  version?: string;
  description?: string;
  tools?: AnyTypedTool[];
  resources?: McpResource[];
  prompts?: AnyMcpPromptTemplate[];
  /** Auto-start server when true */
  autoStart?: boolean;
  /** Transport mode override (default: parse from CLI or "stdio") */
  transport?: TransportMode;
  /** Debug logging */
  debug?: boolean;
  /** SSE/HTTP port (default: 3000) */
  port?: number;
  /** SSE/HTTP host (default: localhost) */
  host?: string;
}

/** Resource definition */
export interface McpResource {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType?: string;
  handler: (uri: string) => Promise<string>;
}

/** Zod object shape type (the inner structure of z.object()) */
export type ZodRawShape = Record<string, z.ZodTypeAny>;

/** Prompt template definition (typed with Zod object shape) */
export interface McpPromptTemplate<TShape extends ZodRawShape = ZodRawShape> {
  name: string;
  description: string;
  argsSchema?: TShape;
  handler: (args: z.infer<z.ZodObject<TShape>>) => Promise<string>;
}

/** Base prompt type for arrays (type-erased for compatibility) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMcpPromptTemplate = McpPromptTemplate<any>;

/** Prompt definition configuration */
export interface PromptConfig<TShape extends ZodRawShape> {
  name: string;
  description: string;
  argsSchema?: TShape;
  handler: (args: z.infer<z.ZodObject<TShape>>) => Promise<string>;
}

// =============================================================================
// CLI Argument Parsing
// =============================================================================

export interface CliArgs {
  transport: TransportMode;
  port: number;
  host: string;
  help: boolean;
}

/** Parse CLI arguments for transport mode */
export function parseCliArgs(args: string[] = process.argv.slice(2)): CliArgs {
  const result: CliArgs = {
    transport: "stdio",
    port: 3000,
    host: "localhost",
    help: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg.startsWith("--transport=")) {
      const mode = arg.slice("--transport=".length) as TransportMode;
      if (["stdio", "sse", "http"].includes(mode)) {
        result.transport = mode;
      } else {
        
      }
    } else if (arg.startsWith("--port=")) {
      result.port = parseInt(arg.slice("--port=".length), 10) || 3000;
    } else if (arg.startsWith("--host=")) {
      result.host = arg.slice("--host=".length);
    }
  }

  return result;
}

// =============================================================================
// Zod to JSON Schema Conversion
// =============================================================================

/** Convert Zod schema to JSON Schema for MCP */
export function zodToJsonSchema(schema: ZodSchema): Record<string, unknown> {
  const def = (schema as unknown as {
    _def: {
      typeName: string;
      shape?: () => Record<string, unknown>;
      innerType?: ZodSchema;
      type?: ZodSchema;
      items?: ZodSchema;
      values?: ZodSchema;
      options?: ZodSchema[];
      checks?: Array<{ kind: string; value?: unknown }>;
    };
  })._def;

  switch (def.typeName) {
    case "ZodObject": {
      const shape = typeof def.shape === "function" ? def.shape() : (def.shape || {});
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, field] of Object.entries(shape)) {
        const fieldDef =
          (field as unknown as { _def: { typeName: string } })._def;
        properties[key] = zodToJsonSchema(field as ZodSchema);

        if (
          fieldDef.typeName !== "ZodOptional" &&
          fieldDef.typeName !== "ZodDefault"
        ) {
          required.push(key);
        }
      }

      return {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
      };
    }

    case "ZodString": {
      const result: Record<string, unknown> = { type: "string" };
      if (def.checks) {
        for (const check of def.checks) {
          if (check.kind === "url") result.format = "uri";
          if (check.kind === "email") result.format = "email";
          if (check.kind === "min") result.minLength = check.value;
          if (check.kind === "max") result.maxLength = check.value;
        }
      }
      return result;
    }

    case "ZodNumber": {
      const result: Record<string, unknown> = { type: "number" };
      if (def.checks) {
        for (const check of def.checks) {
          if (check.kind === "int") result.type = "integer";
          if (check.kind === "min") result.minimum = check.value;
          if (check.kind === "max") result.maximum = check.value;
        }
      }
      return result;
    }

    case "ZodBoolean":
      return { type: "boolean" };

    case "ZodArray":
      return {
        type: "array",
        items: def.type ? zodToJsonSchema(def.type) : { type: "string" },
      };

    case "ZodEnum": {
      const values =
        (schema as unknown as { _def: { values: string[] } })._def.values;
      return { type: "string", enum: values };
    }

    case "ZodOptional":
    case "ZodDefault":
      return def.innerType
        ? zodToJsonSchema(def.innerType)
        : { type: "string" };

    case "ZodNullable": {
      const inner = def.innerType
        ? zodToJsonSchema(def.innerType)
        : { type: "string" };
      return { ...inner, nullable: true };
    }

    case "ZodUnion": {
      const options = def.options || [];
      return {
        oneOf: options.map((opt: ZodSchema) => zodToJsonSchema(opt)),
      };
    }

    case "ZodRecord":
      return {
        type: "object",
        additionalProperties: def.values
          ? zodToJsonSchema(def.values as ZodSchema)
          : true,
      };

    case "ZodLiteral": {
      const value =
        (schema as unknown as { _def: { value: unknown } })._def.value;
      return { const: value };
    }

    case "ZodAny":
      return {};

    default:
      return { type: "string" };
  }
}

// =============================================================================
// Tool Definition
// =============================================================================

/**
 * Define a typed MCP tool.
 * Returns a TypedTool that can be:
 * 1. Registered with an MCP server
 * 2. Called directly as a function (without server)
 * 3. Exported for use in other modules
 */
export function defineTool<
  TInput extends ZodSchema,
  TOutput extends ZodSchema,
>(config: ToolConfig<TInput, TOutput>): TypedTool<TInput, TOutput> {
  const { name, description, inputSchema, outputSchema, handler } = config;

  // Direct call function with validation
  const call = async (input: z.infer<TInput>): Promise<z.infer<TOutput>> => {
    // Validate input
    const validatedInput = await inputSchema.parseAsync(input);
    // Execute handler
    const result = await handler(validatedInput);
    // Validate output
    const validatedOutput = await outputSchema.parseAsync(result);
    return validatedOutput;
  };

  // MCP handler that wraps the result in content array
  const _mcpHandler = async (
    input: unknown,
  ): Promise<{ content: McpContent[]; isError?: boolean }> => {
    try {
      const validatedInput = await inputSchema.parseAsync(input);
      const result = await handler(validatedInput);
      const validatedOutput = await outputSchema.parseAsync(result);

      // Serialize output to text content
      const text = typeof validatedOutput === "string"
        ? validatedOutput
        : JSON.stringify(validatedOutput, null, 2);

      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  };

  return {
    name,
    description,
    inputSchema,
    outputSchema,
    call,
    handler,
    _mcpHandler,
  };
}

/**
 * Define a simple tool with automatic text output schema.
 * Useful for tools that just return a string.
 */
export function defineSimpleTool<TInput extends ZodSchema>(config: {
  name: string;
  description: string;
  inputSchema: TInput;
  handler: (input: z.infer<TInput>) => Promise<string>;
}): TypedTool<TInput, ZodType<string>> {
  return defineTool({
    ...config,
    outputSchema: z.string(),
  });
}

// =============================================================================
// Server Creation
// =============================================================================

/** MCP Server wrapper with tools, resources, and prompts */
export class McpServerWrapper {
  private server: McpServer;
  private config:
    & Required<Pick<McpServerConfig, "name" | "version" | "debug">>
    & McpServerConfig;
  private tools: Map<string, AnyTypedTool> = new Map();

  constructor(config: McpServerConfig) {
    this.config = {
      version: "1.0.0",
      debug: false,
      ...config,
    };

    this.server = new McpServer({
      name: this.config.name,
      version: this.config.version,
    });

    // Register tools
    if (config.tools) {
      for (const tool of config.tools) {
        this.registerTool(tool);
      }
    }

    // Register resources
    if (config.resources) {
      for (const resource of config.resources) {
        this.registerResource(resource);
      }
    }

    // Register prompts
    if (config.prompts) {
      for (const prompt of config.prompts) {
        this.registerPrompt(prompt);
      }
    }
  }

  /** Register a typed tool */
  registerTool(tool: AnyTypedTool): void {
    this.tools.set(tool.name, tool);

    this.server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      tool._mcpHandler,
    );

    this.log(`Tool registered: ${tool.name}`);
  }

  /** Register a resource */
  registerResource(resource: McpResource): void {
    this.server.registerResource(
      resource.name,
      resource.uriTemplate,
      {
        description: resource.description,
        mimeType: resource.mimeType || "text/plain",
      },
      async (uri: URL) => {
        const content = await resource.handler(uri.href);
        return {
          contents: [{
            uri: uri.href,
            mimeType: resource.mimeType || "text/plain",
            text: content,
          }],
        };
      },
    );

    this.log(`Resource registered: ${resource.uriTemplate}`);
  }

  /** Register a prompt */
  registerPrompt(prompt: AnyMcpPromptTemplate): void {
    this.server.registerPrompt(
      prompt.name,
      {
        description: prompt.description,
        ...(prompt.argsSchema ? { argsSchema: prompt.argsSchema } : {}),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (args: any) => {
        const content = await prompt.handler(args);
        return {
          messages: [{
            role: "user" as const,
            content: { type: "text" as const, text: content },
          }],
        };
      },
    );

    this.log(`Prompt registered: ${prompt.name}`);
  }

  /** Start the server with the configured transport */
  async start(): Promise<void> {
    const cliArgs = parseCliArgs();
    const transport = this.config.transport || cliArgs.transport;

    switch (transport) {
      case "stdio": {
        const stdioTransport = new StdioServerTransport();
        await this.server.connect(stdioTransport);
        this.log("Server running on stdio");
        break;
      }

      case "sse":
      case "http": {
        // HTTP/SSE not implemented for Node.js yet
        
        process.exit(1);
      }
    }
  }

  /** Get registered tool by name */
  getTool(name: string): AnyTypedTool | undefined {
    return this.tools.get(name);
  }

  /** Get all registered tools */
  getAllTools(): AnyTypedTool[] {
    return Array.from(this.tools.values());
  }

  /** Get underlying MCP server */
  getServer(): McpServer {
    return this.server;
  }

  private log(message: string): void {
    if (this.config.debug) {
      
    }
  }
}

/**
 * Create an MCP server with optional auto-start.
 */
export function createMcpServer(config: McpServerConfig): McpServerWrapper {
  const server = new McpServerWrapper(config);

  if (config.autoStart) {
    server.start().catch((error) => {
      
      process.exit(1);
    });
  }

  return server;
}

/**
 * Print help message for MCP server CLI
 */
export function printMcpHelp(name: string, description?: string): void {
  
}

// =============================================================================
// Utility Functions
// =============================================================================

/** Create a text content response */
export function textContent(text: string): TextContent {
  return { type: "text", text };
}

/** Create an image content response */
export function imageContent(data: string, mimeType: string): ImageContent {
  return { type: "image", data, mimeType };
}

/** Create a simple resource */
export function createResource(
  uriTemplate: string,
  name: string,
  description: string,
  handler: (uri: string) => Promise<string>,
  mimeType?: string,
): McpResource {
  return { uriTemplate, name, description, handler, mimeType };
}

/**
 * Define a typed MCP prompt.
 */
export function definePrompt<TShape extends ZodRawShape>(
  config: PromptConfig<TShape>,
): McpPromptTemplate<TShape> {
  return {
    name: config.name,
    description: config.description,
    argsSchema: config.argsSchema,
    handler: config.handler,
  };
}

/** @deprecated Use definePrompt instead for better type safety */
export function createPrompt(
  name: string,
  description: string,
  handler: (args: Record<string, string>) => Promise<string>,
): McpPromptTemplate<Record<string, z.ZodString>> {
  return { name, description, handler };
}

// =============================================================================
// Default Export
// =============================================================================

export default {
  defineTool,
  defineSimpleTool,
  definePrompt,
  createMcpServer,
  createResource,
  createPrompt,
  parseCliArgs,
  printMcpHelp,
  zodToJsonSchema,
  textContent,
  imageContent,
};
