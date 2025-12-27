/**
 * Bio Ecosystem Types
 */

/** Account information */
export interface BioAccount {
  address: string
  chain: string
  name?: string
}

/** Transfer parameters */
export interface TransferParams {
  from: string
  to: string
  amount: string
  chain: string
  asset?: string
}

/** Request message from miniapp */
export interface BioRequestMessage {
  type: 'bio_request'
  id: string
  method: string
  params?: unknown[]
}

/** Response message to miniapp */
export interface BioResponseMessage {
  type: 'bio_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** Event message to miniapp */
export interface BioEventMessage {
  type: 'bio_event'
  event: string
  args: unknown[]
}

/** Miniapp manifest */
export interface MiniappManifest {
  id: string
  name: string
  description: string
  icon: string
  url: string
  version: string
  author?: string
  permissions?: string[]
  chains?: string[]
}

/** Ecosystem source */
export interface EcosystemSource {
  name: string
  version: string
  updated: string
  apps: MiniappManifest[]
}

/** Method handler */
export type MethodHandler = (
  params: unknown,
  context: HandlerContext
) => Promise<unknown>

/** Handler context */
export interface HandlerContext {
  appId: string
  origin: string
  permissions: string[]
}

/** Error codes */
export const BioErrorCodes = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  INTERNAL_ERROR: -32603,
  INVALID_PARAMS: -32602,
  METHOD_NOT_FOUND: -32601,
} as const

/** Create error response */
export function createErrorResponse(
  id: string,
  code: number,
  message: string,
  data?: unknown
): BioResponseMessage {
  return {
    type: 'bio_response',
    id,
    success: false,
    error: { code, message, data },
  }
}

/** Create success response */
export function createSuccessResponse(id: string, result: unknown): BioResponseMessage {
  return {
    type: 'bio_response',
    id,
    success: true,
    result,
  }
}
