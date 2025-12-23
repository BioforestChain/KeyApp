#!/usr/bin/env tsx
/**
 * Test Setting Pay Password (二次签名)
 *
 * This script performs a REAL transaction to set pay password.
 * WARNING: This will consume BFM from the test account!
 *
 * Test Account:
 * - Mnemonic: 董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆
 * - Address: b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx
 */

import { BioForestApiClient } from '../src/services/bioforest-api'
import {
  createSignatureTransaction,
  broadcastTransaction,
  getSignatureTransactionMinFee,
} from '../src/services/bioforest-sdk'

// Test configuration
const TEST_MNEMONIC = '董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆'
const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'
const NEW_PAY_PASSWORD = 'TestPayPassword123'

const RPC_URL = 'https://walletapi.bfmeta.info'
const CHAIN_ID = 'bfm'

// Create API client
const client = new BioForestApiClient({
  rpcUrl: RPC_URL,
  chainId: CHAIN_ID,
})

async function main() {
  console.log('═'.repeat(60))
  console.log('Set Pay Password (二次签名) - REAL TRANSACTION')
  console.log('═'.repeat(60))
  console.log(`Address: ${TEST_ADDRESS}`)
  console.log(`New Pay Password: ${NEW_PAY_PASSWORD}`)
  console.log('═'.repeat(60))

  // Step 1: Check current status
  console.log('\n📋 Step 1: Check current status')
  const addressInfo = await client.getAddressInfo(TEST_ADDRESS)
  const balance = await client.getBalance(TEST_ADDRESS, 'BFM')

  console.log(`   Balance: ${BioForestApiClient.formatAmount(balance.amount)} BFM`)
  console.log(`   Second Public Key: ${addressInfo.secondPublicKey || '(not set)'}`)

  if (addressInfo.secondPublicKey) {
    console.log('\n⚠️ Pay password is already set! Cannot set again.')
    console.log('   Each account can only set pay password once.')
    process.exit(0)
  }

  // Step 2: Calculate fee (use 10x minimum to ensure acceptance)
  console.log('\n💰 Step 2: Calculate fee')
  const minFee = await getSignatureTransactionMinFee(RPC_URL, CHAIN_ID)
  const actualFee = String(BigInt(minFee) * BigInt(100)) // 100x minimum fee
  console.log(`   Min Fee: ${BioForestApiClient.formatAmount(minFee)} BFM (raw: ${minFee})`)
  console.log(`   Using Fee: ${BioForestApiClient.formatAmount(actualFee)} BFM (raw: ${actualFee})`)

  // Check if we have enough balance
  const balanceNum = BigInt(balance.amount)
  const feeNum = BigInt(actualFee)
  if (balanceNum < feeNum) {
    console.log(`\n❌ Insufficient balance! Need at least ${BioForestApiClient.formatAmount(actualFee)} BFM`)
    process.exit(1)
  }

  // Step 3: Create transaction
  console.log('\n🔧 Step 3: Create signature transaction')
  const transaction = await createSignatureTransaction({
    rpcUrl: RPC_URL,
    chainId: CHAIN_ID,
    mainSecret: TEST_MNEMONIC,
    newPaySecret: NEW_PAY_PASSWORD,
    fee: actualFee,
  })

  console.log(`   Transaction Type: ${transaction.type}`)
  console.log(`   Fee: ${BioForestApiClient.formatAmount(transaction.fee)} BFM`)
  console.log(`   Signature: ${transaction.signature.slice(0, 32)}...`)

  // Step 4: Broadcast transaction
  console.log('\n📡 Step 4: Broadcast transaction')
  console.log('   Transaction JSON:')
  console.log(JSON.stringify(transaction, null, 2).split('\n').slice(0, 20).join('\n'))
  console.log('   ...')
  
  // Broadcast via wallet API
  console.log(`   Broadcasting to: ${RPC_URL}`)
  
  const response = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/transactions/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })
  const result = await response.json()
  console.log('   Full broadcast response:', JSON.stringify(result, null, 2).slice(0, 500))
  
  if (!result.success) {
    console.log('   ❌ Broadcast failed')
    process.exit(1)
  }
  
  console.log('   ✅ Broadcast successful!')
  console.log(`   Transaction Hash: ${transaction.signature.slice(0, 32)}...`)
  
  // Wait a bit then check pending
  console.log('\n⏳ Checking pending status in 5 seconds...')
  await new Promise(r => setTimeout(r, 5000))
  
  const pendingRes = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/pendingTr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId: TEST_ADDRESS }),
  })
  const pending = await pendingRes.json() as { success: boolean; result: Array<{ state: number; failReason: string }> }
  if (pending.result?.length > 0) {
    console.log(`   Pending state: ${pending.result[0].state}`)
    console.log(`   Fail reason: ${pending.result[0].failReason || '(none)'}`)
  } else {
    console.log('   No pending transactions (may have been processed)')
  }

  // Step 5: Wait and verify
  console.log('\n⏳ Step 5: Wait for confirmation (20 seconds)...')
  await new Promise((resolve) => setTimeout(resolve, 20000))

  console.log('\n🔍 Step 6: Verify pay password is set')
  const newInfo = await client.getAddressInfo(TEST_ADDRESS)

  if (newInfo.secondPublicKey) {
    console.log('   ✅ Pay password successfully set!')
    console.log(`   Second Public Key: ${newInfo.secondPublicKey.slice(0, 32)}...`)
  } else {
    console.log('   ⏳ Transaction may still be pending...')
    console.log('   Wait a few more blocks and check again.')
  }

  console.log('\n' + '═'.repeat(60))
  console.log('Test Complete')
  console.log('═'.repeat(60))
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
