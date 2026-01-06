import type { ZodIssue } from 'zod'

export type InvalidDataSource = 'fetch' | 'indexeddb' | 'provider'

export interface InvalidDataErrorParams {
  source: InvalidDataSource
  chainId: string
  method: string
  issues?: ZodIssue[]
  cause?: unknown
}

export class InvalidDataError extends Error {
  readonly source: InvalidDataSource
  readonly chainId: string
  readonly method: string
  readonly issues: ZodIssue[]

  constructor(params: InvalidDataErrorParams) {
    super(`[InvalidData] ${params.source}:${params.chainId}:${params.method}`, {
      cause: params.cause instanceof Error ? params.cause : undefined,
    })
    this.name = 'InvalidDataError'
    this.source = params.source
    this.chainId = params.chainId
    this.method = params.method
    this.issues = params.issues ?? []
  }
}
