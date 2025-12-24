/**
 * Base HTTP client for bnqkl_wallet API
 */

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>

export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
  fetch?: FetchFn
}

export interface ApiResponse<T> {
  success: boolean
  result?: T
  message?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseUrl: string
  private timeout: number
  private fetchFn: FetchFn

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.timeout = config.timeout ?? 30000
    // Use bound fetch to preserve Window context, or use custom fetch function
    this.fetchFn = config.fetch ?? ((url, init) => fetch(url, init))
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const init: RequestInit = {
        method,
        signal: controller.signal,
      }
      if (body) {
        init.headers = { 'Content-Type': 'application/json' }
        init.body = JSON.stringify(body)
      }
      const response = await this.fetchFn(url, init)

      const json = (await response.json()) as ApiResponse<T>

      if (!response.ok) {
        throw new ApiError(
          json.message ?? `Request failed: ${response.status}`,
          response.status,
          json,
        )
      }

      if (!json.success) {
        throw new ApiError(json.message ?? 'Request failed', response.status, json)
      }

      return json.result as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', undefined, undefined)
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        undefined,
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }
}
