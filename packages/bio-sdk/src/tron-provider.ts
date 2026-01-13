/**
 * Tron Provider (TronLink Compatible)
 *
 * Provides window.tronWeb and window.tronLink for Tron dApps.
 * Communicates with KeyApp host via postMessage.
 */

import { EventEmitter } from './events'
import { BioErrorCodes, createProviderError } from './types'

/** Tron address format */
export interface TronAddress {
  base58: string
  hex: string
}

/** TronLink request arguments (EIP-1193 style) */
export interface TronRequestArguments {
  method: string
  params?: unknown
}

/** Message sent to host */
interface RequestMessage {
  type: 'tron_request'
  id: string
  method: string
  params?: unknown[]
}

/** Response from host */
interface ResponseMessage {
  type: 'tron_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** Event from host */
interface EventMessage {
  type: 'tron_event'
  event: string
  args: unknown[]
}

type HostMessage = ResponseMessage | EventMessage

/**
 * TronLink-compatible Provider
 */
export class TronLinkProvider {
  private events = new EventEmitter()
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }>()
  private requestIdCounter = 0
  private readonly targetOrigin: string

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

    if (data.type === 'tron_response') {
      this.handleResponse(data)
    } else if (data.type === 'tron_event') {
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
  }

  private generateId(): string {
    return `tron_${Date.now()}_${++this.requestIdCounter}`
  }

  private postMessage(message: RequestMessage): void {
    if (window.parent === window) {
      
      return
    }
    window.parent.postMessage(message, this.targetOrigin)
  }

  /**
   * TronLink request method (EIP-1193 style)
   */
  async request<T = unknown>(args: TronRequestArguments): Promise<T> {
    const { method, params } = args
    const paramsArray = Array.isArray(params) ? params : params !== undefined ? [params] : []

    const id = this.generateId()

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })

      this.postMessage({
        type: 'tron_request',
        id,
        method,
        params: paramsArray,
      })

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(createProviderError(BioErrorCodes.INTERNAL_ERROR, 'Request timeout'))
        }
      }, 5 * 60 * 1000)
    })
  }

  on(event: string, handler: (...args: unknown[]) => void): this {
    this.events.on(event, handler)
    return this
  }

  off(event: string, handler: (...args: unknown[]) => void): this {
    this.events.off(event, handler)
    return this
  }
}

/**
 * TronWeb-compatible API
 * Provides the subset of TronWeb API that KeyApp supports
 */
export class TronWebProvider {
  private tronLink: TronLinkProvider
  private _ready = false
  private _defaultAddress: TronAddress = { base58: '', hex: '' }

  /** TRX operations */
  readonly trx: TronWebTrx

  constructor(tronLink: TronLinkProvider) {
    this.tronLink = tronLink
    this.trx = new TronWebTrx(tronLink)

    // Listen for account changes
    tronLink.on('accountsChanged', (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        const addr = accounts[0] as TronAddress
        this._defaultAddress = addr
        this._ready = true
      } else {
        this._defaultAddress = { base58: '', hex: '' }
        this._ready = false
      }
    })
  }

  /** Whether TronWeb is ready (connected) */
  get ready(): boolean {
    return this._ready
  }

  /** Current default address */
  get defaultAddress(): TronAddress {
    return this._defaultAddress
  }

  /**
   * Set default address (called by host after connection)
   */
  setAddress(address: TronAddress): void {
    this._defaultAddress = address
    this._ready = true
  }

  /**
   * Check if an address is valid
   */
  isAddress(address: string): boolean {
    // Basic validation: base58 starts with T, hex starts with 41
    if (address.startsWith('T')) {
      return address.length === 34
    }
    if (address.startsWith('41')) {
      return address.length === 42
    }
    return false
  }

  /**
   * Convert address to hex format
   */
  address = {
    toHex: (base58: string): string => {
      // This is a stub - actual conversion requires TronWeb library
      // KeyApp will handle the conversion on the host side
      return base58
    },
    fromHex: (hex: string): string => {
      return hex
    },
  }
}

/**
 * TronWeb.trx operations
 */
class TronWebTrx {
  private tronLink: TronLinkProvider

  constructor(tronLink: TronLinkProvider) {
    this.tronLink = tronLink
  }

  /**
   * Sign a transaction
   */
  async sign(transaction: unknown): Promise<unknown> {
    return this.tronLink.request({
      method: 'tron_signTransaction',
      params: transaction,
    })
  }

  /**
   * Send raw transaction (broadcast)
   */
  async sendRawTransaction(signedTransaction: unknown): Promise<unknown> {
    return this.tronLink.request({
      method: 'tron_sendRawTransaction',
      params: signedTransaction,
    })
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<number> {
    return this.tronLink.request({
      method: 'tron_getBalance',
      params: address,
    })
  }

  /**
   * Get account info
   */
  async getAccount(address: string): Promise<unknown> {
    return this.tronLink.request({
      method: 'tron_getAccount',
      params: address,
    })
  }
}

// Extend Window interface
declare global {
  interface Window {
    tronLink?: TronLinkProvider
    tronWeb?: TronWebProvider
  }
}

/**
 * Initialize and inject the Tron providers
 */
export function initTronProvider(targetOrigin = '*'): { tronLink: TronLinkProvider; tronWeb: TronWebProvider } {
  if (typeof window === 'undefined') {
    throw new Error('[TronProvider] Cannot initialize: window is not defined')
  }

  if (window.tronLink && window.tronWeb) {
    
    return { tronLink: window.tronLink, tronWeb: window.tronWeb }
  }

  const tronLink = new TronLinkProvider(targetOrigin)
  const tronWeb = new TronWebProvider(tronLink)

  window.tronLink = tronLink
  window.tronWeb = tronWeb

  
  return { tronLink, tronWeb }
}
