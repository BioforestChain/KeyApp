/**
 * Dev Runner 类型定义
 */

export interface DevCommand {
  id: string;
  name: string;
  description: string;
  cmd: string[];
  cwd?: string;
  env?: Record<string, string>;
  color: string;
  /** 是否默认启动 */
  autoStart?: boolean;
  /** 关联的端口号（用于彻底释放） */
  port?: number;
  /** 启动前需要先运行的命令 */
  preStart?: () => Promise<void>;
}

export interface ProcessState {
  id: string;
  pid: number | null;
  status: 'stopped' | 'starting' | 'running' | 'stopping';
  subprocess: Bun.Subprocess | null;
  buffer: string[]; // 保留最近的输出用于 Tab 切换时显示
  startedAt: number | null;
}

export interface TabState {
  activeTab: number; // 0 = control panel, 1+ = process tabs
  selectedCommand: number; // 控制面板中选中的命令索引
}

export interface TerminalSize {
  cols: number;
  rows: number;
}
