/**
 * API Client
 */

import { getApiBaseUrlSafe, ApiConfigError } from './config'

export { ApiConfigError }

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options
  
  // Get base URL - will throw ApiConfigError if not configured
  const baseUrl = getApiBaseUrlSafe()
  let url = `${baseUrl}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    }
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(
      data?.message || `HTTP ${response.status}`,
      response.status,
      data,
    )
  }

  return response.json()
}

export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'GET', params })
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
}
