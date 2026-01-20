import type { DevCommand, ProcessState, TabState } from './types';

type StateGetter = (id: string) => ProcessState | undefined;

export class ControlPanel {
  private commands: DevCommand[];
  private getState: StateGetter;

  constructor(commands: DevCommand[], getState: StateGetter) {
    this.commands = commands;
    this.getState = getState;
  }

  render(tabState: TabState): string {
    const lines: string[] = [];
    const width = process.stdout.columns || 80;

    lines.push('\x1b[90m' + '─'.repeat(width) + '\x1b[0m');
    lines.push('\x1b[1m Dev Runner \x1b[0m');
    lines.push('\x1b[90m Option+← / Option+→ 切换Tab │ ↑↓ 选择 │ Enter 启动 │ S 停止 │ R 重启 │ Q 退出\x1b[0m');
    lines.push('\x1b[90m' + '─'.repeat(width) + '\x1b[0m');
    lines.push('');

    this.commands.forEach((cmd, index) => {
      const state = this.getState(cmd.id);
      const isSelected = index === tabState.selectedCommand;
      const prefix = isSelected ? '\x1b[47m\x1b[30m > \x1b[0m' : '   ';

      const statusIcon = this.getStatusIcon(state?.status);
      const pidInfo = state?.pid ? `\x1b[90m${state.pid}:${cmd.name}\x1b[0m` : '\x1b[90m(stopped)\x1b[0m';

      const line = `${prefix}${statusIcon} ${cmd.color}${cmd.name.padEnd(12)}\x1b[0m ${cmd.description.padEnd(25)} ${pidInfo}`;
      lines.push(line);
    });

    lines.push('');
    lines.push('\x1b[90m' + '─'.repeat(width) + '\x1b[0m');

    const tabs = [tabState.activeTab === 0 ? '\x1b[47m\x1b[30m[0] Control\x1b[0m' : '[0] Control'];
    let tabIndex = 1;
    this.commands.forEach((cmd) => {
      const state = this.getState(cmd.id);
      if (state?.status === 'running' && state.pid) {
        const tabLabel = `[${tabIndex}] ${state.pid}:${cmd.name}`;
        tabs.push(tabState.activeTab === tabIndex ? `\x1b[47m\x1b[30m${tabLabel}\x1b[0m` : tabLabel);
        tabIndex++;
      }
    });
    lines.push(tabs.join('  '));

    return lines.join('\n');
  }

  private getStatusIcon(status?: string): string {
    switch (status) {
      case 'running':
        return '\x1b[32m●\x1b[0m';
      case 'starting':
        return '\x1b[33m◐\x1b[0m';
      case 'stopping':
        return '\x1b[31m◐\x1b[0m';
      default:
        return '\x1b[90m○\x1b[0m';
    }
  }

  getRunningCommands(): DevCommand[] {
    return this.commands.filter((cmd) => {
      const state = this.getState(cmd.id);
      return state?.status === 'running';
    });
  }
}
