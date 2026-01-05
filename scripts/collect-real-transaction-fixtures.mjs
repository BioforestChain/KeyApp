import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(
  ROOT_DIR,
  'src/services/chain-adapter/providers/__tests__/fixtures/real'
)

function writeJson(fileName, data) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, fileName), JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('[fixtures] wrote', fileName)
}

async function fetchJson(url, init) {
  const args = ['-sS']
  const method = init?.method ?? 'GET'
  if (method && method !== 'GET') {
    args.push('-X', method)
  }

  const headers = init?.headers ?? {}
  for (const [key, value] of Object.entries(headers)) {
    args.push('-H', `${key}: ${value}`)
  }

  if (init?.body) {
    args.push('-d', typeof init.body === 'string' ? init.body : String(init.body))
  }

  args.push(url)
  const stdout = execFileSync('curl', args, { encoding: 'utf8' })
  return JSON.parse(stdout)
}

async function fetchEvmAccountAction(baseUrl, action, address, { page = 1, offset = 100, sort = 'desc' } = {}) {
  const params = new URLSearchParams({
    module: 'account',
    action,
    address,
    page: String(page),
    offset: String(offset),
    sort,
  })
  const url = `${baseUrl}?${params.toString()}`
  return { url, json: await fetchJson(url) }
}

async function findFirstEvmTx({ baseUrl, address, predicate, maxPages = 10, offset = 100 }) {
  for (let page = 1; page <= maxPages; page++) {
    const { url, json } = await fetchEvmAccountAction(baseUrl, 'txlist', address, { page, offset })
    const list = Array.isArray(json?.result) ? json.result : []
    for (const tx of list) {
      if (predicate(tx)) {
        return { url, tx }
      }
    }
  }
  return null
}

async function findFirstEvmTokenTx({ baseUrl, address, predicate, maxPages = 10, offset = 100 }) {
  for (let page = 1; page <= maxPages; page++) {
    const { url, json } = await fetchEvmAccountAction(baseUrl, 'tokentx', address, { page, offset })
    const list = Array.isArray(json?.result) ? json.result : []
    for (const tx of list) {
      if (predicate(tx)) {
        return { url, tx }
      }
    }
  }
  return null
}

async function main() {
  const ethBlockscout = 'https://eth.blockscout.com/api'

  // EVM (Ethereum) - try to collect swap + approve + native transfer + token transfer
  const evmContractCaller = '0xc00eb08fef86e5f74b692813f31bb5957eaa045c'
  const evmNativeReceiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

  const swap = await findFirstEvmTx({
    baseUrl: ethBlockscout,
    address: evmContractCaller,
    predicate: (tx) => typeof tx?.input === 'string' && (
      tx.input.startsWith('0x38ed1739') || // swapExactTokensForTokens
      tx.input.startsWith('0x7ff36ab5') || // swapExactETHForTokens
      tx.input.startsWith('0x18cbafe5')    // swapExactTokensForETH
    ),
  })
  if (swap) {
    writeJson('eth-blockscout-native-swap-tx.json', { sourceUrl: swap.url, tx: swap.tx })
  }

  const approve = await findFirstEvmTx({
    baseUrl: ethBlockscout,
    address: evmContractCaller,
    predicate: (tx) => typeof tx?.input === 'string' && tx.input.startsWith('0x095ea7b3'),
  })
  if (approve) {
    writeJson('eth-blockscout-native-approve-tx.json', { sourceUrl: approve.url, tx: approve.tx })
  }

  const nativeTransfer = await findFirstEvmTx({
    baseUrl: ethBlockscout,
    address: evmNativeReceiver,
    predicate: (tx) => typeof tx?.value === 'string' && tx.value !== '0' && (tx.input === '0x' || tx.input === '0x0' || tx.input === '0x00'),
  })
  if (nativeTransfer) {
    writeJson('eth-blockscout-native-transfer-tx.json', { sourceUrl: nativeTransfer.url, tx: nativeTransfer.tx })
  }

  const tokenTransfer = await findFirstEvmTokenTx({
    baseUrl: ethBlockscout,
    address: evmNativeReceiver,
    predicate: (tx) => typeof tx?.tokenSymbol === 'string' && typeof tx?.value === 'string',
  })
  if (tokenTransfer) {
    writeJson('eth-blockscout-token-transfer-tx.json', { sourceUrl: tokenTransfer.url, tx: tokenTransfer.tx })
  }

  // BioForest (BFMeta) - collect transferAsset transaction
  const bfmetaAddress = 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'
  const bfmetaBase = 'https://walletapi.bfmeta.info/wallet/bfm'

  const lastblock = await fetchJson(`${bfmetaBase}/lastblock`)
  writeJson('bfmeta-lastblock.json', lastblock)

  const maxHeight = lastblock?.result?.height ?? 0
  const bfmetaQuery = await fetchJson(`${bfmetaBase}/transactions/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxHeight, address: bfmetaAddress, limit: 30 }),
  })
  writeJson('bfmeta-transactions-query.json', bfmetaQuery)

  // BSC (walletapi) - tx history sample
  const bscAddress = '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3'
  const bscBase = 'https://walletapi.bfmeta.info/wallet/bsc'
  const bscHistory = await fetchJson(`${bscBase}/trans/normal/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: bscAddress, page: 1, offset: 20 }),
  })
  writeJson('bsc-transactions-history.json', bscHistory)

  // BTC (mempool.space) - tx list sample
  const btcAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
  const btcTxs = await fetchJson(`https://mempool.space/api/address/${btcAddress}/txs`)
  writeJson('btc-mempool-address-txs.json', Array.isArray(btcTxs) ? btcTxs.slice(0, 1) : btcTxs)

  // TRON (trongrid) - tx list sample
  const tronAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
  const tronTxs = await fetchJson(`https://api.trongrid.io/v1/accounts/${tronAddress}/transactions?limit=20`)
  if (tronTxs && Array.isArray(tronTxs.data)) {
    writeJson('tron-trongrid-account-txs.json', { ...tronTxs, data: tronTxs.data.slice(0, 3) })
  } else {
    writeJson('tron-trongrid-account-txs.json', tronTxs)
  }

  console.log('[fixtures] done')
}

main().catch((error) => {
  console.error('[fixtures] failed:', error)
  process.exitCode = 1
})
