/**
 * BioForest Chain SDK Types
 * Extracted from @bfchain/core for use in KeyApp
 */

export namespace BFChainCore {
  /** Transaction storage for indexing */
  export interface TransactionStorageJSON {
    key: string;
    value: string;
  }

  /** Base transaction JSON structure */
  export interface TransactionJSON<AssetJSON extends object = object> {
    version: number;
    type: string;
    senderId: string;
    senderPublicKey: string;
    senderSecondPublicKey?: string;
    recipientId?: string;
    rangeType: number;
    range: string[];
    fee: string;
    timestamp: number;
    dappid?: string;
    lns?: string;
    sourceIP?: string;
    fromMagic: string;
    toMagic: string;
    applyBlockHeight: number;
    effectiveBlockHeight: number;
    signature: string;
    signSignature?: string;
    remark: Record<string, string>;
    asset: AssetJSON;
    storage?: TransactionStorageJSON;
    storageKey?: string;
    storageValue?: string;
    nonce: number;
  }

  /** Transfer asset info */
  export interface TransferAssetJSON {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
  }

  /** Transfer asset transaction */
  export interface TransferAssetAssetJSON {
    transferAsset: TransferAssetJSON;
  }

  /** Transfer asset transaction type */
  export type TransferAssetTransactionJSON = TransactionJSON<TransferAssetAssetJSON>;

  /** Signature asset (for setting pay password) */
  export interface SignatureAssetJSON {
    signature: {
      publicKey: string;
    };
  }

  /** Genesis block asset */
  export interface GenesisBlockAssetJSON {
    [key: string]: unknown;
  }

  /** Block JSON structure */
  export interface BlockJSON<AssetJSON extends object = object> {
    version: number;
    height: number;
    timestamp: number;
    magic: string;
    previousBlockSignature: string;
    generatorPublicKey: string;
    generatorEquity: string;
    generatorSecondPublicKey?: string;
    reward: string;
    asset: AssetJSON;
    numberOfTransactions: number;
    payloadLength: number;
    payloadHash: string;
    totalAmount: string;
    totalFee: string;
    signature: string;
    blockParticipation: string;
    remark: Record<string, string>;
    statisticInfo?: unknown;
    blockSize?: number;
    transactions?: TransactionJSON[];
  }

  /** Crypto helper interface */
  export interface CryptoHelperInterface {
    sha256(data?: Uint8Array): Promise<Buffer> | CryptoAsyncHash;
    md5(data?: Uint8Array): Promise<Buffer> | CryptoAsyncHash;
    ripemd160(data?: Uint8Array): Promise<Buffer> | CryptoAsyncHash;
  }

  export interface CryptoAsyncHash {
    update(data: Uint8Array | string): this;
    digest(): Promise<Buffer>;
  }

  /** Keypair */
  export interface Keypair {
    publicKey: Buffer;
    secretKey: Buffer;
  }

  /** Config helper interface */
  export interface ConfigHelper {
    magic: string;
    chainName: string;
    assetType: string;
    version: number;
    beginEpochTime: number;
    forgeInterval: number;
    decimals: number;
  }
}

/** Secrets for transaction signing */
export interface Secrets {
  mainSecret: string;
  paySecret?: string | undefined;
  usePaySecretV1?: boolean | undefined;
}

/** Transaction body options */
export interface TransactionBodyOptions {
  fee: string;
  recipientId: string;
  applyBlockHeight: number;
  timestamp: number;
  remark?: Record<string, string> | undefined;
  effectiveBlockHeight?: number | undefined;
}

/** Transfer asset info for creating transaction */
export interface TransferAssetInfo {
  sourceChainName?: string | undefined;
  sourceChainMagic: string;
  assetType: string;
  amount: string;
}

/** Create transfer transaction args */
export interface CreateTransferTransactionArgs {
  secrets: Secrets;
  transaction: TransactionBodyOptions;
  assetInfo: TransferAssetInfo;
}

/** Transaction controller interface */
export interface TransactionController {
  createTransferTransactionJSON(args: CreateTransferTransactionArgs): Promise<BFChainCore.TransferAssetTransactionJSON>;
  getTransferTransactionMinFee(args: {
    transaction: Omit<TransactionBodyOptions, 'fee' | 'recipientId'>;
    assetInfo: TransferAssetInfo;
  }): Promise<string>;
  createSignatureTransactionJSON(
    secrets: Secrets,
    args: {
      newPaySecret: string;
      fee: string;
      applyBlockHeight: number;
      timestamp: number;
      effectiveBlockHeight?: number;
    }
  ): Promise<BFChainCore.TransactionJSON<BFChainCore.SignatureAssetJSON>>;
  getSignatureTransactionMinFee(args: {
    newPaySecret: string;
    applyBlockHeight: number;
    timestamp: number;
    effectiveBlockHeight?: number;
  }): Promise<string>;
}

/** BioForest Chain Bundle Core interface */
export interface BioforestChainBundleCore {
  transactionController: TransactionController;
  getMagic(): Promise<string>;
  getChainName(): Promise<string>;
  getAssetType(): Promise<string>;
  accountBaseHelper(): {
    getAddressFromSecret(secret: string): Promise<string>;
    getAddressFromPublicKey(publicKey: Buffer): Promise<string>;
    createSecretKeypair(secret: string): Promise<BFChainCore.Keypair>;
    createSecondSecretKeypair(mainSecret: string, paySecret: string): Promise<BFChainCore.Keypair>;
    createSecondSecretKeypairV2(mainSecret: string, paySecret: string): Promise<BFChainCore.Keypair>;
  };
}

/** Setup function type */
export type BioforestChainBundleSetup = (
  genesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>,
  cryptoHelper: BFChainCore.CryptoHelperInterface,
  customRemark?: Record<string, string>
) => Promise<BioforestChainBundleCore>;

/** Bundle exports */
export interface BioforestChainBundle {
  setup: BioforestChainBundleSetup;
}
