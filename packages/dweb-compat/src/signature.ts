/**
 * 签名适配
 * 
 * 将 dweb 的 getExternalAppData(signature, [...]) 转换为 KeyApp 的 bio_* 方法
 */

import { bioRequest } from './bridge'
import {
    $WALLET_PLAOC_PATH,
    $WALLET_SIGNATURE_TYPE,
    type $WALLET_SIGNATURE_PARAMETER,
    type $WALLET_PLAOC_PATH_RESPONSE,
} from './types'

/** 转账响应 */
interface TransferResponse {
    txId: string
    transaction: string | object
}

/**
 * 调用外部 App 获取数据
 * 
 * 对应 dweb 的 getExternalAppData(mmid, pathname, search)
 */
export function getExternalAppData<T extends keyof $WALLET_PLAOC_PATH_RESPONSE>(
    _mmid: `${string}.dweb`,
    pathname: T,
    params?: unknown
) {
    const dataPromise = executeRequest<$WALLET_PLAOC_PATH_RESPONSE[T]>(pathname, params)

    return {
        getData: (): Promise<$WALLET_PLAOC_PATH_RESPONSE[T]> => dataPromise,
        abort: (): void => {
            // postMessage 请求不支持中止，这里只是兼容接口
            console.warn('[dweb-compat] abort is not supported in miniapp mode')
        },
    }
}

async function executeRequest<T>(pathname: string, params: unknown): Promise<T> {
    switch (pathname) {
        case $WALLET_PLAOC_PATH.signature:
            if (Array.isArray(params)) {
                const results = await Promise.all(params.map(handleSignatureParam))
                return results as T
            }
            throw new Error('Invalid signature params: expected array')

        case $WALLET_PLAOC_PATH.getAddress:
            // 地址请求走 address.ts 的 getWalleterAddresss
            throw new Error('Use getWalleterAddresss for address requests')

        case $WALLET_PLAOC_PATH.stakeAsset:
            // 锻造功能暂不支持
            throw new Error('stakeAsset is not supported in miniapp mode')

        default:
            throw new Error(`Unknown pathname: ${pathname}`)
    }
}

async function handleSignatureParam(
    param: $WALLET_SIGNATURE_PARAMETER
): Promise<TransferResponse | string | object | null> {
    switch (param.type) {
        case $WALLET_SIGNATURE_TYPE.transfer:
            return handleTransfer(param)

        case $WALLET_SIGNATURE_TYPE.message:
            return handleMessage(param)

        case $WALLET_SIGNATURE_TYPE.json:
            return handleJsonSign(param)

        case $WALLET_SIGNATURE_TYPE.destory:
            return handleDestroy(param)

        case $WALLET_SIGNATURE_TYPE.assetTypeBalance:
            return handleGetBalance(param)

        case $WALLET_SIGNATURE_TYPE.contract:
            return handleContract(param)

        default:
            console.error('[dweb-compat] Unsupported signature type:', (param as { type: number }).type)
            return { error: true, message: `Unsupported signature type: ${(param as { type: number }).type}` }
    }
}

async function handleTransfer(param: {
    chainName: string
    senderAddress: string
    receiveAddress: string
    balance: string
    assetType?: string
    contractInfo?: { contractAddress: string; assetType: string; decimals: number | string }
    remark?: Record<string, string>
}): Promise<TransferResponse> {
    const result = await bioRequest<{ txHash: string; transaction?: object }>('bio_sendTransaction', {
        from: param.senderAddress,
        to: param.receiveAddress,
        amount: param.balance,
        chain: param.chainName,
        asset: param.assetType,
        contractInfo: param.contractInfo,
        remark: param.remark,
    })

    return {
        txId: result.txHash,
        transaction: result.transaction || result.txHash,
    }
}

async function handleMessage(param: {
    chainName: string
    senderAddress: string
    message: string
}): Promise<string> {
    const signature = await bioRequest<string>('bio_signMessage', {
        address: param.senderAddress,
        message: param.message,
        chainName: param.chainName,
    })
    return signature
}

async function handleJsonSign(param: {
    chainName: string
    senderAddress: string
    json: object
    jsonInterpolation?: Array<{ path: string; index: 0 | 1 }>
}): Promise<TransferResponse> {
    const result = await bioRequest<{ txId: string; transaction: object }>('bio_signTypedData', {
        address: param.senderAddress,
        data: param.json,
        chainName: param.chainName,
        interpolation: param.jsonInterpolation,
    })
    return result
}

async function handleDestroy(param: {
    chainName: string
    senderAddress: string
    assetType: string
    destoryAmount: string
    remark?: Record<string, string>
}): Promise<TransferResponse> {
    const result = await bioRequest<{ txId: string; transaction: object }>('bio_destroyAsset', {
        from: param.senderAddress,
        chain: param.chainName,
        asset: param.assetType,
        amount: param.destoryAmount,
        remark: param.remark,
    })
    return result
}

async function handleGetBalance(param: {
    chainName: string
    senderAddress: string
    assetTypes: Array<{ assetType: string; contractAddress?: string }>
}): Promise<Record<string, { assetType: string; decimals: number; balance: string }>> {
    const result = await bioRequest<Record<string, { assetType: string; decimals: number; balance: string }>>(
        'bio_getBalance',
        {
            address: param.senderAddress,
            chain: param.chainName,
            assets: param.assetTypes,
        }
    )
    return result
}

async function handleContract(param: {
    chainName: string
    senderAddress: string
    receiveAddress: string
    methods: string
    params: unknown[]
    data: string
    amount?: string
}): Promise<TransferResponse> {
    // 合约调用通过 bio_signTransaction
    const result = await bioRequest<{ txId: string; signedTx: object }>('bio_signTransaction', {
        from: param.senderAddress,
        to: param.receiveAddress,
        chain: param.chainName,
        data: param.data,
        value: param.amount || '0',
    })
    return {
        txId: result.txId,
        transaction: result.signedTx,
    }
}
