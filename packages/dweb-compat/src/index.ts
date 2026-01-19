/**
 * @biochain/dweb-compat
 * 
 * dweb-plaoc 到 KeyApp bio provider 的兼容适配器
 * 
 * 提供与 @nilai/dweb-plaoc 相同的 API 接口，
 * 底层通过 postMessage 调用 KeyApp Bio Provider
 */

// 核心功能
export { getWalleterAddresss, verifyAddressImport } from './address'
export { getExternalAppData } from './signature'

// Crypto Token API
export {
    requestCryptoToken,
    asymmetricEncrypt,
    signData,
    rwaLogin,
} from './crypto-token'
export type {
    CryptoAction,
    TokenDuration,
    RequestCryptoTokenParams,
    RequestCryptoTokenResponse,
    AsymmetricEncryptParams,
    SignParams,
    CryptoExecuteResponse,
    RwaLoginResult,
} from './crypto-token'

// 类型和常量
export {
    $WALLET_PLAOC_PATH,
    $WALLET_SIGNATURE_TYPE,
    $WALLET_AUTHORIZE_ADDRESS_TYPE,
} from './types'
export type {
    $CHAIN_NAME,
    $WALLET_SIGNATURE_TRANSFER,
    $WALLET_SIGNATURE_MESSAGE,
    $WALLET_SIGNATURE_JSON,
    $WALLET_SIGNATURE_DESTORY_ASSET,
    $WALLET_SIGNATURE_PARAMETER,
    $WalletGetAddressResponse,
    $WalletSignatureResponse,
    DwebAppConfig,
} from './types'

// 空操作函数
export {
    canOpenUrl,
    focusWindow,
    appMaximize,
    appVersionUpdate,
    browserOpen,
    restart,
    getDwebAppDownUrl,
    gotoDwebAppMarketDownLoad,
    CorrecDwebAppLang,
    listenerBackButton,
    dwebAppConfig,
} from './noop'
