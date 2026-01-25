/**
 * Snapshot storage (IndexedDB + memory fallback)
 *
 * Front-end-only persistence for hook snapshots.
 */

import { superjson } from "./superjson"

export interface SnapshotEntry<T> {
  key: string
  data: T
  timestamp: number
}

interface SnapshotRecord {
  key: string
  payload: string
  timestamp: number
  serializerVersion: number
}

const DB_NAME = "chain-effect-snapshots"
const DB_VERSION = 1
const STORE_NAME = "snapshots"
const SERIALIZER_VERSION = 3

const memorySnapshots = new Map<string, SnapshotEntry<unknown>>()
let dbPromise: Promise<IDBDatabase> | null = null

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined"
}

function getDb(): Promise<IDBDatabase> {
  if (!hasIndexedDb()) {
    return Promise.reject(new Error("IndexedDB is not available"))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.addEventListener("error", () => reject(request.error))
    request.addEventListener("success", () => resolve(request.result))
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" })
      }
    }
  })
  return dbPromise
}

export function readMemorySnapshot<T>(key: string): SnapshotEntry<T> | null {
  const entry = memorySnapshots.get(key)
  if (!entry) return null
  return entry as SnapshotEntry<T>
}

export function writeMemorySnapshot<T>(entry: SnapshotEntry<T>): void {
  memorySnapshots.set(entry.key, entry as SnapshotEntry<unknown>)
}

export function deleteMemorySnapshot(key: string): void {
  memorySnapshots.delete(key)
}

export async function readSnapshot<T>(key: string): Promise<SnapshotEntry<T> | null> {
  if (!hasIndexedDb()) {
    return readMemorySnapshot<T>(key)
  }

  try {
    const db = await getDb()
    const record = await new Promise<SnapshotRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)
      request.addEventListener("error", () => reject(request.error))
      request.addEventListener("success", () => resolve((request.result as SnapshotRecord) ?? null))
    })

    if (!record) return null
    if (record.serializerVersion !== SERIALIZER_VERSION) {
      await deleteSnapshot(key)
      return null
    }
    const data = superjson.parse<T>(record.payload)
    return { key: record.key, data, timestamp: record.timestamp }
  } catch {
    return null
  }
}

export async function writeSnapshot<T>(entry: SnapshotEntry<T>): Promise<void> {
  writeMemorySnapshot(entry)
  if (!hasIndexedDb()) return
  try {
    const db = await getDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const request = store.put({
        key: entry.key,
        payload: superjson.stringify(entry.data),
        timestamp: entry.timestamp,
        serializerVersion: SERIALIZER_VERSION,
      } satisfies SnapshotRecord)
      request.addEventListener("error", () => reject(request.error))
      request.addEventListener("success", () => resolve())
    })
  } catch {
    // ignore persistence errors
  }
}

export async function deleteSnapshot(key: string): Promise<void> {
  deleteMemorySnapshot(key)
  if (!hasIndexedDb()) return
  try {
    const db = await getDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(key)
      request.addEventListener("error", () => reject(request.error))
      request.addEventListener("success", () => resolve())
    })
  } catch {
    // ignore persistence errors
  }
}
