type DebugSetting = boolean | string | undefined
type DebugLogger = (message: string, detail?: unknown) => void

function readLocalStorageSetting(): DebugSetting {
  if (typeof globalThis === "undefined") return undefined
  const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage
  if (!storage) return undefined
  try {
    const raw = storage.getItem("__CHAIN_EFFECT_DEBUG__")
    if (raw === null) return undefined
    const value = raw.trim()
    if (value.length === 0) return undefined
    if (value === "true" || value === "1") return true
    if (value === "false" || value === "0") return false
    return value
  } catch {
    return undefined
  }
}

function readGlobalSetting(): DebugSetting {
  if (typeof globalThis === "undefined") return undefined
  const store = globalThis as typeof globalThis & { __CHAIN_EFFECT_DEBUG__?: unknown }
  const value = store.__CHAIN_EFFECT_DEBUG__
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value.trim() === "" ? undefined : value
  return undefined
}

function readGlobalLogger(): DebugLogger | undefined {
  if (typeof globalThis === "undefined") return undefined
  const store = globalThis as typeof globalThis & { __CHAIN_EFFECT_LOG__?: unknown }
  const value = store.__CHAIN_EFFECT_LOG__
  if (typeof value === "function") return value as DebugLogger
  return undefined
}

function parseRegex(pattern: string): RegExp | null {
  if (!pattern.startsWith("/")) return null
  const lastSlash = pattern.lastIndexOf("/")
  if (lastSlash <= 0) return null
  const body = pattern.slice(1, lastSlash)
  const flags = pattern.slice(lastSlash + 1)
  try {
    return new RegExp(body, flags)
  } catch {
    return null
  }
}

export function isChainDebugEnabled(message: string): boolean {
  const setting = readGlobalSetting() ?? readLocalStorageSetting()
  if (setting === true) return true
  if (!setting) return false
  const regex = parseRegex(setting)
  if (regex) return regex.test(message)
  return message.includes(setting)
}

export function logChainDebug(message: string, detail?: unknown): void {
  if (!isChainDebugEnabled(message)) return
  const logger = readGlobalLogger()
  if (!logger) return
  logger(message, detail)
}
