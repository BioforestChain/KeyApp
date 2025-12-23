#!/usr/bin/env tsx
/**
 * Test keypair generation from mnemonic
 */

import { BioForestApiClient } from '../src/services/bioforest-api'

const TEST_MNEMONIC = '董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆'
const EXPECTED_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'

async function main() {
  console.log('Testing keypair generation...')
  console.log(`Mnemonic: ${TEST_MNEMONIC}`)
  console.log(`Expected Address: ${EXPECTED_ADDRESS}`)
  
  // Load SDK
  const { getBioforestCore } = await import('../src/services/bioforest-sdk')
  const core = await getBioforestCore()
  
  // Generate keypair from mnemonic
  const keypair = await core.accountBaseHelper().createSecretKeypair(TEST_MNEMONIC)
  const publicKeyHex = keypair.publicKey.toString('hex')
  const secretKeyHex = keypair.secretKey.toString('hex')
  
  console.log(`\nGenerated keypair:`)
  console.log(`  Public Key: ${publicKeyHex}`)
  console.log(`  Secret Key: ${secretKeyHex.slice(0, 16)}...`)
  
  // Generate address from public key
  const address = await core.accountBaseHelper().getAddressFromPublicKey(keypair.publicKey)
  console.log(`  Generated Address: ${address}`)
  console.log(`  Address matches: ${address === EXPECTED_ADDRESS}`)
  
  // Check on-chain account info
  console.log('\nOn-chain account info:')
  const client = new BioForestApiClient({
    rpcUrl: 'https://walletapi.bfmeta.info',
    chainId: 'bfm',
  })
  const info = await client.getAddressInfo(EXPECTED_ADDRESS)
  console.log(`  On-chain publicKey: ${info.publicKey || '(empty)'}`)
  console.log(`  secondPublicKey: ${info.secondPublicKey || '(not set)'}`)
  
  // Compare
  if (info.publicKey) {
    console.log(`  Public keys match: ${info.publicKey === publicKeyHex}`)
  } else {
    console.log(`  Account has no on-chain publicKey (never sent a transaction)`)
    console.log(`  But the SDK can still generate valid keypair from mnemonic`)
  }
}

main().catch(console.error)
