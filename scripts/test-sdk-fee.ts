#!/usr/bin/env tsx
import { getSignatureTransactionMinFee } from '../src/services/bioforest-sdk/index'

async function main() {
  try {
    console.log('Testing SDK fee calculation...')
    const fee = await getSignatureTransactionMinFee('https://walletapi.bfmeta.info', 'bfm')
    console.log('Signature Transaction Min Fee:', fee)
    console.log('Formatted:', (BigInt(fee) / BigInt(100000000)).toString(), 'BFM')
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  }
}

main()
