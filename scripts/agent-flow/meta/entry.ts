#!/usr/bin/env -S deno run -A
/**
 * KeyApp Agent Meta MCP
 *
 * Entry point for both CLI and MCP Server.
 */

import { dirname, join, fromFileUrl } from "jsr:@std/path";
import { exists } from "jsr:@std/fs";
import { buildMetaMcp } from "../../../packages/flow/src/meta/meta.mcp.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const WORKFLOWS_DIR = join(__dirname, "../workflows");

// CLI Mode
if (Deno.args.length > 0) {
  const [workflowName, ...workflowArgs] = Deno.args;
  const workflowPath = join(WORKFLOWS_DIR, `${workflowName}.workflow.ts`);

  if (await exists(workflowPath)) {
    const p = new Deno.Command("deno", {
      args: ["run", "-A", workflowPath, ...workflowArgs],
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      env: Deno.env.toObject(),
    });
    const { code } = await p.output();
    Deno.exit(code);
  } else {
    // If not a workflow, maybe it's a legacy command or help?
    // For now, fail fast
    console.error(`❌ Unknown workflow: "${workflowName}"`);
    Deno.exit(1);
  }
}

// MCP Server Mode
await buildMetaMcp({
  name: "keyapp-agent",
  directories: [WORKFLOWS_DIR],
  autoStart: true,
  autoRefresh: true,
});
