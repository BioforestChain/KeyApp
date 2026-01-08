#!/usr/bin/env -S deno run -A
/**
 * Investigate Workflow - 需求调查与方案设计
 *
 * 在正式开发前，帮助 AI 分析需求、阅读相关白皮书、生成 RFC 草稿。
 */

import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.ts";
import { getChapter, getRelatedChapters } from "../mcps/whitebook.mcp.ts";

// =============================================================================
// Subflows
// =============================================================================

const analyzeWorkflow = defineWorkflow({
  name: "analyze",
  description: "分析需求并生成方案草稿",
  args: {
    type: {
      type: "string",
      description: "任务类型 (ui|service|page|hybrid)",
      required: true,
    },
    topic: {
      type: "string",
      description: "主题/需求描述",
      required: true,
    },
  },
  handler: async (args) => {
    const { type, topic } = args;
    console.log(`# 需求分析: ${topic} [${type}]\n`);

    // 1. 获取相关白皮书章节
    console.log("## 1. 相关白皮书\n");
    const chapters = getRelatedChapters(type);
    
    for (const chapterPath of chapters) {
      console.log(`### 📖 ${chapterPath}`);
      try {
        const { content } = getChapter(chapterPath);
        // 提取关键信息 (这里简化为显示前 200 字符，实际可由 LLM 总结)
        console.log(content.slice(0, 200).replace(/\n/g, " ") + "...\n");
      } catch (e) {
        console.log("(无法读取章节内容)\n");
      }
    }

    // 2. 生成 RFC 模板
    console.log("## 2. RFC 草稿模板\n");
    console.log(`
# RFC: ${topic}

## 背景
- 类型: ${type}
- 需求: ...

## 设计方案
...

## 影响范围
...

## 任务拆解
- [ ] ...
`);

    console.log("\n✅ 分析完成。请基于以上信息完善 RFC，然后使用 'task start' 启动任务。");
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "investigate",
  description: "需求调查 - 分析白皮书、生成 RFC",
  version: "1.0.0",
  subflows: [analyzeWorkflow],
  examples: [
    ['investigate analyze --type ui --topic "New Button"', "分析 UI 组件需求"],
    ['investigate analyze --type service --topic "Biometric"', "分析服务需求"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

if (import.meta.main) {
  workflow.run();
}
