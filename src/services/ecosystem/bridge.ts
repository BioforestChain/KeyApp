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

export class PostMessageBridge {
  private handlers = new Map<string, MethodHandler>()
  private iframe: HTMLIFrameElement | null = null
  private appId: string = ''
  private origin: string = '*'
  private permissions: string[] = []
  private messageHandler: ((event: MessageEvent) => void) | null = null

  /** Register a method handler */
  registerHandler(method: string, handler: MethodHandler): void {
    this.handlers.set(method, handler)
  }

  /** Attach to an iframe */
  attach(iframe: HTMLIFrameElement, appId: string, permissions: string[] = []): void {
    this.detach()

    this.iframe = iframe
    this.appId = appId
    this.permissions = permissions

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
    this.permissions = []
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

    // Check permissions (skip for connect methods)
    const skipPermissionCheck = ['bio_connect', 'bio_requestAccounts'].includes(method)
    if (!skipPermissionCheck && !this.permissions.includes(method)) {
      this.sendResponse(createErrorResponse(
        id,
        BioErrorCodes.UNAUTHORIZED,
        `Permission denied: ${method}`
      ))
      return
    }

    // Execute handler
    try {
      const context: HandlerContext = {
        appId: this.appId,
        origin: this.origin,
        permissions: this.permissions,
      }

      const result = await handler(params?.[0], context)
      this.sendResponse(createSuccessResponse(id, result))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const code = (error as { code?: number }).code ?? BioErrorCodes.INTERNAL_ERROR
      this.sendResponse(createErrorResponse(id, code, message))
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
