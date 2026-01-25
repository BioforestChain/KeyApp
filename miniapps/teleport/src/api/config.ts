const GLOBAL_PREFIX = 'payment'
const DEFAULT_API_ORIGIN = 'https://api.eth-metaverse.com'
const RAW_API_BASE_URL = import.meta.env.VITE_TELEPORT_API_BASE_URL || DEFAULT_API_ORIGIN

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function withPaymentPrefix(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl)
  const prefix = `/${GLOBAL_PREFIX}`
  return normalized.endsWith(prefix) ? normalized : `${normalized}${prefix}`
}

const PAYMENT_BASE_URL = withPaymentPrefix(RAW_API_BASE_URL)

export function getPaymentBaseUrl(): string {
  return PAYMENT_BASE_URL
}

export function buildPaymentUrl(path: string): string {
  if (!path) return PAYMENT_BASE_URL
  return `${PAYMENT_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
