#!/usr/bin/env bun
/**
 * Agent MCP Server 启动入口
 *
 * 基于 meta.mcp 的 buildMetaMcp 构建，自动发现 workflows 并暴露给 AI。
 * AI 通过 workflow("agent", [...]) 调用功能，无需手动聚合 MCP tools。
 *
 * Usage:
 *   pnpm agent:mcp
 */

import { join } from "node:path";
import { buildMetaMcp } from "../../packages/flow/src/meta/meta.mcp.js";

const ROOT = process.cwd();

// Meta 只负责发现 workflows，不需要 extraTools
await buildMetaMcp({
  name: "keyapp-agent",
  directories: [join(ROOT, "scripts/agent-flow/workflows")],
  autoStart: true,
});
