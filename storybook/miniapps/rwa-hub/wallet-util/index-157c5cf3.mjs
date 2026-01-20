import { c as createWasmPreparer, v as validateBits, g as getUInt8Buffer, a as getInitParam, w as writeHexToUInt8, b as getDigestHex, d as decodeBase64, e as getDecodeBase64Length, f as encodeBase64, i as intArrayToString, h as validateLowHeightSeed, j as validateSeed } from './WASMInterface-e83e38e1.mjs';
export { a as createHMAC, c as createHMACSync } from './hmac-d682b216.mjs';
export { a as createKeccak, c as createKeccakSync, k as keccak } from './keccak-a3a14d2a.mjs';
import { p as pbkdf2Sync } from './pbkdf2-9ba738dc.mjs';
export { a as pbkdf2 } from './pbkdf2-9ba738dc.mjs';
export { a as createRIPEMD160, c as createRIPEMD160Sync, p as prepareRIPEMD160, r as ripemd160 } from './ripemd160-eb7b517c.mjs';
import { a as createSHA256, c as createSHA256Sync } from './sha256-098a9414.mjs';
export { p as prepareSHA256, s as sha256 } from './sha256-098a9414.mjs';
export { a as createSHA1, c as createSHA1Sync, p as prepareSHA1, s as sha1 } from './sha1-d9a30eed.mjs';
export { c as createSHA3, a as createSHA3Sync, g as getSha3Preparer, s as sha3 } from './sha3-8923c3ca.mjs';
export { a as createSHA512, c as createSHA512Sync, p as prepareSHA512, s as sha512 } from './sha512-da1b7bbd.mjs';
import './index-62190cc8.mjs';

/**
 * Load Adler32 wasm
 */
const prepareAdler32 = createWasmPreparer('adler32', 4);
/**
 * Calculates Adler-32 hash. The resulting 32-bit hash is stored in
 * network byte order (big-endian).
 *
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const adler32 = async (data) => {
    return (await prepareAdler32()).calculate(data);
};
/**
 * Creates a new Adler-32 hash instance
 */
const createAdler32 = async () => {
    return createAdler32Sync(await prepareAdler32());
};
/**
 * Creates a new Adler-32 hash instance
 */
