/**
 * 空操作函数
 * 
 * 这些函数在 dweb 环境中有实际功能，但在 miniapp 中不需要
 */

import type { DwebAppConfig } from './types'

/**
 * 检查应用是否可打开
 * 
 * 在 miniapp 模式下总是返回 true，因为钱包功能由宿主提供
 */
export function canOpenUrl(_mmid: `${string}.dweb`): Promise<{ success: boolean }> {
    return Promise.resolve({ success: true })
}

/**
 * 聚焦窗口
 * 
 * 在 miniapp 模式下不需要此操作
 */
export function focusWindow(): Promise<Response> {
    return Promise.resolve(new Response())
}

/**
 * 窗口最大化
 * 
 * 在 miniapp 模式下不需要此操作
 */
export function appMaximize(): Promise<Response> {
    return Promise.resolve(new Response())
}

/**
 * 版本更新
 * 
 * 在 miniapp 模式下不支持
 */
export function appVersionUpdate(_metadataUrl: string): Window | null {
    console.warn('[dweb-compat] appVersionUpdate is not supported in miniapp mode')
    return null
}

/**
 * 打开浏览器
 * 
 * 在 miniapp 模式下使用 window.open
 */
export function browserOpen(url: string, target?: string): Promise<Window | null> {
    return Promise.resolve(window.open(url, target || '_blank'))
}

/**
 * 重启应用
 * 
 * 在 miniapp 模式下刷新页面
 */
export function restart(): Promise<boolean> {
    window.location.reload()
    return Promise.resolve(true)
}

/**
 * 获取 Dweb App 下载地址
 * 
 * 在 miniapp 模式下不需要下载钱包
 */
export function getDwebAppDownUrl(_info: {
    marketUrl: string
    name: string
    applistJson: string
}): Promise<{ downloadUrl?: string; marketUrl?: string }> {
    return Promise.resolve({})
}

/**
 * 跳转到应用商城下载
 * 
 * 在 miniapp 模式下不需要
 */
export function gotoDwebAppMarketDownLoad(_info: {
    downloadUrl?: string
    marketUrl?: string
}): Promise<Window | null> {
    console.warn('[dweb-compat] gotoDwebAppMarketDownLoad is not supported in miniapp mode')
    return Promise.resolve(null)
}

/**
 * 矫正语言
 */
export function CorrecDwebAppLang(lang?: string): Promise<string> {
    return Promise.resolve(lang || navigator.language)
}

/**
 * 监听硬件返回按钮
 * 
 * 在 miniapp 模式下使用浏览器历史 API
 */
export function listenerBackButton(callback: () => void): void {
    window.addEventListener('popstate', callback)
}

/**
 * DwebApp 配置
 * 
 * 在 miniapp 模式下返回空配置
 */
export const dwebAppConfig = {
    XPay(_alpha = false): DwebAppConfig {
        return {
            mmid: 'pay.nikola-x.com.dweb',
            name: 'X Pay',
            marketUrl: '',
            applistJson: '',
        }
    },
    BIWMeta(_alpha = false): DwebAppConfig {
        return {
            mmid: 'biw-meta.com.dweb',
            name: 'BIWMeta',
            marketUrl: '',
            applistJson: '',
        }
    },
    BFMPay(_alpha = false): DwebAppConfig {
        return {
            mmid: 'pay.bfmeta.info.dweb',
            name: 'BFM Pay',
            marketUrl: '',
            applistJson: '',
        }
    },
    NiLai(_alpha = false): DwebAppConfig {
        return {
            mmid: 'www.ni-lai.com.dweb',
            name: 'NiLai',
            marketUrl: '',
            applistJson: '',
        }
    },
}
