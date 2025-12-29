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
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initBioProvider());
  } else {
    initBioProvider();
  }
}
export {
  BioErrorCodes,
  BioProviderImpl,
  EventEmitter,
  createProviderError,
  initBioProvider
};
//# sourceMappingURL=index.js.map
