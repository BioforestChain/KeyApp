/**
 * Tauri Plugin Opener Stub
 * 
 * 在 miniapp 模式下替代 @tauri-apps/plugin-opener
 */

/**
 * 在浏览器中打开 URL
 */
export async function openUrl(url: string): Promise<void> {
    window.open(url, '_blank')
}
