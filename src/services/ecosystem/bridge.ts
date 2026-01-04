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
import {
  BioErrorCodes,
  createErrorResponse,
  createSuccessResponse,
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

    console.log('[BioProvider] Attached to iframe:', appId)
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

  /** Send event to miniapp */
  emit(event: string, ...args: unknown[]): void {
    if (!this.iframe?.contentWindow) return

    const message: BioEventMessage = {
      type: 'bio_event',
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

    const data = event.data as BioRequestMessage
    if (!data || data.type !== 'bio_request') {
      return
    }

    this.processRequest(data)
  }

  private async processRequest(request: BioRequestMessage): Promise<void> {
    const { id, method, params } = request

    console.log('[BioProvider] Request:', method, params)

    // Check if handler exists
    const handler = this.handlers.get(method)
    if (!handler) {
      this.sendResponse(createErrorResponse(
        id,
        BioErrorCodes.METHOD_NOT_FOUND,
        `Method not found: ${method}`
      ))
      return
    }

    // Check permissions
    const skipPermissionCheck = ['bio_connect', 'bio_closeSplashScreen'].includes(method)
    if (!skipPermissionCheck) {
      const accountRelatedMethods = ['bio_accounts', 'bio_selectAccount', 'bio_pickWallet']
      const shouldMapToRequestAccounts =
        accountRelatedMethods.includes(method) && this.manifestPermissions.includes('bio_requestAccounts')
      const permissionKey = shouldMapToRequestAccounts ? 'bio_requestAccounts' : method

      // 1. 检查 manifest 是否声明了该权限
      const isDeclaredInManifest =
        this.manifestPermissions.includes(method) || method === 'bio_requestAccounts' || shouldMapToRequestAccounts

      if (!isDeclaredInManifest) {
        this.sendResponse(createErrorResponse(
          id,
          BioErrorCodes.UNAUTHORIZED,
          `Permission not declared in manifest: ${method}`
        ))
        return
      }

      // 2. 对于敏感方法，检查用户是否已授权
      if (isSensitiveMethod(permissionKey)) {
        const granted = hasPermission(this.appId, permissionKey)
        if (!granted) {
          // 请求权限
          const approved = await this.requestPermission([permissionKey])
          if (!approved) {
            this.sendResponse(createErrorResponse(
              id,
              BioErrorCodes.USER_REJECTED,
              'Permission denied by user'
            ))
            return
          }
        }
      }
    }

    // Execute handler
    try {
      const context: HandlerContext = {
        appId: this.appId,
        appName: this.appName,
        origin: this.origin,
        permissions: this.manifestPermissions,
      }

      const result = await handler(params?.[0], context)
      this.sendResponse(createSuccessResponse(id, result))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const code = (error as { code?: number }).code ?? BioErrorCodes.INTERNAL_ERROR
      this.sendResponse(createErrorResponse(id, code, message))
    }
  }

  /** 请求用户授权权限 */
  private async requestPermission(permissions: string[]): Promise<boolean> {
    if (!this.permissionRequestCallback) {
      console.warn('[BioProvider] No permission request callback set')
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
      console.error('[BioProvider] Permission request failed:', error)
      return false
    }
  }

  private sendResponse(response: BioResponseMessage): void {
    if (!this.iframe?.contentWindow) return

    console.log('[BioProvider] Response:', response)
    this.iframe.contentWindow.postMessage(response, this.origin)
  }
}

/** Singleton bridge instance */
export const bridge = new PostMessageBridge()
