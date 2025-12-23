#!/usr/bin/env tsx
/**
 * Test Setting Pay Password (二次签名)
 *
 * This script tests checking pay password status and provides
 * the information needed for setting it through the UI.
 *
 * Note: SDK requires complete genesis block config with milestones.
 * For production, use the UI flow instead of this script.
 *
 * Test Account:
 * - Mnemonic: 董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆
 * - Address: b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx
 */

import { BioForestApiClient } from '../src/services/bioforest-api'

// Test configuration
const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'

const RPC_URL = 'https://walletapi.bfmeta.info'
const CHAIN_ID = 'bfm'

// Create API client
const client = new BioForestApiClient({
  rpcUrl: RPC_URL,
  chainId: CHAIN_ID,
})

async function main() {
  console.log('═'.repeat(60))
  console.log('Pay Password (二次签名) Status Check')
  console.log('═'.repeat(60))
  console.log(`Address: ${TEST_ADDRESS}`)
  console.log('═'.repeat(60))

  // Check current status
  console.log('\n📋 Checking account status...')
  const addressInfo = await client.getAddressInfo(TEST_ADDRESS)
  const balance = await client.getBalance(TEST_ADDRESS, 'BFM')
  const block = await client.getLastBlock()

  console.log(`\n   Balance: ${BioForestApiClient.formatAmount(balance.amount)} BFM`)
  console.log(`   Block Height: ${block.height}`)
  console.log(`   Account Status: ${addressInfo.accountStatus}`)
  console.log(`   Second Public Key: ${addressInfo.secondPublicKey || '(not set)'}`)

  if (addressInfo.secondPublicKey) {
    console.log('\n✅ Pay password is already set!')
    console.log('   This account has a second signature configured.')
    console.log('   All transactions will require the pay password.')
  } else {
    console.log('\n⚠️ Pay password is NOT set!')
    console.log('   To set pay password:')
    console.log('   1. Go to Settings > Security')
    console.log('   2. Tap "Set Pay Password"')
    console.log('   3. Enter your new pay password twice')
    console.log('   4. Enter your wallet password to confirm')
    console.log('')
    console.log('   Required fee: ~0.0001 BFM (estimated)')
    console.log(`   Current balance: ${BioForestApiClient.formatAmount(balance.amount)} BFM`)

    const hasEnoughBalance = BigInt(balance.amount) >= BigInt(10000) // 0.0001 BFM
    if (hasEnoughBalance) {
      console.log('   ✅ Balance is sufficient')
    } else {
      console.log('   ❌ Insufficient balance - need at least 0.0001 BFM')
    }
  }

  // Get transaction history
  console.log('\n📜 Recent transactions:')
  const history = await client.getTransactionHistory(TEST_ADDRESS, { pageSize: 3 })
  if (history.trs && history.trs.length > 0) {
    history.trs.forEach((item, i) => {
      const tx = item.transaction
      const isIncoming = tx.recipientId === TEST_ADDRESS
      console.log(`   [${i + 1}] ${isIncoming ? '←' : '→'} ${tx.type}`)
      console.log(`       ${isIncoming ? 'From' : 'To'}: ${isIncoming ? tx.senderId : tx.recipientId}`)
      console.log(`       Height: ${item.height}`)
    })
  } else {
    console.log('   No transactions found')
  }

  console.log('\n' + '═'.repeat(60))
  console.log('Status Check Complete')
  console.log('═'.repeat(60))
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
