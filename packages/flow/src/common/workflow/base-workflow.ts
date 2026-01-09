/**
 * Base Workflow Framework
 *
 * Features:
 * - Nested subflows support
 * - Hierarchical help system
 * - Deep invocation: `workflow sub1 sub2 --args`
 * - Type-safe argument parsing
 *
 * Usage:
 *   export const workflow = defineWorkflow({
 *     name: "main",
 *     description: "Main workflow",
 *     args: {
 *       prompt: { type: "string", alias: "p", description: "Input", required: true },
 *     },
 *     subflows: [subWorkflow],
 *     handler: async (args) => { ... },
 *     autoStart: true,
 *   });
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { withPreferences, WorkflowNameContext } from "../async-context.ts";

// =============================================================================
// Types
// =============================================================================

export type ArgType = "string" | "boolean" | "number";

export interface ArgConfig {
  type: ArgType;
  alias?: string;
  description?: string;
  default?: string | boolean | number;
  required?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubflowDef = Workflow<any> | (() => Promise<Workflow<any>>);

async function resolveSubflow(def: SubflowDef): Promise<Workflow<Record<string, ArgConfig>>> {
  if (typeof def === "function") {
    return await def();
  }
  return def;
}

async function getSubflowName(def: SubflowDef): Promise<string> {
  const workflow = await resolveSubflow(def);
  return workflow.meta.name;
}

async function buildSubflowMap(subflows: SubflowDef[]): Promise<Map<string, SubflowDef>> {
  const map = new Map<string, SubflowDef>();
  for (const def of subflows) {
    const name = await getSubflowName(def);
    map.set(name, def);
  }
  return map;
}

/** Description can be static string, sync function, or async function */
export type DescriptionProvider = string | (() => string) | (() => Promise<string>);

/** Resolve description to string */
export async function resolveDescription(desc: DescriptionProvider): Promise<string> {
  if (typeof desc === "string") return desc;
  const result = desc();
  return result instanceof Promise ? await result : result;
}

export interface WorkflowConfig<TArgs extends Record<string, ArgConfig>> {
  name: string;
  description: DescriptionProvider;
  version?: string;
  args?: TArgs;
  subflows?: SubflowDef[];
  examples?: Array<[string, string]>;
  notes?: string;
  handler?: (args: InferArgs<TArgs>, ctx: WorkflowContext) => Promise<void>;
  autoStart?: boolean;
}

export interface WorkflowMeta {
  name: string;
  description: DescriptionProvider;
  version: string;
  args: Record<string, ArgConfig>;
}

/** Get resolved description string from WorkflowMeta */
export async function getMetaDescription(meta: WorkflowMeta): Promise<string> {
  return resolveDescription(meta.description);
}

export interface WorkflowContext {
  meta: WorkflowMeta;
  path: string[];
  rawArgs: string[];
  getSubflow: (name: string) => Promise<Workflow<Record<string, ArgConfig>> | undefined>;
  subflowNames: () => Promise<string[]>;
}

type InferArg<T extends ArgConfig> = T["type"] extends "string"
  ? string
  : T["type"] extends "boolean"
    ? boolean
    : T["type"] extends "number"
      ? number
      : never;

type InferArgs<T extends Record<string, ArgConfig>> = {
  [K in keyof T]: T[K]["required"] extends true
    ? InferArg<T[K]>
    : T[K]["default"] extends undefined
      ? InferArg<T[K]> | undefined
      : InferArg<T[K]>;
} & {
  _: string[];
};

// =============================================================================
// Argument Parsing
// =============================================================================

export interface ParsedArgs {
  _: (string | number)[];
  [key: string]: unknown;
}

function parseArgs(argv: string[], argsConfig: Record<string, ArgConfig> = {}): ParsedArgs {
  const result: ParsedArgs = { _: [] };
  const aliasMap: Record<string, string> = {};

  // Build alias map
  for (const [key, cfg] of Object.entries(argsConfig)) {
    if (cfg.alias) {
      aliasMap[cfg.alias] = key;
    }
    if (cfg.default !== undefined) {
      result[key] = cfg.default;
    }
  }

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      const eqIndex = arg.indexOf("=");
      if (eqIndex !== -1) {
        const key = arg.slice(2, eqIndex);
        const value = arg.slice(eqIndex + 1);
        result[key] = value;
      } else if (arg.startsWith("--no-")) {
        const key = arg.slice(5);
        result[key] = false;
      } else {
        const key = arg.slice(2);
        const cfg = argsConfig[key];
        if (cfg?.type === "boolean") {
          result[key] = true;
        } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
          result[key] = argv[++i];
        } else {
          result[key] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const alias = arg.slice(1);
      const key = aliasMap[alias] || alias;
      const cfg = argsConfig[key];
      if (cfg?.type === "boolean") {
        result[key] = true;
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        result[key] = argv[++i];
      } else {
        result[key] = true;
      }
    } else {
      result._.push(arg);
    }
    i++;
  }

  return result;
}