const createAdler32Sync = (wasm = prepareAdler32.wasm) => {
    wasm.init();
    const obj = {
        init: () => {
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 4,
        digestSize: 4,
    };
    return obj;
};

const blake2bPreparerCache = new Map();
/**
 * Load BLAKE2b wasm
 */
const getBLAKE2bPreparer = (bits) => {
    validateBits(bits, 512);
    const hashLength = bits / 8;
    let preparer = blake2bPreparerCache.get(hashLength);
    if (preparer === undefined) {
        preparer = createWasmPreparer('blake2b', hashLength);
        blake2bPreparerCache.set(hashLength, preparer);
    }
    return preparer;
};
const parseKey$2 = (bits, key) => {
    let keyBuffer;
    let initParam = bits;
    if (key !== undefined) {
        keyBuffer = getUInt8Buffer(key);
        if (keyBuffer.length > 64) {
            throw new Error('Max key length is 64 bytes');
        }
        initParam = getInitParam(bits, keyBuffer.length);
    }
    return { keyBuffer, initParam };
};
/**
 * Calculates BLAKE2b hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8, between 8 and 512. Defaults to 512.
 * @param key Optional key (string, Buffer or TypedArray). Maximum length is 64 bytes.
 * @returns Computed hash as a hexadecimal string
 */
const blake2b = async (data, bits = 512, key) => {
    const wasm = await getBLAKE2bPreparer(bits)();
    const { keyBuffer, initParam } = parseKey$2(bits, key);
    if (initParam > 512) {
        wasm.writeMemory(keyBuffer);
    }
    return wasm.calculate(data, initParam);
};
/**
 * Creates a new BLAKE2b hash instance
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8, between 8 and 512. Defaults to 512.
 * @param key Optional key (string, Buffer or TypedArray). Maximum length is 64 bytes.
 */
const createBLAKE2b = async (bits = 512, key) => {
    return createBLAKE2bSync(bits, key, await getBLAKE2bPreparer(bits)());
};
/**
 * Creates a new BLAKE2b hash instance
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8, between 8 and 512. Defaults to 512.
 * @param key Optional key (string, Buffer or TypedArray). Maximum length is 64 bytes.
 */
const createBLAKE2bSync = (bits = 512, key, wasm = getBLAKE2bPreparer(bits).wasm) => {
    const { keyBuffer, initParam } = parseKey$2(bits, key);
    const outputSize = bits / 8;
    if (initParam > 512) {
        wasm.writeMemory(keyBuffer);
    }
    wasm.init(initParam);
    const obj = {
        init: initParam > 512
            ? () => {
                wasm.writeMemory(keyBuffer);
                wasm.init(initParam);
                return obj;
            }
            : () => {
                wasm.init(initParam);
                return obj;
            },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 128,
        digestSize: outputSize,
    };
    return obj;
};

/**
 * Load argon2 wasm
 */
const prepareArgon2 = createWasmPreparer('argon2', 1024);
function encodeResult(salt, options, res) {
    const parameters = [
        `m=${options.memorySize}`,
        `t=${options.iterations}`,
        `p=${options.parallelism}`,
    ].join(',');
    return `$argon2${options.hashType}$v=19$${parameters}$${encodeBase64(salt, false)}$${encodeBase64(res, false)}`;
}
const uint32View = new DataView(new ArrayBuffer(4));
function int32LE(x) {
    uint32View.setInt32(0, x, true);
    return new Uint8Array(uint32View.buffer);
}
async function hashFunc(blake512, buf, len) {
    if (len <= 64) {
        const blake = await createBLAKE2b(len * 8);
        blake.update(int32LE(len));
        blake.update(buf);
        return blake.digest('binary');
    }
    const r = Math.ceil(len / 32) - 2;
    const ret = new Uint8Array(len);
    blake512.init();
    blake512.update(int32LE(len));
    blake512.update(buf);
    let vp = blake512.digest('binary');
    ret.set(vp.subarray(0, 32), 0);
    for (let i = 1; i < r; i++) {
        blake512.init();
        blake512.update(vp);
        vp = blake512.digest('binary');
        ret.set(vp.subarray(0, 32), i * 32);
    }
    const partialBytesNeeded = len - 32 * r;
    let blakeSmall;
    if (partialBytesNeeded === 64) {
        blakeSmall = blake512;
        blakeSmall.init();
    }
    else {
        blakeSmall = await createBLAKE2b(partialBytesNeeded * 8);
    }
    blakeSmall.update(vp);
    vp = blakeSmall.digest('binary');
    ret.set(vp.subarray(0, partialBytesNeeded), r * 32);
    return ret;
}
function getHashType(type) {
    switch (type) {
        case 'd':
            return 0;
        case 'i':
            return 1;
        default:
            return 2;
    }
}
async function argon2Internal(options) {
    const { parallelism, iterations, hashLength } = options;
    const password = getUInt8Buffer(options.password);
    const salt = getUInt8Buffer(options.salt);
    const version = 0x13;
    const hashType = getHashType(options.hashType);
    const { memorySize } = options; // in KB
    const [argon2Interface, blake512] = await Promise.all([
        await prepareArgon2(),
        createBLAKE2b(512),
    ]);
    // last block is for storing the init vector
    argon2Interface.setMemorySize(memorySize * 1024 + 1024);
    const initVector = new Uint8Array(24);
    const initVectorView = new DataView(initVector.buffer);
    initVectorView.setInt32(0, parallelism, true);
    initVectorView.setInt32(4, hashLength, true);
    initVectorView.setInt32(8, memorySize, true);
    initVectorView.setInt32(12, iterations, true);
    initVectorView.setInt32(16, version, true);
    initVectorView.setInt32(20, hashType, true);
    argon2Interface.writeMemory(initVector, memorySize * 1024);
    blake512.init();
    blake512.update(initVector);
    blake512.update(int32LE(password.length));
    blake512.update(password);
    blake512.update(int32LE(salt.length));
    blake512.update(salt);
    blake512.update(int32LE(0)); // key length + key
    blake512.update(int32LE(0)); // associatedData length + associatedData
    const segments = Math.floor(memorySize / (parallelism * 4)); // length of each lane
    const lanes = segments * 4;
    const param = new Uint8Array(72);
    const H0 = blake512.digest('binary');
    param.set(H0);
    for (let lane = 0; lane < parallelism; lane++) {
        param.set(int32LE(0), 64);
        param.set(int32LE(lane), 68);
        let position = lane * lanes;
        let chunk = await hashFunc(blake512, param, 1024);
        argon2Interface.writeMemory(chunk, position * 1024);
        position += 1;
        param.set(int32LE(1), 64);
        chunk = await hashFunc(blake512, param, 1024);
        argon2Interface.writeMemory(chunk, position * 1024);
    }
    const C = new Uint8Array(1024);
    writeHexToUInt8(C, argon2Interface.calculate(new Uint8Array([]), memorySize));
    const res = await hashFunc(blake512, C, hashLength);
    if (options.outputType === 'hex') {
        const digestChars = new Uint8Array(hashLength * 2);
        return getDigestHex(digestChars, res, hashLength);
    }
    if (options.outputType === 'encoded') {
        return encodeResult(salt, options, res);
    }
    // return binary format
    return res;
}
const validateOptions$2 = (options) => {
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options parameter. It requires an object.');
    }
    if (!options.password) {
        throw new Error('Password must be specified');
    }
    options.password = getUInt8Buffer(options.password);
    if (options.password.length < 1) {
        throw new Error('Password must be specified');
    }
    if (!options.salt) {
        throw new Error('Salt must be specified');
    }
    options.salt = getUInt8Buffer(options.salt);
    if (options.salt.length < 8) {
        throw new Error('Salt should be at least 8 bytes long');
    }
    if (!Number.isInteger(options.iterations) || options.iterations < 1) {
        throw new Error('Iterations should be a positive number');
    }
    if (!Number.isInteger(options.parallelism) || options.parallelism < 1) {
        throw new Error('Parallelism should be a positive number');
    }
    if (!Number.isInteger(options.hashLength) || options.hashLength < 4) {
        throw new Error('Hash length should be at least 4 bytes.');
    }
    if (!Number.isInteger(options.memorySize)) {
        throw new Error('Memory size should be specified.');
    }
    if (options.memorySize < 8 * options.parallelism) {
        throw new Error('Memory size should be at least 8 * parallelism.');
    }
    if (options.outputType === undefined) {
        options.outputType = 'hex';
    }
    if (!['hex', 'binary', 'encoded'].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
    }
};
/**
 * Calculates hash using the argon2i password-hashing function
 * @returns Computed hash
 */
