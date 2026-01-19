/**
 * @plaoc/is-dweb 兼容层
 * 
 * 在 miniapp 模式下返回 false
 */

/**
 * 判断是否在 dweb 环境
 */
export function isDweb(): boolean {
    return false
}

/**
 * 获取 dweb 大版本
 */
export function dwebTarget(): number {
    return 0
}

/**
 * 判断是否移动端
 */
export function isMobile(): boolean {
    const nav = navigator as Navigator & { userAgentData?: { mobile: boolean } }
    if (typeof navigator !== 'undefined' && nav.userAgentData) {
        return !!nav.userAgentData.mobile
    }
    // 降级到 UA 检测
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
}
