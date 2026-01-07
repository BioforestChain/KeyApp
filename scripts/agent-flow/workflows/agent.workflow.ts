#!/usr/bin/env bun
/**
 * Agent CLI Workflow
 *
 * 组合 MCP tools 成 CLI 工作流，通过 tool.call() 调用
 *
 * Usage:
 *   pnpm agent:flow readme
 *   pnpm agent:flow toc
 *   pnpm agent:flow chapter <path>
 *   pnpm agent:flow search <query>
 *   pnpm agent:flow practice list
 *   pnpm agent:flow roadmap [release]
 */

import { defineWorkflow, createRouter } from "../../../packages/flow/src/common/workflow/base-workflow.js";
import { whitebook, practice, roadmap } from "../meta/index.js";

// =============================================================================
// Readme Workflow
// =============================================================================

const readmeWorkflow = defineWorkflow({
  name: "readme",
  description: "输出索引（最佳实践 + 知识地图 + 当前任务）",
  handler: async () => {
    console.log("# KeyApp AI 开发索引\n");

    // Call MCP tools
    const [practiceResult, mapResult, currentResult] = await Promise.all([
      practice.list.call({}),
      whitebook.knowledgeMap.call({}),
      roadmap.current.call({}),
    ]);

    console.log(practiceResult.formatted);
    console.log("\n详见: pnpm agent:flow chapter 00-Manifesto\n");
    console.log(mapResult.content);

    if (currentResult.formatted) {
      console.log("\n" + currentResult.formatted);
    }

    console.log(`
# 工作流

pnpm agent:flow readme             启动入口
pnpm agent:flow toc                白皮书目录
pnpm agent:flow chapter <path>     查阅章节
pnpm agent:flow search <query>     搜索白皮书
pnpm agent:flow practice list      最佳实践
pnpm agent:flow roadmap [release]  查看 Roadmap
pnpm agent:flow stats [release]    进度统计

MCP 模式:
pnpm agent:mcp                     启动 MCP 服务器
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
    const result = await whitebook.toc.call({});
    console.log(result.formatted);
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
    const chapterPath = args.path || args._[0];
    if (!chapterPath) {
      console.error("错误: 请指定章节路径");
      console.error("用法: pnpm agent:flow chapter <path>");
      process.exit(1);
    }

    try {
      const result = await whitebook.chapter.call({ path: chapterPath });
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
      process.exit(1);
    }

    const result = await whitebook.search.call({ query });
    console.log(`# 搜索: "${query}" (${result.count} 条结果)\n`);

    for (const r of result.results) {
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
    const result = await practice.list.call({});
    console.log(result.formatted);
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
      process.exit(1);
    }
    const result = await practice.add.call({ content });
    console.log("已添加\n");
    console.log(result.formatted);
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
      process.exit(1);
    }
    const result = await practice.remove.call({ target });
    console.log("已删除\n");
    console.log(result.formatted);
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
      process.exit(1);
    }
    const result = await practice.update.call({ index, content });
    console.log("已更新\n");
    console.log(result.formatted);
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
    const release = args.release || args._[0];
    const result = await roadmap.list.call({ release });
    console.log(result.formatted);
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
    const release = args.release || args._[0];
    const result = await roadmap.stats.call({ release });
    console.log(`# 进度统计${release ? ` (${release})` : ""}\n`);
    console.log(`总任务: ${result.total}`);
    console.log(`已完成: ${result.done}`);
    console.log(`进行中: ${result.inProgress}`);
    console.log(`待处理: ${result.todo}`);
    console.log(`完成率: ${result.progress}%`);
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "agent",
  description: "KeyApp AI Agent CLI",
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

// Auto-start
workflow.run();
