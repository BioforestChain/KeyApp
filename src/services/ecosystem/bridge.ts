/**
 * PostMessage Bridge for miniapp communication
 */

import type {
  BioRequestMessage,
  BioResponseMessage,
  BioEventMessage,
  MethodHandler,
  HandlerContext,
} from './types'
import { miniappRuntimeStore } from '../miniapp-runtime'

/** EVM request message from miniapp */
interface EthRequestMessage {
  type: 'eth_request'
  id: string
  method: string
  params?: unknown[]
}

/** EVM response message to miniapp */
interface EthResponseMessage {
  type: 'eth_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** EVM event message to miniapp */
interface EthEventMessage {
  type: 'eth_event'
  event: string
  args: unknown[]
}

/** TRON request message from miniapp */
interface TronRequestMessage {
  type: 'tron_request'
  id: string
  method: string
  params?: unknown[]
}

/** TRON response message to miniapp */
interface TronResponseMessage {
  type: 'tron_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** TRON event message to miniapp */
interface TronEventMessage {
  type: 'tron_event'
  event: string
  args: unknown[]
}

/** All supported request types */
type RequestMessage = BioRequestMessage | EthRequestMessage | TronRequestMessage

/** Protocol type */
type Protocol = 'bio' | 'eth' | 'tron'
import {
  BioErrorCodes,
  createErrorResponse,
} from './types'
import {
  hasPermission,
  isSensitiveMethod,
  grantPermissions as storeGrantPermissions,
} from './permissions'

/** 权限请求回调类型 */
export type PermissionRequestCallback = (
  appId: string,
  appName: string,
  permissions: string[]
) => Promise<boolean>

export class PostMessageBridge {
  private handlers = new Map<string, MethodHandler>()
  private iframe: HTMLIFrameElement | null = null
  private appId: string = ''
  private appName: string = ''
  private origin: string = '*'
  private manifestPermissions: string[] = []  // manifest 声明的权限
  private messageHandler: ((event: MessageEvent) => void) | null = null
  private permissionRequestCallback: PermissionRequestCallback | null = null

  /** Register a method handler */
  registerHandler(method: string, handler: MethodHandler): void {
    this.handlers.set(method, handler)
  }

  /** Set permission request callback */
  setPermissionRequestCallback(callback: PermissionRequestCallback | null): void {
    this.permissionRequestCallback = callback
  }

  /** Attach to an iframe */
  attach(
    iframe: HTMLIFrameElement,
    appId: string,
    appName: string,
    manifestPermissions: string[] = []
  ): void {
    this.detach()

    this.iframe = iframe
    this.appId = appId
    this.appName = appName
    this.manifestPermissions = manifestPermissions

    // Get origin from iframe src
    try {
      const url = new URL(iframe.src, window.location.origin)
      this.origin = url.origin
    } catch {
      this.origin = '*'
    }

    this.messageHandler = this.handleMessage.bind(this)
    window.addEventListener('message', this.messageHandler)

    
  }

  /** Detach from iframe */
  detach(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler)
      this.messageHandler = null
    }
    this.iframe = null
    this.appId = ''
    this.appName = ''
    this.manifestPermissions = []
  }

  /** Send event to miniapp (Bio protocol) */
  emit(event: string, ...args: unknown[]): void {
    this.emitTo('bio', event, ...args)
  }

  /** Send event to miniapp (EVM protocol) */
  emitEth(event: string, ...args: unknown[]): void {
    this.emitTo('eth', event, ...args)
  }

  /** Send event to miniapp (TRON protocol) */
  emitTron(event: string, ...args: unknown[]): void {
    this.emitTo('tron', event, ...args)
  }

  /** Send event to specific protocol */
  private emitTo(protocol: Protocol, event: string, ...args: unknown[]): void {
    if (!this.iframe?.contentWindow) return

    const message: BioEventMessage | EthEventMessage | TronEventMessage = {
      type: `${protocol}_event` as 'bio_event' | 'eth_event' | 'tron_event',
      event,
      args,
    }

    this.iframe.contentWindow.postMessage(message, this.origin)
  }