async function argon2i(options) {
    validateOptions$2(options);
    return argon2Internal({
        ...options,
        hashType: 'i',
    });
}
/**
 * Calculates hash using the argon2id password-hashing function
 * @returns Computed hash
 */
async function argon2id(options) {
    validateOptions$2(options);
    return argon2Internal({
        ...options,
        hashType: 'id',
    });
}
/**
 * Calculates hash using the argon2d password-hashing function
 * @returns Computed hash
 */
async function argon2d(options) {
    validateOptions$2(options);
    return argon2Internal({
        ...options,
        hashType: 'd',
    });
}
const getHashParameters = (password, encoded) => {
    const regex = /^\$argon2(id|i|d)\$v=([0-9]+)\$((?:[mtp]=[0-9]+,){2}[mtp]=[0-9]+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;
    const match = encoded.match(regex);
    if (!match) {
        throw new Error('Invalid hash');
    }
    const [, hashType, version, parameters, salt, hash] = match;
    if (version !== '19') {
        throw new Error(`Unsupported version: ${version}`);
    }
    const parsedParameters = {};
    const paramMap = {
        m: 'memorySize',
        p: 'parallelism',
        t: 'iterations',
    };
    parameters.split(',').forEach((x) => {
        const [n, v] = x.split('=');
        parsedParameters[paramMap[n]] = parseInt(v, 10);
    });
    return {
        ...parsedParameters,
        password,
        hashType: hashType,
        salt: decodeBase64(salt),
        hashLength: getDecodeBase64Length(hash),
        outputType: 'encoded',
    };
};
const validateVerifyOptions$1 = (options) => {
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options parameter. It requires an object.');
    }
    if (options.hash === undefined || typeof options.hash !== 'string') {
        throw new Error('Hash should be specified');
    }
};
/**
 * Verifies password using the argon2 password-hashing function
 * @returns True if the encoded hash matches the password
 */
async function argon2Verify(options) {
    validateVerifyOptions$1(options);
    const params = getHashParameters(options.password, options.hash);
    validateOptions$2(params);
    const hashStart = options.hash.lastIndexOf('$') + 1;
    const result = (await argon2Internal(params));
    return result.substring(hashStart) === options.hash.substring(hashStart);
}

/**
 * Load bcrypt wasm
 */
const prepareBcrypt = createWasmPreparer('bcrypt', 0);
async function bcryptInternal(options) {
    const { costFactor, password, salt } = options;
    const bcryptInterface = await prepareBcrypt();
    bcryptInterface.writeMemory(getUInt8Buffer(salt), 0);
    const passwordBuffer = getUInt8Buffer(password);
    bcryptInterface.writeMemory(passwordBuffer, 16);
    const shouldEncode = options.outputType === 'encoded' ? 1 : 0;
    bcryptInterface
        .getExports()
        .bcrypt(passwordBuffer.length, costFactor, shouldEncode);
    const memory = bcryptInterface.getMemory();
    if (options.outputType === 'encoded') {
        return intArrayToString(memory, 60);
    }
    if (options.outputType === 'hex') {
        const digestChars = new Uint8Array(24 * 2);
        return getDigestHex(digestChars, memory, 24);
    }
    // return binary format
    // the data is copied to allow GC of the original memory buffer
    return memory.slice(0, 24);
}
const validateOptions$1 = (options) => {
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options parameter. It requires an object.');
    }
    if (!Number.isInteger(options.costFactor) ||
        options.costFactor < 4 ||
        options.costFactor > 31) {
        throw new Error('Cost factor should be a number between 4 and 31');
    }
    options.password = getUInt8Buffer(options.password);
    if (options.password.length < 1) {
        throw new Error('Password should be at least 1 byte long');
    }
    if (options.password.length > 72) {
        throw new Error('Password should be at most 72 bytes long');
    }
    options.salt = getUInt8Buffer(options.salt);
    if (options.salt.length !== 16) {
        throw new Error('Salt should be 16 bytes long');
    }
    if (options.outputType === undefined) {
        options.outputType = 'encoded';
    }
    if (!['hex', 'binary', 'encoded'].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
    }
};
/**
 * Calculates hash using the bcrypt password-hashing function
 * @returns Computed hash
 */
