/**
 * Tron-specific types
 */

/** Tron account info from API */
export interface TronAccount {
  address: string
  balance: number
  create_time: number
  latest_opration_time?: number
  account_resource?: {
    energy_usage?: number
    frozen_balance_for_energy?: number
  }
}

/** Tron block info */
export interface TronBlock {
  blockID: string
  block_header: {
    raw_data: {
      number: number
      txTrieRoot: string
      witness_address: string
      parentHash: string
      timestamp: number
    }
  }
}

/** Raw transaction from Tron API */
export interface TronRawTransaction {
  txID: string
  raw_data: {
    contract: Array<{
      parameter: {
        value: {
          amount: number
          owner_address: string
          to_address: string
        }
        type_url: string
      }
      type: string
    }>
    ref_block_bytes: string
    ref_block_hash: string
    expiration: number
    timestamp: number
  }
  raw_data_hex: string
}

/** Signed transaction ready for broadcast */
export interface TronSignedTransaction extends TronRawTransaction {
  signature: string[]
}

/** Transaction info from API */
export interface TronTransactionInfo {
  id: string
  blockNumber: number
  blockTimeStamp: number
  contractResult: string[]
  receipt: {
    net_usage?: number
    energy_usage?: number
  }
}

/** Account resource info */
export interface TronAccountResource {
  freeNetLimit: number
  freeNetUsed?: number
  NetLimit?: number
  NetUsed?: number
  EnergyLimit?: number
  EnergyUsed?: number
}
