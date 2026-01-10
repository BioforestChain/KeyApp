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

  // BIW (BIWMeta) - collect provided real signatures
  const biwmetaBase = 'https://walletapi.bfmeta.info/wallet/biwmeta'
  const biwmetaLastblock = await fetchJson(`${biwmetaBase}/lastblock`)
  writeJson('biwmeta-lastblock.json', biwmetaLastblock)

  const biwmetaMaxHeight = biwmetaLastblock?.result?.height ?? 0
  const biwmetaSignatures = [
    {
      file: 'biwmeta-bse-01-signature.json',
      signature:
        'eb85d4ef1303f900815fd23098c4837b2576f27c776afb599574a6d5b0c10c1fd230cbf8613a76ac48988deb0e70c3ea6b2fcf58745771d0ca16832f24e83e0c',
    },
    {
      file: 'biwmeta-ast-03-destroyAsset.json',
      signature:
        '3c96dfa4f6579ed753549df27653e762780c40c0a1f959cfa18655095ca975666ddc2aa151f179d78fd1fe27b0d7de82ba13edcef4bd53d7768399d848c94c07',
    },
    {
      file: 'biwmeta-ety-02-issueEntity.json',
      signature:
        '287c40e7e68cddde48cd7158872744ad2dc772153599e61cac0311d5f0bfa0f38f4c9e81023ee21adf8cc243e6daf0fd059525dccf1f78d464f8fe7dd9785905',
    },
    {
      file: 'biwmeta-ety-01-issueEntityFactory.json',
      signature:
        '6160e4827b0fb7758e54f74cf906fbc6de5b6c9f803e0bf5dd39260a187fb0623600bc9a44de788cfc476f36eea0513244f550ed123aff0fbe8c84becf458206',
    },
    {
      file: 'biwmeta-ast-02-transferAsset.json',
      signature:
        'ae1f5de56b79822954e3da0090cecc20e5af603cf6737e4f57cdd667e66c170f2fcb566f43053c163b755dd62847c22ee49996664c188f1361ab170924ecf202',
    },
  ]

  for (const { file, signature } of biwmetaSignatures) {
    const result = await fetchJson(`${biwmetaBase}/transactions/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxHeight: biwmetaMaxHeight, signature, limit: 5 }),
    })
    writeJson(file, result)
  }

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
