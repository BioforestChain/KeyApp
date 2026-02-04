#!/usr/bin/env -S deno run -A
/**
 * Release Workflow - 自动化版本发布
 *
 * ## 使用示例
 *
 * ```bash
 * pnpm agent release --bump=patch    # 0.7.5 -> 0.7.6
 * pnpm agent release --bump=minor    # 0.7.5 -> 0.8.0
 * pnpm agent release --bump=major    # 0.7.5 -> 1.0.0
 * pnpm agent release --bump=0.8.0    # 指定版本号
 * ```
 */

import { defineWorkflow } from "../../../packages/flow/src/common/workflow/base-workflow.ts";

// =============================================================================
// Types
// =============================================================================

type VersionBump = "patch" | "minor" | "major";

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

interface ManifestJson {
  version: string;
  change_log?: string;
  [key: string]: unknown;
}

// =============================================================================
// Helpers
// =============================================================================

function parseVersion(version: string): [number, number, number] | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

function bumpVersion(current: string, bump: VersionBump): string {
  const parsed = parseVersion(current);
  if (!parsed) throw new Error(`Invalid version: ${current}`);

  const [major, minor, patch] = parsed;
  switch (bump) {
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "major":
      return `${major + 1}.0.0`;
  }
}

function isVersionBump(value: string): value is VersionBump {
  return ["patch", "minor", "major"].includes(value);
}

async function readJson<T>(path: string): Promise<T> {
  const content = await Deno.readTextFile(path);
  return JSON.parse(content) as T;
}

async function writeJson(path: string, data: unknown): Promise<void> {
  const content = JSON.stringify(data, null, 2) + "\n";
  await Deno.writeTextFile(path, content);
}

async function exec(
  cmd: string[],
  options?: { cwd?: string; silent?: boolean }
): Promise<{ code: number; stdout: string; stderr: string }> {
  const p = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd: options?.cwd,
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await p.output();
  const stdoutStr = new TextDecoder().decode(stdout);
  const stderrStr = new TextDecoder().decode(stderr);

  if (!options?.silent && code !== 0) {
    console.error(`Command failed: ${cmd.join(" ")}`);
    if (stderrStr) console.error(stderrStr);
  }

  return { code, stdout: stdoutStr, stderr: stderrStr };
}

async function getRecentCommits(since: string): Promise<string[]> {
  const { code, stdout } = await exec(
    ["git", "log", `${since}..HEAD`, "--oneline", "--no-merges"],
    { silent: true }
  );
  if (code !== 0) return [];
  return stdout
    .trim()
    .split("\n")
    .filter((line) => line.length > 0);
}

async function ensureCleanWorkspace(): Promise<boolean> {
  const { stdout } = await exec(["git", "status", "--porcelain"], { silent: true });
  return stdout.trim().length === 0;
}

async function ensureOnMain(): Promise<boolean> {
  const { stdout } = await exec(["git", "branch", "--show-current"], { silent: true });
  return stdout.trim() === "main";
}

async function syncWithOrigin(): Promise<void> {
  await exec(["git", "fetch", "origin"]);
  await exec(["git", "reset", "--hard", "origin/main"]);
}

// =============================================================================
// Main Workflow
// =============================================================================