function resolveArgs<TArgs extends Record<string, ArgConfig>>(
  parsed: ParsedArgs,
  config: TArgs
): InferArgs<TArgs> {
  const result: Record<string, unknown> = { _: parsed._.map(String) };

  for (const [key, cfg] of Object.entries(config)) {
    const value = parsed[key];

    if (value !== undefined) {
      switch (cfg.type) {
        case "number":
          result[key] = Number(value);
          break;
        case "boolean":
          result[key] = Boolean(value);
          break;
        default:
          result[key] = String(value);
      }
    } else if (cfg.default !== undefined) {
      result[key] = cfg.default;
    }
  }

  return result as InferArgs<TArgs>;
}

// =============================================================================
// Help System
// =============================================================================

interface HelpOptions {
  showAll: boolean;
  printed: Set<string>;
  indent: number;
}

function formatArg(key: string, cfg: ArgConfig): string {
  const parts: string[] = [];
  parts.push(`  --${key}`);
  if (cfg.alias) parts[0] += `, -${cfg.alias}`;
  parts.push(`<${cfg.type}>`);
  if (cfg.description) parts.push(cfg.description);
  if (cfg.required) parts.push("(required)");
  if (cfg.default !== undefined) parts.push(`[default: ${cfg.default}]`);
  return parts.join("  ");
}

async function printHelp<TArgs extends Record<string, ArgConfig>>(
  workflow: Workflow<TArgs>,
  path: string[],
  opts: HelpOptions
): Promise<void> {
  const { meta, config } = workflow;
  const prefix = "  ".repeat(opts.indent);
  const pathStr = path.join(" ");
  const id = pathStr || meta.name;

  if (opts.printed.has(id)) {
    if (opts.showAll) {
      console.log(`${prefix}${meta.name}: (see above)`);
    }
    return;
  }
  opts.printed.add(id);

  // Set workflow name context for str.scenarios() to use
  const description = await WorkflowNameContext.run(meta.name, () => getMetaDescription(meta));
  if (opts.indent === 0) {
    console.log(`${meta.name} v${meta.version} - ${description}`);
    console.log();
    console.log(`Usage: ${pathStr || meta.name} [subflow...] [options]`);
  } else {
    console.log(`${prefix}${meta.name} - ${description}`);
  }

  const argEntries = Object.entries(meta.args);
  if (argEntries.length > 0) {
    console.log();
    console.log(`${prefix}Options:`);
    for (const [key, cfg] of argEntries) {
      console.log(`${prefix}${formatArg(key, cfg)}`);
    }
  }

  if (opts.indent === 0) {
    console.log();
    console.log(`${prefix}Built-in:`);
    console.log(`${prefix}  --help, -h      Show help (use --help=all for full tree)`);
    console.log(`${prefix}  --version, -v   Show version`);
  }

  const subflows = config.subflows || [];
  if (subflows.length > 0) {
    console.log();
    console.log(`${prefix}Subflows:`);
    for (const subDef of subflows) {
      const sub = await resolveSubflow(subDef);
      if (opts.showAll) {
        console.log();
        await printHelp(sub, [...path, sub.meta.name], {
          ...opts,
          indent: opts.indent + 1,
        });
      } else {
        console.log(`${prefix}  ${sub.meta.name}  ${sub.meta.description}`);
      }
    }
  }

  if (config.examples && config.examples.length > 0 && opts.indent === 0) {
    console.log();
    console.log("Examples:");
    for (const [cmd, desc] of config.examples) {
      console.log(`  ${cmd}`);
      console.log(`    ${desc}`);
    }
  }

  if (config.notes && opts.indent === 0) {
    console.log();
    console.log(config.notes);
  }
}

// =============================================================================
// Workflow Definition
// =============================================================================

export interface Workflow<TArgs extends Record<string, ArgConfig>> {
  meta: WorkflowMeta;
  config: WorkflowConfig<TArgs>;
  run: (argv?: string[]) => Promise<void>;
  execute: (args: Partial<InferArgs<TArgs>>) => Promise<void>;
}

/**
 * Define a workflow with optional subflows
 */
