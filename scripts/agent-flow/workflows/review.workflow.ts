#!/usr/bin/env bun
/**
 * Review Workflow - 质量检查与代码评审
 *
 * 在提交 PR 前进行自动化检查，确保代码符合最佳实践。
 */

import { execSync } from "node:child_process";
import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.js";

// =============================================================================
// Constants
// =============================================================================

const CHECKLISTS = {
  ui: [
    "Components have Storybook stories",
    "Responsive design tested on mobile/desktop",
    "Dark mode support verified",
    "Accessibility (A11y) checks passed",
    "No hardcoded colors (use theme variables)",
  ],
  service: [
    "Schema-first definition (Zod)",
    "Unit tests cover happy/error paths",
    "Error handling follows conventions",
    "No console.log (use logger)",
    "Platform compatibility (Web/DWeb)",
  ],
  page: [
    "Route configuration correct",
    "Deep link handling",
    "Loading/Error states handled",
    "SEO/Metadata (if applicable)",
  ],
  general: [
    "Code passes linting (pnpm lint)",
    "Type checks pass (pnpm typecheck)",
    "No secrets committed",
    "Commit messages follow Conventional Commits",
  ],
};

// =============================================================================
// Helpers
// =============================================================================

function exec(cmd: string): void {
  try {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
  } catch {
    console.error(`❌ Command failed: ${cmd}`);
    // Don't exit immediately to allow running other checks
  }
}

// =============================================================================
// Subflows
// =============================================================================

const checklistWorkflow = defineWorkflow({
  name: "checklist",
  description: "显示代码评审检查清单",
  args: {
    type: {
      type: "string",
      description: "任务类型 (ui|service|page)",
      required: false,
    },
  },
  handler: async (args) => {
    const type = (args.type || "general") as keyof typeof CHECKLISTS;
    console.log(`# Review Checklist [${type}]\n`);

    const items = [...(CHECKLISTS[type] || []), ...CHECKLISTS.general];
    items.forEach((item) => console.log(`- [ ] ${item}`));

    console.log("\n💡 请逐项确认，确保高质量交付。");
  },
});

const verifyWorkflow = defineWorkflow({
  name: "verify",
  description: "运行自动化检查 (Lint + Typecheck + Test)",
  handler: async () => {
    console.log("# 🚀 Starting Verification...\n");

    console.log("## 1. Type Check");
    exec("pnpm typecheck");

    console.log("\n## 2. Lint");
    exec("pnpm lint");

    console.log("\n## 3. Unit Tests");
    // Run tests related to changed files (simplified as all tests for now)
    // In future: use jest --findRelatedTests or similar
    exec("pnpm test run");

    console.log("\n✨ Verification Complete.");
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "review",
  description: "代码评审 - 检查清单与自动化验证",
  version: "1.0.0",
  subflows: [checklistWorkflow, verifyWorkflow],
  examples: [
    ['review checklist --type ui', "UI 检查清单"],
    ['review verify', "运行自动化检查"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

const isMain =
  process.argv[1]?.endsWith("review.workflow.ts") ||
  process.argv[1]?.endsWith("review.workflow.js");

if (isMain) {
  workflow.run();
}
