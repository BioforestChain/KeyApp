/**
 * 地址授权适配
 * 
 * 将 dweb 的 getWalleterAddresss 转换为 KeyApp 的 bio_requestAccounts
 */

import { bioRequest } from './bridge'
import type { $WalletGetAddressResponse, $CHAIN_NAME } from './types'

/** KeyApp bio_accounts 返回的账户信息 */
interface BioAccountInfo {
    address: string
    chain: string
    publicKey?: string
}

/**
 * 获取钱包地址授权
 * 
 * 对应 dweb 的 getWalleterAddresss(mmid)
 * 转换为 KeyApp 的 bio_requestAccounts + bio_accounts
 */
export async function getWalleterAddresss(
    _mmid: `${string}.dweb`
): Promise<$WalletGetAddressResponse | null> {
    try {
        // 1. 请求账户授权
        const addresses = await bioRequest<string[]>('bio_requestAccounts')

        if (!addresses || addresses.length === 0) {
            return null
        }

        // 2. 获取完整账户信息
        let accounts: BioAccountInfo[]
        try {
            accounts = await bioRequest<BioAccountInfo[]>('bio_accounts')
        } catch {
            // 如果 bio_accounts 失败，使用地址构造基本信息
            accounts = addresses.map(addr => ({ address: addr, chain: 'BFMeta' }))
        }

        // 3. 转换为 dweb 格式
        return accounts.map(acc => ({
            name: '',
            chainName: acc.chain as $CHAIN_NAME,
            address: acc.address,
            main: acc.address, // KeyApp 中 main 等于 address
            publicKey: acc.publicKey || '',
            privateKey: '', // 不暴露私钥
            magic: '',
            signMessage: '',
        }))
    } catch {
        return null
    }
}

/**
 * 验证地址导入
 * 
 * 对应 dweb 的 verifyAddressImport
 */
export async function verifyAddressImport(
    _mmid: `${string}.dweb`,
    opts: { address: string; message: string; chainName: $CHAIN_NAME }
): Promise<boolean> {
    try {
        const signature = await bioRequest<string>('bio_signMessage', {
            address: opts.address,
            message: opts.message,
            chainName: opts.chainName,
        })
        return typeof signature === 'string' && signature.length > 0
    } catch {
        return false
    }
}