export function defineWorkflow<TArgs extends Record<string, ArgConfig>>(
  config: WorkflowConfig<TArgs>
): Workflow<TArgs> {
  const meta: WorkflowMeta = {
    name: config.name,
    description: config.description,
    version: config.version || "1.0.0",
    args: (config.args || {}) as Record<string, ArgConfig>,
  };

  let subflowMapCache: Map<string, SubflowDef> | null = null;

  async function getSubflowMap(): Promise<Map<string, SubflowDef>> {
    if (!subflowMapCache) {
      subflowMapCache = await buildSubflowMap(config.subflows || []);
    }
    return subflowMapCache;
  }

  function createContext(path: string[], rawArgs: string[]): WorkflowContext {
    return {
      meta,
      path,
      rawArgs,
      getSubflow: async (name: string) => {
        const map = await getSubflowMap();
        const subDef = map.get(name);
        if (!subDef) return undefined;
        return await resolveSubflow(subDef);
      },
      subflowNames: async () => {
        const map = await getSubflowMap();
        return Array.from(map.keys());
      },
    };
  }

  async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
    const parsed = parseArgs(argv, {});

    if (parsed["version"] === true) {
      console.log(meta.version);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentWorkflow: Workflow<any> = workflow;
    const path: string[] = [meta.name];
    const remaining = parsed._.map(String);

    while (remaining.length > 0) {
      const next = remaining[0];
      const subflowMap = await buildSubflowMap(currentWorkflow.config.subflows || []);
      const subDef = subflowMap.get(next);
      if (subDef) {
        path.push(next);
        remaining.shift();
        currentWorkflow = await resolveSubflow(subDef);
      } else {
        break;
      }
    }

    const helpValue = parsed["help"] ?? parsed["h"];
    if (helpValue !== undefined) {
      const showAll = helpValue === "all";
      await printHelp(currentWorkflow, path, {
        showAll,
        printed: new Set(),
        indent: 0,
      });
      return;
    }

    const targetArgv = [...remaining];
    for (const [key, value] of Object.entries(parsed)) {
      if (key === "_" || key === "--" || key === "help" || key === "h" || key === "version")
        continue;
      if (typeof value === "boolean") {
        if (value) targetArgv.push(`--${key}`);
        else targetArgv.push(`--no-${key}`);
      } else {
        targetArgv.push(`--${key}=${value}`);
      }
    }

    const targetParsed = parseArgs(targetArgv, currentWorkflow.meta.args);
    const args = resolveArgs(targetParsed, currentWorkflow.meta.args);

    for (const [key, cfg] of Object.entries(currentWorkflow.meta.args)) {
      if (cfg.required && args[key] === undefined) {
        console.error(`Error: Missing required argument: --${key}`);
        console.error(`Run with --help for usage information.`);
        process.exit(1);
      }
    }

    if (currentWorkflow.config.handler) {
      let ctxSubflowMap: Map<string, SubflowDef> | null = null;
      const getCtxSubflowMap = async () => {
        if (!ctxSubflowMap) {
          ctxSubflowMap = await buildSubflowMap(currentWorkflow.config.subflows || []);
        }
        return ctxSubflowMap;
      };

      const ctx: WorkflowContext = {
        meta: currentWorkflow.meta,
        path,
        rawArgs: remaining,
        getSubflow: async (name: string) => {
          const map = await getCtxSubflowMap();
          const subDef = map.get(name);
          if (!subDef) return undefined;
          return await resolveSubflow(subDef);
        },
        subflowNames: async () => {
          const map = await getCtxSubflowMap();
          return Array.from(map.keys());
        },
      };

      try {
        await withPreferences(() => currentWorkflow.config.handler!(args, ctx));
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    } else {
      await printHelp(currentWorkflow, path, {
        showAll: false,
        printed: new Set(),
        indent: 0,
      });
    }
  }

  async function execute(args: Partial<InferArgs<TArgs>>): Promise<void> {
    const fullArgs = { _: [], ...args } as InferArgs<TArgs>;
    if (config.handler) {
      await withPreferences(() => config.handler!(fullArgs, createContext([meta.name], [])));
    }
  }

  const workflow: Workflow<TArgs> = { meta, config, run, execute };

  if (config.autoStart) {
    run().catch((error) => {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    });
  }

  return workflow;
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Get the directory of the current module
 */
export function getModuleDir(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

/**
 * Create a simple router workflow
 */
export function createRouter(config: {
  name: string;
  description: string;
  subflows: SubflowDef[];
  version?: string;
}): Workflow<Record<string, never>> {
  return defineWorkflow({
    name: config.name,
    description: config.description,
    version: config.version,
    subflows: config.subflows,
  });
}
