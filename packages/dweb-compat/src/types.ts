/**
 * dweb-plaoc 类型定义
 * 
 * 从 @nilai/dweb-plaoc/types.ts 复制并简化
 */

/** 链名称类型 */
export type $CHAIN_NAME =
    | 'BFMeta'
    | 'BFMetaV2'
    | 'BIWMeta'
    | 'Ethereum'
    | 'Binance'
    | 'Tron'

/** API 路径 */
export enum $WALLET_PLAOC_PATH {
    /** 获取地址 */
    getAddress = '/wallet/authorize/address',
    /** 签名 */
    signature = '/wallet/authorize/signature',
    /** 锻造 */
    stakeAsset = '/wallet/staking',
}

/** 地址授权类型 */
export enum $WALLET_AUTHORIZE_ADDRESS_TYPE {
    main = 'main',
    network = 'network',
    all = 'all',
}

/** 签名类型 */
export enum $WALLET_SIGNATURE_TYPE {
    /** 消息签名 */
    message = 0,
    /** 转账 */
    transfer = 1,
    /** 内链：凭证资产转移 */
    bioforestChainCertificateTransfer = 2,
    /** JSON 签名 */
    json = 3,
    /** 内链：同质化(非同质化)交易 */
    ENTITY = 4,
    /** 获取币种余额 */
    assetTypeBalance = 5,
    /** 调用智能合约 */
    contract = 6,
    /** 内链销毁 */
    destory = 7,
}

/** 消息签名参数 */
export interface $WALLET_SIGNATURE_MESSAGE {
    type: typeof $WALLET_SIGNATURE_TYPE.message
    chainName: $CHAIN_NAME
    senderAddress: string
    message: string
}

/** 转账签名参数 */
export interface $WALLET_SIGNATURE_TRANSFER {
    type: typeof $WALLET_SIGNATURE_TYPE.transfer
    chainName: $CHAIN_NAME
    assetType?: string
    senderAddress: string
    receiveAddress: string
    privateKey?: string
    balance: string
    fee?: string
    contractInfo?: {
        contractAddress: string
        assetType: string
        decimals: number | string
    }
    remark?: Record<string, string>
}

/** JSON 签名参数 */
export interface $WALLET_SIGNATURE_JSON {
    type: typeof $WALLET_SIGNATURE_TYPE.json
    chainName: $CHAIN_NAME
    senderAddress: string
    json: object
    jsonInterpolation?: Array<{
        path: string
        index: 0 | 1
    }>
}

/** 销毁资产参数 */
export interface $WALLET_SIGNATURE_DESTORY_ASSET {
    type: typeof $WALLET_SIGNATURE_TYPE.destory
    chainName: $CHAIN_NAME
    assetType: string
    fee?: string
    senderAddress: string
    destoryAddress?: string
    destoryAmount: string
    remark?: Record<string, string>
}

/** 获取余额参数 */
export interface $WALLET_ASSETTYPE_BALANCE {
    type: typeof $WALLET_SIGNATURE_TYPE.assetTypeBalance
    chainName: $CHAIN_NAME
    senderAddress: string
    assetTypes: Array<{
        assetType: string
        contractAddress?: string
    }>
}

/** 合约调用参数 */
export interface $WALLET_SIGNATURE_CONTRACT {
    type: typeof $WALLET_SIGNATURE_TYPE.contract
    chainName: $CHAIN_NAME
    amount?: string
    methods: string
    params: unknown[]
    senderAddress: string
    receiveAddress: string
    data: string
    fee?: string
    binanceGasInfo?: {
        gasLimit: number | string
        gasPrice: number | string
    }
    boradcast?: boolean
    waitTrsInBlock?: boolean
    waitTime?: number
}

/** 签名参数联合类型 */
export type $WALLET_SIGNATURE_PARAMETER =
    | $WALLET_SIGNATURE_MESSAGE
    | $WALLET_SIGNATURE_DESTORY_ASSET
    | $WALLET_SIGNATURE_TRANSFER
    | $WALLET_SIGNATURE_JSON
    | $WALLET_ASSETTYPE_BALANCE
    | $WALLET_SIGNATURE_CONTRACT

/** 地址响应 */
export type $WalletGetAddressResponse = Array<{
    name: string
    chainName: $CHAIN_NAME
    address: string
    main: string
    publicKey: string
    privateKey: string
    magic: string
    signMessage?: string
}>

/** 签名响应 */
export type $WalletSignatureResponse = Array<
    | string
    | object
    | { txId: string; transaction: string | object }
    | { [assetType: string]: { assetType: string; decimals: number; balance: string; contracts?: string } }
    | null
    | { error: boolean; message: string }
>

/** API 响应类型映射 */
export type $WALLET_PLAOC_PATH_RESPONSE = {
    [$WALLET_PLAOC_PATH.getAddress]: $WalletGetAddressResponse | null
    [$WALLET_PLAOC_PATH.signature]: $WalletSignatureResponse | null
    [$WALLET_PLAOC_PATH.stakeAsset]: {
        address: string
        orderId: string
        stakeAssetType: string
        stakeChainName: $CHAIN_NAME
        stakeAmount: string
        mintAssetType: string
        mintChainName: $CHAIN_NAME
        mintAmount: string
    } | null
}

/** DwebApp 配置 */
export interface DwebAppConfig {
    mmid: `${string}.dweb`
    name: string
    marketUrl: string
    applistJson: string
}
