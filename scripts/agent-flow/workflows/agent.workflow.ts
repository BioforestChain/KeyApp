#!/usr/bin/env bun
/**
 * Agent CLI Workflow
 *
 * Usage:
 *   pnpm agent readme              # 输出索引
 *   pnpm agent toc                 # 白皮书目录
 *   pnpm agent chapter <path>      # 读取章节
 *   pnpm agent search <query>      # 搜索白皮书
 *   pnpm agent practice list       # 最佳实践列表
 *   pnpm agent roadmap [release]   # Roadmap
 */

import { defineWorkflow, createRouter } from "../../../packages/flow/src/common/workflow/base-workflow.js";
import { getToc, readChapter, getKnowledgeMap, searchWhiteBook } from "../tools/whitebook.js";
import { listPractices, addPractice, removePractice, updatePractice, getPracticesContent } from "../tools/practice.js";
import { formatRoadmap, getCurrentTasks, getRoadmapStats } from "../tools/roadmap.js";

// =============================================================================
// Readme Workflow
// =============================================================================

const readmeWorkflow = defineWorkflow({
  name: "readme",
  description: "输出索引（最佳实践 + 知识地图 + 当前任务）",
  handler: async () => {
    console.log("# KeyApp AI 开发索引\n");

    // Best practices
    console.log(getPracticesContent());
    console.log("\n详见: pnpm agent chapter 00-Manifesto\n");

    // Knowledge map
    console.log(getKnowledgeMap());

    // Current tasks
    const tasks = getCurrentTasks();
    if (tasks) {
      console.log(tasks);
    }

    // Workflow help
    console.log(`
# 工作流

pnpm agent readme             启动入口（索引 + 知识地图 + 最佳实践）
pnpm agent toc                白皮书目录
pnpm agent chapter <path>     查阅白皮书章节
pnpm agent search <query>     搜索白皮书
pnpm agent practice list      最佳实践列表
pnpm agent roadmap [release]  查看 Roadmap
pnpm agent stats [release]    进度统计

MCP 模式:
pnpm agent:mcp                启动 MCP 服务器 (供 AI 调用)
`);
  },
});

// =============================================================================
// TOC Workflow
// =============================================================================

const tocWorkflow = defineWorkflow({
  name: "toc",
  description: "白皮书目录结构",
  handler: async () => {
    const { formatted } = getToc();
    console.log(formatted);
  },
});

// =============================================================================
// Chapter Workflow
// =============================================================================

