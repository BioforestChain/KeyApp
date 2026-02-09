#!/usr/bin/env -S deno run -A --unstable-sloppy-imports
/**
 * Review Workflow - 质量检查与代码评审
 *
 * 在提交 PR 前进行自动化检查，确保代码符合最佳实践。
 */

import {
  createRouter,
  defineWorkflow,
} from "../../../packages/flow/src/common/workflow/base-workflow.ts";

// =============================================================================
// Constants
// =============================================================================

const ACTION_STATUS_GUIDE_PATH = "docs/white-book/09-i18n-Ref/03-Action-Status-Copy.md";

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
    "Action copy is stage-specific (signing/broadcasting/confirming)",
    "UI does not expose raw error.message (must use i18n mapping)",
  ],
};

const WORDING_CHECK_SCOPES = [
  "src/stackflow/activities/sheets/",
  "src/components/transaction/",
  "src/services/ecosystem/handlers/",
];

interface WordingCheckRule {
  id: string;
  pattern: RegExp;
  message: string;
}

interface WordingCheckViolation {
  file: string;
  line: number;
  rule: WordingCheckRule;
  snippet: string;
}

const WORDING_CHECK_RULES: WordingCheckRule[] = [
  {
    id: "ambiguous-confirming-key",
    pattern: /\bt\((['"])confirming\1\)/,
    message:
      "避免使用模糊状态 key `confirming`；请改为阶段化文案（如 transaction:txStatus.broadcasting / confirming）。",
  },
  {
    id: "hardcoded-confirming-copy",
    pattern: /(['"`])(确认中\.{0,3}|Confirming\.{0,3})(['"`])/,
    message: "避免硬编码模糊状态文案；请使用 i18n key 并明确阶段。",
  },
  {
    id: "raw-error-message",
    pattern: /error\s+instanceof\s+Error\s*\?\s*error\.message/,
    message: "禁止 UI 直接透出 error.message；请先做错误映射再展示。",
  },
  {
    id: "hardcoded-broadcast-error",
    pattern: /Failed to broadcast transaction/,
    message: "禁止硬编码英文错误；请映射到 transaction:broadcast.* i18n key。",
  },
  {
    id: "hardcoded-unsupported-pipeline",
    pattern: /does not support transaction pipeline/,
    message: "禁止硬编码 pipeline 错误；请映射到 i18n key。",
  },
];

// =============================================================================
// Helpers
// =============================================================================

interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

function runCommand(
  cmd: string[],
  options?: { inherit?: boolean; silent?: boolean },
): CommandResult {
  const inherit = options?.inherit ?? true;
  try {
    if (!options?.silent) {
      console.log(`> ${cmd.join(" ")}`);
    }

    const p = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      stdout: inherit ? "inherit" : "piped",
      stderr: inherit ? "inherit" : "piped",
    });

    const output = p.outputSync();
    if (inherit) {
      return { code: output.code, stdout: "", stderr: "" };
    }

    const decoder = new TextDecoder();
    return {
      code: output.code,
      stdout: decoder.decode(output.stdout),
      stderr: decoder.decode(output.stderr),
    };
  } catch (e) {
    console.error(`❌ Command failed: ${cmd.join(" ")}`, e);
    return { code: 1, stdout: "", stderr: String(e) };
  }
}

function runCheckStep(stepTitle: string, cmd: string[]): boolean {
  console.log(`\n## ${stepTitle}`);
  const result = runCommand(cmd);
  if (result.code !== 0) {
    console.error(`❌ ${stepTitle} failed.`);
    return false;
  }
  return true;
}

function listChangedFiles(): string[] {
  const unstaged = runCommand(["git", "diff", "--name-only", "--diff-filter=ACMRTUXB", "HEAD"], {
    inherit: false,
    silent: true,
  });
  const staged = runCommand(["git", "diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB"], {
    inherit: false,
    silent: true,
  });
  const untracked = runCommand(["git", "ls-files", "--others", "--exclude-standard"], {
    inherit: false,
    silent: true,
  });

  const lines = [unstaged.stdout, staged.stdout, untracked.stdout]
    .flatMap((text) => text.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return Array.from(new Set(lines));
}

function isWordingCheckTargetFile(filePath: string): boolean {
  if (!(filePath.endsWith(".ts") || filePath.endsWith(".tsx"))) {
    return false;
  }

  if (
    filePath.includes(".test.") ||
    filePath.includes(".spec.") ||
    filePath.includes(".stories.") ||
    filePath.includes("__tests__")
  ) {
    return false;
  }

  return WORDING_CHECK_SCOPES.some((scope) => filePath.startsWith(scope));
}

function collectWordingCheckViolations(files: string[]): WordingCheckViolation[] {
  const violations: WordingCheckViolation[] = [];

  for (const file of files) {
    try {
      const content = Deno.readTextFileSync(file);
      const lines = content.split(/\r?\n/);

      lines.forEach((line, index) => {
        for (const rule of WORDING_CHECK_RULES) {
          if (rule.pattern.test(line)) {
            violations.push({
              file,
              line: index + 1,
              rule,
              snippet: line.trim(),
            });
          }
        }
      });
    } catch (error) {
      console.error(`⚠️  Skip file ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return violations;
}

function runWordingCheck(): boolean {
  console.log("## 0. Action/Status Wording Check");
  console.log(`📖 Required guide: ${ACTION_STATUS_GUIDE_PATH}`);

  const changedFiles = listChangedFiles();
  const targetFiles = changedFiles.filter(isWordingCheckTargetFile);

  if (targetFiles.length === 0) {
    console.log("ℹ️  No wording-check target files changed. Skip semantic checks.");
    return true;
  }

  const violations = collectWordingCheckViolations(targetFiles);
  if (violations.length === 0) {
    console.log(`✅ Wording check passed (${targetFiles.length} files checked).`);
    return true;
  }

  console.error(`❌ Wording check found ${violations.length} issue(s):`);
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} [${violation.rule.id}]`);
    console.error(`  ${violation.rule.message}`);
    console.error(`  code: ${violation.snippet}`);
  }

  console.error("\n💡 请先修复上述问题，再运行 pnpm agent review verify。");
  return false;
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

    console.log(`\n📖 状态文案规范: ${ACTION_STATUS_GUIDE_PATH}`);
    console.log("\n💡 请逐项确认，确保高质量交付。");
  },
});

const wordingCheckWorkflow = defineWorkflow({
  name: "wording-check",
  description: "检查高风险动作文案语义与错误文案映射",
  handler: async () => {
    const ok = runWordingCheck();
    if (!ok) {
      Deno.exit(1);
    }
    console.log("\n✨ Wording check complete.");
  },
});

const verifyWorkflow = defineWorkflow({
  name: "verify",
  description: "运行自动化检查 (Wording Check + Typecheck + Lint + Test)",
  handler: async () => {
    console.log("# 🚀 Starting Verification...\n");

    if (!runWordingCheck()) {
      Deno.exit(1);
    }

    const okType = runCheckStep("1. Type Check", ["pnpm", "typecheck"]);
    const okLint = okType ? runCheckStep("2. Lint", ["pnpm", "lint"]) : false;
    const okTest = okType && okLint ? runCheckStep("3. Unit Tests", ["pnpm", "test:run"]) : false;

    if (!okType || !okLint || !okTest) {
      console.error("\n❌ Verification failed.");
      Deno.exit(1);
    }

    console.log("\n✨ Verification Complete.");
  },
});

// =============================================================================
// Main Router
// =============================================================================

export const workflow = createRouter({
  name: "review",
  description: "代码评审 - 检查清单与自动化验证",
  version: "1.1.0",
  subflows: [checklistWorkflow, wordingCheckWorkflow, verifyWorkflow],
  examples: [
    ["review checklist --type ui", "UI 检查清单"],
    ["review wording-check", "文案语义检查"],
    ["review verify", "运行自动化检查"],
  ],
});

// =============================================================================
// Auto-start
// =============================================================================

if (import.meta.main) {
  workflow.run();
}
