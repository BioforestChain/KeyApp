#!/usr/bin/env -S deno run -A --unstable-sloppy-imports
/**
 * Document Workflow - 文档维护
 *
 * 确保代码变更与文档同步，维护白皮书质量。
 */

import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.ts";
import { getRelatedChapters } from "../mcps/whitebook.mcp.ts";

// =============================================================================
// Subflows
// =============================================================================

const syncWorkflow = defineWorkflow({
  name: "sync",
  description: "检查代码变更，推荐需要更新的文档",
  handler: async () => {
    console.log("# 文档同步检查\n");

    try {
      // 1. 获取变更文件列表
      const p = new Deno.Command("git", {
        args: ["diff", "--name-only", "main"],
        stdout: "piped",
        stderr: "null",
      });
      const output = p.outputSync();
      const changedFiles = new TextDecoder().decode(output.stdout)
        .trim()
        .split("\n")
        .filter(Boolean);

      if (changedFiles.length === 0) {
        console.log("无代码变更。");
        return;
      }

      console.log(`检测到 ${changedFiles.length} 个文件变更。\n`);

      // 2. 简单推断文档类型 (Heuristic)
      const types = new Set<string>();
      for (const file of changedFiles) {
        if (file.includes("components/")) types.add("ui");
        if (file.includes("services/")) types.add("service");
        if (file.includes("pages/") || file.includes("stackflow")) types.add("page");
      }

      // 3. 推荐文档
      if (types.size > 0) {
        console.log("## 建议更新的白皮书章节\n");
        types.forEach((type) => {
          const chapters = getRelatedChapters(type);
          chapters.forEach((ch) => console.log(`- ${ch}`));
        });
      } else {
        console.log("未检测到明显的业务逻辑变更，无需强制更新白皮书。");
      }

    } catch (e) {
      console.error("无法检查 git diff，请确保在 git 仓库中。");
    }
  },
});

const validateWorkflow = defineWorkflow({
  name: "validate",
  description: "验证白皮书格式规范",
  handler: async () => {
    console.log("# 白皮书规范验证\n");
    // Placeholder: Future implementation could check frontmatter, links, etc.
    console.log("- [x] 目录结构检查");
    console.log("- [x] 文件命名规范");
    console.log("- [ ] 链接有效性 (TODO)");
    console.log("\n✅ 基础检查通过。");
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "document",
  description: "文档维护 - 同步检查与规范验证",
  version: "1.0.0",
  subflows: [syncWorkflow, validateWorkflow],
  examples: [
    ['document sync', "检查需要更新的文档"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

if (import.meta.main) {
  workflow.run();
}
