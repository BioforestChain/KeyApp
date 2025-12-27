/**
 * Bitcoin-specific types
 */

/** UTXO from mempool.space API */
export interface BitcoinUtxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
  value: number
}

/** Address info from mempool.space API */
export interface BitcoinAddressInfo {
  address: string
  chain_stats: {
    funded_txo_count: number
    funded_txo_sum: number
    spent_txo_count: number
    spent_txo_sum: number
    tx_count: number
  }
  mempool_stats: {
    funded_txo_count: number
    funded_txo_sum: number
    spent_txo_count: number
    spent_txo_sum: number
    tx_count: number
  }
}

/** Transaction from mempool.space API */
export interface BitcoinTransaction {
  txid: string
  version: number
  locktime: number
  vin: Array<{
    txid: string
    vout: number
    prevout: {
      scriptpubkey: string
      scriptpubkey_address: string
      value: number
    }
    scriptsig: string
    sequence: number
  }>
  vout: Array<{
    scriptpubkey: string
    scriptpubkey_address: string
    value: number
  }>
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
}

/** Fee estimates from mempool.space API */
export interface BitcoinFeeEstimates {
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
}

/** Bitcoin address types */
export type BitcoinAddressType = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2tr'

/** Unsigned Bitcoin transaction data */
export interface BitcoinUnsignedTx {
  inputs: Array<{
    txid: string
    vout: number
    value: number
    scriptPubKey: string
  }>
  outputs: Array<{
    address: string
    value: number
  }>
  fee: number
  changeAddress: string
}
