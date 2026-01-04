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

/** Create a provider RPC error */
export declare function createProviderError(code: number, message: string, data?: unknown): ProviderRpcError;

export declare class EventEmitter {
    private handlers;
    on(event: string, handler: EventHandler): void;
    off(event: string, handler: EventHandler): void;
    emit(event: string, ...args: unknown[]): void;
    removeAllListeners(event?: string): void;
}

/** Event handler type */
export declare type EventHandler<T = unknown> = (...args: T[]) => void;

/**
 * Initialize and inject the Bio provider into window.bio
 */
export declare function initBioProvider(targetOrigin?: string): BioProvider;

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

/** Transfer parameters */
export declare interface TransferParams {
    from: string;
    to: string;
    amount: string;
    chain: string;
    asset?: string;
}

export { }