  private handleMessage(event: MessageEvent): void {
    // Validate origin
    if (this.origin !== '*' && event.origin !== this.origin) {
      return
    }

    // Validate source
    if (event.source !== this.iframe?.contentWindow) {
      return
    }

    const data = event.data as RequestMessage
    if (!data || typeof data !== 'object' || !('type' in data)) {
      return
    }

    // Route to appropriate handler based on protocol
    if (data.type === 'bio_request') {
      this.processRequest(data, 'bio')
    } else if (data.type === 'eth_request') {
      this.processRequest(data as EthRequestMessage, 'eth')
    } else if (data.type === 'tron_request') {
      this.processRequest(data as TronRequestMessage, 'tron')
    }
  }

  private async processRequest(request: RequestMessage, protocol: Protocol): Promise<void> {
    const { id, method, params } = request

    

    // Check if handler exists
    const handler = this.handlers.get(method)
    if (!handler) {
      this.sendResponse(protocol, {
        type: `${protocol}_response` as 'bio_response',
        id,
        success: false,
        error: { code: BioErrorCodes.METHOD_NOT_FOUND, message: `Method not found: ${method}` },
      })
      return
    }

    // Permission check (skip for EVM/TRON - they use their own connection flow)
    const skipPermissionCheck = protocol !== 'bio' || ['bio_connect', 'bio_closeSplashScreen'].includes(method)
    if (!skipPermissionCheck) {
      const accountRelatedMethods = ['bio_accounts', 'bio_selectAccount', 'bio_pickWallet']
      const shouldMapToRequestAccounts =
        accountRelatedMethods.includes(method) && this.manifestPermissions.includes('bio_requestAccounts')
      const permissionKey = shouldMapToRequestAccounts ? 'bio_requestAccounts' : method

      // 1. 检查 manifest 是否声明了该权限
      const isDeclaredInManifest =
        this.manifestPermissions.includes(method) || method === 'bio_requestAccounts' || shouldMapToRequestAccounts

      if (!isDeclaredInManifest) {
        this.sendResponse(protocol, createErrorResponse(id, BioErrorCodes.UNAUTHORIZED, `Permission not declared in manifest: ${method}`))
        return
      }

      // 2. 对于敏感方法，检查用户是否已授权
      if (isSensitiveMethod(permissionKey)) {
        const granted = hasPermission(this.appId, permissionKey)
        if (!granted) {
          // 请求权限
          const approved = await this.requestPermission([permissionKey])
          if (!approved) {
            this.sendResponse(protocol, createErrorResponse(id, BioErrorCodes.USER_REJECTED, 'Permission denied by user'))
            return
          }
        }
      }
    }

    // Execute handler
    try {
      const app = miniappRuntimeStore.state.apps.get(this.appId)
      const manifest = app?.manifest
      let appIcon = manifest?.icon

      // Resolve relative icon URL to absolute based on miniapp's URL
      if (appIcon && !appIcon.startsWith('http') && !appIcon.startsWith('data:')) {
        try {
          const baseUrl = new URL(manifest?.url ?? '', window.location.origin)
          appIcon = new URL(appIcon, baseUrl).href
        } catch {
          // Keep original if resolution fails
        }
      }

      const context: HandlerContext = {
        appId: this.appId,
        appName: this.appName,
        appIcon,
        origin: this.origin,
        permissions: this.manifestPermissions,
      }

      const result = await handler(params?.[0], context)
      this.sendResponse(protocol, {
        type: `${protocol}_response` as 'bio_response',
        id,
        success: true,
        result,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const code = (error as { code?: number }).code ?? BioErrorCodes.INTERNAL_ERROR
      this.sendResponse(protocol, {
        type: `${protocol}_response` as 'bio_response',
        id,
        success: false,
        error: { code, message },
      })
    }
  }

  /** 请求用户授权权限 */
  private async requestPermission(permissions: string[]): Promise<boolean> {
    if (!this.permissionRequestCallback) {
      
      return false
    }

    try {
      const approved = await this.permissionRequestCallback(
        this.appId,
        this.appName,
        permissions
      )
      if (approved) {
        storeGrantPermissions(this.appId, permissions)
      }
      return approved
    } catch (error) {
      
      return false
    }
  }

  private sendResponse(_protocol: Protocol, response: BioResponseMessage | EthResponseMessage | TronResponseMessage): void {
    if (!this.iframe?.contentWindow) return

    
    this.iframe.contentWindow.postMessage(response, this.origin)
  }
}

/** Singleton bridge instance */
export const bridge = new PostMessageBridge()
