/** API chain name to KeyApp chain ID mapping */
export declare const API_CHAIN_TO_KEYAPP: Record<string, string>;

/**
 * Bio SDK Types
 * EIP-1193 style provider interface for Bio ecosystem
 */
/** Account information */
export declare interface BioAccount {
    address: string;
    chain: string;
    name?: string;
    /** Public key (hex encoded) */
    publicKey: string;
}

/** RPC error codes */
export declare const BioErrorCodes: {
    readonly USER_REJECTED: 4001;
    readonly UNAUTHORIZED: 4100;
    readonly UNSUPPORTED_METHOD: 4200;
    readonly DISCONNECTED: 4900;
    readonly CHAIN_DISCONNECTED: 4901;
    readonly INTERNAL_ERROR: -32603;
    readonly INVALID_PARAMS: -32602;
    readonly METHOD_NOT_FOUND: -32601;
};

/** Event names */
export declare type BioEventName = keyof BioEvents;

/**
 * Bio event definitions
 */
export declare interface BioEvents {
    /** Emitted when accounts change */
    accountsChanged: (accounts: BioAccount[]) => void;
    /** Emitted when chain changes */
    chainChanged: (chainId: string) => void;
    /** Emitted when connected */
    connect: (info: {
        chainId: string;
    }) => void;
    /** Emitted when disconnected */
    disconnect: (error: {
        code: number;
        message: string;
    }) => void;
}

/** Method names */
export declare type BioMethodName = keyof BioMethods;

/**
 * Bio method definitions
 */
export declare interface BioMethods {
    /** Request wallet accounts (shows connection UI) */
    bio_requestAccounts: () => Promise<BioAccount[]>;
    /** Get connected accounts (no UI) */
    bio_accounts: () => Promise<BioAccount[]>;
    /** Select an account (shows account picker UI) */
    bio_selectAccount: (opts?: {
        chain?: string;
    }) => Promise<BioAccount>;
    /** Pick another wallet address (shows wallet picker UI) */
    bio_pickWallet: (opts?: {
        chain?: string;
        exclude?: string;
    }) => Promise<BioAccount>;
    /** Sign a message, returns signature and public key (hex) */
    bio_signMessage: (params: {
        message: string;
        address: string;
    }) => Promise<{
        signature: string;
        publicKey: string;
    }>;
    /** Sign typed data, returns signature and public key (hex) */
    bio_signTypedData: (params: {
        data: object;
        address: string;
    }) => Promise<{
        signature: string;
        publicKey: string;
    }>;
    /** Create an unsigned transaction (no signature, no broadcast) */
    bio_createTransaction: (params: TransferParams) => Promise<BioUnsignedTransaction>;
    /** Sign an unsigned transaction (requires user confirmation) */
    bio_signTransaction: (params: {
        from: string;
        chain: string;
        unsignedTx: BioUnsignedTransaction;
    }) => Promise<BioSignedTransaction>;
    /** Send a transaction */
    bio_sendTransaction: (params: TransferParams) => Promise<{
        txHash: string;
    }>;
    /** Get current chain ID */
    bio_chainId: () => Promise<string>;
    /** Get balance */
    bio_getBalance: (params: {
        address: string;
        chain: string;
    }) => Promise<string>;
    /** Close splash screen (indicates app is ready) */
    bio_closeSplashScreen: () => Promise<void>;
}

/**
 * Bio Provider Interface (EIP-1193 style)
 */
export declare interface BioProvider {
    /** Make a request to the provider */
    request<T = unknown>(args: RequestArguments): Promise<T>;
    /** Subscribe to an event */
    on(event: string, handler: EventHandler): void;
    /** Unsubscribe from an event */
    off(event: string, handler: EventHandler): void;
    /** Check if connected */
    isConnected(): boolean;
}

export declare class BioProviderImpl implements BioProvider {
    private events;
    private pendingRequests;
    private requestIdCounter;
    private connected;
    private readonly targetOrigin;
    constructor(targetOrigin?: string);
    private setupMessageListener;
    private handleMessage;
    private handleResponse;
    private handleEvent;
    private connect;
    private generateId;
    private postMessage;
    request<T = unknown>(args: RequestArguments): Promise<T>;
    on(event: string, handler: EventHandler): void;
    off(event: string, handler: EventHandler): void;
    isConnected(): boolean;
}

