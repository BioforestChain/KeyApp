import { c as config } from './index-62190cc8.mjs';

class Mutex {
    constructor() {
        this.mutex = Promise.resolve();
    }
    lock() {
        let begin = () => { };
        this.mutex = this.mutex.then(() => new Promise(begin));
        return new Promise((res) => {
            begin = res;
        });
    }
    async dispatch(fn) {
        const unlock = await this.lock();
        try {
            return await fn();
        }
        finally {
            unlock();
        }
    }
}
var Mutex$1 = Mutex;

/* eslint-disable import/prefer-default-export */
/* eslint-disable no-bitwise */
function getGlobal() {
    // eslint-disable-next-line no-undef
    if (typeof globalThis !== 'undefined')
        return globalThis;
    // eslint-disable-next-line no-restricted-globals, no-undef
    if (typeof self !== 'undefined')
        return self;
    // eslint-disable-next-line no-undef
    if (typeof window !== 'undefined')
        return window;
    return global;
}
const globalObject = getGlobal();
const nodeBuffer = globalObject.Buffer ?? null;
const textEncoder = globalObject.TextEncoder
    ? new globalObject.TextEncoder()
    : null;
function intArrayToString(arr, len) {
    return String.fromCharCode(...arr.subarray(0, len));
}
function hexCharCodesToInt(a, b) {
    return ((((a & 0xf) + ((a >> 6) | ((a >> 3) & 0x8))) << 4) |
        ((b & 0xf) + ((b >> 6) | ((b >> 3) & 0x8))));
}
function writeHexToUInt8(buf, str) {
    const size = str.length >> 1;
    for (let i = 0; i < size; i++) {
        const index = i << 1;
        buf[i] = hexCharCodesToInt(str.charCodeAt(index), str.charCodeAt(index + 1));
    }
}
function equalsArray(a1, a2) {
    if (a1.length !== a2.length) {
        return false;
    }
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}
const alpha = 'a'.charCodeAt(0) - 10;
const digit = '0'.charCodeAt(0);
function getDigestHex(tmpBuffer, input, hashLength) {
    let p = 0;
    /* eslint-disable no-plusplus */
    for (let i = 0; i < hashLength; i++) {
        let nibble = input[i] >>> 4;
        tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
        nibble = input[i] & 0xf;
        tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    }
    /* eslint-enable no-plusplus */
    return String.fromCharCode.apply(null, tmpBuffer);
}
const getUInt8Buffer = nodeBuffer !== null
    ? (data) => {
        if (typeof data === 'string') {
            const buf = nodeBuffer.from(data, 'utf8');
            return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
        }
        if (nodeBuffer.isBuffer(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.length);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        throw new Error('Invalid data type!');
    }
    : (data) => {
        if (typeof data === 'string') {
            return textEncoder.encode(data);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        throw new Error('Invalid data type!');
    };
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
    base64Lookup[base64Chars.charCodeAt(i)] = i;
}
function encodeBase64(data, pad = true) {
    const len = data.length;
    const extraBytes = len % 3;
    const parts = [];
    const len2 = len - extraBytes;
    for (let i = 0; i < len2; i += 3) {
        const tmp = ((data[i] << 16) & 0xff0000) +
            ((data[i + 1] << 8) & 0xff00) +
            (data[i + 2] & 0xff);
        const triplet = base64Chars.charAt((tmp >> 18) & 0x3f) +
            base64Chars.charAt((tmp >> 12) & 0x3f) +
            base64Chars.charAt((tmp >> 6) & 0x3f) +
            base64Chars.charAt(tmp & 0x3f);
        parts.push(triplet);
    }
    if (extraBytes === 1) {
        const tmp = data[len - 1];
        const a = base64Chars.charAt(tmp >> 2);
        const b = base64Chars.charAt((tmp << 4) & 0x3f);
        parts.push(`${a}${b}`);
        if (pad) {
            parts.push('==');
        }
    }
    else if (extraBytes === 2) {
        const tmp = (data[len - 2] << 8) + data[len - 1];
        const a = base64Chars.charAt(tmp >> 10);
        const b = base64Chars.charAt((tmp >> 4) & 0x3f);
        const c = base64Chars.charAt((tmp << 2) & 0x3f);
        parts.push(`${a}${b}${c}`);
        if (pad) {
            parts.push('=');
        }
    }
    return parts.join('');
}
function getDecodeBase64Length(data) {
    let bufferLength = Math.floor(data.length * 0.75);
    const len = data.length;
    if (data[len - 1] === '=') {
        bufferLength -= 1;
        if (data[len - 2] === '=') {
            bufferLength -= 1;
        }
    }
    return bufferLength;
}
function decodeBase64(data) {
    const bufferLength = getDecodeBase64Length(data);
    const len = data.length;
    const bytes = new Uint8Array(bufferLength);
    let p = 0;
    for (let i = 0; i < len; i += 4) {
        const encoded1 = base64Lookup[data.charCodeAt(i)];
        const encoded2 = base64Lookup[data.charCodeAt(i + 1)];
        const encoded3 = base64Lookup[data.charCodeAt(i + 2)];
        const encoded4 = base64Lookup[data.charCodeAt(i + 3)];
        bytes[p] = (encoded1 << 2) | (encoded2 >> 4);
        p += 1;
        bytes[p] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        p += 1;
        bytes[p] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        p += 1;
    }
    return bytes;
}
function validateBits(bits, max) {
    if (!Number.isInteger(bits) || bits < 8 || bits > max || bits % 8 !== 0) {
        throw `Invalid variant! Valid values: 8, 16, ..., ${max}`;
    }
}
function getInitParam(outputBits, keyBits) {
    // eslint-disable-next-line no-bitwise
    return outputBits | (keyBits << 16);
}
const _invalidateSeed = (seed) => !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff;
const validateSeed = (seed) => {
    if (_invalidateSeed(seed)) {
        throw new Error('Seed must be a valid 32-bit long unsigned integer.');
    }
};
const validateLowHeightSeed = (seedLow, seedHigh) => {
    if (_invalidateSeed(seedLow) || _invalidateSeed(seedHigh)) {
        throw new Error('Seed must be given as two valid 32-bit long unsigned integers (lo + high).');
    }
};

async function loadWasm(wasmName) {
    const wasmUrl = `${config.wasmBaseUrl}/hash-wasm/${wasmName}.wasm`;
    const data = await config.wasmLoader(wasmUrl);
    const sha1 = await crypto.subtle.digest('SHA-1', data);
    return { data, sha1 };
}

const MAX_HEAP = 16 * 1024;
const WASM_FUNC_HASH_LENGTH = 4;
const wasmMutex = new Mutex$1();
const wasmCompileCache = new Map();
// if (typeof WebAssembly === 'undefined') {
//   throw new Error('WebAssembly is not supported in this environment!');
// }
const compileWasm = async (wasmName) => {
    let wasmCompileTask = wasmCompileCache.get(wasmName);
    if (wasmCompileTask === undefined) {
        wasmCompileTask = wasmMutex.dispatch(() => loadWasm(wasmName).then(async (wasm) => {
            const hash = new Uint8Array(wasm.sha1.slice(0, WASM_FUNC_HASH_LENGTH));
            const module = await WebAssembly.compile(wasm.data);
            const instance = await WebAssembly.instantiate(module, {});
            const wasmCompile = {
                hash,
                module,
                instance,
            };
            wasmCompileCache.set(wasmName, wasmCompile);
            return wasmCompile;
        }));
        wasmCompileCache.set(wasmName, wasmCompileTask);
    }
    return await wasmCompileTask;
};
const WASMInterfaceSync = (wasmCompile, wasmName, hashLength) => {
    const { instance: wasmInstance, hash } = wasmCompile;
    const exports = wasmInstance.exports;
    let memoryView = new Uint8Array(exports.memory.buffer, exports.Hash_GetBuffer(), MAX_HEAP);
    let initialized = false;
    const getMemory = () => memoryView;
    const writeMemory = (data, offset = 0) => {
        getMemory().set(data, offset);
    };
    const setMemorySize = (totalSize) => {
        exports.Hash_SetMemorySize(totalSize);
        memoryView = new Uint8Array(exports.memory.buffer, exports.Hash_GetBuffer(), totalSize);
    };
    const getStateSize = () => {
        const view = new DataView(exports.memory.buffer);
        const stateSize = view.getUint32(exports.STATE_SIZE, true);
        return stateSize;
    };
    const init = (bits) => {
        initialized = true;
        exports.Hash_Init(bits);
    };
    const updateUInt8Array = (data) => {
        let read = 0;
        while (read < data.length) {
            const chunk = data.subarray(read, read + MAX_HEAP);
            read += chunk.length;
            getMemory().set(chunk);
            exports.Hash_Update(chunk.length);
        }
    };
    const update = (data) => {
        if (!initialized) {
            throw new Error('update() called before init()');
        }
        const Uint8Buffer = getUInt8Buffer(data);
        updateUInt8Array(Uint8Buffer);
    };
    const digestChars = new Uint8Array(hashLength * 2);
    const digest = ((outputType = 'binary', padding) => {
        if (!initialized) {
            throw new Error('digest() called before init()');
        }
        initialized = false;
        exports.Hash_Final(padding);
        if (outputType === 'hex') {
            return getDigestHex(digestChars, getMemory(), hashLength);
        }
        // the data is copied to allow GC of the original memory object
        return getMemory().slice(0, hashLength);
    });
    const save = () => {
        if (!initialized) {
            throw new Error('save() can only be called after init() and before digest()');
        }
        const stateOffset = exports.Hash_GetState();
        const stateLength = getStateSize();
        const memoryBuffer = exports.memory.buffer;
        const internalState = new Uint8Array(memoryBuffer, stateOffset, stateLength);
        // prefix is 4 bytes from SHA1 hash of the WASM binary
        // it is used to detect incompatible internal states between different versions of hash-wasm
        const prefixedState = new Uint8Array(WASM_FUNC_HASH_LENGTH + stateLength);
        prefixedState.set(hash, 0);
        prefixedState.set(internalState, WASM_FUNC_HASH_LENGTH);
        return prefixedState;
    };
    const load = (state) => {
        if (!(state instanceof Uint8Array)) {
            throw new Error('load() expects an Uint8Array generated by save()');
        }
        const stateOffset = exports.Hash_GetState();
        const stateLength = getStateSize();
        const overallLength = WASM_FUNC_HASH_LENGTH + stateLength;
        const memoryBuffer = exports.memory.buffer;
        if (state.length !== overallLength) {
            throw new Error(`Bad state length (expected ${overallLength} bytes, got ${state.length})`);
        }
        if (!equalsArray(hash, state.subarray(0, WASM_FUNC_HASH_LENGTH))) {
            throw new Error('This state was written by an incompatible hash implementation');
        }
        const internalState = state.subarray(WASM_FUNC_HASH_LENGTH);
        new Uint8Array(memoryBuffer, stateOffset, stateLength).set(internalState);
        initialized = true;
    };
    const isDataShort = (data) => {
        if (typeof data === 'string') {
            // worst case is 4 bytes / char
            return data.length < MAX_HEAP / 4;
        }
        return data.byteLength < MAX_HEAP;
    };
    let canSimplify = isDataShort;
    switch (wasmName) {
        case 'argon2':
        case 'scrypt':
            canSimplify = () => true;
            break;
        case 'blake2b':
        case 'blake2s':
            // if there is a key at blake2 then cannot simplify
            canSimplify = (data, initParam) => typeof initParam === 'number' && initParam <= 512 && isDataShort(data);
            break;
        case 'blake3':
            // if there is a key at blake3 then cannot simplify
            canSimplify = (data, initParam) => initParam === 0 && isDataShort(data);
            break;
        case 'xxhash64': // cannot simplify
        case 'xxhash3':
        case 'xxhash128':
            canSimplify = () => false;
            break;
    }
    // shorthand for (init + update + digest) for better performance
    const calculate = (data, initParam, digestParam) => {
        if (!canSimplify(data, initParam)) {
            init(initParam);
            update(data);
            return digest('hex', digestParam);
        }
        const buffer = getUInt8Buffer(data);
        getMemory().set(buffer);
        exports.Hash_Calculate(buffer.length, initParam, digestParam);
        return getDigestHex(digestChars, getMemory(), hashLength);
    };
    return {
        getMemory,
        writeMemory,
        getExports: () => exports,
        setMemorySize,
        init,
        update,
        digest,
        save,
        load,
        calculate,
        hashLength,
    };
};
const WASMInterface = async (wasmName, hashLength) => {
    return WASMInterfaceSync(await compileWasm(wasmName), wasmName, hashLength);
};
/**
 * @TODO 实现一个池子，如果 digest 了，那么就回收到池子中，可以重复使用
 */
const createWasmPreparer = (wasmName, hashLength) => {
    const preparer = () => {
        return WASMInterface(wasmName, hashLength);
    };
    Object.defineProperties(preparer, {
        wasm: {
            get() {
                const wasmCompile = wasmCompileCache.get(wasmName);
                if (wasmCompile === undefined || wasmCompile instanceof Promise) {
                    throw new Error(`wasm instance ${wasmName} is not yet ready.`);
                }
                return WASMInterfaceSync(wasmCompile, wasmName, hashLength);
            },
        },
        prepare: {
            value: async () => {
                await compileWasm(wasmName);
            },
        },
    });
    return preparer;
};

export { getInitParam as a, getDigestHex as b, createWasmPreparer as c, decodeBase64 as d, getDecodeBase64Length as e, encodeBase64 as f, getUInt8Buffer as g, validateLowHeightSeed as h, intArrayToString as i, validateSeed as j, validateBits as v, writeHexToUInt8 as w };
//# sourceMappingURL=WASMInterface-e83e38e1.mjs.map
