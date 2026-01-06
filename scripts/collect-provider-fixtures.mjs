#!/usr/bin/env node
/**
 * 从真实 Provider API 收集数据用于 E2E 测试 fixtures
 * 
 * 使用 Storybook 中配置的真实地址拉取：
 * - 余额数据
 * - 交易历史
 * 
 * 运行: node scripts/collect-provider-fixtures.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Storybook 中的真实地址
const REAL_ADDRESSES = {
  ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
  tron: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Satoshi
  binance: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
}

// Provider API endpoints
const PROVIDERS = {
  ethereum: {
    rpc: 'https://ethereum-rpc.publicnode.com',
    blockscout: 'https://eth.blockscout.com/api',
    ethwallet: 'https://walletapi.bfmeta.info/wallet/eth',
  },
  tron: {
    rpc: 'https://api.trongrid.io',
    tronwallet: 'https://walletapi.bfmeta.info/wallet/tron',
  },
  bitcoin: {
    mempool: 'https://mempool.space/api',
    btcwallet: 'https://walletapi.bfmeta.info/wallet/btc',
  },
  binance: {
    rpc: 'https://bsc-dataseed.binance.org',
    bscwallet: 'https://walletapi.bfmeta.info/wallet/bsc',
  },
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// Ethereum RPC balance
async function fetchEthereumRpcBalance(address) {
  const result = await fetchJson(PROVIDERS.ethereum.rpc, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  })
  return {
    provider: 'ethereum-rpc',
    chain: 'ethereum',
    address,
    balance: result.result,
    balanceDecimal: parseInt(result.result, 16) / 1e18,
    symbol: 'ETH',
    decimals: 18,
  }
}

// Blockscout balance
async function fetchBlockscoutBalance(address) {
  const url = `${PROVIDERS.ethereum.blockscout}?module=account&action=balance&address=${address}`
  const result = await fetchJson(url)
  return {
    provider: 'blockscout-v1',
    chain: 'ethereum',
    address,
    balance: result.result,
    balanceDecimal: parseInt(result.result) / 1e18,
    symbol: 'ETH',
    decimals: 18,
  }
}

// Blockscout transactions
async function fetchBlockscoutTransactions(address) {
  const url = `${PROVIDERS.ethereum.blockscout}?module=account&action=txlist&address=${address}&page=1&offset=10&sort=desc`
  const result = await fetchJson(url)
  return {
    provider: 'blockscout-v1',
    chain: 'ethereum',
    address,
    transactions: result.result?.slice(0, 10) || [],
  }
}

// WalletAPI balance
async function fetchWalletApiBalance(chain, address) {
  const endpoints = {
    ethereum: PROVIDERS.ethereum.ethwallet,
    tron: PROVIDERS.tron.tronwallet,
    bitcoin: PROVIDERS.bitcoin.btcwallet,
    binance: PROVIDERS.binance.bscwallet,
  }
  const url = `${endpoints[chain]}/balance/${address}`
  try {
    const result = await fetchJson(url)
    return {
      provider: `${chain}wallet-v1`,
      chain,
      address,
      ...result,
    }
  } catch (e) {
    return { provider: `${chain}wallet-v1`, chain, address, error: e.message }
  }
}

// WalletAPI transactions
async function fetchWalletApiTransactions(chain, address) {
  const endpoints = {
    ethereum: PROVIDERS.ethereum.ethwallet,
    tron: PROVIDERS.tron.tronwallet,
    bitcoin: PROVIDERS.bitcoin.btcwallet,
    binance: PROVIDERS.binance.bscwallet,
  }
  const url = `${endpoints[chain]}/transactions/${address}?limit=10`
  try {
    const result = await fetchJson(url)
    return {
      provider: `${chain}wallet-v1`,
      chain,
      address,
      transactions: Array.isArray(result) ? result : result.transactions || [],
    }
  } catch (e) {
    return { provider: `${chain}wallet-v1`, chain, address, error: e.message, transactions: [] }
  }
}

// Mempool.space Bitcoin
async function fetchMempoolBalance(address) {
  const url = `${PROVIDERS.bitcoin.mempool}/address/${address}`
  const result = await fetchJson(url)
  const balance = (result.chain_stats?.funded_txo_sum || 0) - (result.chain_stats?.spent_txo_sum || 0)
  return {
    provider: 'mempool-v1',
    chain: 'bitcoin',
    address,
    balance: balance.toString(),
    balanceDecimal: balance / 1e8,
    symbol: 'BTC',
    decimals: 8,
  }
}

async function fetchMempoolTransactions(address) {
  const url = `${PROVIDERS.bitcoin.mempool}/address/${address}/txs`
  const result = await fetchJson(url)
  return {
    provider: 'mempool-v1',
    chain: 'bitcoin',
    address,
    transactions: result.slice(0, 10),
  }
}

// Tron RPC balance
async function fetchTronBalance(address) {
  const url = `${PROVIDERS.tron.rpc}/v1/accounts/${address}`
  try {
    const result = await fetchJson(url)
    const balance = result.data?.[0]?.balance || 0
    return {
      provider: 'tron-rpc',
      chain: 'tron',
      address,
      balance: balance.toString(),
      balanceDecimal: balance / 1e6,
      symbol: 'TRX',
      decimals: 6,
    }
  } catch (e) {
    return { provider: 'tron-rpc', chain: 'tron', address, error: e.message }
  }
}

// Tron RPC transactions
async function fetchTronTransactions(address) {
  const url = `${PROVIDERS.tron.rpc}/v1/accounts/${address}/transactions?limit=10`
  try {
    const result = await fetchJson(url)
    return {
      provider: 'tron-rpc',
      chain: 'tron',
      address,
      transactions: result.data || [],
    }
  } catch (e) {
    return { provider: 'tron-rpc', chain: 'tron', address, error: e.message, transactions: [] }
  }
}

// Etherscan transactions (using V2 API)
async function fetchEtherscanTransactions(address) {
  const apiKey = 'UN6TIKGANUFRYYPNSD1SCHRAZ3NABF52XS'
  // V2 API endpoint
  const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
  try {
    const result = await fetchJson(url)
    return {
      provider: 'etherscan-v2',
      chain: 'ethereum',
      address,
      transactions: result.result?.slice(0, 10) || [],
    }
  } catch (e) {
    return { provider: 'etherscan-v2', chain: 'ethereum', address, error: e.message, transactions: [] }
  }
}

// BSCScan transactions (using V2 API via Etherscan)
async function fetchBscScanTransactions(address) {
  const apiKey = 'UN6TIKGANUFRYYPNSD1SCHRAZ3NABF52XS'
  // V2 API endpoint with chainid=56 for BSC
  const url = `https://api.etherscan.io/v2/api?chainid=56&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
  try {
    const result = await fetchJson(url)
    return {
      provider: 'bscscan-v2',
      chain: 'binance',
      address,
      transactions: result.result?.slice(0, 10) || [],
    }
  } catch (e) {
    return { provider: 'bscscan-v2', chain: 'binance', address, error: e.message, transactions: [] }
  }
}

// BSC RPC balance
async function fetchBscBalance(address) {
  const result = await fetchJson(PROVIDERS.binance.rpc, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  })
  return {
    provider: 'bsc-rpc',
    chain: 'binance',
    address,
    balance: result.result,
    balanceDecimal: parseInt(result.result, 16) / 1e18,
    symbol: 'BNB',
    decimals: 18,
  }
}

async function collectAllFixtures() {
  console.log('Collecting provider fixtures from real APIs...\n')
  
  const fixtures = {
    version: 1,
    collectedAt: new Date().toISOString(),
    addresses: REAL_ADDRESSES,
    balances: [],
    transactions: [],
  }

  // Ethereum
  console.log('📦 Ethereum...')
  try {
    const ethRpc = await fetchEthereumRpcBalance(REAL_ADDRESSES.ethereum)
    console.log(`  ✓ ethereum-rpc: ${ethRpc.balanceDecimal} ETH`)
    fixtures.balances.push(ethRpc)
  } catch (e) {
    console.log(`  ✗ ethereum-rpc: ${e.message}`)
  }

  try {
    const blockscout = await fetchBlockscoutBalance(REAL_ADDRESSES.ethereum)
    console.log(`  ✓ blockscout: ${blockscout.balanceDecimal} ETH`)
    fixtures.balances.push(blockscout)
  } catch (e) {
    console.log(`  ✗ blockscout: ${e.message}`)
  }

  try {
    const blockscoutTx = await fetchBlockscoutTransactions(REAL_ADDRESSES.ethereum)
    console.log(`  ✓ blockscout txs: ${blockscoutTx.transactions.length} transactions`)
    fixtures.transactions.push(blockscoutTx)
  } catch (e) {
    console.log(`  ✗ blockscout txs: ${e.message}`)
  }

  try {
    const ethwallet = await fetchWalletApiBalance('ethereum', REAL_ADDRESSES.ethereum)
    console.log(`  ✓ ethwallet: ${JSON.stringify(ethwallet).slice(0, 100)}...`)
    fixtures.balances.push(ethwallet)
  } catch (e) {
    console.log(`  ✗ ethwallet: ${e.message}`)
  }

  try {
    const ethwalletTx = await fetchWalletApiTransactions('ethereum', REAL_ADDRESSES.ethereum)
    console.log(`  ✓ ethwallet txs: ${ethwalletTx.transactions?.length || 0} transactions`)
    fixtures.transactions.push(ethwalletTx)
  } catch (e) {
    console.log(`  ✗ ethwallet txs: ${e.message}`)
  }

  try {
    const etherscanTx = await fetchEtherscanTransactions(REAL_ADDRESSES.ethereum)
    console.log(`  ✓ etherscan txs: ${etherscanTx.transactions?.length || 0} transactions`)
    fixtures.transactions.push(etherscanTx)
  } catch (e) {
    console.log(`  ✗ etherscan txs: ${e.message}`)
  }

  // Bitcoin
  console.log('\n📦 Bitcoin...')
  try {
    const mempool = await fetchMempoolBalance(REAL_ADDRESSES.bitcoin)
    console.log(`  ✓ mempool: ${mempool.balanceDecimal} BTC`)
    fixtures.balances.push(mempool)
  } catch (e) {
    console.log(`  ✗ mempool: ${e.message}`)
  }

  try {
    const mempoolTx = await fetchMempoolTransactions(REAL_ADDRESSES.bitcoin)
    console.log(`  ✓ mempool txs: ${mempoolTx.transactions.length} transactions`)
    fixtures.transactions.push(mempoolTx)
  } catch (e) {
    console.log(`  ✗ mempool txs: ${e.message}`)
  }

  try {
    const btcwallet = await fetchWalletApiBalance('bitcoin', REAL_ADDRESSES.bitcoin)
    console.log(`  ✓ btcwallet: ${JSON.stringify(btcwallet).slice(0, 100)}...`)
    fixtures.balances.push(btcwallet)
  } catch (e) {
    console.log(`  ✗ btcwallet: ${e.message}`)
  }

  // Tron
  console.log('\n📦 Tron...')
  try {
    const tron = await fetchTronBalance(REAL_ADDRESSES.tron)
    console.log(`  ✓ tron-rpc: ${tron.balanceDecimal} TRX`)
    fixtures.balances.push(tron)
  } catch (e) {
    console.log(`  ✗ tron-rpc: ${e.message}`)
  }

  try {
    const tronwallet = await fetchWalletApiBalance('tron', REAL_ADDRESSES.tron)
    console.log(`  ✓ tronwallet: ${JSON.stringify(tronwallet).slice(0, 100)}...`)
    fixtures.balances.push(tronwallet)
  } catch (e) {
    console.log(`  ✗ tronwallet: ${e.message}`)
  }

  try {
    const tronwalletTx = await fetchWalletApiTransactions('tron', REAL_ADDRESSES.tron)
    console.log(`  ✓ tronwallet txs: ${tronwalletTx.transactions?.length || 0} transactions`)
    fixtures.transactions.push(tronwalletTx)
  } catch (e) {
    console.log(`  ✗ tronwallet txs: ${e.message}`)
  }

  try {
    const tronRpcTx = await fetchTronTransactions(REAL_ADDRESSES.tron)
    console.log(`  ✓ tron-rpc txs: ${tronRpcTx.transactions?.length || 0} transactions`)
    fixtures.transactions.push(tronRpcTx)
  } catch (e) {
    console.log(`  ✗ tron-rpc txs: ${e.message}`)
  }

  // Binance
  console.log('\n📦 Binance Smart Chain...')
  try {
    const bsc = await fetchBscBalance(REAL_ADDRESSES.binance)
    console.log(`  ✓ bsc-rpc: ${bsc.balanceDecimal} BNB`)
    fixtures.balances.push(bsc)
  } catch (e) {
    console.log(`  ✗ bsc-rpc: ${e.message}`)
  }

  try {
    const bscwallet = await fetchWalletApiBalance('binance', REAL_ADDRESSES.binance)
    console.log(`  ✓ bscwallet: ${JSON.stringify(bscwallet).slice(0, 100)}...`)
    fixtures.balances.push(bscwallet)
  } catch (e) {
    console.log(`  ✗ bscwallet: ${e.message}`)
  }

  try {
    const bscwalletTx = await fetchWalletApiTransactions('binance', REAL_ADDRESSES.binance)
    console.log(`  ✓ bscwallet txs: ${bscwalletTx.transactions?.length || 0} transactions`)
    fixtures.transactions.push(bscwalletTx)
  } catch (e) {
    console.log(`  ✗ bscwallet txs: ${e.message}`)
  }

  try {
    const bscscanTx = await fetchBscScanTransactions(REAL_ADDRESSES.binance)
    console.log(`  ✓ bscscan txs: ${bscscanTx.transactions?.length || 0} transactions`)
    fixtures.transactions.push(bscscanTx)
  } catch (e) {
    console.log(`  ✗ bscscan txs: ${e.message}`)
  }

  // Save fixtures
  const outputPath = path.join(__dirname, '../e2e/fixtures/provider-data/real-provider-data.v1.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(fixtures, null, 2))
  console.log(`\n✅ Saved fixtures to ${outputPath}`)
  console.log(`   - ${fixtures.balances.length} balance records`)
  console.log(`   - ${fixtures.transactions.length} transaction records`)
}

collectAllFixtures().catch(console.error)
