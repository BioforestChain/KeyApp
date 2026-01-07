#!/usr/bin/env bun
/**
 * Agent MCP Server
 *
 * 基于 meta 的自发现机制，提供：
 * 1. workflow(name, args) - 执行任意 workflow
 * 2. reload() - 刷新 workflow 列表
 * 3. list() - 列出所有 workflows
 * 4. 直接 MCP tools (whitebook, practice, roadmap)
 *
 * Usage:
 *   pnpm agent:mcp
 *   pnpm agent:mcp --transport=http --port=3100
 */

import { join } from "node:path";
import { buildMetaMcp } from "../../../packages/flow/src/meta/meta.mcp.js";
import { allTools } from "../meta/index.js";

const ROOT = process.cwd();

// 使用 buildMetaMcp，传入 workflow 目录和额外的直接 tools
const { server } = buildMetaMcp({
  name: "keyapp-agent",
  directories: [
    join(ROOT, "scripts/agent-flow/workflows"),  // 项目 workflows
  ],
  extraTools: allTools,  // 直接暴露的 MCP tools
  autoStart: true,
});

export default server;
