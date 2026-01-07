#!/usr/bin/env bun
/**
 * KeyApp Agent MCP Server
 *
 * 基于 meta.mcp 的 buildMetaMcp 构建，自动发现 workflows 并暴露给 AI。
 * 
 * workflow tool 的 description 将替代 AGENTS.md，成为 AI 的入口文档。
 *
 * Usage:
 *   pnpm agent:mcp
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildMetaMcp } from "../../packages/flow/src/meta/meta.mcp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_DIR = join(__dirname, "workflows");

// Meta 自动发现 workflows，生成 description
await buildMetaMcp({
  name: "keyapp-agent",
  directories: [WORKFLOWS_DIR],
  autoStart: true,
  autoRefresh: true,
});
