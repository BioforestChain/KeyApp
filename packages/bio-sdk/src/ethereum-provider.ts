/**
 * Ethereum Provider (EIP-1193 Compatible)
 *
 * Provides window.ethereum for EVM-compatible dApps.
 * Communicates with KeyApp host via postMessage.
 */

import { EventEmitter } from './events'
import { BioErrorCodes, createProviderError } from './types'

/** EIP-1193 Request Arguments */
export interface EthRequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

/** EIP-1193 Provider Connect Info */
export interface ProviderConnectInfo {
  chainId: string
}

/** EIP-1193 Provider Message */
export interface ProviderMessage {
  type: string
  data: unknown
}

/** Transaction request (eth_sendTransaction) */
export interface TransactionRequest {
  from: string
  to?: string
  value?: string
  data?: string
  gas?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  nonce?: string
}

/** Message sent to host */
interface RequestMessage {
  type: 'eth_request'
  id: string
  method: string
  params?: unknown[]
}

/** Response from host */
interface ResponseMessage {
  type: 'eth_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** Event from host */
interface EventMessage {
  type: 'eth_event'
  event: string
  args: unknown[]
}

type HostMessage = ResponseMessage | EventMessage

/**
 * EIP-1193 Ethereum Provider Implementation
 */
export class EthereumProvider {
  private events = new EventEmitter()
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }>()
  private requestIdCounter = 0
  private connected = false
  private currentChainId: string | null = null
  private accounts: string[] = []
  private readonly targetOrigin: string

  // EIP-1193 required properties
  readonly isMetaMask = false
  readonly isKeyApp = true

  constructor(targetOrigin = '*') {
    this.targetOrigin = targetOrigin
    this.setupMessageListener()
  }

  private setupMessageListener(): void {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent): void {
    const data = event.data as HostMessage
    if (!data || typeof data !== 'object') return

    if (data.type === 'eth_response') {
      this.handleResponse(data)
    } else if (data.type === 'eth_event') {
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
      const info = message.args[0] as ProviderConnectInfo
      this.currentChainId = info?.chainId ?? null
    } else if (message.event === 'disconnect') {
      this.connected = false
      this.accounts = []
    } else if (message.event === 'chainChanged') {
      this.currentChainId = message.args[0] as string
    } else if (message.event === 'accountsChanged') {
      this.accounts = message.args[0] as string[]
    }
  }

  private generateId(): string {
    return `eth_${Date.now()}_${++this.requestIdCounter}`
  }

  private postMessage(message: RequestMessage): void {
    if (window.parent === window) {
      
      return
    }
    window.parent.postMessage(message, this.targetOrigin)
  }

  /**
   * EIP-1193 request method
   */
  async request<T = unknown>(args: EthRequestArguments): Promise<T> {
    const { method, params } = args
    const paramsArray = Array.isArray(params) ? params : params ? [params] : []

    const id = this.generateId()

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })

      this.postMessage({
        type: 'eth_request',
        id,
        method,
        params: paramsArray,
      }, self.location.origin)

      // Timeout after 5 minutes (for user interactions)
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(createProviderError(BioErrorCodes.INTERNAL_ERROR, 'Request timeout'))
        }
      }, 5 * 60 * 1000)
    })
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: (...args: unknown[]) => void): this {
    this.events.on(event, handler)
    return this
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: (...args: unknown[]) => void): this {
    this.events.off(event, handler)
    return this
  }

  /**
   * Alias for off (Node.js EventEmitter compatibility)
   */
  removeListener(event: string, handler: (...args: unknown[]) => void): this {
    return this.off(event, handler)
  }

  /**
   * Add listener that fires only once
   */
  once(event: string, handler: (...args: unknown[]) => void): this {
    const wrapper = (...args: unknown[]) => {
      this.off(event, wrapper)
      handler(...args)
    }
    this.on(event, wrapper)
    return this
  }

  /**
   * EIP-1193 isConnected method
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * Get current chain ID (cached)
   */
  get chainId(): string | null {
    return this.currentChainId
  }

  /**
   * Get selected address (first account)
   */
  get selectedAddress(): string | null {
    return this.accounts[0] ?? null
  }

  // ============================================
  // Legacy methods (for backwards compatibility)
  // ============================================

  /**
   * @deprecated Use request({ method: 'eth_requestAccounts' })
   */
  async enable(): Promise<string[]> {
    return this.request({ method: 'eth_requestAccounts' })
  }

  /**
   * @deprecated Use request()
   */
  send(method: string, params?: unknown[]): Promise<unknown> {
    return this.request({ method, params })
  }

  /**
   * @deprecated Use request()
   */
  sendAsync(
    payload: { method: string; params?: unknown[]; id?: number },
    callback: (error: Error | null, result?: { result: unknown }) => void
  ): void {
    this.request({ method: payload.method, params: payload.params })
      .then((result) => callback(null, { result }))
      .catch((error) => callback(error))
  }
}

// Extend Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

/**
 * Initialize and inject the Ethereum provider into window.ethereum
 */
export function initEthereumProvider(targetOrigin = '*'): EthereumProvider {
  if (typeof window === 'undefined') {
    throw new Error('[EthereumProvider] Cannot initialize: window is not defined')
  }

  if (window.ethereum) {
    
    return window.ethereum
  }

  const provider = new EthereumProvider(targetOrigin)
  window.ethereum = provider

  
  return provider
}
