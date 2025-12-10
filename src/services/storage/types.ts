/**
 * 安全存储服务类型定义
 */

export interface ISecureStorageService {
  /** 存储数据 */
  set(key: string, value: string): Promise<void>
  /** 获取数据 */
  get(key: string): Promise<string | null>
  /** 删除数据 */
  remove(key: string): Promise<void>
  /** 检查是否存在 */
  has(key: string): Promise<boolean>
  /** 清空所有数据 */
  clear(): Promise<void>
}
