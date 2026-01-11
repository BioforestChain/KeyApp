(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.BioSDK = {}));
})(this, (function(exports2) {
  "use strict";
  const BioErrorCodes = {
    USER_REJECTED: 4001,
    UNAUTHORIZED: 4100,
    UNSUPPORTED_METHOD: 4200,
    DISCONNECTED: 4900,
    CHAIN_DISCONNECTED: 4901,
    INTERNAL_ERROR: -32603,
    INVALID_PARAMS: -32602,
    METHOD_NOT_FOUND: -32601
  };
  function createProviderError(code, message, data) {
    const error = new Error(message);
    error.code = code;
    error.data = data;
    return error;
  }
  class EventEmitter {
    handlers = /* @__PURE__ */ new Map();
    on(event, handler) {
      let handlers = this.handlers.get(event);
      if (!handlers) {
        handlers = /* @__PURE__ */ new Set();
        this.handlers.set(event, handlers);
      }
      handlers.add(handler);
    }
    off(event, handler) {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    }
    emit(event, ...args) {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(...args);
          } catch (error) {
            console.error(`[BioSDK] Error in event handler for "${event}":`, error);
          }
        });
      }
    }
    removeAllListeners(event) {
      if (event) {
        this.handlers.delete(event);
      } else {
        this.handlers.clear();
      }
    }
  }
  class BioProviderImpl {
    events = new EventEmitter();
    pendingRequests = /* @__PURE__ */ new Map();
    requestIdCounter = 0;
    connected = false;
    targetOrigin;
    constructor(targetOrigin = "*") {
      this.targetOrigin = targetOrigin;
      this.setupMessageListener();
      this.connect();
    }
    setupMessageListener() {
      window.addEventListener("message", this.handleMessage.bind(this));
    }
    handleMessage(event) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "bio_response") {
        this.handleResponse(data);
      } else if (data.type === "bio_event") {
        this.handleEvent(data);
      }
    }
    handleResponse(message) {
      const pending = this.pendingRequests.get(message.id);
      if (!pending) return;
      this.pendingRequests.delete(message.id);
      if (message.success) {
        pending.resolve(message.result);
      } else {
        const error = message.error ?? { code: BioErrorCodes.INTERNAL_ERROR, message: "Unknown error" };
        pending.reject(createProviderError(error.code, error.message, error.data));
      }
    }
    handleEvent(message) {
      this.events.emit(message.event, ...message.args);
      if (message.event === "connect") {
        this.connected = true;
      } else if (message.event === "disconnect") {
        this.connected = false;
      }
    }
    connect() {
      this.postMessage({
        type: "bio_request",
        id: this.generateId(),
        method: "bio_connect",
        params: []
      });
    }
    generateId() {
      return `bio_${Date.now()}_${++this.requestIdCounter}`;
    }
    postMessage(message) {
      if (window.parent === window) {
        console.warn("[BioSDK] Not running in iframe, cannot communicate with host");
        return;
      }
      window.parent.postMessage(message, this.targetOrigin);
    }
    async request(args) {
      const id = this.generateId();
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(id, {
          resolve,
          reject
        });
        this.postMessage({
          type: "bio_request",
          id,
          method: args.method,
          params: args.params
        });
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(createProviderError(BioErrorCodes.INTERNAL_ERROR, "Request timeout"));
          }
        }, 5 * 60 * 1e3);
      });
    }
    on(event, handler) {
      this.events.on(event, handler);
    }
    off(event, handler) {
      this.events.off(event, handler);
    }
    isConnected() {
      return this.connected;
    }
  }
  class EthereumProvider {
    events = new EventEmitter();
    pendingRequests = /* @__PURE__ */ new Map();
    requestIdCounter = 0;
    connected = false;
    currentChainId = null;
    accounts = [];
    targetOrigin;
    // EIP-1193 required properties
    isMetaMask = false;
    isKeyApp = true;
    constructor(targetOrigin = "*") {
      this.targetOrigin = targetOrigin;
      this.setupMessageListener();
    }
    setupMessageListener() {
      window.addEventListener("message", this.handleMessage.bind(this));
    }
    handleMessage(event) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "eth_response") {
        this.handleResponse(data);
      } else if (data.type === "eth_event") {
        this.handleEvent(data);
      }
    }
    handleResponse(message) {
      const pending = this.pendingRequests.get(message.id);
      if (!pending) return;
      this.pendingRequests.delete(message.id);
      if (message.success) {
        pending.resolve(message.result);
      } else {
        const error = message.error ?? { code: BioErrorCodes.INTERNAL_ERROR, message: "Unknown error" };
        pending.reject(createProviderError(error.code, error.message, error.data));
      }
    }
    handleEvent(message) {
      this.events.emit(message.event, ...message.args);
      if (message.event === "connect") {
        this.connected = true;
        const info = message.args[0];
        this.currentChainId = info?.chainId ?? null;
      } else if (message.event === "disconnect") {
        this.connected = false;
        this.accounts = [];
      } else if (message.event === "chainChanged") {
        this.currentChainId = message.args[0];
      } else if (message.event === "accountsChanged") {
        this.accounts = message.args[0];
      }
    }
    generateId() {
      return `eth_${Date.now()}_${++this.requestIdCounter}`;
    }
    postMessage(message) {
      if (window.parent === window) {
        console.warn("[EthereumProvider] Not running in iframe, cannot communicate with host");
        return;
      }
      window.parent.postMessage(message, this.targetOrigin);
    }
    /**
     * EIP-1193 request method
     */
    async request(args) {
      const { method, params } = args;
      const paramsArray = Array.isArray(params) ? params : params ? [params] : [];
      const id = this.generateId();
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(id, {
          resolve,
          reject
        });
        this.postMessage({
          type: "eth_request",
          id,
          method,
          params: paramsArray
        });
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(createProviderError(BioErrorCodes.INTERNAL_ERROR, "Request timeout"));
          }
        }, 5 * 60 * 1e3);
      });
    }
    /**
     * Subscribe to an event
     */
    on(event, handler) {
      this.events.on(event, handler);
      return this;
    }
    /**
     * Unsubscribe from an event
     */
    off(event, handler) {
      this.events.off(event, handler);
      return this;
    }
    /**
     * Alias for off (Node.js EventEmitter compatibility)
     */
    removeListener(event, handler) {
      return this.off(event, handler);
    }
    /**
     * Add listener that fires only once
     */
    once(event, handler) {
      const wrapper = (...args) => {
        this.off(event, wrapper);
        handler(...args);
      };
      this.on(event, wrapper);
      return this;
    }
    /**
     * EIP-1193 isConnected method
     */
    isConnected() {
      return this.connected;
    }
    /**
     * Get current chain ID (cached)
     */
    get chainId() {
      return this.currentChainId;
    }
    /**
     * Get selected address (first account)
     */
    get selectedAddress() {
      return this.accounts[0] ?? null;
    }
    // ============================================
    // Legacy methods (for backwards compatibility)
    // ============================================
    /**
     * @deprecated Use request({ method: 'eth_requestAccounts' })
     */
    async enable() {
      return this.request({ method: "eth_requestAccounts" });
    }
    /**
     * @deprecated Use request()
     */
    send(method, params) {
      return this.request({ method, params });
    }
    /**
     * @deprecated Use request()
     */
    sendAsync(payload, callback) {
      this.request({ method: payload.method, params: payload.params }).then((result) => callback(null, { result })).catch((error) => callback(error));
    }
  }
  function initEthereumProvider(targetOrigin = "*") {
    if (typeof window === "undefined") {
      throw new Error("[EthereumProvider] Cannot initialize: window is not defined");
    }
    if (window.ethereum) {
      console.warn("[EthereumProvider] Provider already exists, returning existing instance");
      return window.ethereum;
    }
    const provider = new EthereumProvider(targetOrigin);
    window.ethereum = provider;
    console.log("[EthereumProvider] Provider initialized");
    return provider;
  }
  class TronLinkProvider {
    events = new EventEmitter();
    pendingRequests = /* @__PURE__ */ new Map();
    requestIdCounter = 0;
    targetOrigin;
    constructor(targetOrigin = "*") {
      this.targetOrigin = targetOrigin;
      this.setupMessageListener();
    }
    setupMessageListener() {
      window.addEventListener("message", this.handleMessage.bind(this));
    }
    handleMessage(event) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "tron_response") {
        this.handleResponse(data);
      } else if (data.type === "tron_event") {
        this.handleEvent(data);
      }
    }
    handleResponse(message) {
      const pending = this.pendingRequests.get(message.id);
      if (!pending) return;
      this.pendingRequests.delete(message.id);
      if (message.success) {
        pending.resolve(message.result);
      } else {
        const error = message.error ?? { code: BioErrorCodes.INTERNAL_ERROR, message: "Unknown error" };
        pending.reject(createProviderError(error.code, error.message, error.data));
      }
    }
    handleEvent(message) {
      this.events.emit(message.event, ...message.args);
    }
    generateId() {
      return `tron_${Date.now()}_${++this.requestIdCounter}`;
    }
    postMessage(message) {
      if (window.parent === window) {
        console.warn("[TronLinkProvider] Not running in iframe, cannot communicate with host");
        return;
      }
      window.parent.postMessage(message, this.targetOrigin);
    }
    /**
     * TronLink request method (EIP-1193 style)
     */
    async request(args) {
      const { method, params } = args;
      const paramsArray = Array.isArray(params) ? params : params !== void 0 ? [params] : [];
      const id = this.generateId();
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(id, {
          resolve,
          reject
        });
        this.postMessage({
          type: "tron_request",
          id,
          method,
          params: paramsArray
        });
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(createProviderError(BioErrorCodes.INTERNAL_ERROR, "Request timeout"));
          }
        }, 5 * 60 * 1e3);
      });
    }
    on(event, handler) {
      this.events.on(event, handler);
      return this;
    }
    off(event, handler) {
      this.events.off(event, handler);
      return this;
    }
  }
  class TronWebProvider {
    tronLink;
    _ready = false;
    _defaultAddress = { base58: "", hex: "" };
    /** TRX operations */
    trx;
    constructor(tronLink) {
      this.tronLink = tronLink;
      this.trx = new TronWebTrx(tronLink);
      tronLink.on("accountsChanged", (accounts) => {
        if (Array.isArray(accounts) && accounts.length > 0) {
          const addr = accounts[0];
          this._defaultAddress = addr;
          this._ready = true;
        } else {
          this._defaultAddress = { base58: "", hex: "" };
          this._ready = false;
        }
      });
    }
    /** Whether TronWeb is ready (connected) */
    get ready() {
      return this._ready;
    }
    /** Current default address */
    get defaultAddress() {
      return this._defaultAddress;
    }
    /**
     * Set default address (called by host after connection)
     */
    setAddress(address) {
      this._defaultAddress = address;
      this._ready = true;
    }
    /**
     * Check if an address is valid
     */
    isAddress(address) {
      if (address.startsWith("T")) {
        return address.length === 34;
      }
      if (address.startsWith("41")) {
        return address.length === 42;
      }
      return false;
    }
    /**
     * Convert address to hex format
     */
    address = {
      toHex: (base58) => {
        return base58;
      },
      fromHex: (hex) => {
        return hex;
      }
    };
  }
  class TronWebTrx {
    tronLink;
    constructor(tronLink) {
      this.tronLink = tronLink;
    }
    /**
     * Sign a transaction
     */
    async sign(transaction) {
      return this.tronLink.request({
        method: "tron_signTransaction",
        params: transaction
      });
    }
    /**
     * Send raw transaction (broadcast)
     */
    async sendRawTransaction(signedTransaction) {
      return this.tronLink.request({
        method: "tron_sendRawTransaction",
        params: signedTransaction
      });
    }
    /**
     * Get account balance
     */
    async getBalance(address) {
      return this.tronLink.request({
        method: "tron_getBalance",
        params: address
      });
    }
    /**
     * Get account info
     */
    async getAccount(address) {
      return this.tronLink.request({
        method: "tron_getAccount",
        params: address
      });
    }
  }
  function initTronProvider(targetOrigin = "*") {
    if (typeof window === "undefined") {
      throw new Error("[TronProvider] Cannot initialize: window is not defined");
    }
    if (window.tronLink && window.tronWeb) {
      console.warn("[TronProvider] Providers already exist, returning existing instances");
      return { tronLink: window.tronLink, tronWeb: window.tronWeb };
    }
    const tronLink = new TronLinkProvider(targetOrigin);
    const tronWeb = new TronWebProvider(tronLink);
    window.tronLink = tronLink;
    window.tronWeb = tronWeb;
    console.log("[TronProvider] Providers initialized");
    return { tronLink, tronWeb };
  }
  const EVM_CHAIN_IDS = {
    ethereum: 1,
    binance: 56
    // Future chains
    // polygon: 137,
    // arbitrum: 42161,
    // optimism: 10,
  };
  const EVM_CHAIN_ID_TO_KEYAPP = Object.fromEntries(
    Object.entries(EVM_CHAIN_IDS).map(([key, value]) => [value, key])
  );
  const API_CHAIN_TO_KEYAPP = {
    ETH: "ethereum",
    BSC: "binance",
    TRON: "tron",
    BFMCHAIN: "bfmeta",
    BFCHAIN: "bfchain",
    // Lowercase variants
    eth: "ethereum",
    bsc: "binance",
    tron: "tron",
    bfmchain: "bfmeta",
    bfchain: "bfchain"
  };
  const CHAIN_DISPLAY_NAMES = {
    ethereum: "Ethereum",
    binance: "BNB Smart Chain",
    tron: "Tron",
    bfmeta: "BFMeta",
    bfchain: "BFChain"
  };
  function toHexChainId(chainId) {
    return `0x${chainId.toString(16)}`;
  }
  function parseHexChainId(hexChainId) {
    if (!hexChainId.startsWith("0x")) {
      throw new Error(`Invalid hex chain ID: ${hexChainId}`);
    }
    return parseInt(hexChainId, 16);
  }
  function getKeyAppChainId(hexChainId) {
    const decimal = parseHexChainId(hexChainId);
    return EVM_CHAIN_ID_TO_KEYAPP[decimal] ?? null;
  }
  function getEvmChainId(keyAppChainId) {
    const decimal = EVM_CHAIN_IDS[keyAppChainId];
    return decimal ? toHexChainId(decimal) : null;
  }
  function isEvmChain(chainId) {
    return chainId in EVM_CHAIN_IDS;
  }
  function normalizeChainId(chainName) {
    return API_CHAIN_TO_KEYAPP[chainName] ?? chainName.toLowerCase();
  }
  function initBioProvider(targetOrigin = "*") {
    if (typeof window === "undefined") {
      throw new Error("[BioSDK] Cannot initialize: window is not defined");
    }
    if (window.bio) {
      console.warn("[BioSDK] Provider already exists, returning existing instance");
      return window.bio;
    }
    const provider = new BioProviderImpl(targetOrigin);
    window.bio = provider;
    console.log("[BioSDK] Provider initialized");
    return provider;
  }
  function initAllProviders(targetOrigin = "*") {
    const bio = initBioProvider(targetOrigin);
    const ethereum = initEthereumProvider(targetOrigin);
    const { tronLink, tronWeb } = initTronProvider(targetOrigin);
    return { bio, ethereum, tronLink, tronWeb };
  }
  if (typeof window !== "undefined") {
    const init = () => {
      initBioProvider();
      initEthereumProvider();
      initTronProvider();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
  exports2.API_CHAIN_TO_KEYAPP = API_CHAIN_TO_KEYAPP;
  exports2.BioErrorCodes = BioErrorCodes;
  exports2.BioProviderImpl = BioProviderImpl;
  exports2.CHAIN_DISPLAY_NAMES = CHAIN_DISPLAY_NAMES;
  exports2.EVM_CHAIN_IDS = EVM_CHAIN_IDS;
  exports2.EVM_CHAIN_ID_TO_KEYAPP = EVM_CHAIN_ID_TO_KEYAPP;
  exports2.EthereumProvider = EthereumProvider;
  exports2.EventEmitter = EventEmitter;
  exports2.TronLinkProvider = TronLinkProvider;
  exports2.TronWebProvider = TronWebProvider;
  exports2.createProviderError = createProviderError;
  exports2.getEvmChainId = getEvmChainId;
  exports2.getKeyAppChainId = getKeyAppChainId;
  exports2.initAllProviders = initAllProviders;
  exports2.initBioProvider = initBioProvider;
  exports2.initEthereumProvider = initEthereumProvider;
  exports2.initTronProvider = initTronProvider;
  exports2.isEvmChain = isEvmChain;
  exports2.normalizeChainId = normalizeChainId;
  exports2.parseHexChainId = parseHexChainId;
  exports2.toHexChainId = toHexChainId;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=index.umd.js.map
