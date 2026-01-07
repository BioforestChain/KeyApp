#!/usr/bin/env bun
/**
 * Agent MCP Server 启动入口
 *
 * 基于 meta.mcp 的 buildMetaMcp 构建，自动发现 workflows 并暴露给 AI。
 *
 * Usage:
 *   pnpm agent:mcp
 */

import { join } from "node:path";
import { buildMetaMcp } from "../../packages/flow/src/meta/meta.mcp.js";
import { allTools } from "./meta/index.js";

const ROOT = process.cwd();

const { server } = buildMetaMcp({
  name: "keyapp-agent",
  directories: [
    join(ROOT, "scripts/agent-flow/workflows"),
  ],
  extraTools: allTools,
  autoStart: true,
});
