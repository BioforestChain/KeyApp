/**
 * Agent MCP Server
 *
 * Exposes agent tools via MCP protocol for AI assistants.
 *
 * Usage:
 *   bun scripts/agent-flow/mcps/agent.mcp.ts
 *   bun scripts/agent-flow/mcps/agent.mcp.ts --transport=http --port=3100
 */

import { z } from "zod";
import { defineTool, createMcpServer } from "../../../packages/flow/src/common/mcp/base-mcp.js";
import { getToc, readChapter, getKnowledgeMap, searchWhiteBook } from "../tools/whitebook.js";
import { listPractices, addPractice, removePractice, updatePractice } from "../tools/practice.js";
import { formatRoadmap, getRoadmapStats } from "../tools/roadmap.js";

// =============================================================================
// White Book Tools
// =============================================================================

export const whitebook_toc = defineTool({
  name: "whitebook_toc",
  description: "获取白皮书目录结构",
  inputSchema: z.object({}),
  outputSchema: z.object({
    formatted: z.string(),
  }),
  handler: async () => {
    const { formatted } = getToc();
    return { formatted };
  },
});

export const whitebook_chapter = defineTool({
  name: "whitebook_chapter",
  description: "读取白皮书章节内容",
  inputSchema: z.object({
    path: z.string().describe("章节路径，如 '00-Manifesto' 或 '03-UI-Ref/01-Foundation/01-Colors.md'"),
  }),
  outputSchema: z.object({
    content: z.string(),
    subFiles: z.array(z.object({
      name: z.string(),
      content: z.string(),
    })).optional(),
  }),
  handler: async ({ path }) => {
    const result = readChapter(path);
    return {
      content: result.content,
      subFiles: result.subFiles,
    };
  },
});

export const whitebook_search = defineTool({
  name: "whitebook_search",
  description: "在白皮书中搜索内容",
  inputSchema: z.object({
    query: z.string().describe("搜索关键词"),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      path: z.string(),
      line: z.number(),
      text: z.string(),
    })),
    count: z.number(),
  }),
  handler: async ({ query }) => {
    const results = searchWhiteBook(query);
    return { results, count: results.length };
  },
});

export const whitebook_knowledge_map = defineTool({
  name: "whitebook_knowledge_map",
  description: "获取知识地图 - 代码和文档的快速导航",
  inputSchema: z.object({}),
  outputSchema: z.object({
    content: z.string(),
  }),
  handler: async () => {
    return { content: getKnowledgeMap() };
  },
});

// =============================================================================
// Practice Tools
// =============================================================================

export const practice_list = defineTool({
  name: "practice_list",
  description: "列出所有最佳实践",
  inputSchema: z.object({}),
  outputSchema: z.object({
    formatted: z.string(),
    count: z.number(),
  }),
  handler: async () => {
    const { practices, formatted } = listPractices();
    return { formatted, count: practices.length };
  },
});

export const practice_add = defineTool({
  name: "practice_add",
  description: "添加新的最佳实践",
  inputSchema: z.object({
    content: z.string().describe("最佳实践内容"),
  }),
  outputSchema: z.object({
    formatted: z.string(),
    count: z.number(),
  }),
  handler: async ({ content }) => {
    const { practices, formatted } = addPractice(content);
    return { formatted, count: practices.length };
  },
});

export const practice_remove = defineTool({
  name: "practice_remove",
  description: "删除最佳实践",
  inputSchema: z.object({
    target: z.string().describe("序号或内容关键词"),
  }),
  outputSchema: z.object({
    formatted: z.string(),
    count: z.number(),
  }),
  handler: async ({ target }) => {
    const { practices, formatted } = removePractice(target);
    return { formatted, count: practices.length };
  },
});

export const practice_update = defineTool({
  name: "practice_update",
  description: "更新最佳实践",
  inputSchema: z.object({
    index: z.number().describe("序号"),
    content: z.string().describe("新内容"),
  }),
  outputSchema: z.object({
    formatted: z.string(),
  }),
  handler: async ({ index, content }) => {
    const { formatted } = updatePractice(index, content);
    return { formatted };
  },
});

// =============================================================================
// Roadmap Tools
// =============================================================================

export const roadmap_list = defineTool({
  name: "roadmap_list",
  description: "获取 Roadmap 任务列表",
  inputSchema: z.object({
    release: z.string().optional().describe("版本号，如 V1, V2"),
  }),
  outputSchema: z.object({
    formatted: z.string(),
  }),
  handler: async ({ release }) => {
    return { formatted: formatRoadmap(release) };
  },
});

export const roadmap_stats = defineTool({
  name: "roadmap_stats",
  description: "获取 Roadmap 统计信息",
  inputSchema: z.object({
    release: z.string().optional().describe("版本号"),
  }),
  outputSchema: z.object({
    total: z.number(),
    done: z.number(),
    inProgress: z.number(),
    todo: z.number(),
    progress: z.number(),
  }),
  handler: async ({ release }) => {
    return getRoadmapStats(release);
  },
});

// =============================================================================
// Server
// =============================================================================

const server = createMcpServer({
  name: "keyapp-agent",
  version: "1.0.0",
  description: "KeyApp AI Agent Tools - 白皮书、最佳实践、Roadmap 管理",
  tools: [
    whitebook_toc,
    whitebook_chapter,
    whitebook_search,
    whitebook_knowledge_map,
    practice_list,
    practice_add,
    practice_remove,
    practice_update,
    roadmap_list,
    roadmap_stats,
  ],
  autoStart: true,
  debug: process.env.DEBUG === "true",
});

export default server;
