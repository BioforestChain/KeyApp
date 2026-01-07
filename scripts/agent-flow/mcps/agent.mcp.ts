#!/usr/bin/env bun
/**
 * Agent MCP Server - 聚合所有 MCPs
 *
 * Usage:
 *   pnpm agent:mcp
 *   pnpm agent:mcp --transport=http --port=3100
 */

import { createMcpServer } from "../../../packages/flow/src/common/mcp/base-mcp.js";
import { allTools } from "../meta/index.js";

const server = createMcpServer({
  name: "keyapp-agent",
  version: "2.0.0",
  description: "KeyApp AI Agent - 白皮书、最佳实践、Roadmap",
  tools: allTools,
  autoStart: true,
  debug: process.env.DEBUG === "true",
});

export default server;
