#!/usr/bin/env bun
/**
 * Agent MCP Server 启动入口
 *
 * 基于 meta.mcp 的 buildMetaMcp 构建，自动发现 workflows 并暴露给 AI。
 * AI 通过 workflow("agent", [...]) 调用功能。
 *
 * Usage:
 *   pnpm agent:mcp
 */

import { buildMetaMcp } from "../../packages/flow/src/meta/meta.mcp.js";
import { WORKFLOWS_DIR } from "./meta/index.js";

// Meta 自动发现 workflows
await buildMetaMcp({
  name: "keyapp-agent",
  directories: [WORKFLOWS_DIR],
  autoStart: true,
  autoRefresh: true,
});