export const workflow = defineWorkflow({
  name: "release",
  description: `发布新版本

使用方式:
  pnpm agent release --bump=patch    # Patch 版本 (bug 修复)
  pnpm agent release --bump=minor    # Minor 版本 (新功能)
  pnpm agent release --bump=major    # Major 版本 (重大变更)
  pnpm agent release --bump=1.0.0    # 指定版本号
  pnpm agent release --bump=patch --dry-run     # 预览
  pnpm agent release --bump=patch --skip-checks # 跳过检查`,
  version: "1.0.0",
  args: {
    bump: {
      type: "string",
      alias: "b",
      description: "版本号或升级类型 (patch|minor|major|x.y.z)",
      required: true,
    },
    "skip-checks": {
      type: "boolean",
      description: "跳过 typecheck 和 test",
      default: false,
    },
    "dry-run": {
      type: "boolean",
      description: "仅显示将要执行的操作，不实际执行",
      default: false,
    },
  },
  handler: async (args) => {
    const versionArg = args.bump as string;
    const skipChecks = args["skip-checks"] as boolean;
    const dryRun = args["dry-run"] as boolean;

    console.log("🚀 开始发布流程...\n");

    // 1. 检查工作区状态
    console.log("1️⃣  检查工作区状态...");

    if (!(await ensureOnMain())) {
      console.error("❌ 错误: 必须在 main 分支上执行发布");
      Deno.exit(1);
    }
    console.log("   ✅ 当前在 main 分支");

    if (!(await ensureCleanWorkspace())) {
      console.error("❌ 错误: 工作区有未提交的更改");
      Deno.exit(1);
    }
    console.log("   ✅ 工作区干净");

    // 2. 同步远程
    console.log("\n2️⃣  同步远程仓库...");
    if (!dryRun) {
      await syncWithOrigin();
    }
    console.log("   ✅ 已同步 origin/main");

    // 3. 读取当前版本
    console.log("\n3️⃣  读取版本信息...");
    const packageJson = await readJson<PackageJson>("package.json");
    const currentVersion = packageJson.version;
    console.log(`   当前版本: ${currentVersion}`);

    // 4. 计算新版本
    let newVersion: string;
    if (isVersionBump(versionArg)) {
      newVersion = bumpVersion(currentVersion, versionArg);
    } else if (parseVersion(versionArg)) {
      newVersion = versionArg;
    } else {
      console.error(`❌ 错误: 无效的版本参数 "${versionArg}"`);
      console.error("   支持: patch, minor, major, 或具体版本号 (如 1.0.0)");
      Deno.exit(1);
    }
    console.log(`   新版本: ${newVersion}`);

    // 5. 获取变更日志
    console.log("\n4️⃣  获取变更记录...");
    const commits = await getRecentCommits(`v${currentVersion}`);
    if (commits.length === 0) {
      console.log("   ⚠️  没有新的提交");
    } else {
      console.log(`   找到 ${commits.length} 个新提交:`);
      commits.slice(0, 5).forEach((c) => console.log(`   - ${c}`));
      if (commits.length > 5) {
        console.log(`   ... 还有 ${commits.length - 5} 个提交`);
      }
    }

    // 6. 运行检查
    if (!skipChecks) {
      console.log("\n5️⃣  运行质量检查...");
      if (!dryRun) {
        const { code } = await exec(["pnpm", "agent", "review", "verify"]);
        if (code !== 0) {
          console.error("❌ 质量检查失败，请修复后重试");
          Deno.exit(1);
        }
      } else {
        console.log("   [dry-run] 跳过检查");
      }
      console.log("   ✅ 检查通过");
    } else {
      console.log("\n5️⃣  跳过质量检查 (--skip-checks)");
    }

    // 7. 更新版本文件
    console.log("\n6️⃣  更新版本文件...");

    const changeLog = commits
      .slice(0, 10)
      .map((c) => c.replace(/^[a-f0-9]+ /, ""))
      .join("; ");

    if (!dryRun) {
      // 更新 package.json
      packageJson.version = newVersion;
      await writeJson("package.json", packageJson);
      console.log("   ✅ 更新 package.json");

      // 更新 manifest.json
      try {
        const manifestJson = await readJson<ManifestJson>("manifest.json");
        manifestJson.version = newVersion;
        manifestJson.change_log = changeLog || `Release v${newVersion}`;
        await writeJson("manifest.json", manifestJson);
        console.log("   ✅ 更新 manifest.json");
      } catch {
        console.log("   ⚠️  manifest.json 不存在，跳过");
      }
    } else {
      console.log("   [dry-run] 将更新 package.json 和 manifest.json");
    }

    // 8. 创建 release 分支
    const branchName = `release/v${newVersion}`;
    console.log(`\n7️⃣  创建发布分支: ${branchName}...`);

    if (!dryRun) {
      await exec(["git", "checkout", "-b", branchName]);
      await exec(["git", "add", "package.json", "manifest.json"]);

      const commitMessage = `release: v${newVersion}\n\n## Changes\n${commits.map((c) => `- ${c}`).join("\n")}\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;
      await exec(["git", "commit", "-m", commitMessage]);
      console.log("   ✅ 提交版本更新");

      // 推送分支
      const { code: pushCode } = await exec(["git", "push", "-u", "origin", branchName]);
      if (pushCode !== 0) {
        console.error("❌ 推送失败，请检查网络后重试");
        Deno.exit(1);
      }
      console.log("   ✅ 推送到远程");
    } else {
      console.log("   [dry-run] 将创建并推送分支");
    }

    // 9. 创建 PR
    console.log("\n8️⃣  创建 Pull Request...");

    const prBody = `## v${newVersion}

### Changes
${commits.map((c) => `- ${c}`).join("\n") || "- Release v" + newVersion}

### Checklist
- [x] Version bumped in package.json
- [x] Version bumped in manifest.json
- [ ] CI passed
- [ ] Ready to merge and tag`;

    if (!dryRun) {
      const { code: prCode, stdout: prUrl } = await exec([
        "gh",
        "pr",
        "create",
        "--title",
        `release: v${newVersion}`,
        "--body",
        prBody,
        "--base",
        "main",
      ]);

      if (prCode !== 0) {
        console.error("❌ 创建 PR 失败");
        Deno.exit(1);
      }
      console.log(`   ✅ PR 已创建: ${prUrl.trim()}`);
    } else {
      console.log("   [dry-run] 将创建 PR");
    }

    // 10. 完成提示
    console.log("\n" + "=".repeat(50));
    console.log("✨ 发布准备完成！\n");
    console.log("📋 后续步骤:");
    console.log("   1. 等待 CI 通过");
    console.log("   2. 合并 PR: gh pr merge --squash --delete-branch");
    console.log(`   3. 创建 Tag: git tag v${newVersion} && git push origin v${newVersion}`);
    console.log("   4. CD 将自动触发，创建 GitHub Release");

    if (!dryRun) {
      // 切回 main
      await exec(["git", "checkout", "main"]);
    }
  },
});

// =============================================================================
// Auto-start
// =============================================================================

if (import.meta.main) {
  workflow.run();
}
