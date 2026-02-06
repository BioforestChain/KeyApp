import type { Plugin, ResolvedConfig } from 'vite'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

type JsonObject = Record<string, unknown>

interface PruneGenesisTransactionsOptions {
  /** 是否启用（默认 true） */
  enabled?: boolean
  /** dist 下的 genesis 目录（默认 configs/genesis） */
  genesisDir?: string
  /** 交易中要保留的字段（默认仅保留 type/senderId，避免运行期依赖断裂） */
  keepTransactionFields?: readonly string[]
}

interface PruneResult {
  changed: boolean
  prunedTransactions: number
}

function asObject(value: unknown): JsonObject | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as JsonObject
}

function isSameObject(left: JsonObject, right: JsonObject): boolean {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }
  return leftKeys.every((key) => Object.is(left[key], right[key]))
}

function pickTransactionFields(transaction: unknown, keepFields: readonly string[]): JsonObject {
  const tx = asObject(transaction)
  if (!tx) {
    return {}
  }

  const next: JsonObject = {}
  for (const field of keepFields) {
    if (field in tx) {
      next[field] = tx[field]
    }
  }
  return next
}

export function pruneGenesisTransactions(
  genesis: JsonObject,
  keepTransactionFields: readonly string[],
): PruneResult {
  let changed = false
  let prunedTransactions = 0

  const transactionInfo = asObject(genesis.transactionInfo)
  if (transactionInfo) {
    const transactionInBlocks = transactionInfo.transactionInBlocks
    if (Array.isArray(transactionInBlocks)) {
      const nextTransactionInBlocks = transactionInBlocks.map((entry) => {
        const entryObject = asObject(entry)
        if (!entryObject) {
          return entry
        }

        if ('transaction' in entryObject) {
          const nextTransaction = pickTransactionFields(entryObject.transaction, keepTransactionFields)
          const currentTransaction = asObject(entryObject.transaction)

          if (!currentTransaction || !isSameObject(currentTransaction, nextTransaction)) {
            changed = true
            prunedTransactions += 1
            return {
              ...entryObject,
              transaction: nextTransaction,
            }
          }

          return entry
        }

        if (Array.isArray(entryObject.transactions) && entryObject.transactions.length > 0) {
          changed = true
          prunedTransactions += entryObject.transactions.length
          return {
            ...entryObject,
            transactions: [],
          }
        }

        return entry
      })

      if (changed) {
        transactionInfo.transactionInBlocks = nextTransactionInBlocks
      }
    }

    if (Array.isArray(transactionInfo.transactions) && transactionInfo.transactions.length > 0) {
      changed = true
      prunedTransactions += transactionInfo.transactions.length
      transactionInfo.transactions = []
    }
  }

  if (Array.isArray(genesis.transactions) && genesis.transactions.length > 0) {
    changed = true
    prunedTransactions += genesis.transactions.length
    genesis.transactions = []
  }

  return {
    changed,
    prunedTransactions,
  }
}

export function pruneGenesisTransactionsPlugin(options: PruneGenesisTransactionsOptions = {}): Plugin {
  const {
    enabled = true,
    genesisDir = 'configs/genesis',
    keepTransactionFields = ['type', 'senderId'],
  } = options

  let config: ResolvedConfig | undefined
  let outputDir = 'dist'

  return {
    name: 'vite-plugin-prune-genesis-transactions',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    writeBundle(outputOptions) {
      outputDir = outputOptions.dir ?? outputDir
    },

    closeBundle() {
      if (!enabled || !config) {
        return
      }

      const distGenesisDir = resolve(config.root, outputDir, genesisDir)
      if (!existsSync(distGenesisDir)) {
        return
      }

      const genesisFiles = readdirSync(distGenesisDir).filter((file) => file.endsWith('.json'))
      if (genesisFiles.length === 0) {
        return
      }

      let changedFiles = 0
      let prunedTransactions = 0
      let bytesSaved = 0

      for (const file of genesisFiles) {
        const filePath = join(distGenesisDir, file)
        const raw = readFileSync(filePath, 'utf-8')

        let parsed: unknown
        try {
          parsed = JSON.parse(raw)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'unknown error'
          console.warn(`[genesis-prune] Skip invalid JSON: ${file} (${message})`)
          continue
        }

        const genesis = asObject(parsed)
        if (!genesis) {
          continue
        }

        const result = pruneGenesisTransactions(genesis, keepTransactionFields)
        if (!result.changed) {
          continue
        }

        const nextRaw = `${JSON.stringify(genesis, null, 2)}\n`
        writeFileSync(filePath, nextRaw)

        changedFiles += 1
        prunedTransactions += result.prunedTransactions
        bytesSaved += Buffer.byteLength(raw) - Buffer.byteLength(nextRaw)
      }

      if (changedFiles > 0) {
        console.log(
          `[genesis-prune] Processed ${changedFiles}/${genesisFiles.length} files, ` +
            `pruned ${prunedTransactions} transactions, saved ${Math.max(bytesSaved, 0)} bytes`,
        )
      }
    },
  }
}

export default pruneGenesisTransactionsPlugin
