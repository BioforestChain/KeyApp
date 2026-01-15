/**
 * Bio Provider Implementation
 * Communicates with KeyApp host via postMessage
 */

import type { BioProvider, RequestArguments, EventHandler } from './types'
import { BioErrorCodes, createProviderError } from './types'
import { EventEmitter } from './events'

/** Message sent to host */
interface RequestMessage {
  type: 'bio_request'
  id: string
  method: string
  params?: unknown[]
}

/** Response from host */
interface ResponseMessage {
  type: 'bio_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** Event from host */
interface EventMessage {
  type: 'bio_event'
  event: string
  args: unknown[]
}

type HostMessage = ResponseMessage | EventMessage

export class BioProviderImpl implements BioProvider {
  private events = new EventEmitter()
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }>()
  private requestIdCounter = 0
  private connected = false
  private readonly targetOrigin: string

  constructor(targetOrigin = '*') {
    this.targetOrigin = targetOrigin
    this.setupMessageListener()
    this.connect()
  }

  private setupMessageListener(): void {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent): void {
    const data = event.data as HostMessage
    if (!data || typeof data !== 'object') return

    if (data.type === 'bio_response') {
      this.handleResponse(data)
    } else if (data.type === 'bio_event') {
      this.handleEvent(data)
    }
  }

  private handleResponse(message: ResponseMessage): void {
    const pending = this.pendingRequests.get(message.id)
    if (!pending) return

    this.pendingRequests.delete(message.id)

    if (message.success) {
      pending.resolve(message.result)
    } else {
      const error = message.error ?? { code: BioErrorCodes.INTERNAL_ERROR, message: 'Unknown error' }
      pending.reject(createProviderError(error.code, error.message, error.data))
    }
  }

  private handleEvent(message: EventMessage): void {
    this.events.emit(message.event, ...message.args)

    // Handle built-in events
    if (message.event === 'connect') {
      this.connected = true
    } else if (message.event === 'disconnect') {
      this.connected = false
    }
  }

  private connect(): void {
    // Send handshake to host
    this.postMessage({
      type: 'bio_request',
      id: this.generateId(),
      method: 'bio_connect',
      params: [],
    })
  }

  private generateId(): string {
    return `bio_${Date.now()}_${++this.requestIdCounter}`
  }

  private postMessage(message: RequestMessage): void {
    if (window.parent === window) {
      console.warn('[bio-sdk] Not running in iframe, postMessage will not work')
      return
    }
    window.parent.postMessage(message, this.targetOrigin)
  }

  async request<T = unknown>(args: RequestArguments): Promise<T> {
    const id = this.generateId()

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })

      this.postMessage({
        type: 'bio_request',
        id,
        method: args.method,
        params: args.params,
      })

      // Timeout after 5 minutes (for user interactions)
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(createProviderError(BioErrorCodes.INTERNAL_ERROR, 'Request timeout'))
        }
      }, 5 * 60 * 1000)
    })
  }

  on(event: string, handler: EventHandler): void {
    this.events.on(event, handler)
  }

  off(event: string, handler: EventHandler): void {
    this.events.off(event, handler)
  }

  isConnected(): boolean {
    return this.connected
  }
}