const chapterWorkflow = defineWorkflow({
  name: "chapter",
  description: "查阅白皮书章节",
  args: {
    path: { type: "string", alias: "p", description: "章节路径", required: false },
  },
  handler: async (args) => {
    // Support positional argument: pnpm agent:flow chapter 00-Manifesto
    const chapterPath = args.path || args._[0];
    if (!chapterPath) {
      console.error("错误: 请指定章节路径");
      console.error("用法: pnpm agent:flow chapter <path>");
      console.error("示例: pnpm agent:flow chapter 00-Manifesto");
      process.exit(1);
    }

    try {
      const result = readChapter(chapterPath);
      console.log(`# 章节: ${chapterPath}\n`);
      console.log(result.content);

      if (result.subFiles && result.subFiles.length > 0) {
        for (const sub of result.subFiles) {
          console.log(`\n## ${sub.name}\n`);
          console.log(sub.content);
        }
      }
    } catch (error) {
      console.error(`错误: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  },
});

// =============================================================================
// Search Workflow
// =============================================================================

const searchWorkflow = defineWorkflow({
  name: "search",
  description: "搜索白皮书",
  args: {
    query: { type: "string", alias: "q", description: "搜索关键词", required: false },
  },
  handler: async (args) => {
    const query = args.query || args._[0];
    if (!query) {
      console.error("错误: 请指定搜索关键词");
      console.error("用法: pnpm agent:flow search <query>");
      process.exit(1);
    }

    const results = searchWhiteBook(query);
    console.log(`# 搜索: "${query}" (${results.length} 条结果)\n`);

    for (const r of results) {
      console.log(`${r.path}:${r.line}`);
      console.log(`  ${r.text}`);
    }
  },
});

// =============================================================================
// Practice Workflows
// =============================================================================

const practiceListWorkflow = defineWorkflow({
  name: "list",
  description: "列出最佳实践",
  handler: async () => {
    const { formatted } = listPractices();
    console.log(formatted);
  },
});

const practiceAddWorkflow = defineWorkflow({
  name: "add",
  description: "添加最佳实践",
  args: {
    content: { type: "string", alias: "c", description: "内容", required: false },
  },
  handler: async (args) => {
    const content = args.content || args._.join(" ");
    if (!content) {
      console.error("错误: 请指定内容");
      console.error("用法: pnpm agent:flow practice add <content>");
      process.exit(1);
    }
    const { formatted } = addPractice(content);
    console.log("已添加\n");
    console.log(formatted);
  },
});

const practiceRemoveWorkflow = defineWorkflow({
  name: "remove",
  description: "删除最佳实践",
  args: {
    target: { type: "string", alias: "t", description: "序号或关键词", required: false },
  },
  handler: async (args) => {
    const target = args.target || args._[0];
    if (!target) {
      console.error("错误: 请指定序号或关键词");
      console.error("用法: pnpm agent:flow practice remove <index|keyword>");
      process.exit(1);
    }
    const { formatted } = removePractice(target);
    console.log("已删除\n");
    console.log(formatted);
  },
});

const practiceUpdateWorkflow = defineWorkflow({
  name: "update",
  description: "更新最佳实践",
  args: {
    index: { type: "number", alias: "i", description: "序号", required: false },
    content: { type: "string", alias: "c", description: "新内容", required: false },
  },
  handler: async (args) => {
    const index = args.index || parseInt(args._[0], 10);
    const content = args.content || args._.slice(1).join(" ");
    if (!index || !content) {
      console.error("错误: 请指定序号和内容");
      console.error("用法: pnpm agent:flow practice update <index> <content>");
      process.exit(1);
    }
    const { formatted } = updatePractice(index, content);
    console.log("已更新\n");
    console.log(formatted);
  },
});

const practiceWorkflow = createRouter({
  name: "practice",
  description: "最佳实践管理",
  subflows: [practiceListWorkflow, practiceAddWorkflow, practiceRemoveWorkflow, practiceUpdateWorkflow],
});

// =============================================================================
// Roadmap Workflow
// =============================================================================

const roadmapWorkflow = defineWorkflow({
  name: "roadmap",
  description: "查看 Roadmap",
  args: {
    release: { type: "string", description: "版本号 (V1/V2)", required: false },
  },
  handler: async (args) => {
    console.log(formatRoadmap(args.release));
  },
});

// =============================================================================
// Stats Workflow
// =============================================================================

const statsWorkflow = defineWorkflow({
  name: "stats",
  description: "进度统计",
  args: {
    release: { type: "string", description: "版本号", required: false },
  },
  handler: async (args) => {
    const stats = getRoadmapStats(args.release);
    console.log(`# 进度统计${args.release ? ` (${args.release})` : ""}\n`);
    console.log(`总任务: ${stats.total}`);
    console.log(`已完成: ${stats.done}`);
    console.log(`进行中: ${stats.inProgress}`);
    console.log(`待处理: ${stats.todo}`);
    console.log(`完成率: ${stats.progress}%`);
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "agent",
  description: "KeyApp AI Agent CLI - 白皮书、最佳实践、Roadmap 管理",
  version: "2.0.0",
  subflows: [
    readmeWorkflow,
    tocWorkflow,
    chapterWorkflow,
    searchWorkflow,
    practiceWorkflow,
    roadmapWorkflow,
    statsWorkflow,
  ],
});

// Auto-start when run directly
workflow.run();
