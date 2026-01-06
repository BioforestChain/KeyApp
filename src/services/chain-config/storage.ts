import { z } from 'zod'
import { ChainConfigSchema, ChainConfigSourceSchema, ChainConfigSubscriptionSchema } from './schema'
import type { ChainConfig, ChainConfigSource, ChainConfigSubscription } from './types'

const DB_NAME = 'bfm_chain_config'
const DB_VERSION = 1

const STORE_CONFIGS = 'chain_configs'
const STORE_PREFERENCES = 'chain_preferences'

type BaseChainConfig = Omit<ChainConfig, 'enabled' | 'source'>

interface ChainConfigRecord {
  key: string
  id: string
  source: ChainConfigSource
  config: BaseChainConfig
}

interface PreferenceRecord {
  key: string
  value: unknown
}

let dbInstance: IDBDatabase | null = null
let dbOpening: Promise<IDBDatabase> | null = null

const BaseChainConfigSchema = ChainConfigSchema.omit({ enabled: true, source: true })
const ChainConfigRecordSchema = z.object({
  key: z.string(),
  id: z.string(),
  source: ChainConfigSourceSchema,
  config: BaseChainConfigSchema,
})

const EnabledMapRawSchema = z.record(z.string(), z.any())

function assertIndexedDbAvailable(): void {
  if (typeof indexedDB === 'undefined') {
    throw new Error('indexedDB is not available in this environment')
  }
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

async function getDb(): Promise<IDBDatabase> {
  assertIndexedDbAvailable()

  if (dbInstance) return dbInstance
  if (dbOpening) return dbOpening

  dbOpening = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_CONFIGS)) {
        const store = db.createObjectStore(STORE_CONFIGS, { keyPath: 'key' })
        store.createIndex('source', 'source', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
        db.createObjectStore(STORE_PREFERENCES, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
  })

  try {
    dbInstance = await dbOpening
    return dbInstance
  } finally {
    dbOpening = null
  }
}

async function listKeysBySource(store: IDBObjectStore, source: ChainConfigSource): Promise<IDBValidKey[]> {
  const index = store.index('source')
  const keys: IDBValidKey[] = []

  return new Promise((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.only(source))
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) {
        resolve(keys)
        return
      }
      keys.push(cursor.primaryKey)
      cursor.continue()
    }
    request.onerror = () => reject(request.error ?? new Error('Failed to read IndexedDB cursor'))
  })
}

/**
 * Persist chain configs for a given source.
 *
 * Behavior: replaces all existing configs under the same source (prevents stale leftovers).
 */
export async function saveChainConfigs(options: {
  source: ChainConfigSource
  configs: readonly ChainConfig[]
}): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_CONFIGS], 'readwrite')
  const store = tx.objectStore(STORE_CONFIGS)

  const keysToDelete = await listKeysBySource(store, options.source)
  for (const key of keysToDelete) {
    store.delete(key)
  }

  for (const config of options.configs) {
    const base: BaseChainConfig = {
      id: config.id,
      version: config.version,
      chainKind: config.chainKind,
      name: config.name,
      symbol: config.symbol,
      decimals: config.decimals,
      ...(config.icon !== undefined ? { icon: config.icon } : {}),
      ...(config.prefix !== undefined ? { prefix: config.prefix } : {}),
      ...(config.apis !== undefined ? { apis: config.apis } : {}),
      ...(config.explorer !== undefined ? { explorer: config.explorer } : {}),
    }

    const record: ChainConfigRecord = {
      key: `${options.source}:${config.id}`,
      id: config.id,
      source: options.source,
      config: base,
    }

    store.put(record)
  }

  await transactionDone(tx)
}

export async function loadChainConfigs(): Promise<ChainConfig[]> {
  const db = await getDb()
  const tx = db.transaction([STORE_CONFIGS], 'readonly')
  const store = tx.objectStore(STORE_CONFIGS)

  const records = await requestToPromise(store.getAll())
  await transactionDone(tx)

  const configs: ChainConfig[] = []

  for (const raw of records as unknown[]) {
    const parsed = ChainConfigRecordSchema.safeParse(raw)
    if (!parsed.success) {
      console.warn('[ChainConfigStorage] Invalid chain config record:', parsed.error.issues[0])
      continue
    }

    if (parsed.data.id !== parsed.data.config.id) {
      console.warn('[ChainConfigStorage] Invalid chain config record (id mismatch):', {
        key: parsed.data.key,
        id: parsed.data.id,
        configId: parsed.data.config.id,
      })
      continue
    }

    configs.push({
      ...parsed.data.config,
      source: parsed.data.source,
      enabled: true,
    })
  }

  return configs
}

export async function saveUserPreferences(preferences: Record<string, boolean>): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readwrite')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record: PreferenceRecord = { key: 'enabledMap', value: preferences }
  store.put(record)

  await transactionDone(tx)
}

export async function loadUserPreferences(): Promise<Record<string, boolean>> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readonly')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record = await requestToPromise(store.get('enabledMap'))
  await transactionDone(tx)

  if (!record || typeof record !== 'object') return {}
  const value = (record as PreferenceRecord).value
  const parsed = EnabledMapRawSchema.safeParse(value)
  if (!parsed.success) {
    console.warn('[ChainConfigStorage] Invalid enabledMap:', parsed.error.issues[0])
    return {}
  }

  const result: Record<string, boolean> = {}
  for (const [key, rawFlag] of Object.entries(parsed.data)) {
    if (typeof rawFlag === 'boolean') {
      result[key] = rawFlag
      continue
    }

    if (typeof rawFlag === 'string') {
      const normalized = rawFlag.trim().toLowerCase()
      if (normalized === 'true' || normalized === '1') result[key] = true
      else if (normalized === 'false' || normalized === '0') result[key] = false
      continue
    }

    if (rawFlag === 1) result[key] = true
    else if (rawFlag === 0) result[key] = false
  }

  return result
}

export async function saveSubscriptionMeta(meta: ChainConfigSubscription): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readwrite')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record: PreferenceRecord = { key: 'subscriptionMeta', value: meta }
  store.put(record)

  await transactionDone(tx)
}

export async function loadSubscriptionMeta(): Promise<ChainConfigSubscription | null> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readonly')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record = await requestToPromise(store.get('subscriptionMeta'))
  await transactionDone(tx)

  if (!record || typeof record !== 'object') return null
  const value = (record as PreferenceRecord).value
  const parsed = ChainConfigSubscriptionSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export async function resetChainConfigStorageForTests(): Promise<void> {
  assertIndexedDbAvailable()

  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  dbOpening = null

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Failed to delete IndexedDB database'))
    request.onblocked = () => resolve()
  })
}

export async function saveDefaultVersion(version: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readwrite')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record: PreferenceRecord = { key: 'defaultVersion', value: version }
  store.put(record)

  await transactionDone(tx)
}

export async function loadDefaultVersion(): Promise<string | null> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readonly')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record = await requestToPromise(store.get('defaultVersion'))
  await transactionDone(tx)

  if (!record || typeof record !== 'object') return null
  const value = (record as PreferenceRecord).value
  const parsed = z.string().safeParse(value)
  if (!parsed.success) {
    console.warn('[ChainConfigStorage] Invalid defaultVersion:', parsed.error.issues[0])
    return null
  }
  return parsed.data
}
