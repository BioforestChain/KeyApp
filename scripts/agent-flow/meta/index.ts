/**
 * Agent Meta - 导出内部 Tools 供 Workflow 使用
 *
 * 注意：这些 tools 仅供 workflow 内部调用，不直接暴露给 AI。
 * AI 通过 workflow("agent", [...]) 间接使用这些功能。
 */

import * as whitebookMcp from "../mcps/whitebook.mcp.js";
import * as practiceMcp from "../mcps/practice.mcp.js";
import * as roadmapMcp from "../mcps/roadmap.mcp.js";

// =============================================================================
// Tool Exports (for workflow internal use)
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
