#!/usr/bin/env bun

import { commands } from './dev/commands';
import { ProcessManager } from './dev/process-manager';
import { ControlPanel } from './dev/control-panel';
import type { TabState } from './dev/types';

const processManager = new ProcessManager();
processManager.setCommands(commands);

const tabState: TabState = { activeTab: 0, selectedCommand: 0 };

const controlPanel = new ControlPanel(commands, (id) => processManager.getState(id));

function getRunningCommandAtTabIndex(tabIndex: number) {
  const runningCommands = controlPanel.getRunningCommands();
  return runningCommands[tabIndex - 1];
}

function getMaxTabIndex(): number {
  return controlPanel.getRunningCommands().length;
}

function render() {
  if (tabState.activeTab === 0) {
    console.clear();
    console.log(controlPanel.render(tabState));
  }
}

function renderProcessOutput(commandId: string) {
  const state = processManager.getState(commandId);
  if (state) {
    console.clear();
    console.log(state.buffer.join(''));
  }
}

processManager.onOutput = (commandId, text) => {
  const runningCommands = controlPanel.getRunningCommands();
  const cmdIndex = runningCommands.findIndex((c) => c.id === commandId);
  if (tabState.activeTab === cmdIndex + 1) {
    process.stdout.write(text);
  }
};

async function handleKeypress(key: string): Promise<boolean> {
  if (key === '\x1b[1;3D') {
    tabState.activeTab = Math.max(0, tabState.activeTab - 1);
    if (tabState.activeTab === 0) {
      render();
    } else {
      const cmd = getRunningCommandAtTabIndex(tabState.activeTab);
      if (cmd) renderProcessOutput(cmd.id);
    }
    return true;
  }

  if (key === '\x1b[1;3C') {
    const maxTab = getMaxTabIndex();
    tabState.activeTab = Math.min(maxTab, tabState.activeTab + 1);
    if (tabState.activeTab === 0) {
      render();
    } else {
      const cmd = getRunningCommandAtTabIndex(tabState.activeTab);
      if (cmd) renderProcessOutput(cmd.id);
    }
    return true;
  }

  if (tabState.activeTab === 0) {
    if (key === '\x1b[A') {
      tabState.selectedCommand = Math.max(0, tabState.selectedCommand - 1);
      render();
      return true;
    }

    if (key === '\x1b[B') {
      tabState.selectedCommand = Math.min(commands.length - 1, tabState.selectedCommand + 1);
      render();
      return true;
    }

    if (key === '\r') {
      const cmd = commands[tabState.selectedCommand];
      await processManager.start(cmd);
      render();
      return true;
    }

    if (key === 's' || key === 'S') {
      const cmd = commands[tabState.selectedCommand];
      await processManager.stop(cmd.id);
      render();
      return true;
    }

    if (key === 'r' || key === 'R') {
      const cmd = commands[tabState.selectedCommand];
      await processManager.restart(cmd);
      render();
      return true;
    }

    if (key === 'q' || key === 'Q' || key === '\x03') {
      return false;
    }
  } else {
    if (key === 'q' || key === 'Q') {
      tabState.activeTab = 0;
      render();
      return true;
    }

    if (key === '\x03') {
      return false;
    }
  }

  return true;
}

async function cleanup() {
  console.log('\n\x1b[33mStopping all processes...\x1b[0m');
  await processManager.stopAll();
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
}

async function main() {
  const isHeadless = !process.stdin.isTTY || process.env.CI === 'true';

  console.clear();
  console.log('\x1b[36mStarting Dev Runner...\\x1b[0m\n');

  for (const cmd of commands) {
    if (cmd.autoStart) {
      console.log(`Starting ${cmd.name}...`);
      await processManager.start(cmd);
    }
  }

  if (isHeadless) {
    console.log('\x1b[33mRunning in headless mode (no TTY). Press Ctrl+C to stop.\x1b[0m\n');

    processManager.onOutput = (_commandId, text) => {
      process.stdout.write(text);
    };

    await new Promise<void>((resolve) => {
      process.on('SIGINT', async () => {
        await cleanup();
        resolve();
      });
      process.on('SIGTERM', async () => {
        await cleanup();
        resolve();
      });
    });

    process.exit(0);
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  render();

  process.stdin.on('data', async (data: string) => {
    const shouldContinue = await handleKeypress(data);
    if (!shouldContinue) {
      await cleanup();
      process.exit(0);
    }
  });

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await cleanup();
  process.exit(1);
});