async function bcrypt(options) {
    validateOptions$1(options);
    return bcryptInternal(options);
}
const validateHashCharacters = (hash) => {
    if (!/^\$2[axyb]\$[0-3][0-9]\$[./A-Za-z0-9]{53}$/.test(hash)) {
        return false;
    }
    if (hash[4] === '0' && parseInt(hash[5], 10) < 4) {
        return false;
    }
    if (hash[4] === '3' && parseInt(hash[5], 10) > 1) {
        return false;
    }
    return true;
};
const validateVerifyOptions = (options) => {
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options parameter. It requires an object.');
    }
    if (options.hash === undefined || typeof options.hash !== 'string') {
        throw new Error('Hash should be specified');
    }
    if (options.hash.length !== 60) {
        throw new Error('Hash should be 60 bytes long');
    }
    if (!validateHashCharacters(options.hash)) {
        throw new Error('Invalid hash');
    }
    options.password = getUInt8Buffer(options.password);
    if (options.password.length < 1) {
        throw new Error('Password should be at least 1 byte long');
    }
    if (options.password.length > 72) {
        throw new Error('Password should be at most 72 bytes long');
    }
};
/**
 * Verifies password using bcrypt password-hashing function
 * @returns True if the encoded hash matches the password
 */
async function bcryptVerify(options) {
    validateVerifyOptions(options);
    const { hash, password } = options;
    const bcryptInterface = await prepareBcrypt();
    bcryptInterface.writeMemory(getUInt8Buffer(hash), 0);
    const passwordBuffer = getUInt8Buffer(password);
    bcryptInterface.writeMemory(passwordBuffer, 60);
    return !!bcryptInterface.getExports().bcrypt_verify(passwordBuffer.length);
}

const blake2sPreparerCache = new Map();
/**
 * Load BLAKE2s wasm
 */
const getBLAKE2sPreparer = (bits) => {
    validateBits(bits, 256);
    const hashLength = bits / 8;
    let preparer = blake2sPreparerCache.get(hashLength);
    if (preparer === undefined) {
        preparer = createWasmPreparer('blake2s', hashLength);
        blake2sPreparerCache.set(hashLength, preparer);
    }
    return preparer;
};
const parseKey$1 = (bits, key) => {
    let keyBuffer;
    let initParam = bits;
    if (key !== undefined) {
        keyBuffer = getUInt8Buffer(key);
        if (keyBuffer.length > 32) {
            throw new Error('Max key length is 32 bytes');
        }
        initParam = getInitParam(bits, keyBuffer.length);
    }
    return { keyBuffer, initParam };
};
/**
 * Calculates BLAKE2s hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8, between 8 and 256. Defaults to 256.
 * @param key Optional key (string, Buffer or TypedArray). Maximum length is 32 bytes.
 * @returns Computed hash as a hexadecimal string
 */
const blake2s = async (data, bits = 256, key) => {
    const wasm = await getBLAKE2sPreparer(bits)();
    const { keyBuffer, initParam } = parseKey$1(bits, key);
    if (initParam > 512) {
        wasm.writeMemory(keyBuffer);
    }
    return wasm.calculate(data, initParam);
};
/**
 * Creates a new BLAKE2s hash instance
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8, between 8 and 256. Defaults to 256.
 * @param key Optional key (string, Buffer or TypedArray). Maximum length is 32 bytes.
 */
const createBLAKE2s = async (bits = 256, key) => {
    return createBLAKE2sSync(bits, key, await getBLAKE2sPreparer(bits)());
};
/**
 * Creates a new BLAKE2s hash instance
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8, between 8 and 256. Defaults to 256.
 * @param key Optional key (string, Buffer or TypedArray). Maximum length is 32 bytes.
 */
