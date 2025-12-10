/**
 * 剪贴板服务类型定义
 */

export interface IClipboardService {
  /** 写入文本到剪贴板 */
  write(text: string): Promise<void>
  /** 从剪贴板读取文本 */
  read(): Promise<string>
}