/** Signed transaction payload (chain-specific) */
export declare interface BioSignedTransaction {
    chainId: string;
    data: unknown;
    signature: string;
}

/** Unsigned transaction payload (chain-specific) */
export declare interface BioUnsignedTransaction {
    chainId: string;
    data: unknown;
}

/** KeyApp chain ID to display name */
export declare const CHAIN_DISPLAY_NAMES: Record<string, string>;

/** Create a provider RPC error */
export declare function createProviderError(code: number, message: string, data?: unknown): ProviderRpcError;

/**
 * EIP-1193 Ethereum Provider Implementation
 */
export declare class EthereumProvider {
    private events;
    private pendingRequests;
    private requestIdCounter;
    private connected;
    private currentChainId;
    private accounts;
    private readonly targetOrigin;
    readonly isMetaMask = false;
    readonly isKeyApp = true;
    constructor(targetOrigin?: string);
    private setupMessageListener;
    private handleMessage;
    private handleResponse;
    private handleEvent;
    private generateId;
    private postMessage;
    /**
     * EIP-1193 request method
     */
    request<T = unknown>(args: EthRequestArguments): Promise<T>;
    /**
     * Subscribe to an event
     */
    on(event: string, handler: (...args: unknown[]) => void): this;
    /**
     * Unsubscribe from an event
     */
    off(event: string, handler: (...args: unknown[]) => void): this;
    /**
     * Alias for off (Node.js EventEmitter compatibility)
     */
    removeListener(event: string, handler: (...args: unknown[]) => void): this;
    /**
     * Add listener that fires only once
     */
    once(event: string, handler: (...args: unknown[]) => void): this;
    /**
     * EIP-1193 isConnected method
     */
    isConnected(): boolean;
    /**
     * Get current chain ID (cached)
     */
    get chainId(): string | null;
    /**
     * Get selected address (first account)
     */
    get selectedAddress(): string | null;
    /**
     * @deprecated Use request({ method: 'eth_requestAccounts' })
     */
    enable(): Promise<string[]>;
    /**
     * @deprecated Use request()
     */
    send(method: string, params?: unknown[]): Promise<unknown>;
    /**
     * @deprecated Use request()
     */
    sendAsync(payload: {
        method: string;
        params?: unknown[];
        id?: number;
    }, callback: (error: Error | null, result?: {
        result: unknown;
    }) => void): void;
}

/**
 * Ethereum Provider (EIP-1193 Compatible)
 *
 * Provides window.ethereum for EVM-compatible dApps.
 * Communicates with KeyApp host via postMessage.
 */
/** EIP-1193 Request Arguments */
declare interface EthRequestArguments {
    method: string;
    params?: unknown[] | Record<string, unknown>;
}

export declare class EventEmitter {
    private handlers;
    on(event: string, handler: EventHandler): void;
    off(event: string, handler: EventHandler): void;
    emit(event: string, ...args: unknown[]): void;
    removeAllListeners(event?: string): void;
}

/** Event handler type */
export declare type EventHandler<T = unknown> = (...args: T[]) => void;

/** Reverse mapping: EVM chainId -> KeyApp chain ID */
export declare const EVM_CHAIN_ID_TO_KEYAPP: Record<number, string>;

/** EVM Chain ID mapping (decimal) */
export declare const EVM_CHAIN_IDS: Record<string, number>;

/**
 * Get EVM hex chain ID from KeyApp chain ID
 * @example getEvmChainId('binance') => '0x38'
 */
export declare function getEvmChainId(keyAppChainId: string): string | null;

/**
 * Get KeyApp chain ID from EVM hex chain ID
 * @example getKeyAppChainId('0x38') => 'binance'
 */
export declare function getKeyAppChainId(hexChainId: string): string | null;

/**
 * Initialize all providers (bio, ethereum, tron)
 */