const createBLAKE2sSync = (bits = 256, key, wasm = getBLAKE2sPreparer(bits).wasm) => {
    const { keyBuffer, initParam } = parseKey$1(bits, key);
    const outputSize = bits / 8;
    if (initParam > 512) {
        wasm.writeMemory(keyBuffer);
    }
    wasm.init(initParam);
    const obj = {
        init: initParam > 512
            ? () => {
                wasm.writeMemory(keyBuffer);
                wasm.init(initParam);
                return obj;
            }
            : () => {
                wasm.init(initParam);
                return obj;
            },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: outputSize,
    };
    return obj;
};

const blake3PreparerCache = new Map();
/**
 * Load BLAKE3 wasm
 */
const getBLAKE3Preparer = (bits) => {
    validateBits(bits, Infinity);
    const hashLength = bits / 8;
    let preparer = blake3PreparerCache.get(hashLength);
    if (preparer === undefined) {
        preparer = createWasmPreparer('blake3', hashLength);
        blake3PreparerCache.set(hashLength, preparer);
    }
    return preparer;
};
const parseKey = (key) => {
    let keyBuffer;
    let initParam = 0; // key is empty by default
    if (key !== undefined) {
        keyBuffer = getUInt8Buffer(key);
        if (keyBuffer.length !== 32) {
            throw new Error('Key length must be exactly 32 bytes');
        }
        initParam = 32;
    }
    return { keyBuffer, initParam };
};
/**
 * Calculates BLAKE3 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8. Defaults to 256.
 * @param key Optional key (string, Buffer or TypedArray). Length should be 32 bytes.
 * @returns Computed hash as a hexadecimal string
 */
const blake3 = async (data, bits = 256, key) => {
    const wasm = await getBLAKE3Preparer(bits)();
    const { keyBuffer, initParam } = parseKey(key);
    if (initParam === 32) {
        wasm.writeMemory(keyBuffer);
    }
    return wasm.calculate(data, initParam, bits / 8);
};
/**
 * Creates a new BLAKE3 hash instance
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8. Defaults to 256.
 * @param key Optional key (string, Buffer or TypedArray). Length should be 32 bytes.
 */
const createBLAKE3 = async (bits = 256, key) => {
    return createBLAKE3Sync(bits, key, await getBLAKE3Preparer(bits)());
};
/**
 * Creates a new BLAKE3 hash instance
 * @param bits Number of output bits, which has to be a number
 *             divisible by 8. Defaults to 256.
 * @param key Optional key (string, Buffer or TypedArray). Length should be 32 bytes.
 */
const createBLAKE3Sync = (bits = 256, key, wasm = getBLAKE3Preparer(bits).wasm) => {
    const { keyBuffer, initParam } = parseKey(key);
    const digestSize = bits / 8;
    if (initParam === 32) {
        wasm.writeMemory(keyBuffer);
    }
    wasm.init(initParam);
    const obj = {
        init: initParam === 32
            ? () => {
                wasm.writeMemory(keyBuffer);
                wasm.init(initParam);
                return obj;
            }
            : () => {
                wasm.init(initParam);
                return obj;
            },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType, digestSize),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize,
    };
    return obj;
};

/**
 * Load CRC-32 wasm
 */
const prepareCRC32 = createWasmPreparer('crc32', 4);
/**
 * Calculates CRC-32 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const crc32 = async (data) => {
    return (await prepareCRC32()).calculate(data, 0xedb88320);
};
/**
 * Creates a new CRC-32 hash instance
 */
const createCRC32 = async () => {
    return createCRC32Sync(await prepareCRC32());
};
/**
 * Creates a new CRC-32 hash instance
 */
