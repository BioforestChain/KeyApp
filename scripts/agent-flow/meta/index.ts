/**
 * Agent Meta - 统一导出 MCPs 和 Workflows
 *
 * Usage:
 *   import { mcps, workflows, allTools } from './meta'
 */

import * as whitebookMcp from "../mcps/whitebook.mcp.js";
import * as practiceMcp from "../mcps/practice.mcp.js";
import * as roadmapMcp from "../mcps/roadmap.mcp.js";

// =============================================================================
// MCP Registry
// =============================================================================

export const mcps = {
  whitebook: {
    name: "whitebook",
    description: "白皮书工具",
    tools: whitebookMcp.tools,
  },
  practice: {
    name: "practice",
    description: "最佳实践工具",
    tools: practiceMcp.tools,
  },
  roadmap: {
    name: "roadmap",
    description: "Roadmap 工具",
    tools: roadmapMcp.tools,
  },
};

// =============================================================================
// All Tools (flattened)
// =============================================================================

export const allTools = [
  ...whitebookMcp.tools,
  ...practiceMcp.tools,
  ...roadmapMcp.tools,
];

// =============================================================================
// Tool Access by Name
// =============================================================================

export const toolsByName = Object.fromEntries(allTools.map((t) => [t.name, t]));

// =============================================================================
// Direct Tool Exports (for workflow composition)
// =============================================================================

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
