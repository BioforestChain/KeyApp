/**
 * Agent Meta - Workflow 发现路径配置
 *
 * 定义 workflows 的发现目录，供 buildMetaMcp 使用。
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agent-flow 根目录
export const AGENT_FLOW_DIR = dirname(__dirname);

// Workflow 目录
export const WORKFLOWS_DIR = join(AGENT_FLOW_DIR, "workflows");

// MCP 目录
export const MCPS_DIR = join(AGENT_FLOW_DIR, "mcps");

// =============================================================================
// Re-export tools for workflow internal use
// =============================================================================

import * as whitebookMcp from "../mcps/whitebook.mcp.js";
import * as practiceMcp from "../mcps/practice.mcp.js";
import * as roadmapMcp from "../mcps/roadmap.mcp.js";

export const whitebook = {
  toc: whitebookMcp.toc,
  chapter: whitebookMcp.chapter,
  search: whitebookMcp.search,
  knowledgeMap: whitebookMcp.knowledgeMap,
};

export const practice = {
  list: practiceMcp.list,
  add: practiceMcp.add,
  remove: practiceMcp.remove,
  update: practiceMcp.update,
};

export const roadmap = {
  list: roadmapMcp.list,
  stats: roadmapMcp.stats,
  current: roadmapMcp.current,
};
