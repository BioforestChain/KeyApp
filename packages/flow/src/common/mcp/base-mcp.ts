/**
 * Base MCP Server Framework
 *
 * Features:
 * - Type-safe input/output with Zod schemas
 * - Tools exportable as callable functions
 * - Multi-transport support: stdio, http
 *
 * Usage:
 *   export const myTool = defineTool({
 *     name: "my_tool",
 *     description: "...",
 *     inputSchema: z.object({ query: z.string() }),
 *     outputSchema: z.object({ result: z.string() }),
 *     handler: async (input) => ({ result: "..." })
 *   });
 *
 *   createMcpServer({
 *     name: "my-mcp",
 *     tools: [myTool],
 *     autoStart: true
 *   });
 *
 *   // Direct call (works without server)
 *   const result = await myTool.call({ query: "test" });
 */

import { z, type ZodSchema, type ZodType } from "zod";

// Re-export zod
export { z } from "zod";

// =============================================================================
// Types
// =============================================================================

export type TransportMode = "stdio" | "http";

export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image";
  data: string;
  mimeType: string;
}

export type McpContent = TextContent | ImageContent;

export interface ToolResult<TOutput> {
  data: TOutput;
  isError?: boolean;
}

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

export interface TypedTool<
  TInput extends ZodSchema = ZodSchema,
  TOutput extends ZodSchema = ZodSchema,
> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  call: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
  handler: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
  _mcpHandler: (input: unknown) => Promise<{ content: McpContent[]; isError?: boolean }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTypedTool = TypedTool<any, any>;

export interface McpServerConfig {
  name: string;
  version?: string;
  description?: string;
  tools?: AnyTypedTool[];
  resources?: McpResource[];
  prompts?: AnyMcpPromptTemplate[];
  autoStart?: boolean;
  transport?: TransportMode;
  debug?: boolean;
  port?: number;
  host?: string;
}

export interface McpResource {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType?: string;
  handler: (uri: string) => Promise<string>;
}

export type ZodRawShape = Record<string, z.ZodTypeAny>;