const createCRC32Sync = (wasm = prepareCRC32.wasm) => {
    wasm.init(0xedb88320);
    const obj = {
        init: () => {
            wasm.init(0xedb88320);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 4,
        digestSize: 4,
    };
    return obj;
};

/**
 * Calculates CRC-32C hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const crc32c = async (data) => {
    return (await prepareCRC32()).calculate(data, 0x82f63b78);
};
/**
 * Creates a new CRC-32C hash instance
 */
const createCRC32C = async () => {
    return createCRC32CSync(await prepareCRC32());
};
/**
 * Creates a new CRC-32C hash instance
 */
const createCRC32CSync = (wasm = prepareCRC32.wasm) => {
    wasm.init(0x82f63b78);
    const obj = {
        init: () => {
            wasm.init(0x82f63b78);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 4,
        digestSize: 4,
    };
    return obj;
};

/**
 * Load MD4 wasm
 */
const prepareMD4 = createWasmPreparer('md4', 16);
/**
 * Calculates MD4 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const md4 = async (data) => {
    return (await prepareMD4()).calculate(data);
};
/**
 * Creates a new MD4 hash instance
 */
const createMD4 = async () => {
    return createMD4Sync(await prepareMD4());
};
/**
 * Creates a new MD4 hash instance
 */
const createMD4Sync = (wasm = prepareMD4.wasm) => {
    wasm.init();
    const obj = {
        init: () => {
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: 16,
    };
    return obj;
};

/**
 * Load MD5 wasm
 */
const prepareMD5 = createWasmPreparer('md5', 16);
/**
 * Calculates MD5 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const md5 = async (data) => {
    return (await prepareMD5()).calculate(data);
};
/**
 * Creates a new MD5 hash instance
 */
const createMD5 = async () => {
    return createMD5Sync(await prepareMD5());
};
/**
 * Creates a new MD5 hash instance
 */
const createMD5Sync = (wasm = prepareMD5.wasm) => {
    wasm.init();
    const obj = {
        init: () => {
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: 16,
    };
    return obj;
};

/**
 * Load Scrypt wasm
 */
const prepareScrypt = createWasmPreparer('scrypt', 0);
const scryptInternalSync = (options, hashFunction, wasm = prepareScrypt.wasm) => {
    const { costFactor, blockSize, parallelism, hashLength } = options;
    const blockData = pbkdf2Sync({
        password: options.password,
        salt: options.salt,
        iterations: 1,
        hashLength: 128 * blockSize * parallelism,
        hashFunction: hashFunction,
        outputType: 'binary',
    });
    // last block is for storing the temporary vectors
    const VSize = 128 * blockSize * costFactor;
    const XYSize = 256 * blockSize;
    wasm.setMemorySize(blockData.length + VSize + XYSize);
    wasm.writeMemory(blockData, 0);
    // mix blocks
    wasm.getExports().scrypt(blockSize, costFactor, parallelism);
    const expensiveSalt = wasm
        .getMemory()
        .subarray(0, 128 * blockSize * parallelism);
    const outputData = pbkdf2Sync({
        password: options.password,
        salt: expensiveSalt,
        iterations: 1,
        hashLength,
        hashFunction: hashFunction,
        outputType: 'binary',
    });
    if (options.outputType === 'hex') {
        const digestChars = new Uint8Array(hashLength * 2);
        return getDigestHex(digestChars, outputData, hashLength);
    }
    // return binary format
    return outputData;
};
// eslint-disable-next-line no-bitwise
const isPowerOfTwo = (v) => !!(v && !(v & (v - 1)));
const validateOptions = (options) => {
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options parameter. It requires an object.');
    }
    if (!Number.isInteger(options.blockSize) || options.blockSize < 1) {
        throw new Error('Block size should be a positive number');
    }
    if (!Number.isInteger(options.costFactor) ||
        options.costFactor < 2 ||
        !isPowerOfTwo(options.costFactor)) {
        throw new Error('Cost factor should be a power of 2, greater than 1');
    }
    if (!Number.isInteger(options.parallelism) || options.parallelism < 1) {
        throw new Error('Parallelism should be a positive number');
    }
    if (!Number.isInteger(options.hashLength) || options.hashLength < 1) {
        throw new Error('Hash length should be a positive number.');
    }
    if (options.outputType === undefined) {
        options.outputType = 'hex';
    }
    if (!['hex', 'binary'].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary']`);
    }
};
/**
 * Calculates hash using the scrypt password-based key derivation function
 * @returns Computed hash as a hexadecimal string or as
 *          Uint8Array depending on the outputType option
 */
const scrypt = async (options) => {
    validateOptions(options);
    return scryptInternalSync(options, await createSHA256(), await prepareScrypt());
};
/**
 * Calculates hash using the scrypt password-based key derivation function
 * @returns Computed hash as a hexadecimal string or as
 *          Uint8Array depending on the outputType option
 */
const scryptSync = (options) => {
    validateOptions(options);
    return scryptInternalSync(options, createSHA256Sync(), prepareScrypt.wasm);
};

/**
 * Load SHA-224 wasm
 */
const prepareSHA224 = createWasmPreparer('sha256', 28);
/**
 * Calculates SHA-2 (SHA-224) hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const sha224 = async (data) => {
    return (await prepareSHA224()).calculate(data, 224);
};
/**
 * Creates a new SHA-2 (SHA-224) hash instance
 */
const createSHA224 = async () => {
    return createSHA224Sync(await prepareSHA224());
};
/**
 * Creates a new SHA-2 (SHA-224) hash instance
 */
const createSHA224Sync = (wasm = prepareSHA224.wasm) => {
    wasm.init(224);
    const obj = {
        init: () => {
            wasm.init(224);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: 28,
    };
    return obj;
};

/**
 * Load SHA-384 wasm
 */
const prepareSHA384 = createWasmPreparer('sha512', 48);
/**
 * Calculates SHA-2 (SHA-384) hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const sha384 = async (data) => {
    return (await prepareSHA384()).calculate(data, 384);
};
/**
 * Creates a new SHA-2 (SHA-384) hash instance
 */
const createSHA384 = async () => {
    return createSHA384Sync(await prepareSHA384());
};
/**
 * Creates a new SHA-2 (SHA-384) hash instance
 */
const createSHA384Sync = (wasm = prepareSHA384.wasm) => {
    wasm.init(384);
    const obj = {
        init: () => {
            wasm.init(384);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 128,
        digestSize: 48,
    };
    return obj;
};

/**
 * Load SM3 wasm
 */
const prepareSM3 = createWasmPreparer('sm3', 32);
/**
 * Calculates SM3 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const sm3 = async (data) => {
    return (await prepareSM3()).calculate(data);
};
/**
 * Creates a new SM3 hash instance
 */
const createSM3 = async () => {
    return createSM3Sync(await prepareSM3());
};
/**
 * Creates a new SM3 hash instance
 */
const createSM3Sync = (wasm = prepareSM3.wasm) => {
    wasm.init();
    const obj = {
        init: () => {
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: 32,
    };
    return obj;
};

/**
 * Load Whirlpool wasm
 */
const prepareWhirlpool = createWasmPreparer('whirlpool', 64);
/**
 * Calculates Whirlpool hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const whirlpool = async (data) => {
    return (await prepareWhirlpool()).calculate(data);
};
/**
 * Creates a new Whirlpool hash instance
 */
const createWhirlpool = async () => {
    return createWhirlpoolSync(await prepareWhirlpool());
};
/**
 * Creates a new Whirlpool hash instance
 */
const createWhirlpoolSync = (wasm = prepareWhirlpool.wasm) => {
    wasm.init();
    const obj = {
        init: () => {
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: 64,
    };
    return obj;
};

/**
 * Load xxHash128 wasm
 */
const prepareXXHash128 = createWasmPreparer('xxhash128', 4);
const seedBuffer$2 = new ArrayBuffer(8);
const seedArray$2 = new Uint8Array(seedBuffer$2);
const seedView$2 = new DataView(seedBuffer$2);
function writeSeed$2(low, high) {
    // write in little-endian format
    seedView$2.setUint32(0, low, true);
    seedView$2.setUint32(4, high, true);
}
/**
 * Calculates xxHash128 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @returns Computed hash as a hexadecimal string
 */
const xxhash128 = async (data, seedLow = 0, seedHigh = 0) => {
    validateLowHeightSeed(seedLow, seedHigh);
    writeSeed$2(seedLow, seedHigh);
    const wasm = await prepareXXHash128();
    wasm.writeMemory(seedArray$2);
    return wasm.calculate(data);
};
/**
 * Creates a new xxHash128 hash instance
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash128 = async (seedLow = 0, seedHigh = 0) => {
    return createXXHash128Sync(seedLow, seedHigh, await prepareXXHash128());
};
/**
 * Creates a new xxHash128 hash instance
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash128Sync = (seedLow = 0, seedHigh = 0, wasm = prepareXXHash128.wasm) => {
    validateLowHeightSeed(seedLow, seedHigh);
    writeSeed$2(seedLow, seedHigh);
    const seedArray = new Uint8Array(seedBuffer$2);
    wasm.writeMemory(seedArray);
    wasm.init();
    const obj = {
        init: () => {
            wasm.writeMemory(seedArray);
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 512,
        digestSize: 16,
    };
    return obj;
};

/**
 * Load xxHash3 wasm
 */
const prepareXXHash3 = createWasmPreparer('xxhash3', 8);
const seedBuffer$1 = new ArrayBuffer(8);
const seedArray$1 = new Uint8Array(seedBuffer$1);
const seedView$1 = new DataView(seedBuffer$1);
function writeSeed$1(low, high) {
    // write in little-endian format
    seedView$1.setUint32(0, low, true);
    seedView$1.setUint32(4, high, true);
}
/**
 * Calculates xxHash3 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @returns Computed hash as a hexadecimal string
 */
const xxhash3 = async (data, seedLow = 0, seedHigh = 0) => {
    validateLowHeightSeed(seedLow, seedHigh);
    writeSeed$1(seedLow, seedHigh);
    const wasm = await prepareXXHash3();
    wasm.writeMemory(seedArray$1);
    return wasm.calculate(data);
};
/**
 * Creates a new xxHash3 hash instance
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash3 = async (seedLow = 0, seedHigh = 0) => {
    return createXXHash3Sync(seedLow, seedHigh, await prepareXXHash3());
};
/**
 * Creates a new xxHash3 hash instance
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash3Sync = (seedLow = 0, seedHigh = 0, wasm = prepareXXHash3.wasm) => {
    validateLowHeightSeed(seedLow, seedHigh);
    writeSeed$1(seedLow, seedHigh);
    const seedArray = new Uint8Array(seedBuffer$1);
    wasm.writeMemory(seedArray);
    wasm.init();
    const obj = {
        init: () => {
            wasm.writeMemory(seedArray);
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 512,
        digestSize: 8,
    };
    return obj;
};

/**
 * Load xxHash32 wasm
 */
const prepareXXHash32 = createWasmPreparer('xxhash32', 4);
/**
 * Calculates xxHash32 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param seed Number used to initialize the internal state of the algorithm (defaults to 0)
 * @returns Computed hash as a hexadecimal string
 */
const xxhash32 = async (data, seed = 0) => {
    validateSeed(seed);
    return (await prepareXXHash32()).calculate(data, seed);
};
/**
 * Creates a new xxHash32 hash instance
 * @param data Input data (string, Buffer or TypedArray)
 * @param seed Number used to initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash32 = async (seed = 0) => {
    return createXXHash32Sync(seed, await prepareXXHash32());
};
/**
 * Creates a new xxHash32 hash instance
 * @param data Input data (string, Buffer or TypedArray)
 * @param seed Number used to initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash32Sync = (seed = 0, wasm = prepareXXHash32.wasm) => {
    validateSeed(seed);
    wasm.init(seed);
    const obj = {
        init: () => {
            wasm.init(seed);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 16,
        digestSize: 4,
    };
    return obj;
};

/**
 * Load xxHash64 wasm
 */
const prepareXXHash64 = createWasmPreparer('xxhash64', 4);
const seedBuffer = new ArrayBuffer(8);
const seedArray = new Uint8Array(seedBuffer);
const seedView = new DataView(seedBuffer);
function writeSeed(low, high) {
    // write in little-endian format
    seedView.setUint32(0, low, true);
    seedView.setUint32(4, high, true);
}
/**
 * Calculates xxHash64 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @returns Computed hash as a hexadecimal string
 */
const xxhash64 = async (data, seedLow = 0, seedHigh = 0) => {
    validateLowHeightSeed(seedLow, seedHigh);
    writeSeed(seedLow, seedHigh);
    const wasm = await prepareXXHash64();
    wasm.writeMemory(seedArray);
    return wasm.calculate(data);
};
/**
 * Creates a new xxHash64 hash instance
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash64 = async (seedLow = 0, seedHigh = 0) => {
    return createXXHash64Sync(seedLow, seedHigh, await prepareXXHash64());
};
/**
 * Creates a new xxHash64 hash instance
 * @param seedLow Lower 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 * @param seedHigh Higher 32 bits of the number used to
 *  initialize the internal state of the algorithm (defaults to 0)
 */
const createXXHash64Sync = (seedLow = 0, seedHigh = 0, wasm = prepareXXHash64.wasm) => {
    validateLowHeightSeed(seedLow, seedHigh);
    writeSeed(seedLow, seedHigh);
    const seedArray = new Uint8Array(seedBuffer);
    wasm.writeMemory(seedArray);
    wasm.init();
    const obj = {
        init: () => {
            wasm.writeMemory(seedArray);
            wasm.init();
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 32,
        digestSize: 8,
    };
    return obj;
};

export { adler32, argon2Verify, argon2d, argon2i, argon2id, bcrypt, bcryptVerify, blake2b, blake2s, blake3, crc32, crc32c, createAdler32, createAdler32Sync, createBLAKE2b, createBLAKE2bSync, createBLAKE2s, createBLAKE2sSync, createBLAKE3, createBLAKE3Sync, createCRC32, createCRC32C, createCRC32CSync, createCRC32Sync, createMD4, createMD4Sync, createMD5, createMD5Sync, createSHA224, createSHA224Sync, createSHA256, createSHA256Sync, createSHA384, createSHA384Sync, createSM3, createSM3Sync, createWhirlpool, createWhirlpoolSync, createXXHash128, createXXHash128Sync, createXXHash3, createXXHash32, createXXHash32Sync, createXXHash3Sync, createXXHash64, createXXHash64Sync, getBLAKE2bPreparer, getBLAKE2sPreparer, getBLAKE3Preparer, md4, md5, pbkdf2Sync, prepareAdler32, prepareArgon2, prepareBcrypt, prepareCRC32, prepareMD4, prepareMD5, prepareSHA224, prepareSHA384, prepareSM3, prepareScrypt, prepareWhirlpool, prepareXXHash128, prepareXXHash3, prepareXXHash32, prepareXXHash64, scrypt, scryptSync, sha224, sha384, sm3, whirlpool, xxhash128, xxhash3, xxhash32, xxhash64 };
//# sourceMappingURL=index-157c5cf3.mjs.map
