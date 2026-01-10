import { z } from 'zod'
import type { EcosystemSource } from './types'
import { EcosystemSourceSchema } from './schema'

const DB_NAME = 'bfm_ecosystem'
const DB_VERSION = 1

const STORE_SOURCE_PAYLOADS = 'ecosystem_source_payloads'

export interface SourcePayloadRecord {
  url: string
  etag?: string
  lastUpdated: string
  payload: EcosystemSource
}

const SourcePayloadRecordSchema = z.object({
  url: z.string(),
  etag: z.string().optional(),
  lastUpdated: z.string(),
  payload: EcosystemSourceSchema,
})

let dbInstance: IDBDatabase | null = null
let dbOpening: Promise<IDBDatabase> | null = null

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

      if (!db.objectStoreNames.contains(STORE_SOURCE_PAYLOADS)) {
        db.createObjectStore(STORE_SOURCE_PAYLOADS, { keyPath: 'url' })
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

export async function saveSourcePayload(record: SourcePayloadRecord): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_SOURCE_PAYLOADS], 'readwrite')
  const store = tx.objectStore(STORE_SOURCE_PAYLOADS)
  store.put(record)
  await transactionDone(tx)
}

export async function loadSourcePayload(url: string): Promise<SourcePayloadRecord | null> {
  const db = await getDb()
  const tx = db.transaction([STORE_SOURCE_PAYLOADS], 'readonly')
  const store = tx.objectStore(STORE_SOURCE_PAYLOADS)

  const record = await requestToPromise(store.get(url))
  await transactionDone(tx)

  // 记录不存在是正常情况，直接返回 null
  if (record === undefined) {
    return null
  }

  const parsed = SourcePayloadRecordSchema.safeParse(record)
  if (!parsed.success) {
    console.warn('[EcosystemStorage] Invalid source payload record:', parsed.error.issues[0])
    return null
  }
  return parsed.data
}

export async function deleteSourcePayload(url: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_SOURCE_PAYLOADS], 'readwrite')
  const store = tx.objectStore(STORE_SOURCE_PAYLOADS)
  store.delete(url)
  await transactionDone(tx)
}

export async function resetEcosystemStorageForTests(): Promise<void> {
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

