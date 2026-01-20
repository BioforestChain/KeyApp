/**
 * PostMessage Bridge - 与 KeyApp Bio Provider 通信
 */

let requestId = 0

export interface BioResponse<T = unknown> {
    success: boolean
    result?: T
    error?: { code: number; message: string }
}

/**
 * 发送 bio_request 到 KeyApp 宿主
 */
export function bioRequest<T>(method: string, params?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
        const id = `dweb_compat_${++requestId}_${Date.now()}`

        const handler = (event: MessageEvent) => {
            const data = event.data
            if (data?.type === 'bio_response' && data.id === id) {
                window.removeEventListener('message', handler)
                if (data.success) {
                    resolve(data.result as T)
                } else {
                    const error = new Error(data.error?.message || 'Unknown error')
                        ; (error as Error & { code?: number }).code = data.error?.code
                    reject(error)
                }
            }
        }

        window.addEventListener('message', handler)

        // 发送请求到父窗口 (KeyApp)
        const message = {
            type: 'bio_request',
            id,
            method,
            params: params !== undefined ? [params] : [],
        }

        // 优先发送到 parent (iframe 模式)，否则通过 self (web worker 或独立模式)
        const target = window.parent !== window ? window.parent : window
        target.postMessage(message, '*')

        // 超时处理 (60 秒)
        setTimeout(() => {
            window.removeEventListener('message', handler)
            reject(new Error(`Request timeout: ${method}`))
        }, 60000)
    })
}

/**
 * 监听来自 KeyApp 的事件
 */
export function onBioEvent(event: string, callback: (...args: unknown[]) => void): () => void {
    const handler = (e: MessageEvent) => {
        if (e.data?.type === 'bio_event' && e.data.event === event) {
            callback(...(e.data.args || []))
        }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
}