export declare function initAllProviders(targetOrigin?: string): {
    bio: BioProvider;
    ethereum: EthereumProvider;
    tronLink: TronLinkProvider;
    tronWeb: TronWebProvider;
};

/**
 * Initialize and inject the Bio provider into window.bio
 */
export declare function initBioProvider(targetOrigin?: string): BioProvider;

/**
 * Initialize and inject the Ethereum provider into window.ethereum
 */
export declare function initEthereumProvider(targetOrigin?: string): EthereumProvider;

/**
 * Initialize and inject the Tron providers
 */
export declare function initTronProvider(targetOrigin?: string): {
    tronLink: TronLinkProvider;
    tronWeb: TronWebProvider;
};

/**
 * Check if a chain is EVM compatible
 */
export declare function isEvmChain(chainId: string): boolean;

/**
 * Normalize API chain name to KeyApp chain ID
 * @example normalizeChainId('BSC') => 'binance'
 */
export declare function normalizeChainId(chainName: string): string;

/**
 * Parse hex chain ID to decimal
 * @example parseHexChainId('0x38') => 56
 */
export declare function parseHexChainId(hexChainId: string): number;

/** Provider RPC error */
export declare interface ProviderRpcError extends Error {
    code: number;
    data?: unknown;
}

/** Provider request arguments */
export declare interface RequestArguments {
    method: string;
    params?: unknown[];
}

/**
 * Convert decimal chain ID to hex string (EIP-155 format)
 * @example toHexChainId(56) => '0x38'
 */
export declare function toHexChainId(chainId: number): string;

/** Transfer parameters */
export declare interface TransferParams {
    from: string;
    to: string;
    amount: string;
    chain: string;
    asset?: string;
}

/**
 * Tron Provider (TronLink Compatible)
 *
 * Provides window.tronWeb and window.tronLink for Tron dApps.
 * Communicates with KeyApp host via postMessage.
 */
/** Tron address format */
declare interface TronAddress {
    base58: string;
    hex: string;
}

/**
 * TronLink-compatible Provider
 */
export declare class TronLinkProvider {
    private events;
    private pendingRequests;
    private requestIdCounter;
    private readonly targetOrigin;
    constructor(targetOrigin?: string);
    private setupMessageListener;
    private handleMessage;
    private handleResponse;
    private handleEvent;
    private generateId;
    private postMessage;
    /**
     * TronLink request method (EIP-1193 style)
     */
    request<T = unknown>(args: TronRequestArguments): Promise<T>;
    on(event: string, handler: (...args: unknown[]) => void): this;
    off(event: string, handler: (...args: unknown[]) => void): this;
}

/** TronLink request arguments (EIP-1193 style) */
declare interface TronRequestArguments {
    method: string;
    params?: unknown;
}

/**
 * TronWeb-compatible API
 * Provides the subset of TronWeb API that KeyApp supports
 */
export declare class TronWebProvider {
    private tronLink;
    private _ready;
    private _defaultAddress;
    /** TRX operations */
    readonly trx: TronWebTrx;
    constructor(tronLink: TronLinkProvider);
    /** Whether TronWeb is ready (connected) */
    get ready(): boolean;
    /** Current default address */
    get defaultAddress(): TronAddress;
    /**
     * Set default address (called by host after connection)
     */
    setAddress(address: TronAddress): void;
    /**
     * Check if an address is valid
     */
    isAddress(address: string): boolean;
    /**
     * Convert address to hex format
     */
    address: {
        toHex: (base58: string) => string;
        fromHex: (hex: string) => string;
    };
}

/**
 * TronWeb.trx operations
 */
declare class TronWebTrx {
    private tronLink;
    constructor(tronLink: TronLinkProvider);
    /**
     * Sign a transaction
     */
    sign(transaction: unknown): Promise<unknown>;
    /**
     * Send raw transaction (broadcast)
     */
    sendRawTransaction(signedTransaction: unknown): Promise<unknown>;
    /**
     * Get account balance
     */
    getBalance(address: string): Promise<number>;
    /**
     * Get account info
     */
    getAccount(address: string): Promise<unknown>;
}

export { }
