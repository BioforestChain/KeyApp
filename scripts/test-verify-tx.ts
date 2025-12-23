#!/usr/bin/env tsx
/**
 * Verify transaction signature
 */

import { createSignatureTransaction } from '../src/services/bioforest-sdk'

const TEST_MNEMONIC = '董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆'
const NEW_PAY_PASSWORD = 'TestPayPassword123'
const RPC_URL = 'https://walletapi.bfmeta.info'
const CHAIN_ID = 'bfm'

async function main() {
  console.log('Creating transaction...')
  
  const transaction = await createSignatureTransaction({
    rpcUrl: RPC_URL,
    chainId: CHAIN_ID,
    mainSecret: TEST_MNEMONIC,
    newPaySecret: NEW_PAY_PASSWORD,
    fee: '10000',
  })
  
  console.log('\nTransaction details:')
  console.log(JSON.stringify(transaction, null, 2))
  
  // Load SDK to verify
  const { getBioforestCore } = await import('../src/services/bioforest-sdk')
  const core = await getBioforestCore()
  
  // Verify sender matches
  const keypair = await core.accountBaseHelper().createSecretKeypair(TEST_MNEMONIC)
  const address = await core.accountBaseHelper().getAddressFromPublicKey(keypair.publicKey)
  const publicKeyHex = keypair.publicKey.toString('hex')
  
  console.log('\nVerification:')
  console.log(`  Expected senderId: ${address}`)
  console.log(`  Actual senderId: ${transaction.senderId}`)
  console.log(`  Match: ${address === transaction.senderId}`)
  console.log(`  Expected senderPublicKey: ${publicKeyHex}`)
  console.log(`  Actual senderPublicKey: ${transaction.senderPublicKey}`)
  console.log(`  Match: ${publicKeyHex === transaction.senderPublicKey}`)
  
  // Check signature asset
  const secondPubKey = await core.accountBaseHelper().getPublicKeyStringFromSecondSecretV2(
    TEST_MNEMONIC,
    NEW_PAY_PASSWORD
  )
  console.log(`  Expected signature.publicKey: ${secondPubKey}`)
  console.log(`  Actual signature.publicKey: ${transaction.asset.signature.publicKey}`)
  console.log(`  Match: ${secondPubKey === transaction.asset.signature.publicKey}`)
}

main().catch(console.error)
