/**
 * @plaoc/plugins 存根
 * 
 * 在 miniapp 模式下提供空实现
 */

// 导出空的 dwebServiceWorker
export const dwebServiceWorker = {
    fetch: () => Promise.reject(new Error('dwebServiceWorker is not available in miniapp mode')),
    has: () => Promise.resolve(false),
    close: () => Promise.resolve(false),
    restart: () => Promise.resolve(false),
    clearCache: () => Promise.resolve(),
}

// 导出空的 windowPlugin
export const windowPlugin = {
    maximize: () => Promise.resolve(new Response()),
    focusWindow: () => Promise.resolve(new Response()),
}

// 导出空的 configPlugin
export const configPlugin = {
    getLang: () => Promise.resolve(navigator.language),
    setLang: () => Promise.resolve(true),
}

// 为了兼容性导出类型
export class WebSocketIpcBuilder {
    constructor(_url: URL, _config: unknown) { }
    get ipc() {
        return {
            request: () => Promise.reject(new Error('WebSocketIpc is not available in miniapp mode')),
        }
    }
}