export interface McpPromptTemplate<TShape extends ZodRawShape = ZodRawShape> {
  name: string;
  description: string;
  argsSchema?: TShape;
  handler: (args: z.infer<z.ZodObject<TShape>>) => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMcpPromptTemplate = McpPromptTemplate<any>;

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
      if (["stdio", "http"].includes(mode)) {
        result.transport = mode;
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

export function zodToJsonSchema(schema: ZodSchema): Record<string, unknown> {
  const def = (schema as unknown as {
    _def: {
      typeName: string;
      shape?: Record<string, unknown>;
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
      const shape = def.shape || {};
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, field] of Object.entries(shape)) {
        const fieldDef = (field as unknown as { _def: { typeName: string } })._def;
        properties[key] = zodToJsonSchema(field as ZodSchema);

        if (fieldDef.typeName !== "ZodOptional" && fieldDef.typeName !== "ZodDefault") {
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
      const values = (schema as unknown as { _def: { values: string[] } })._def.values;
      return { type: "string", enum: values };
    }

    case "ZodOptional":
    case "ZodDefault":
      return def.innerType ? zodToJsonSchema(def.innerType) : { type: "string" };

    case "ZodNullable": {
      const inner = def.innerType ? zodToJsonSchema(def.innerType) : { type: "string" };
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
        additionalProperties: def.values ? zodToJsonSchema(def.values as ZodSchema) : true,
      };

    case "ZodLiteral": {
      const value = (schema as unknown as { _def: { value: unknown } })._def.value;
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
 */
export function defineTool<TInput extends ZodSchema, TOutput extends ZodSchema>(
  config: ToolConfig<TInput, TOutput>
): TypedTool<TInput, TOutput> {
  const { name, description, inputSchema, outputSchema, handler } = config;

  const call = async (input: z.infer<TInput>): Promise<z.infer<TOutput>> => {
    const validatedInput = await inputSchema.parseAsync(input);
    const result = await handler(validatedInput);
    const validatedOutput = await outputSchema.parseAsync(result);
    return validatedOutput;
  };

  const _mcpHandler = async (
    input: unknown
  ): Promise<{ content: McpContent[]; isError?: boolean }> => {
    try {
      const validatedInput = await inputSchema.parseAsync(input);
      const result = await handler(validatedInput);
      const validatedOutput = await outputSchema.parseAsync(result);

      const text =
        typeof validatedOutput === "string"
          ? validatedOutput
          : JSON.stringify(validatedOutput, null, 2);

      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
 * Define a simple tool with string output.
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

export class McpServerWrapper {
  private config: Required<Pick<McpServerConfig, "name" | "version" | "debug">> & McpServerConfig;
  private tools: Map<string, AnyTypedTool> = new Map();
  private resources: Map<string, McpResource> = new Map();
  private prompts: Map<string, AnyMcpPromptTemplate> = new Map();

  constructor(config: McpServerConfig) {
    this.config = {
      version: "1.0.0",
      debug: false,
      ...config,
    };

    if (config.tools) {
      for (const tool of config.tools) {
        this.registerTool(tool);
      }
    }

    if (config.resources) {
      for (const resource of config.resources) {
        this.registerResource(resource);
      }
    }

    if (config.prompts) {
      for (const prompt of config.prompts) {
        this.registerPrompt(prompt);
      }
    }
  }

  registerTool(tool: AnyTypedTool): void {
    this.tools.set(tool.name, tool);
    this.log(`Tool registered: ${tool.name}`);
  }

  registerResource(resource: McpResource): void {
    this.resources.set(resource.name, resource);
    this.log(`Resource registered: ${resource.uriTemplate}`);
  }

  registerPrompt(prompt: AnyMcpPromptTemplate): void {
    this.prompts.set(prompt.name, prompt);
    this.log(`Prompt registered: ${prompt.name}`);
  }

  async start(): Promise<void> {
    const cliArgs = parseCliArgs();
    const transport = this.config.transport || cliArgs.transport;

    switch (transport) {
      case "stdio":
        await this.startStdioServer();
        break;
      case "http":
        await this.startHttpServer(cliArgs.host, cliArgs.port);
        break;
    }
  }

  private async startStdioServer(): Promise<void> {
    // Stdio transport - read from stdin, write to stdout
    this.log("Server running on stdio");

    const { createInterface } = await import("node:readline");
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    for await (const line of rl) {
      try {
        const request = JSON.parse(line);
        const response = await this.handleRequest(request);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.log(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          })
        );
      }
    }
  }

  private async startHttpServer(host: string, port: number): Promise<void> {
    const { createServer } = await import("node:http");

    const server = createServer(async (req, res) => {
      if (req.method !== "POST") {
        res.writeHead(405);
        res.end("Method Not Allowed");
        return;
      }

      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }

      try {
        const request = JSON.parse(body);
        const response = await this.handleRequest(request);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          })
        );
      }
    });

    server.listen(port, host, () => {
      this.log(`HTTP server running on http://${host}:${port}`);
    });
  }

  private async handleRequest(request: {
    method: string;
    params?: Record<string, unknown>;
  }): Promise<unknown> {
    switch (request.method) {
      case "tools/list":
        return {
          tools: Array.from(this.tools.values()).map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: zodToJsonSchema(tool.inputSchema),
          })),
        };

      case "tools/call": {
        const { name, arguments: args } = request.params as {
          name: string;
          arguments: unknown;
        };
        const tool = this.tools.get(name);
        if (!tool) {
          throw new Error(`Tool not found: ${name}`);
        }
        return await tool._mcpHandler(args);
      }

      case "resources/list":
        return {
          resources: Array.from(this.resources.values()).map((r) => ({
            uri: r.uriTemplate,
            name: r.name,
            description: r.description,
            mimeType: r.mimeType,
          })),
        };

      case "prompts/list":
        return {
          prompts: Array.from(this.prompts.values()).map((p) => ({
            name: p.name,
            description: p.description,
          })),
        };

      default:
        throw new Error(`Unknown method: ${request.method}`);
    }
  }

  getTool(name: string): AnyTypedTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): AnyTypedTool[] {
    return Array.from(this.tools.values());
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.error(`[${this.config.name}] ${message}`);
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
      console.error(`[${config.name}] Fatal error:`, error);
      process.exit(1);
    });
  }

  return server;
}

export function printMcpHelp(name: string, description?: string): void {
  console.log(`${name} - MCP Server

${description || "A Model Context Protocol server."}

Usage:
  node ${name}.mcp.js [options]

Options:
  --transport=<mode>  Transport mode: stdio (default), http
  --port=<port>       Port for HTTP mode (default: 3000)
  --host=<host>       Host for HTTP mode (default: localhost)
  -h, --help          Show this help message
`);
}

// =============================================================================
// Utility Functions
// =============================================================================

export function textContent(text: string): TextContent {
  return { type: "text", text };
}

export function imageContent(data: string, mimeType: string): ImageContent {
  return { type: "image", data, mimeType };
}

export function createResource(
  uriTemplate: string,
  name: string,
  description: string,
  handler: (uri: string) => Promise<string>,
  mimeType?: string
): McpResource {
  return { uriTemplate, name, description, handler, mimeType };
}

export function definePrompt<TShape extends ZodRawShape>(
  config: PromptConfig<TShape>
): McpPromptTemplate<TShape> {
  return {
    name: config.name,
    description: config.description,
    argsSchema: config.argsSchema,
    handler: config.handler,
  };
}

export default {
  defineTool,
  defineSimpleTool,
  definePrompt,
  createMcpServer,
  createResource,
  parseCliArgs,
  printMcpHelp,
  zodToJsonSchema,
  textContent,
  imageContent,
};
